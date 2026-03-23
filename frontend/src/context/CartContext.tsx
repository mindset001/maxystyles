'use client';

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  category: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  inStock: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number | string; selectedSize: string; selectedColor: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number | string; selectedSize: string; selectedColor: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const key = (item: CartItem) =>
        `${item.id}-${item.selectedSize}-${item.selectedColor}`;
      const existingIndex = state.items.findIndex(
        (i) => key(i) === key(action.payload)
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updated, isOpen: true };
      }
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }

    case 'REMOVE_ITEM': {
      const { id, selectedSize, selectedColor } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, selectedSize, selectedColor, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) =>
              !(i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
            ? { ...i, quantity }
            : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number | string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (id: number | string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once mounted
  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxystyles-cart');
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('maxystyles-cart', JSON.stringify(state.items));
    }
  }, [state.items, hydrated]);

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: item.quantity ?? 1 } });
    },
    []
  );

  const removeFromCart = useCallback(
    (id: number | string, selectedSize: string, selectedColor: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { id, selectedSize, selectedColor } });
    },
    []
  );

  const updateQuantity = useCallback(
    (id: number | string, selectedSize: string, selectedColor: string, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, selectedSize, selectedColor, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
