import express from 'express';
import { Student } from '../models/Student';
import { Grade } from '../models/Grade';
import { getMaxScores } from '../utils/grading';

const router = express.Router();

// ─── STUDENTS ────────────────────────────────────────────────────────────────

// GET /api/grades/students — list all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

// POST /api/grades/students — create a student
router.post('/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Validation error', error: (err as Error).message });
  }
});

// GET /api/grades/students/:id
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

// PUT /api/grades/students/:id
router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Validation error', error: (err as Error).message });
  }
});

// DELETE /api/grades/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

// ─── GRADES ──────────────────────────────────────────────────────────────────

// GET /api/grades — list grades (filter by student, term, session, class)
router.get('/', async (req, res) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.student)   filter.student   = req.query.student;
    if (req.query.term)      filter.term      = req.query.term;
    if (req.query.session)   filter.session   = req.query.session;
    if (req.query.className) filter.className = req.query.className;
    if (req.query.subject)   filter.subject   = req.query.subject;

    const grades = await Grade.find(filter).populate('student', 'name admissionNumber className');
    res.json({ success: true, data: grades });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

// GET /api/grades/max-scores?class=jss1 — return max scores for a class
router.get('/max-scores', (req, res) => {
  const className = (req.query.class as string) || '';
  if (!className) {
    return res.status(400).json({ success: false, message: 'class query parameter is required' });
  }
  const scores = getMaxScores(className);
  res.json({ success: true, className, ...scores });
});

// POST /api/grades — record a grade
router.post('/', async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Validation error', error: (err as Error).message });
  }
});

// PUT /api/grades/:id — update a grade
router.put('/:id', async (req, res) => {
  try {
    // Delete and re-create so the pre-save hook recomputes total/grade/remark
    const existing = await Grade.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Grade not found' });

    Object.assign(existing, req.body);
    await existing.save();
    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Validation error', error: (err as Error).message });
  }
});

// DELETE /api/grades/:id
router.delete('/:id', async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, message: 'Grade deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

// ─── REPORT SHEET ────────────────────────────────────────────────────────────

// GET /api/grades/report/:studentId?term=first&session=2025/2026
router.get('/report/:studentId', async (req, res) => {
  try {
    const { term, session } = req.query;
    const filter: Record<string, unknown> = { student: req.params.studentId };
    if (term)    filter.term    = term;
    if (session) filter.session = session;

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const grades = await Grade.find(filter).sort({ subject: 1 });
    const grandTotal  = grades.reduce((sum, g) => sum + g.total, 0);
    const percentage  = grades.length ? ((grandTotal / (grades.length * 100)) * 100).toFixed(1) : '0.0';

    res.json({
      success: true,
      student: {
        name: student.name,
        admissionNumber: student.admissionNumber,
        className: student.className,
      },
      term,
      session,
      grades,
      summary: {
        totalSubjects: grades.length,
        grandTotal,
        percentage: `${percentage}%`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
});

export default router;
