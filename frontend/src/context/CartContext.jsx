import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('duyanan_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('duyanan_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, variant = null, variantPrice = null) => {
        setCart((prevCart) => {
            const cartItemId = `${product.id}-${variant || 'base'}`;
            const existingItem = prevCart.find((item) => item.cartItemId === cartItemId);
            
            const priceToUse = variantPrice !== null ? variantPrice : product.price;

            if (existingItem) {
                return prevCart.map((item) =>
                    item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, cartItemId, variant, price: priceToUse, quantity: 1 }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};
