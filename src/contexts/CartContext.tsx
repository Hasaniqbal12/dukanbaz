"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ICartItem } from '../models/Cart';

interface CartState {
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  addToCart: (item: ICartItem) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  checkout: (shippingAddress: unknown, shippingMethod: string, notes?: string, dropshippingData?: unknown) => Promise<unknown>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: ICartItem[] }
  | { type: 'ADD_ITEM'; payload: ICartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TOTAL_ITEMS'; payload: number }
  | { type: 'SET_TOTAL_AMOUNT'; payload: number };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity, totalPrice: item.unitPrice * action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_TOTAL_ITEMS':
      return { ...state, totalItems: action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null
  });

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cartResponse = await response.json();
      dispatch({ type: 'SET_CART', payload: cartResponse.data.items });
      dispatch({ type: 'SET_TOTAL_ITEMS', payload: cartResponse.data.totalItems });
      dispatch({ type: 'SET_TOTAL_AMOUNT', payload: cartResponse.data.totalAmount });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (item: ICartItem) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: item.type,
          productId: item.productId,
          quantity: item.quantity,
          tierPrice: 'tierPrice' in item ? item.tierPrice : undefined,
          variantId: item.type === 'regular' ? item.variantId : undefined,
          variantName: item.type === 'regular' ? item.variantName : undefined,
          color: item.type === 'regular' ? item.color : undefined,
          size: item.type === 'regular' ? item.size : undefined,
          material: item.type === 'regular' ? item.material : undefined,
          style: item.type === 'regular' ? item.style : undefined,
          variationAttributes: item.type === 'regular' ? item.variationAttributes : undefined,
          isBulkOrder: item.isBulkOrder,
          // Bid-specific fields if applicable
          ...(item.type === 'bid' && {
            requestId: item.requestId,
            originalPrice: item.originalPrice,
            discountPercent: item.discountPercent
          })
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }
      
      const result = await response.json();
      // After adding to cart, refresh the cart to get updated data
      await fetchCart();
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, quantity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }
      
      const updatedCart = await response.json();
      dispatch({ type: 'SET_CART', payload: updatedCart.items });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const updatedCart = await response.json();
      dispatch({ type: 'SET_CART', payload: updatedCart.items });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/cart/clear', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      dispatch({ type: 'CLEAR_CART' });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const checkout = async (shippingAddress: unknown, shippingMethod: string, notes?: string, dropshippingData?: unknown) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          shippingAddress, 
          shippingMethod, 
          notes,
          ...dropshippingData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process checkout');
      }
      
      const result = await response.json();
      dispatch({ type: 'CLEAR_CART' });
      return result;
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
