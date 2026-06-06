import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

/* ─── Scoped Styles ─── */
const styles = `
    .cart-page { padding-top: calc(var(--nav-height) + 30px); padding-bottom: 60px; }

    /* Step indicator */
    .cart-steps { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 36px; }
    .cart-step { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: #bbb; transition: color 0.3s; }
    .cart-step.active { color: var(--accent-orange); }
    .cart-step.done { color: #27ae60; }
    .cart-step-num { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 700; border: 2px solid #ddd; background: #fff; color: #bbb; transition: all 0.3s; }
    .cart-step.active .cart-step-num { border-color: var(--accent-orange); background: var(--accent-orange); color: #fff; box-shadow: 0 2px 12px rgba(211,84,0,0.25); }
    .cart-step.done .cart-step-num { border-color: #27ae60; background: #27ae60; color: #fff; }
    .cart-step-line { width: 60px; height: 2px; background: #e0e0e0; margin: 0 8px; border-radius: 2px; }
    .cart-step-line.active { background: linear-gradient(90deg, var(--accent-orange), #e0e0e0); }
    .cart-step-line.done { background: #27ae60; }

    /* Item cards */
    .cart-item-card { background: #fff; border-radius: 16px; padding: 18px 20px; margin-bottom: 14px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #f0ece8;
        transition: all 0.25s ease; animation: cartItemIn 0.35s ease-out both; position: relative; overflow: hidden; }
    .cart-item-card:hover { box-shadow: 0 4px 20px rgba(160,64,0,0.08); border-color: #e8ddd4; transform: translateY(-1px); }
    .cart-item-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
        background: linear-gradient(180deg, var(--accent-orange), var(--primary-brown)); border-radius: 4px 0 0 4px; opacity: 0; transition: opacity 0.3s; }
    .cart-item-card:hover::before { opacity: 1; }

    @keyframes cartItemIn {
        from { opacity: 0; transform: translateX(-12px); }
        to { opacity: 1; transform: translateX(0); }
    }

    .cart-item-img { width: 72px; height: 72px; object-fit: cover; border-radius: 12px; flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

    /* Quantity stepper */
    .qty-stepper { display: inline-flex; align-items: center; gap: 0; border: 1.5px solid #e8e0d8; border-radius: 10px; overflow: hidden; background: #fdfbf9; }
    .qty-stepper button { width: 32px; height: 32px; border: none; background: transparent; color: var(--primary-brown);
        font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .qty-stepper button:hover { background: rgba(160,64,0,0.08); }
    .qty-stepper button:active { transform: scale(0.92); }
    .qty-stepper .qty-value { width: 36px; text-align: center; font-weight: 700; font-size: 0.92rem; color: var(--text-dark); 
        border-left: 1px solid #ede7e0; border-right: 1px solid #ede7e0; padding: 4px 0; }

    /* Remove button */
    .cart-remove-btn { width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #f5e5e5; background: #fff;
        color: #e74c3c; display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: all 0.25s ease; font-size: 0.85rem; }
    .cart-remove-btn:hover { background: #fdf0f0; border-color: #e74c3c; transform: scale(1.08); }

    /* Order summary card */
    .order-summary { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid #f0ece8;
        box-shadow: 0 4px 24px rgba(0,0,0,0.06); position: sticky; top: calc(var(--nav-height) + 30px); }
    .summary-divider { height: 1px; background: linear-gradient(90deg, transparent, #e0d6cc, transparent); margin: 16px 0; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
    .summary-row.total { padding: 12px 0 4px; }

    /* Checkout button */
    .checkout-btn { width: 100%; padding: 14px 20px; border: none; border-radius: 14px;
        background: linear-gradient(135deg, var(--accent-orange), var(--primary-brown));
        color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer;
        transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(160,64,0,0.2); position: relative; overflow: hidden; }
    .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(160,64,0,0.3); }
    .checkout-btn:active { transform: translateY(0); }
    .checkout-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); transition: left 0.5s; }
    .checkout-btn:hover::after { left: 100%; }

    .add-more-btn { width: 100%; padding: 12px 20px; border: 1.5px solid #e0d6cc; border-radius: 14px;
        background: transparent; color: var(--primary-brown); font-weight: 600; font-size: 0.92rem; cursor: pointer;
        transition: all 0.25s ease; margin-top: 10px; }
    .add-more-btn:hover { background: rgba(160,64,0,0.04); border-color: var(--accent-orange); }

    /* Clear cart button */
    .clear-cart-btn { background: none; border: none; color: #ccc; font-size: 0.78rem; font-weight: 600; cursor: pointer;
        transition: color 0.2s; padding: 0; }
    .clear-cart-btn:hover { color: #e74c3c; }

    /* Group meal badges */
    .gm-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px;
        font-size: 0.7rem; font-weight: 600; }
    .gm-badge-people { background: #fef5e7; color: #b7791f; border: 1px solid #fdebd0; }
    .gm-badge-savings { background: #eafaf1; color: #1e8449; border: 1px solid #d5f5e3; }

    /* Empty cart */
    .empty-cart { min-height: 55vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
        animation: fadeUp 0.5s ease-out; }
    .empty-cart-icon { font-size: 4.5rem; opacity: 0.12; animation: floatBag 3s ease-in-out infinite; }
    @keyframes floatBag { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* Price animation */
    .price-pop { animation: pricePop 0.3s ease; }
    @keyframes pricePop { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }

    /* Responsive */
    @media (max-width: 767px) {
        .cart-item-img { width: 56px; height: 56px; }
        .order-summary { position: static; margin-top: 24px; }
        .cart-step span:not(.cart-step-num) { display: none; }
        .cart-step-line { width: 32px; }
    }
`;

