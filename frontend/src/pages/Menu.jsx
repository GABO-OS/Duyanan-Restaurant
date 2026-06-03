import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import sfcImg from '../assets/img/sfc.png';
import habhabImg from '../assets/img/habhab.jpg';
import logoImg from '../assets/img/duyanan_logo.png';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Rice Meals', 'Sizzling Meals', 'Duyanan Specials', 'Burger', 'French Fries', 'Nachos', 'Home-Made Siomai', 'Drinks', 'Soup', 'Milk Shakes', 'Sandwich', 'Student Meals', 'Extras'];

    const categoryScrollRef = useRef(null);
    const scrollCategories = (direction) => {
        if (categoryScrollRef.current) {
            const scrollAmount = 200;
            categoryScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        axios.get(`${API_URL}/api/products`)
            .then(response => {
                const updatedProducts = response.data.map(p => {
                    let finalImg = p.imageUrl;
                    if (p.name === 'Sizzling Fried Chicken' || p.name === 'Chicken Inasal' || p.imageUrl === 'sfc.png' || p.imageUrl === 'sfc.jpg') {
                        finalImg = sfcImg;
                    } else if (p.name === 'Pancit Habhab' || p.imageUrl === 'habhab.jpg' || p.imageUrl === 'habhab.png') {
                        finalImg = habhabImg;
                    } else if (p.imageUrl === 'duyanan_logo.png') {
                        finalImg = logoImg;
                    } else if (p.imageUrl && !p.imageUrl.startsWith('http') && !p.imageUrl.startsWith('data:') && !p.imageUrl.startsWith('/')) {
                        finalImg = `/img/${p.imageUrl}`;
                    }
                    return { ...p, imageUrl: finalImg };
                });
                setProducts(updatedProducts);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setProducts([
                    { id: 1, name: 'Sizzling Fried Chicken', priceSolo: 109.00, priceALaCarte: 159.00, description: 'Solo | Ala Carte', imageUrl: sfcImg, category: 'Sizzling Meals' },
                    { id: 2, name: 'Pancit Habhab', priceALaCarte: 250.00, description: 'Ala Carte', imageUrl: habhabImg, category: 'Duyanan Specials' },
                    { id: 3, name: 'Lumpiang Turon', priceSolo: 50.00, description: '10pcs', imageUrl: 'https://placehold.co/300x200/brown/white?text=Turon', category: 'Extras' },
                    { id: 4, name: 'Chicken Inasal', priceSolo: 120.00, priceALaCarte: 170.00, description: 'Solo | Ala Carte', imageUrl: sfcImg, category: 'Rice Meals' },
                ]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Filter products by search query first
    const searchedProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group products by category
    const productsByCategory = categories.slice(1).reduce((acc, category) => {
        acc[category] = searchedProducts.filter(p => p.category === category);
        return acc;
    }, {});

    const scrollToCategory = (categoryName) => {
        setActiveCategory(categoryName);
        if (categoryName === 'All') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const element = document.getElementById(`category-${categoryName}`);
        if (element) {
            // Adjust offset for the sticky headers
            const y = element.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleAddToCart = (product) => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                html: 'You need an account to add items to cart.<br/><br/>Please <b>log in</b> or <b>register</b> to continue.',
                showCancelButton: true,
                confirmButtonText: '🔑 Login',
                cancelButtonText: 'Register',
                confirmButtonColor: 'var(--primary-brown)',
                cancelButtonColor: 'var(--accent-orange)',
                reverseButtons: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    navigate('/register');
                }
            });
            return;
        }

        const addAction = (variant = null, price = null) => {
            addToCart(product, variant, price);
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: 'Added to cart',
                text: `${product.name}${variant ? ` (${variant})` : ''} has been added.`,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true
            });
        };

        const comboPrices = (product.customCombos || []).map(c => c.price);
        const activePrices = [product.priceSolo, product.priceALaCarte, product.priceALaCarte2, product.price1Liter, product.price1Point5Liter, product.price2Liter, ...comboPrices].filter(p => p > 0);
        const hasVariants = activePrices.length > 1 || (product.category === 'Milk Shakes' && product.flavors && product.flavors.length > 0);

        if (hasVariants) {
            const flavorsList = product.flavors ? product.flavors.split(',').map(f => f.trim()).filter(f => f.length > 0) : [];
            const flavorDropdownHtml = flavorsList.length > 0 ? `
                <div class="mb-3 text-start px-1">
                    <label class="form-label fw-bold mb-1" style="color: #555; font-size: 0.85rem;">Select Flavor <span class="text-danger">*</span></label>
                    <select id="flavor-select" class="form-select shadow-sm" style="border-radius: 8px; border: 2px solid rgba(0,0,0,0.05); font-weight: 600; color: #444; padding: 6px 12px; cursor: pointer; font-size: 0.9rem;">
                        <option value="" disabled selected>Choose a flavor...</option>
                        ${flavorsList.map(f => `<option value="${f}">${f}</option>`).join('')}
                    </select>
                    <div id="flavor-error" class="text-danger mt-1 small d-none fw-bold"><i class="bi bi-exclamation-circle me-1"></i>Please select a flavor</div>
                </div>
            ` : '';

            Swal.fire({
                title: '',
                html: `
                    <style>
                        .swal2-popup {
                            border-radius: 24px !important;
                            overflow: hidden !important;
                            width: 26em !important;
                        }
                        .swal2-html-container {
                            overflow: hidden !important;
                            padding: 24px !important;
                        }
                        .variant-btn {
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            border: 2px solid transparent;
                            position: relative;
                            overflow: hidden;
                            cursor: pointer;
                        }
                        .variant-btn:hover {
                            transform: translateY(-2px) scale(1.01);
                            box-shadow: 0 4px 12px rgba(139, 58, 15, 0.2) !important;
                            border-color: rgba(255, 255, 255, 0.3);
                        }
                        .variant-btn:active {
                            transform: translateY(1px) scale(0.99);
                        }
                        .variant-btn::after {
                            content: '';
                            position: absolute;
                            top: 50%; left: 50%;
                            width: 150%; height: 150%;
                            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
                            transform: translate(-50%, -50%) scale(0);
                            transition: transform 0.4s ease-out;
                            opacity: 0;
                        }
                        .variant-btn:hover::after {
                            transform: translate(-50%, -50%) scale(1);
                            opacity: 1;
                        }
                        .swal-custom-cancel {
                            background-color: transparent !important;
                            color: #8B3A0F !important;
                            border: 2px solid rgba(139, 58, 15, 0.2) !important;
                            border-radius: 10px !important;
                            font-weight: 700 !important;
                            padding: 8px 24px !important;
                            font-size: 0.9rem !important;
                            transition: all 0.2s !important;
                            box-shadow: none !important;
                        }
                        .swal-custom-cancel:hover {
                            background-color: rgba(139, 58, 15, 0.05) !important;
                            border-color: #8B3A0F !important;
                            transform: translateY(-2px);
                        }
                    </style>
                    <div class="d-flex align-items-center mb-3 text-start pb-3" style="border-bottom: 2px solid rgba(0,0,0,0.05);">
                        <div style="width: 45px; height: 45px; flex-shrink: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.08); margin-right: 12px;">
                            <img src="${product.imageUrl || 'https://placehold.co/300x200?text=No+Image'}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                        <div>
                            <h4 style="color: var(--primary-brown); font-weight: 800; margin: 0 0 2px 0; font-size: 1.1rem; letter-spacing: -0.5px;">Choose Variant</h4>
                            <p style="margin: 0; color: #666; font-size: 0.85rem; font-weight: 600;">${product.name}</p>
                        </div>
                    </div>
                    ${flavorDropdownHtml}

                    <div class="d-flex flex-column px-2">
                        ${product.priceSolo > 0 ? `
                            <button id="btn-solo" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #8B3A0F, #5C1F00); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>${['Drinks', 'Milk Shakes'].includes(product.category) ? 'Glass' : ['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 1' : 'Solo'}</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.priceSolo.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${!['Drinks', 'Milk Shakes'].includes(product.category) && product.priceALaCarte > 0 ? `
                            <button id="btn-alacarte" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>${['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 2' : (product.priceALaCarte2 > 0 ? 'A La Carte 1' : 'A La Carte')}</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.priceALaCarte.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${!['Drinks', 'Milk Shakes'].includes(product.category) && product.priceALaCarte2 > 0 ? `
                            <button id="btn-alacarte2" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>A La Carte 2</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.priceALaCarte2.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${['Drinks', 'Milk Shakes'].includes(product.category) && product.price1Liter > 0 ? `
                            <button id="btn-1l" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>1 Liter</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.price1Liter.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${['Drinks', 'Milk Shakes'].includes(product.category) && product.price1Point5Liter > 0 ? `
                            <button id="btn-15l" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>1.5 Liters</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.price1Point5Liter.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${['Drinks', 'Milk Shakes'].includes(product.category) && product.price2Liter > 0 ? `
                            <button id="btn-2l" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>2 Liters</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.price2Liter.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${product.combo1Name && product.combo1Price > 0 ? `
                            <button id="btn-combo1" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>Combo: ${product.combo1Name}</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.combo1Price.toFixed(2)}</span>
                            </button>
                        ` : ''}
                        ${product.combo2Name && product.combo2Price > 0 ? `
                            <button id="btn-combo2" class="variant-btn btn text-white py-2 fw-bold shadow-sm d-flex justify-content-between align-items-center px-3" style="background: linear-gradient(135deg, #D35400, #A04000); border-radius: 12px !important; font-size: 0.95rem; min-height: 48px; margin-bottom: 12px !important; border: 2px solid transparent;">
                                <span>Combo: ${product.combo2Name}</span>
                                <span style="color: rgba(255,255,255,0.9);">₱${product.combo2Price.toFixed(2)}</span>
                            </button>
                        ` : ''}
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                buttonsStyling: false,
                customClass: {
                    cancelButton: 'swal-custom-cancel mt-4'
                },
                didOpen: () => {
                    const btnSolo = document.getElementById('btn-solo');
                    const btnAlaCarte = document.getElementById('btn-alacarte');
                    const btnAlaCarte2 = document.getElementById('btn-alacarte2');
                    const btn1L = document.getElementById('btn-1l');
                    const btn15L = document.getElementById('btn-15l');
                    const btn2L = document.getElementById('btn-2l');
                    const btnCombo1 = document.getElementById('btn-combo1');
                    const btnCombo2 = document.getElementById('btn-combo2');
                    const flavorSelect = document.getElementById('flavor-select');
                    const flavorError = document.getElementById('flavor-error');
                    
                    const validateFlavorAndAdd = (baseVariantName, price) => {
                        let finalVariantName = baseVariantName;
                        if (flavorSelect) {
                            if (!flavorSelect.value) {
                                flavorSelect.style.borderColor = '#dc3545';
                                flavorError.classList.remove('d-none');
                                // Shake animation
                                flavorSelect.classList.add('animate__animated', 'animate__headShake');
                                setTimeout(() => flavorSelect.classList.remove('animate__animated', 'animate__headShake'), 500);
                                return;
                            }
                            finalVariantName = `${flavorSelect.value} - ${baseVariantName}`;
                        }
                        Swal.close();
                        addAction(finalVariantName, price);
                    };

                    if (flavorSelect) {
                        flavorSelect.addEventListener('change', () => {
                            flavorSelect.style.borderColor = 'rgba(0,0,0,0.05)';
                            flavorError.classList.add('d-none');
                        });
                    }

                    if (btnSolo) {
                        btnSolo.addEventListener('click', () => {
                            validateFlavorAndAdd(['Drinks', 'Milk Shakes'].includes(product.category) ? 'Glass' : ['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 1' : 'Solo', product.priceSolo);
                        });
                    }
                    if (btnAlaCarte) {
                        btnAlaCarte.addEventListener('click', () => {
                            validateFlavorAndAdd(['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 2' : (product.priceALaCarte2 > 0 ? 'A La Carte 1' : 'A La Carte'), product.priceALaCarte);
                        });
                    }
                    if (btnAlaCarte2) {
                        btnAlaCarte2.addEventListener('click', () => {
                            validateFlavorAndAdd('A La Carte 2', product.priceALaCarte2);
                        });
                    }
                    (product.customCombos || []).forEach((combo, idx) => {
                        const btn = document.getElementById(`btn-combo-${idx}`);
                        if (btn) {
                            btn.addEventListener('click', () => {
                                validateFlavorAndAdd(`Combo: ${combo.name}`, combo.price);
                            });
                        }
                    });
                    if (btn1L) {
                        btn1L.addEventListener('click', () => {
                            validateFlavorAndAdd('1 Liter', product.price1Liter);
                        });
                    }
                    if (btn15L) {
                        btn15L.addEventListener('click', () => {
                            validateFlavorAndAdd('1.5 Liters', product.price1Point5Liter);
                        });
                    }
                    if (btn2L) {
                        btn2L.addEventListener('click', () => {
                            validateFlavorAndAdd('2 Liters', product.price2Liter);
                        });
                    }
                }
            });
        } else {
            let activeVariant = null;
            let activePrice = 0;
            if (product.priceSolo > 0) { activeVariant = ['Drinks', 'Milk Shakes'].includes(product.category) ? 'Glass' : ['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 1' : 'Solo'; activePrice = product.priceSolo; }
            else if (product.priceALaCarte > 0) { activeVariant = product.category === 'Drinks' ? null : ['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) ? 'Price 2' : (product.priceALaCarte2 > 0 ? 'A La Carte 1' : 'A La Carte'); activePrice = product.priceALaCarte; }
            else if (product.priceALaCarte2 > 0) { activeVariant = 'A La Carte 2'; activePrice = product.priceALaCarte2; }
            else if (product.price1Liter > 0) { activeVariant = '1 Liter'; activePrice = product.price1Liter; }
            else if (product.price1Point5Liter > 0) { activeVariant = '1.5 Liters'; activePrice = product.price1Point5Liter; }
            else if (product.price2Liter > 0) { activeVariant = '2 Liters'; activePrice = product.price2Liter; }
            
            // For milk shakes with only 1 variant (or 0) but multiple flavors, they will trigger the modal due to hasVariants.
            // If they reach here, it means 0 or 1 price AND 0 or 1 flavors.
            const singleFlavor = (product.category === 'Milk Shakes' && product.flavors) ? product.flavors.split(',')[0].trim() : null;
            if (singleFlavor && activeVariant) {
                activeVariant = `${singleFlavor} - ${activeVariant}`;
            }

            addAction(activeVariant, activePrice);
        }
    };

    return (
        <div className="container-fluid px-0" style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)', paddingBottom: '40px' }}>
            {/* Guest info banner */}
            {!isAuthenticated && (
                <div style={{
                    background: 'linear-gradient(90deg, #7B3F00 0%, #D35400 100%)',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '10px 20px',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <i className="bi bi-eye-fill" style={{ fontSize: '1.1rem' }}></i>
                    You&apos;re browsing as a guest — <strong>&nbsp;view only.</strong>&nbsp;
                    <a href="/login" style={{ color: '#ffd580', textDecoration: 'underline', fontWeight: 700 }}>Log in</a>
                    &nbsp;or&nbsp;
                    <a href="/register" style={{ color: '#ffd580', textDecoration: 'underline', fontWeight: 700 }}>Register</a>
                    &nbsp;to order.
                </div>
            )}

            {/* Sticky category nav bar */}
            <div className="sticky-top bg-white pt-4 pb-3 px-4 shadow-sm z-3" style={{ top: 'var(--nav-height)' }}>
                <h2 className="mb-3" style={{ color: 'var(--primary-brown)', fontWeight: 'bold' }}>Duyanan Menu</h2>
                
                <div className="d-flex align-items-center flex-wrap flex-md-nowrap gap-3">
                    {/* Search Bar */}
                    <div className="position-relative" style={{ minWidth: '250px' }}>
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control rounded-pill ps-5" 
                            placeholder="Search Menu" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: '1px solid #ccc', boxShadow: 'none' }}
                        />
                    </div>

                    {/* Horizontal Scroller for Categories with Arrows */}
                    <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                        <button className="btn btn-sm border-0 text-muted px-1 me-1" onClick={() => scrollCategories('left')}>
                            <i className="bi bi-chevron-left fs-5"></i>
                        </button>
                        
                        <div ref={categoryScrollRef} className="overflow-x-auto no-scrollbar d-flex align-items-center gap-2 flex-grow-1 px-1" style={{ whiteSpace: 'nowrap', scrollBehavior: 'smooth' }}>
                            <button 
                                className="btn rounded-pill border-0 fw-bold px-4 py-2"
                                onClick={() => scrollToCategory('All')}
                                style={{ 
                                    backgroundColor: activeCategory === 'All' ? 'var(--accent-orange)' : 'transparent', 
                                    color: activeCategory === 'All' ? '#fff' : '#6c757d', 
                                }}
                            >
                                All
                            </button>
                            {categories.slice(1).map(cat => (
                                <button 
                                    key={cat}
                                    className="btn rounded-pill border-0 fw-bold px-4 py-2"
                                    onClick={() => scrollToCategory(cat)}
                                    style={{ 
                                        backgroundColor: activeCategory === cat ? 'var(--accent-orange)' : 'transparent', 
                                        color: activeCategory === cat ? '#fff' : '#6c757d', 
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <button className="btn btn-sm border-0 text-muted px-1 ms-1" onClick={() => scrollCategories('right')}>
                            <i className="bi bi-chevron-right fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="px-4 mt-4">
                {isLoading ? (
                    <div className="duyanan-loading-overlay">
                        <div className="duyanan-loading-card">
                            <div className="duyanan-loading-icon-wrap">
                                <span className="duyanan-loading-leaf">🍃</span>
                                <span className="duyanan-loading-ring"></span>
                            </div>
                            <p className="duyanan-loading-text">Preparing the menu<span className="duyanan-loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
                            <p className="duyanan-loading-sub">Duyanan Restaurant</p>
                        </div>
                    </div>
                ) : (
                    <>
                {categories.slice(1).map(category => {
                    const categoryProducts = productsByCategory[category] || [];
                    
                    // Only render the section if there are actual products in this category
                    // or if there's an active search that matches nothing, we handle that elsewhere
                    if (categoryProducts.length === 0 && searchQuery === '') return null;

                    return (
                        <div key={category} id={`category-${category}`} className="mb-5 pt-2">
                            <h3 className="mb-4 pb-2" style={{ color: 'var(--primary-brown)', fontWeight: 'bold', borderBottom: '2px solid rgba(160, 64, 0, 0.1)' }}>
                                {category}
                            </h3>
                            
                            {categoryProducts.length > 0 ? (
                                <div className="row g-4">
                                    {categoryProducts.map(product => (
                                        <div className="col-md-6 col-lg-6 col-xl-4" key={product.id}>
                                            <div className="card h-100 border-0 bg-white" style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <div className="d-flex h-100 align-items-center p-3">
                                                    {/* Image Container */}
                                                    <div style={{ width: '120px', height: '120px', flexShrink: 0, overflow: 'hidden', borderRadius: '10px' }}>
                                                        <img 
                                                            src={product.imageUrl || 'https://placehold.co/300x200?text=No+Image'} 
                                                            alt={product.name} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        />
                                                    </div>
                                                    
                                                    {/* Content Container */}
                                                    <div className="ms-3 d-flex flex-column h-100 justify-content-center w-100 pt-1">
                                                        <h5 className="mb-1" style={{ color: '#222', fontWeight: '700', fontSize: '1.05rem', lineHeight: '1.3' }}>
                                                            {product.category === 'Milk Shakes' && product.flavors ? product.flavors : product.name}
                                                        </h5>
                                                        <p className="text-muted mb-2" style={{ fontSize: '0.82rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {product.description}
                                                        </p>
                                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-1">
                                                            <div className="d-flex flex-column">
                                                                {['Milk Shakes', 'Drinks'].includes(product.category) && (
                                                                    <>
                                                                        {product.priceSolo > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                Glass: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.priceSolo.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.priceALaCarte > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.priceALaCarte.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.price1Liter > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                1 Liter: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.price1Liter.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.price1Point5Liter > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                1.5 Liters: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.price1Point5Liter.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.price2Liter > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                2 Liters: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.price2Liter.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                                
                                                                {['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(product.category) && (
                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '700', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                        {product.priceSolo > 0 && product.priceALaCarte > 0 
                                                                            ? `₱${product.priceSolo.toFixed(2)} - ₱${product.priceALaCarte.toFixed(2)}` 
                                                                            : `₱${(product.priceSolo || product.priceALaCarte || 0).toFixed(2)}`}
                                                                    </span>
                                                                )}

                                                                {['Nachos', 'Sandwich', 'Student Meals'].includes(product.category) && (
                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '700', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                        ₱{(product.priceSolo || 0).toFixed(2)}
                                                                    </span>
                                                                )}

                                                                {!['Milk Shakes', 'Drinks', 'Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup', 'Nachos', 'Sandwich', 'Student Meals'].includes(product.category) && (
                                                                    <>
                                                                        {product.priceSolo > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                Solo: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.priceSolo.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.priceALaCarte > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                {product.priceALaCarte2 > 0 ? 'A La Carte 1' : 'A La Carte'}: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.priceALaCarte.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                        {product.priceALaCarte2 > 0 && (
                                                                            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                                                                                A La Carte 2: <span style={{ color: 'var(--accent-orange)', fontSize: '0.82rem' }}>₱{product.priceALaCarte2.toFixed(2)}</span>
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <button 
                                                                className="btn btn-sm px-3 fw-bold rounded-pill text-nowrap" 
                                                                style={{ 
                                                                    backgroundColor: 'rgba(211, 84, 0, 0.08)', 
                                                                    color: 'var(--accent-orange)',
                                                                    fontSize: '0.8rem',
                                                                    transition: 'all 0.2s ease',
                                                                    opacity: isAuthenticated ? 1 : 0.75,
                                                                    cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                                                                    border: '1px solid rgba(211, 84, 0, 0.15)'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (isAuthenticated) {
                                                                        e.currentTarget.style.backgroundColor = 'var(--accent-orange)';
                                                                        e.currentTarget.style.color = '#fff';
                                                                    }
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    if (isAuthenticated) {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(211, 84, 0, 0.08)';
                                                                        e.currentTarget.style.color = 'var(--accent-orange)';
                                                                    }
                                                                }}
                                                                onClick={() => handleAddToCart(product)}
                                                                title={!isAuthenticated ? 'Login to add items to cart' : ''}
                                                            >
                                                                {!isAuthenticated && <i className="bi bi-lock-fill me-1" style={{ fontSize: '0.7rem' }}></i>}
                                                                Add Order
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No products match your search in this category.</p>
                            )}
                        </div>
                    );
                })}

                    {searchedProducts.length === 0 && searchQuery !== '' && (
                        <div className="text-center py-5">
                            <i className="bi bi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <h4 className="mt-3 text-muted">No results found for "{searchQuery}"</h4>
                            <p className="text-muted">Try adjusting your search term.</p>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Menu;
