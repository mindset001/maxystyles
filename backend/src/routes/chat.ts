import express from 'express';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { Chat } from '../models/Chat';
import { upload, uploadToCloudinary } from '../utils/cloudinary';

// ── Auth middleware ────────────────────────────────────────────────────────────
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function adminMiddleware(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// ── Router factory (receives Socket.io server so routes can emit events) ───────
export function createChatRouter(io: SocketIOServer) {
  const router = express.Router();

  // ── Customer: start or continue a chat ──────────────────────────────────────
  // POST /api/chat  → creates a new conversation
  router.post('/', authMiddleware, async (req: any, res: any) => {
    try {
      const { subject } = req.body;
      const { userId } = req.user;

      // Import User model lazily to avoid circular deps
      const { User } = await import('../models');
      const user = await User.findById(userId).select('name email');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const chat = await Chat.create({
        customer: userId,
        customerName: user.name,
        customerEmail: user.email,
        subject: subject || 'Design Inquiry',
      });

      res.status(201).json({ success: true, data: chat });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ── Customer: list their own chats ──────────────────────────────────────────
  // GET /api/chat/my
  router.get('/my', authMiddleware, async (req: any, res: any) => {
    try {
      const chats = await Chat.find({ customer: req.user.userId })
        .select('-messages')
        .sort({ lastMessageAt: -1 });
      res.json({ success: true, data: chats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ── Admin: list ALL chats ───────────────────────────────────────────────────
  // GET /api/chat/admin/all
  router.get('/admin/all', authMiddleware, adminMiddleware, async (req: any, res: any) => {
    try {
      const { status } = req.query;
      const filter: any = {};
      if (status && status !== 'all') filter.status = status;

      const chats = await Chat.find(filter)
        .select('-messages')
        .sort({ lastMessageAt: -1 });
      res.json({ success: true, data: chats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ── Get single chat (customer can only access their own; admin can access all) ─
  // GET /api/chat/:id
  router.get('/:id', authMiddleware, async (req: any, res: any) => {
    try {
      const chat = await Chat.findById(req.params.id);
      if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

      const isAdmin = req.user.role === 'admin';
      const isOwner = chat.customer.toString() === req.user.userId;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      // Mark messages as read
      if (isAdmin) {
        await Chat.updateOne(
          { _id: req.params.id },
          { $set: { 'messages.$[el].isRead': true, unreadByAdmin: 0 } },
          { arrayFilters: [{ 'el.senderRole': 'customer', 'el.isRead': false }] }
        );
      } else {
        await Chat.updateOne(
          { _id: req.params.id },
          { $set: { unreadByCustomer: 0 } }
        );
      }

      const updated = await Chat.findById(req.params.id);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ── Send a message (text + optional image attachments) ─────────────────────-
  // POST /api/chat/:id/message
  router.post(
    '/:id/message',
    authMiddleware,
    upload.array('attachments', 5),
    async (req: any, res: any) => {
      try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

        const isAdmin = req.user.role === 'admin';
        const isOwner = chat.customer.toString() === req.user.userId;
        if (!isAdmin && !isOwner) {
          return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { text } = req.body;
        const files: Express.Multer.File[] = req.files || [];

        if (!text && files.length === 0) {
          return res.status(400).json({ success: false, message: 'Message must have text or at least one attachment' });
        }

        // Upload each file to Cloudinary
        const attachments = await Promise.all(
          files.map(async (file) => {
            const result = await uploadToCloudinary(file.buffer, 'maxystyles/chat');
            return {
              url: result.url,
              publicId: result.publicId,
              filename: file.originalname,
              mimetype: file.mimetype,
            };
          })
        );

        const message: any = {
          sender: req.user.userId,
          senderName: req.user.name || (isAdmin ? 'Admin' : chat.customerName),
          senderRole: isAdmin ? 'admin' : 'customer',
          text: text || '',
          attachments,
          isRead: false,
        };

        chat.messages.push(message);
        chat.lastMessageAt = new Date();
        if (isAdmin) {
          chat.status = 'in-progress';
          chat.unreadByCustomer = (chat.unreadByCustomer || 0) + 1;
        } else {
          chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
        }

        await chat.save();

        const newMsg = chat.messages[chat.messages.length - 1];

        // Emit real-time event to the chat room
        io.to(`chat:${chat._id}`).emit('new-message', {
          chatId: chat._id,
          message: newMsg,
        });

        // Notify admin room of any new customer message
        if (!isAdmin) {
          io.to('admin-room').emit('chat-updated', {
            chatId: chat._id,
            customerName: chat.customerName,
            subject: chat.subject,
            unreadByAdmin: chat.unreadByAdmin,
          });
        }

        res.status(201).json({ success: true, data: newMsg });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  );

  // ── Admin: update chat status ───────────────────────────────────────────────
  // PATCH /api/chat/:id/status
  router.patch('/:id/status', authMiddleware, adminMiddleware, async (req: any, res: any) => {
    try {
      const { status } = req.body;
      const chat = await Chat.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
      io.to(`chat:${chat._id}`).emit('chat-status-changed', { chatId: chat._id, status });
      res.json({ success: true, data: chat });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}