/* ─── Format Group Meal JSON ─── */
const formatDescription = (desc) => {
    if (!desc) return null;
    try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object' && parsed.inclusions) {
            const items = parsed.inclusions
                .split(/\\n|\n/)
                .map(s => s.trim())
                .filter(Boolean);
            return (
                <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.6 }}>
                        {items.map((item, i) => (
                            <span key={i}>{item}{i < items.length - 1 ? ', ' : ''}</span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        {parsed.goodFor && (
                            <span className="gm-badge gm-badge-people">👥 Good for {parsed.goodFor}</span>
                        )}
                        {parsed.savings > 0 && (
                            <span className="gm-badge gm-badge-savings">💰 Save ₱{parsed.savings}</span>
                        )}
                    </div>
                </div>
            );
        }
    } catch (e) { /* not JSON */ }
    return <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4 }}>{desc}</div>;
};

const CartPage = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleIncrement = (item) => {
        updateQuantity(item.cartItemId, item.quantity + 1);
    };

    const handleDecrement = (item) => {
        updateQuantity(item.cartItemId, item.quantity - 1);
    };

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: 'Clear Cart?',
            text: 'This will remove all items from your cart.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#999',
            confirmButtonText: 'Yes, clear it'
        });
        if (result.isConfirmed) clearCart();
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Sign In Required',
                text: 'Please log in to place your order.',
                confirmButtonColor: '#A04000'
            });
            navigate('/login');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Order?',
            html: `<div style="font-size:0.95rem">Place order for <b>${itemCount} item${itemCount !== 1 ? 's' : ''}</b> totaling <b style="color:#a04000">₱${total.toFixed(2)}</b>?</div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#A04000',
            cancelButtonColor: '#999',
            confirmButtonText: '<i class="bi bi-check-lg me-1"></i> Yes, Order Now'
        });

        if (result.isConfirmed) {
            setIsCheckingOut(true);
            try {
                const response = await fetch(`${API_URL}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        notes: "Customer order via Website",
                        items: cart.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            variant: item.variant
                        }))
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Order Placed! 🎉',
                        html: '<div>Your delicious meal is now being prepared.</div>',
                        confirmButtonColor: '#A04000',
                        timer: 5000
                    });
                    clearCart();
                    navigate('/profile');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Order Failed',
                        text: data.error || 'There was a problem placing your order.',
                        confirmButtonColor: '#A04000'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Checkout Error',
                    text: 'Could not reach the server. Please try again later.',
                    confirmButtonColor: '#A04000'
                });
            }
            setIsCheckingOut(false);
        }
    };

    /* ─── Empty Cart State ─── */
    if (cart.length === 0) {
        return (
            <>
                <style>{styles}</style>
                <div className="container cart-page">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h3 style={{ color: 'var(--primary-brown)', fontWeight: 700, marginBottom: 4 }}>Your cart is empty</h3>
                        <p style={{ color: '#999', fontSize: '0.95rem', maxWidth: 340, textAlign: 'center', lineHeight: 1.5 }}>
                            Looks like you haven't added any delicious meals yet. Explore our menu and find something you'll love!
                        </p>
                        <Link to="/menu" className="checkout-btn" style={{ width: 'auto', padding: '12px 36px', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <i className="bi bi-card-list"></i> Browse Menu
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{styles}</style>
            <div className="container cart-page">

                {/* ─── Step Progress ─── */}
                <div className="cart-steps">
                    <div className="cart-step active">
                        <span className="cart-step-num">1</span>
                        <span>Review Order</span>
                    </div>
                    <div className="cart-step-line active"></div>
                    <div className="cart-step">
                        <span className="cart-step-num">2</span>
                        <span>Checkout</span>
                    </div>
                    <div className="cart-step-line"></div>
                    <div className="cart-step">
                        <span className="cart-step-num">3</span>
                        <span>Order Confirmed</span>
                    </div>
                </div>

                <div className="row g-4">
                    {/* ─── Left: Cart Items ─── */}
                    <div className="col-lg-8">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 style={{ color: 'var(--primary-brown)', fontWeight: 700, margin: 0 }}>
                                <i className="bi bi-bag-check me-2" style={{ opacity: 0.6 }}></i>
                                Your Order
                                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#aaa', marginLeft: 8 }}>
                                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                                </span>
                            </h4>
                            <button className="clear-cart-btn" onClick={handleClearCart}>
                                <i className="bi bi-trash3 me-1"></i> Clear All
                            </button>
                        </div>

                        {cart.map((item, index) => (
                            <div className="cart-item-card" key={item.cartItemId} style={{ animationDelay: `${index * 0.06}s` }}>
                                <div className="d-flex align-items-start gap-3">
                                    <img 
                                        src={item.imageUrl || 'https://placehold.co/72x72/f5ebe0/a04000?text=🍽️'} 
                                        alt={item.name} 
                                        className="cart-item-img" 
                                    />
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <h6 style={{ fontWeight: 700, color: '#2c2c2c', margin: 0, fontSize: '0.95rem' }}>
                                                    {item.name}
                                                </h6>
                                                {item.variant && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
                                                        {item.variant}
                                                    </span>
                                                )}
                                                {formatDescription(item.description)}
                                            </div>
                                            <button 
                                                className="cart-remove-btn ms-2 flex-shrink-0" 
                                                onClick={() => removeFromCart(item.cartItemId)} 
                                                title="Remove item"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>

                                        {/* Bottom: Price + Qty */}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div className="qty-stepper">
                                                <button 
                                                    onClick={() => handleDecrement(item)}
                                                    title={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
                                                >
                                                    {item.quantity <= 1 ? <i className="bi bi-trash3" style={{ fontSize: '0.75rem', color: '#e74c3c' }}></i> : '−'}
                                                </button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button onClick={() => handleIncrement(item)} title="Increase quantity">+</button>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-brown)' }}>
                                                    ₱{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div style={{ fontSize: '0.72rem', color: '#bbb' }}>
                                                        ₱{item.price.toFixed(2)} each
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ─── Right: Order Summary ─── */}
                    <div className="col-lg-4">
                        <div className="order-summary">
                            <h5 style={{ fontWeight: 700, color: 'var(--primary-brown)', marginBottom: 20 }}>
                                <i className="bi bi-receipt me-2" style={{ opacity: 0.5 }}></i>
                                Order Summary
                            </h5>

                            <div className="summary-row">
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>Items ({itemCount})</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>₱{total.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>Delivery</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#27ae60' }}>Free</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#333' }}>Total</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-brown)' }}>
                                    ₱{total.toFixed(2)}
                                </span>
                            </div>

                            <div className="summary-divider"></div>

                            <button 
                                className="checkout-btn" 
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> Processing...</>
                                ) : (
                                    <><i className="bi bi-bag-check me-2"></i> Place Order</>
                                )}
                            </button>

                            <Link to="/menu" className="add-more-btn text-center d-block" style={{ textDecoration: 'none' }}>
                                <i className="bi bi-plus-lg me-1"></i> Add More Items
                            </Link>

                            {/* Trust badges */}
                            <div className="text-center mt-4" style={{ opacity: 0.4 }}>
                                <div style={{ fontSize: '0.72rem', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                    <span><i className="bi bi-shield-check me-1"></i>Secure</span>
                                    <span>•</span>
                                    <span><i className="bi bi-clock me-1"></i>Fast Prep</span>
                                    <span>•</span>
                                    <span><i className="bi bi-heart me-1"></i>Fresh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;
