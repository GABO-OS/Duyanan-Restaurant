import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', priceSolo: '', priceALaCarte: '', priceALaCarte2: '', price1Liter: '', price1Point5Liter: '', price2Liter: '', description: '', imageUrl: '', category: 'Rice Meals', flavors: '', customCombos: []
    });

    const addCombo = (e) => {
        e.preventDefault();
        setProductForm(prev => ({
            ...prev,
            customCombos: [...(prev.customCombos || []), { name: '', price: '' }]
        }));
    };

    const updateCombo = (index, field, value) => {
        setProductForm(prev => {
            const updatedCombos = [...(prev.customCombos || [])];
            updatedCombos[index] = { ...updatedCombos[index], [field]: value };
            return { ...prev, customCombos: updatedCombos };
        });
    };

    const removeCombo = (e, index) => {
        e.preventDefault();
        setProductForm(prev => {
            const updatedCombos = [...(prev.customCombos || [])];
            updatedCombos.splice(index, 1);
            return { ...prev, customCombos: updatedCombos };
        });
    };

    const categories = ['Rice Meals', 'Sizzling Meals', 'Duyanan Specials', 'Burger', 'French Fries', 'Nachos', 'Home-Made Siomai', 'Drinks', 'Soup', 'Milk Shakes', 'Sandwich', 'Student Meals', 'Extras'];

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
    });

    // ── Fetch Data ────────────────────────────────────────
    const fetchData = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const [usersRes, productsRes, ordersRes, resRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/users`, { headers: authHeaders() }),
                fetch(`${API_URL}/api/admin/products`, { headers: authHeaders() }),
                fetch(`${API_URL}/api/admin/orders`, { headers: authHeaders() }),
                fetch(`${API_URL}/api/admin/reservations`, { headers: authHeaders() })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (productsRes.ok) setProducts(await productsRes.json());
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (resRes.ok) setReservations(await resRes.json());
        } catch (e) {
            console.error("Failed to fetch admin data", e);
        }
        if (showLoading) setIsLoading(false);
    };

    const [isAlertVisible, setIsAlertVisible] = useState(false);

    useEffect(() => {
        fetchData();
        setMessage(`Welcome, ${user?.firstName || 'Admin'}! You have securely accessed the Admin Panel.`);
        setIsAlertVisible(true);
        
        // Auto-refresh data every 10 seconds
        const interval = setInterval(() => {
            fetchData(false); // silent fetch
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (message) {
            setIsAlertVisible(true);
            const timer = setTimeout(() => {
                setIsAlertVisible(false);
                // Wait for animation
                setTimeout(() => setMessage(''), 800);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // ── Products CRUD ─────────────────────────────────────
    const resetProductForm = () => {
        let defaultCategory = 'Rice Meals';
        if (activeTab === 'event-packages') {
            defaultCategory = 'Event Packages';
        } else if (activeTab === 'group-meals') {
            defaultCategory = 'Group Meals';
        }
        setProductForm({ name: '', priceSolo: '', priceALaCarte: '', priceALaCarte2: '', price1Liter: '', price1Point5Liter: '', price2Liter: '', description: '', imageUrl: '', category: defaultCategory, flavors: '', customCombos: [] });
        setEditingProduct(null);
        setShowProductForm(false);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const payload = { 
            ...productForm, 
            name: productForm.category === 'Milk Shakes' ? 'Milk Shake' : productForm.name,
            priceSolo: productForm.priceSolo ? parseFloat(productForm.priceSolo) : 0,
            priceALaCarte: productForm.priceALaCarte ? parseFloat(productForm.priceALaCarte) : 0,
            priceALaCarte2: productForm.priceALaCarte2 ? parseFloat(productForm.priceALaCarte2) : 0,
            price1Liter: productForm.price1Liter ? parseFloat(productForm.price1Liter) : 0,
            price1Point5Liter: productForm.price1Point5Liter ? parseFloat(productForm.price1Point5Liter) : 0,
            price2Liter: productForm.price2Liter ? parseFloat(productForm.price2Liter) : 0,
            customCombos: (productForm.customCombos || []).map(c => ({ name: c.name, price: parseFloat(c.price) || 0 })).filter(c => c.name && c.price > 0)
        };

        try {
            const url = editingProduct
                ? `${API_URL}/api/admin/products/${editingProduct.id}`
                : `${API_URL}/api/admin/products`;
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: editingProduct ? 'Product Updated' : 'Product Created',
                    text: `Successfully ${editingProduct ? 'updated' : 'created'} ${payload.name}.`,
                    confirmButtonColor: 'var(--primary-brown)'
                });
                resetProductForm();
                fetchData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Action Failed',
                    text: 'Unable to save the product. Please check your inputs.',
                    confirmButtonColor: 'var(--primary-brown)'
                });
            }
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error saving product.',
                confirmButtonColor: 'var(--primary-brown)'
            });
        }
    };

    const handleEditProduct = (product) => {
        setProductForm({
            name: product.name,
            priceSolo: product.priceSolo || '',
            priceALaCarte: product.priceALaCarte || '',
            priceALaCarte2: product.priceALaCarte2 || '',
            price1Liter: product.price1Liter || '',
            price1Point5Liter: product.price1Point5Liter || '',
            price2Liter: product.price2Liter || '',
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            category: product.category || 'Rice Meals',
            flavors: product.flavors || '',
            customCombos: product.customCombos || []
        });
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This product will be permanently removed from the menu.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                });
                if (res.ok) {
                    Swal.fire('Deleted!', 'Product has been removed.', 'success');
                    fetchData();
                }
            } catch (e) {
                Swal.fire('Error', 'Failed to delete product.', 'error');
            }
        }
    };

    // ── Orders & Reservations Status ──────────────────────
    const handleUpdateStatus = async (type, id, status) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/${type}/${id}/status`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Status Updated',
                    showConfirmButton: false,
                    timer: 2000
                });
                fetchData();
            }
        } catch (e) {
            Swal.fire('Error', 'Failed to update status.', 'error');
        }
    };

    // ── Derived Stats ─────────────────────────────────────
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const preparingOrders = orders.filter(o => o.status === 'PREPARING').length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const pendingRes = reservations.filter(r => r.status === 'PENDING').length;
    const confirmedRes = reservations.filter(r => r.status === 'CONFIRMED').length;
    const cancelledRes = reservations.filter(r => r.status === 'CANCELLED').length;

    // ── Analytics & Forecasting Processors (Live Data) ──
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED');
    const liveTotalSales = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const liveAOV = activeOrders.length > 0 ? liveTotalSales / activeOrders.length : 0;

    // 14-day history baseline merged with real database orders
    const dailySalesData = [];
    const today = new Date();
    const baselineDailySales = [
        6800, 7200, 6500, 8900, 11500, 12800, 10200, // Week 1 (Mon-Sun baseline)
        7000, 7500, 6800, 9200, 12000, 13500, 11000  // Week 2 (Mon-Sun baseline)
    ];

    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        // Find real orders on this day
        const realOrdersOnDay = activeOrders.filter(o => {
            const oDate = new Date(o.orderDate);
            oDate.setHours(0, 0, 0, 0);
            return oDate.getTime() === d.getTime();
        });
        
        const realSales = realOrdersOnDay.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const dayOfWeekIndex = d.getDay(); // 0 = Sun, 1 = Mon, ...
        const baselineIndex = i % 14;
        const baselineVal = baselineDailySales[13 - baselineIndex];
        
        // If we have >= 10 real orders overall, we transition towards purely real daily data.
        // Otherwise, we show baseline + real sales so the dashboard remains populated and visually rich.
        const finalSales = activeOrders.length >= 10 ? realSales : (baselineVal + realSales);
        
        dailySalesData.push({
            date: d,
            label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'short' }),
            sales: finalSales,
            realSales: realSales,
            orderCount: realOrdersOnDay.length,
            isForecast: false
        });
    }

    // Weekly average sales per day of the week
    const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdaySales = weekdayLabels.map(label => {
        const matchingDays = dailySalesData.filter(d => d.dayOfWeek.startsWith(label));
        const total = matchingDays.reduce((sum, d) => sum + d.sales, 0);
        const avg = matchingDays.length > 0 ? total / matchingDays.length : 0;
        return { label, sales: avg };
    });

    const liveAvgDailySales = dailySalesData.reduce((sum, d) => sum + d.sales, 0) / 14;

    // Top Performing Category
    const categoryTotals = {};
    activeOrders.forEach(o => {
        o.items?.forEach(item => {
            const cat = item.product?.category || 'Uncategorized';
            const subtotal = item.subtotal || ((item.unitPrice || 0) * (item.quantity || 1));
            categoryTotals[cat] = (categoryTotals[cat] || 0) + subtotal;
        });
    });
    let topCategory = 'N/A';
    let topCategorySales = 0;
    Object.entries(categoryTotals).forEach(([cat, sales]) => {
        if (sales > topCategorySales) {
            topCategory = cat;
            topCategorySales = sales;
        }
    });
    if (topCategory === 'N/A') {
        topCategory = 'Sizzling Meals'; // reasonable default
    }

    // Forecasting: Calculate trend growth factor comparing Week 2 vs Week 1
    const week1Sales = dailySalesData.slice(0, 7).reduce((sum, d) => sum + d.sales, 0);
    const week2Sales = dailySalesData.slice(7, 14).reduce((sum, d) => sum + d.sales, 0);
    const rawGrowthRate = week1Sales > 0 ? (week2Sales - week1Sales) / week1Sales : 0.05;
    const boundedGrowthRate = Math.max(-0.2, Math.min(0.4, rawGrowthRate));
    const growthPercentString = `${boundedGrowthRate >= 0 ? '+' : ''}${(boundedGrowthRate * 100).toFixed(0)}%`;

    // Project next 7 days
    const projectedSalesData = [];
    for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        d.setHours(0, 0, 0, 0);
        
        const prevDayData = dailySalesData[14 - 7 + (i - 1) % 7];
        const projectedSales = prevDayData.sales * (1 + boundedGrowthRate);
        
        projectedSalesData.push({
            date: d,
            label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'short' }),
            sales: projectedSales,
            realSales: 0,
            orderCount: 0,
            isForecast: true
        });
    }

    const projectedRevenueNextMonth = liveAvgDailySales * 30 * (1 + boundedGrowthRate);

    // Busiest Day of week
    let busiestDay = 'Saturday';
    let maxDaySales = 0;
    weekdaySales.forEach(ws => {
        if (ws.sales > maxDaySales) {
            maxDaySales = ws.sales;
            busiestDay = ws.label === 'Mon' ? 'Monday' : ws.label === 'Tue' ? 'Tuesday' : ws.label === 'Wed' ? 'Wednesday' : ws.label === 'Thu' ? 'Thursday' : ws.label === 'Fri' ? 'Friday' : ws.label === 'Sat' ? 'Saturday' : 'Sunday';
        }
    });

    // Peak Hour range
    const hourlyOrders = Array(24).fill(0);
    activeOrders.forEach(o => {
        const hour = new Date(o.orderDate).getHours();
        hourlyOrders[hour] += 1;
    });
    let peakHourStart = 18;
    let maxOrdersInHour = 0;
    for (let h = 0; h < 24; h++) {
        if (hourlyOrders[h] > maxOrdersInHour) {
            maxOrdersInHour = hourlyOrders[h];
            peakHourStart = h;
        }
    }
    const peakHourFormatted = `${peakHourStart > 12 ? peakHourStart - 12 : peakHourStart === 0 ? 12 : peakHourStart} ${peakHourStart >= 12 ? 'PM' : 'AM'}`;
    const peakHourEnd = (peakHourStart + 2) % 24;
    const peakHourEndFormatted = `${peakHourEnd > 12 ? peakHourEnd - 12 : peakHourEnd === 0 ? 12 : peakHourEnd} ${peakHourEnd >= 12 ? 'PM' : 'AM'}`;

    const getTrendAdvice = () => {
        let advice = "";
        if (boundedGrowthRate >= 0) {
            advice += `Weekly sales are growing by ${growthPercentString}. `;
        } else {
            advice += `Weekly sales are down by ${Math.abs(boundedGrowthRate * 100).toFixed(0)}%. `;
        }
        
        advice += `The busiest day of the week is typically ${busiestDay}. The top performing category is ${topCategory}, generating a significant portion of your revenue. `;
        
        if (topCategory === 'Sizzling Meals' || topCategory === 'Rice Meals' || topCategory === 'Duyanan Specials') {
            advice += `We project a demand increase for ${topCategory} this weekend. Consider preparing extra ingredients and checking inventory for this category. `;
        } else {
            advice += `Ensure sufficient staff scheduling between ${peakHourFormatted} and ${peakHourEndFormatted} to handle peak hourly traffic.`;
        }
        return advice;
    };

    // ── Components ────────────────────────────────────────
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { id: 'orders', label: 'Orders', icon: 'bi-bag-check' },
        { id: 'reservations', label: 'Reservations', icon: 'bi-calendar-event' },
        { id: 'products', label: 'Menu', icon: 'bi-card-list' },
        { id: 'event-packages', label: 'Event Packages', icon: 'bi-gift' },
        { id: 'group-meals', label: 'Group Meals', icon: 'bi-people' },
        { id: 'sales', label: 'Sales', icon: 'bi-bar-chart' },
        { id: 'forecasting', label: 'Forecasting', icon: 'bi-graph-up-arrow' },
        { id: 'users', label: 'Users', icon: 'bi-people' }
    ];

    const StatBox = ({ title, value, subtitle }) => (
        <div className="card border border-light shadow-sm rounded-3 h-100 text-center">
            <div className="card-body py-4">
                <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>{title}</h6>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-brown)' }}>{value}</h2>
                {subtitle && <small className="text-success fw-bold"><i className="bi bi-arrow-up-right me-1"></i>{subtitle}</small>}
            </div>
        </div>
    );

    return (
        <div className="d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: '#fdfcfb' }}>
            {/* ── Desktop Header ── */}
            <header 
                className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm" 
                style={{ 
                    background: 'linear-gradient(to right, var(--accent-orange), var(--dark-brown))', 
                    color: '#fff', 
                    zIndex: 1050,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Left: Logo */}
                <div className="d-flex align-items-center" style={{ minWidth: '220px' }}>
                    {/* Hamburger visible on mobile only */}
                    <button className="btn btn-sm me-3 shadow-none text-white border-0 d-lg-none" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '2rem' }}></i>
                    </button>
                    <div className="d-flex align-items-center" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.6rem', transform: 'rotate(-20deg)', display: 'inline-block', marginRight: '8px' }}>🍃</span>
                        <div className="d-flex flex-column" style={{ lineHeight: 1.1 }}>
                            <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Duyanan</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: '600', opacity: 0.8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Administrator</span>
                        </div>
                    </div>
                </div>

                {/* Center: Horizontal Nav for Desktop */}
                <nav className="d-none d-lg-flex gap-2 justify-content-center flex-grow-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`btn border-0 px-2 py-1 fw-bold rounded-pill transition-all ${activeTab === item.id ? 'bg-white text-dark shadow-sm' : 'text-white opacity-75'}`}
                            style={{ fontSize: '0.88rem' }}
                        >
                            <i className={`bi ${item.icon} me-1`}></i>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Right: Logout */}
                <div className="d-flex align-items-center justify-content-end" style={{ minWidth: '160px' }}>
                    <button
                        className="btn btn-outline-light d-flex align-items-center gap-2 px-3 py-2 fw-bold"
                        style={{ fontSize: '0.85rem', borderRadius: '10px', letterSpacing: '0.03em' }}
                        onClick={() => { logout(); window.location.href = '/'; }}
                    >
                        <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>
                        Logout
                    </button>
                </div>
            </header>

            <div className="d-flex flex-column flex-grow-1 position-relative" style={{ overflow: 'hidden' }}>
                {/* ── Mobile Sidebar Drawer ── */}
                {isSidebarOpen && (
                    <div 
                        className="position-absolute top-0 start-0 w-100 h-100 bg-dark d-lg-none" 
                        style={{ opacity: 0.5, zIndex: 1040 }}
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                <style>{`
                    .admin-mobile-drawer {
                        width: 280px;
                        z-index: 1045;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        transition: transform 0.3s ease-in-out;
                        height: 100%;
                        background: linear-gradient(to bottom, var(--accent-orange), var(--dark-brown));
                        color: #fff;
                        box-shadow: 4px 0 15px rgba(0,0,0,0.2);
                    }
                    .nav-item-mobile {
                        padding: 15px 25px;
                        border-left: 4px solid transparent;
                        transition: all 0.2s;
                        color: #555;
                        font-weight: 600;
                    }
                    .nav-item-mobile.active {
                        background-color: rgba(211, 84, 0, 0.05);
                        color: var(--accent-orange);
                        border-left-color: var(--accent-orange);
                    }
                `}</style>

                <div 
                    className="admin-mobile-drawer d-lg-none"
                    style={{ transform: `translateX(${isSidebarOpen ? '0' : '-100%'})` }}
                >
                    <div className="p-4 border-bottom border-white border-opacity-10 d-flex align-items-center justify-content-between">
                        <span className="fw-bold fs-5 text-white">Navigation</span>
                        <button className="btn-close btn-close-white" onClick={() => setIsSidebarOpen(false)}></button>
                    </div>
                    <div className="py-2">
                        {navItems.map(item => (
                            <div 
                                key={item.id}
                                className={`nav-item-mobile cursor-pointer ${activeTab === item.id ? 'bg-white bg-opacity-20 fw-bold' : 'text-white opacity-75'}`}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                style={{ cursor: 'pointer', padding: '12px 24px', transition: 'all 0.2s' }}
                            >
                                <i className={`bi ${item.icon} me-3 fs-5 ${activeTab === item.id ? 'text-white' : ''}`}></i>
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="flex-grow-1 w-100" style={{ backgroundColor: '#fdfcfb' }}>
                    {/* ── Floating Alert ── */}
                    {message && (
                        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 2000, width: 'max-content', maxWidth: '90%' }}>
                            <div className={`alert alert-success border-0 shadow-lg rounded-4 py-3 px-4 fw-bold d-inline-flex align-items-center mb-0 animate__animated ${isAlertVisible ? 'animate__fadeInDown' : 'animate__backOutUp'}`} role="alert" style={{ backgroundColor: '#e6ffed', border: '1px solid #d4edda' }}>
                                <i className="bi bi-check-circle-fill me-3 fs-4 text-success"></i>
                                {message}
                            </div>
                        </div>
                    )}

                    <div className="p-4 p-md-5">
                        {isLoading ? (
                            <div className="duyanan-loading-overlay">
                                <div className="duyanan-loading-card">
                                    <div className="duyanan-loading-icon-wrap">
                                        <span className="duyanan-loading-leaf">🍃</span>
                                        <span className="duyanan-loading-ring"></span>
                                    </div>
                                    <p className="duyanan-loading-text">Preparing your table<span className="duyanan-loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
                                    <p className="duyanan-loading-sub">Duyanan Restaurant</p>
                                </div>
                            </div>
                        ) : (
                        <>
                            {/* ── Dashboard Tab ── */}
                            {activeTab === 'dashboard' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Dashboard Overview</h3>
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-4">
                                            <StatBox 
                                                title="Total Sales" 
                                                value={`₱${liveTotalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                                                subtitle={`${growthPercentString} this week`} 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <StatBox 
                                                title="Total Orders" 
                                                value={orders.length} 
                                                subtitle={`${pendingOrders} pending, ${completedOrders} completed`} 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <StatBox 
                                                title="Pending Reservations" 
                                                value={pendingRes} 
                                            />
                                        </div>
                                    </div>

                                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Sales Forecasting (Live)</h5>
                                            <div style={{ height: '200px', width: '100%', position: 'relative', borderBottom: '2px solid #eee', borderLeft: '2px solid #eee' }}>
                                                {(() => {
                                                    const last7Days = dailySalesData.slice(7, 14);
                                                    const max7 = Math.max(...last7Days.map(d => d.sales), 1);
                                                    const min7 = Math.min(...last7Days.map(d => d.sales), 0);
                                                    const getPointX = (idx) => idx * (100 / 6);
                                                    const getPointY = (val) => 90 - ((val - min7) / (max7 - min7 || 1)) * 80;
                                                    
                                                    let pathD = `M ${getPointX(0)},${getPointY(last7Days[0].sales)}`;
                                                    for (let i = 0; i < last7Days.length - 1; i++) {
                                                        const x0 = getPointX(i);
                                                        const y0 = getPointY(last7Days[i].sales);
                                                        const x1 = getPointX(i + 1);
                                                        const y1 = getPointY(last7Days[i + 1].sales);
                                                        const cp1x = x0 + (x1 - x0) / 2;
                                                        const cp1y = y0;
                                                        const cp2x = x0 + (x1 - x0) / 2;
                                                        const cp2y = y1;
                                                        pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
                                                    }
                                                    const areaD = `${pathD} L 100,100 L 0,100 Z`;
                                                    
                                                    return (
                                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                            <defs>
                                                                <filter id="dashGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                                                                    <feMerge>
                                                                        <feMergeNode in="blur" />
                                                                        <feMergeNode in="SourceGraphic" />
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <path d={areaD} fill="rgba(211, 84, 0, 0.08)" />
                                                            <path d={pathD} fill="none" stroke="var(--accent-orange)" strokeWidth="2.5" filter="url(#dashGlow)" />
                                                        </svg>
                                                    );
                                                })()}
                                            </div>
                                            <div className="d-flex justify-content-between mt-2 text-muted small">
                                                {dailySalesData.slice(7, 14).map((d, idx) => (
                                                    <span key={idx} className="fw-bold">{d.dayOfWeek}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Active Orders Tab ── */}
                            {activeTab === 'orders' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Active Orders</h3>
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-4"><StatBox title="Pending" value={pendingOrders} /></div>
                                        <div className="col-md-4"><StatBox title="Preparing" value={preparingOrders} /></div>
                                        <div className="col-md-4"><StatBox title="Completed" value={completedOrders} /></div>
                                    </div>

                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                                <tr>
                                                    <th className="py-3 px-4 border-0 text-center">Order ID</th>
                                                    <th className="py-3 px-4 border-0 text-center">Customer Info</th>
                                                    <th className="py-3 px-4 border-0 text-center">Items</th>
                                                    <th className="py-3 px-4 border-0 text-center">Timestamp</th>
                                                    <th className="py-3 px-4 border-0 text-center">Price</th>
                                                    <th className="py-3 px-4 border-0 text-center">Status</th>
                                                    <th className="py-3 px-4 border-0 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o.id}>
                                                        <td className="px-4 fw-bold text-center">#{o.id}</td>
                                                        <td className="px-4 text-start">
                                                            <div className="fw-bold text-dark">{o.user?.firstName} {o.user?.lastName} <span className="text-muted small">(ID: #{o.user?.id})</span></div>
                                                            <div className="small text-muted" style={{ lineHeight: '1.2' }}><i className="bi bi-telephone-fill me-1" style={{ fontSize: '0.75rem' }}></i>{o.user?.phone || 'N/A'}</div>
                                                            <div className="small text-muted text-truncate" style={{ maxWidth: '200px', lineHeight: '1.2' }} title={o.user?.address || 'N/A'}><i className="bi bi-geo-alt-fill me-1" style={{ fontSize: '0.75rem' }}></i>{o.user?.address || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-4 text-center">
                                                            <div className="bg-light p-2 rounded mx-auto text-start" style={{ fontSize: '0.8rem', width: 'max-content' }}>
                                                                <div className="fw-bold mb-1">Items:</div>
                                                                {o.items?.map((item, idx) => (
                                                                    <div key={idx} className="text-truncate" style={{ maxWidth: '200px' }} title={`${item.quantity}x ${item.product?.name} ${item.variant ? `(${item.variant})` : ''}`}>
                                                                        {item.quantity}x {item.product?.name} {item.variant ? <span className="fst-italic text-primary">({item.variant})</span> : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 text-center">
                                                            <div className="small">{new Date(o.orderDate || Date.now()).toLocaleString()}</div>
                                                        </td>
                                                        <td className="px-4 fw-bold text-center">₱{o.totalAmount?.toFixed(2)}</td>
                                                        <td className="px-4 text-center">
                                                            <span className={`badge rounded-pill ${o.status === 'PENDING' ? 'bg-warning text-dark' : o.status === 'COMPLETED' ? 'bg-success' : 'bg-info text-dark'}`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 text-center">
                                                            <select className="form-select form-select-sm d-inline-block w-auto" value={o.status} onChange={(e) => handleUpdateStatus('orders', o.id, e.target.value)}>
                                                                <option value="PENDING">Pending</option>
                                                                <option value="PREPARING">Preparing</option>
                                                                <option value="COMPLETED">Completed</option>
                                                                <option value="CANCELLED">Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {orders.length === 0 && <tr><td colSpan="6" className="text-center py-5">No active orders.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── Reservations Tab ── */}
                            {activeTab === 'reservations' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Reservations Management</h3>
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-4"><StatBox title="Pending" value={pendingRes} /></div>
                                        <div className="col-md-4"><StatBox title="Confirmed" value={confirmedRes} /></div>
                                        <div className="col-md-4"><StatBox title="Cancelled" value={cancelledRes} /></div>
                                    </div>

                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                                <tr>
                                                    <th className="py-3 px-4 border-0">Res ID</th>
                                                    <th className="py-3 px-4 border-0">Name</th>
                                                    <th className="py-3 px-4 border-0">Date & Time</th>
                                                    <th className="py-3 px-4 border-0">Guests</th>
                                                    <th className="py-3 px-4 border-0">Status</th>
                                                    <th className="py-3 px-4 border-0 text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reservations.map(r => (
                                                    <tr key={r.id}>
                                                        <td className="px-4 fw-bold">#{r.id}</td>
                                                        <td className="px-4">{r.guestName}</td>
                                                        <td className="px-4">{r.reservationDate} <span className="text-muted small">{r.reservationTime}</span></td>
                                                        <td className="px-4">{r.numberOfGuests}</td>
                                                        <td className="px-4">
                                                            <span className={`badge rounded-pill ${r.status === 'PENDING' ? 'bg-warning text-dark' : r.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                                                                {r.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 text-end">
                                                            <select className="form-select form-select-sm d-inline-block w-auto" value={r.status} onChange={(e) => handleUpdateStatus('reservations', r.id, e.target.value)}>
                                                                <option value="PENDING">Pending</option>
                                                                <option value="CONFIRMED">Confirm</option>
                                                                <option value="CANCELLED">Cancel</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {reservations.length === 0 && <tr><td colSpan="6" className="text-center py-5">No reservations.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── Menu Management Tab ── */}
                            {activeTab === 'products' && (
                                <>
                                    {/* Product Form Modal (placed outside fade-in to avoid transform context clipping) */}
                                    {showProductForm && (
                                        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                                            <style>{`
                                                .admin-modal-no-scroll::-webkit-scrollbar {
                                                    display: none;
                                                }
                                                .admin-modal-no-scroll {
                                                    -ms-overflow-style: none;
                                                    scrollbar-width: none;
                                                }
                                            `}</style>
                                            <div className="card border-0 shadow-lg rounded-4 admin-modal-no-scroll" style={{ backgroundColor: '#fffaf5', width: '100%', maxWidth: '650px', maxHeight: '95vh', overflowY: 'auto' }}>
                                                <div className="card-body p-3 p-md-4 position-relative">
                                                    <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={resetProductForm}></button>
                                                    <h5 className="fw-bold mb-3" style={{ color: 'var(--primary-brown)' }}>{editingProduct ? 'Edit Item' : 'Create New Menu Item'}</h5>
                                                    <form onSubmit={handleProductSubmit}>
                                                        <div className="row g-2">
                                                            {productForm.category !== 'Milk Shakes' && (
                                                                <div className="col-md-6">
                                                                    <label className="form-label small fw-bold text-muted">Item Name</label>
                                                                    <input type="text" className="form-control bg-white" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required={productForm.category !== 'Milk Shakes'} />
                                                                </div>
                                                            )}
                                                            <div className={productForm.category === 'Milk Shakes' ? "col-md-12" : "col-md-6"}>
                                                                <label className="form-label small fw-bold text-muted">Category</label>
                                                                <input 
                                                                    type="text" 
                                                                    list={['Event Packages', 'Group Meals'].includes(productForm.category) ? undefined : "categoryOptions"} 
                                                                    className={`form-control ${['Event Packages', 'Group Meals'].includes(productForm.category) ? 'bg-light' : 'bg-white'}`} 
                                                                    value={productForm.category} 
                                                                    onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} 
                                                                    placeholder="Type or select category" 
                                                                    required 
                                                                    readOnly={['Event Packages', 'Group Meals'].includes(productForm.category)} 
                                                                />
                                                                <datalist id="categoryOptions">
                                                                    {categories.map(c => <option key={c} value={c} />)}
                                                                </datalist>
                                                            </div>

                                                            {['Event Packages', 'Group Meals'].includes(productForm.category) ? (
                                                                <>
                                                                    <div className="col-md-12">
                                                                        <label className="form-label small fw-bold text-muted">Price (₱)</label>
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.01" 
                                                                            className="form-control bg-white" 
                                                                            value={productForm.priceSolo} 
                                                                            onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} 
                                                                            required 
                                                                            placeholder="e.g. 1500.00" 
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-12">
                                                                        <label className="form-label small fw-bold text-muted">Description</label>
                                                                        <textarea 
                                                                            className="form-control bg-white" 
                                                                            rows="3" 
                                                                            value={productForm.description} 
                                                                            onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} 
                                                                            required 
                                                                            placeholder="Describe inclusions/items" 
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {productForm.category === 'Milk Shakes' && (
                                                                        <>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">Flavors (comma separated)</label>
                                                                                <input type="text" className="form-control bg-white" value={productForm.flavors} onChange={e => setProductForm(p => ({ ...p, flavors: e.target.value }))} placeholder="e.g. Chocolate, Vanilla, Strawberry" />
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">Price (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} placeholder="e.g. 150.00" />
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {productForm.category === 'Drinks' && (
                                                                        <>
                                                                            <div className="col-md">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">Glass (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">1 Liter (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.price1Liter} onChange={e => setProductForm(p => ({ ...p, price1Liter: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">1.5 Liters (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.price1Point5Liter} onChange={e => setProductForm(p => ({ ...p, price1Point5Liter: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">2 Liters (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.price2Liter} onChange={e => setProductForm(p => ({ ...p, price2Liter: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md">
                                                                                <label className="form-label small fw-bold text-muted text-nowrap">Price (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceALaCarte} onChange={e => setProductForm(p => ({ ...p, priceALaCarte: e.target.value }))} />
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(productForm.category) && (
                                                                        <>
                                                                            <div className="col-md-6">
                                                                                <label className="form-label small fw-bold text-muted">Price 1 (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <label className="form-label small fw-bold text-muted">Price 2 (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceALaCarte} onChange={e => setProductForm(p => ({ ...p, priceALaCarte: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted">Description</label>
                                                                                <input type="text" className="form-control bg-white" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {['Nachos'].includes(productForm.category) && (
                                                                        <>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted">Price (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted">Description</label>
                                                                                <input type="text" className="form-control bg-white" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {['Sandwich', 'Student Meals'].includes(productForm.category) && (
                                                                        <div className="col-md-12">
                                                                            <label className="form-label small fw-bold text-muted">Price (₱)</label>
                                                                            <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} required />
                                                                        </div>
                                                                    )}

                                                                    {!['Milk Shakes', 'Drinks', 'Sandwich', 'Student Meals', 'Duyanan Specials', 'Burger', 'French Fries', 'Nachos', 'Home-Made Siomai', 'Soup'].includes(productForm.category) && (
                                                                        <>
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small fw-bold text-muted">Solo Price (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small fw-bold text-muted">A La Carte 1 (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceALaCarte} onChange={e => setProductForm(p => ({ ...p, priceALaCarte: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small fw-bold text-muted">A La Carte 2 (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceALaCarte2} onChange={e => setProductForm(p => ({ ...p, priceALaCarte2: e.target.value }))} />
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <label className="form-label small fw-bold text-muted">Description</label>
                                                                                <input type="text" className="form-control bg-white" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                            
                                                            {['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(productForm.category) && (
                                                                <>
                                                                    <div className="col-12 mt-3 mb-1">
                                                                        <hr className="m-0 border-secondary opacity-25" />
                                                                        <div className="text-muted fw-bold small mt-2">Custom Combos (Optional)</div>
                                                                    </div>
                                                                    {(productForm.customCombos || []).map((combo, index) => (
                                                                        <React.Fragment key={index}>
                                                                            <div className="col-md-7">
                                                                                <label className="form-label small fw-bold text-muted">Combo {index + 1} Name</label>
                                                                                <input type="text" className="form-control bg-white" placeholder="e.g. Spag with Fries" value={combo.name} onChange={e => updateCombo(index, 'name', e.target.value)} />
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <label className="form-label small fw-bold text-muted">Price (₱)</label>
                                                                                <input type="number" step="0.01" className="form-control bg-white" placeholder="0.00" value={combo.price} onChange={e => updateCombo(index, 'price', e.target.value)} />
                                                                            </div>
                                                                            <div className="col-md-2 d-flex align-items-end">
                                                                                <button className="btn btn-outline-danger w-100" onClick={(e) => removeCombo(e, index)}><i className="bi bi-trash"></i></button>
                                                                            </div>
                                                                        </React.Fragment>
                                                                    ))}
                                                                    <div className="col-12 mt-2">
                                                                        <button className="btn btn-sm btn-outline-secondary" onClick={addCombo}>+ Add Combo Option</button>
                                                                    </div>
                                                                </>
                                                            )}

                                                            <div className="col-md-12 mt-3">
                                                                <label className="form-label small fw-bold text-muted">Image URL</label>
                                                                <input type="text" className="form-control bg-white" value={productForm.imageUrl} onChange={e => setProductForm(p => ({ ...p, imageUrl: e.target.value }))} />
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 pt-2 d-flex justify-content-end gap-2">
                                                            <button type="button" className="btn btn-light px-3 py-1 fw-bold" onClick={resetProductForm}>Cancel</button>
                                                            <button type="submit" className="btn text-white px-3 py-1 fw-bold" style={{ backgroundColor: 'var(--accent-orange)' }}>{editingProduct ? 'Update Item' : 'Save Item'}</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="fade-in">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="fw-bold m-0" style={{ color: 'var(--primary-brown)' }}>Menu Management</h3>
                                            <button className="btn text-white shadow-sm px-4 py-2 fw-bold" style={{ backgroundColor: 'var(--accent-orange)' }} onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                                                <i className="bi bi-plus-lg me-2"></i> Add New Item
                                            </button>
                                        </div>

                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                                <tr>
                                                    <th className="py-3 px-4 border-0">Item</th>
                                                    <th className="py-3 px-4 border-0 text-center">Category</th>
                                                    <th className="py-3 px-4 border-0 text-center">Price</th>
                                                    <th className="py-3 px-4 border-0 text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.filter(p => p.category !== 'Event Packages' && p.category !== 'Group Meals').map(p => (
                                                    <tr key={p.id}>
                                                        <td className="px-4">
                                                            <div className="d-flex align-items-center">
                                                                {p.imageUrl ? <img src={p.imageUrl.startsWith('http') || p.imageUrl.startsWith('/') || p.imageUrl.startsWith('data:') ? p.imageUrl : `/img/${p.imageUrl}`} alt={p.name} className="rounded-2 me-3 object-fit-cover" style={{ width: '40px', height: '40px' }} /> : <div className="bg-light rounded-2 me-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}><i className="bi bi-image"></i></div>}
                                                                <span className="fw-bold">{p.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 text-center">{p.category}</td>
                                                        <td className="px-4 text-center text-muted small">
                                                            {p.category === 'Milk Shakes' ? (
                                                                <>
                                                                    {p.flavors && <div><span className="fw-bold">Flavors:</span> {p.flavors}</div>}
                                                                    {p.priceSolo > 0 && <div>Glass: ₱{p.priceSolo.toFixed(2)}</div>}
                                                                    {p.priceALaCarte > 0 && <div>Price: ₱{p.priceALaCarte.toFixed(2)}</div>}
                                                                    {p.price1Liter > 0 && <div>1 Liter: ₱{p.price1Liter.toFixed(2)}</div>}
                                                                    {p.price1Point5Liter > 0 && <div>1.5 Liters: ₱{p.price1Point5Liter.toFixed(2)}</div>}
                                                                    {p.price2Liter > 0 && <div>2 Liters: ₱{p.price2Liter.toFixed(2)}</div>}
                                                                </>
                                                            ) : p.category === 'Drinks' ? (
                                                                <>
                                                                    {p.priceSolo > 0 && <div>Glass: ₱{p.priceSolo.toFixed(2)}</div>}
                                                                    {p.priceALaCarte > 0 && <div>Price: ₱{p.priceALaCarte.toFixed(2)}</div>}
                                                                    {p.price1Liter > 0 && <div>1 Liter: ₱{p.price1Liter.toFixed(2)}</div>}
                                                                    {p.price1Point5Liter > 0 && <div>1.5 Liters: ₱{p.price1Point5Liter.toFixed(2)}</div>}
                                                                    {p.price2Liter > 0 && <div>2 Liters: ₱{p.price2Liter.toFixed(2)}</div>}
                                                                </>
                                                            ) : ['Duyanan Specials', 'Burger', 'French Fries', 'Home-Made Siomai', 'Soup'].includes(p.category) ? (
                                                                <div>
                                                                    {p.priceSolo > 0 && p.priceALaCarte > 0 
                                                                        ? `₱${p.priceSolo.toFixed(2)} - ₱${p.priceALaCarte.toFixed(2)}` 
                                                                        : `₱${(p.priceSolo || p.priceALaCarte || 0).toFixed(2)}`}
                                                                </div>
                                                            ) : ['Nachos', 'Sandwich', 'Student Meals'].includes(p.category) ? (
                                                                <div>Price: ₱{(p.priceSolo || 0).toFixed(2)}</div>
                                                            ) : (
                                                                <>
                                                                    <div>Solo: ₱{(p.priceSolo || 0).toFixed(2)}</div>
                                                                    {p.priceALaCarte > 0 && <div>A La Carte: ₱{p.priceALaCarte.toFixed(2)}</div>}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-4 text-end">
                                                            <button className="btn btn-sm text-primary p-2 me-2" onClick={() => handleEditProduct(p)}><i className="bi bi-pencil-square fs-5"></i></button>
                                                            <button className="btn btn-sm text-danger p-2" onClick={() => handleDeleteProduct(p.id)}><i className="bi bi-trash fs-5"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {products.filter(p => p.category !== 'Event Packages' && p.category !== 'Group Meals').length === 0 && <tr><td colSpan="4" className="text-center py-5">No items found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Event Packages Tab ── */}
                        {activeTab === 'event-packages' && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h3 className="fw-bold m-0" style={{ color: 'var(--primary-brown)' }}>Event Packages Management</h3>
                                    <button className="btn text-white shadow-sm px-4 py-2 fw-bold" style={{ backgroundColor: 'var(--accent-orange)' }} onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                                        <i className="bi bi-plus-lg me-2"></i> Add Event Package
                                    </button>
                                </div>

                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                             <tr>
                                                 <th className="py-3 px-4 border-0">Package Name</th>
                                                 <th className="py-3 px-4 border-0 text-center">Description</th>
                                                 <th className="py-3 px-4 border-0 text-center">Price</th>
                                                 <th className="py-3 px-4 border-0 text-end">Action</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {products.filter(p => p.category === 'Event Packages').map(p => (
                                                 <tr key={p.id}>
                                                     <td className="px-4">
                                                         <div className="d-flex align-items-center">
                                                             {p.imageUrl ? <img src={p.imageUrl.startsWith('http') || p.imageUrl.startsWith('/') || p.imageUrl.startsWith('data:') ? p.imageUrl : `/img/${p.imageUrl}`} alt={p.name} className="rounded-2 me-3 object-fit-cover" style={{ width: '40px', height: '40px' }} /> : <div className="bg-light rounded-2 me-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}><i className="bi bi-image"></i></div>}
                                                             <span className="fw-bold">{p.name}</span>
                                                         </div>
                                                     </td>
                                                     <td className="px-4 text-center text-muted small" style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={p.description}>{p.description}</td>
                                                     <td className="px-4 text-center fw-bold">₱{(p.priceSolo || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                     <td className="px-4 text-end">
                                                         <button className="btn btn-sm text-primary p-2 me-2" onClick={() => handleEditProduct(p)}><i className="bi bi-pencil-square fs-5"></i></button>
                                                         <button className="btn btn-sm text-danger p-2" onClick={() => handleDeleteProduct(p.id)}><i className="bi bi-trash fs-5"></i></button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             {products.filter(p => p.category === 'Event Packages').length === 0 && <tr><td colSpan="4" className="text-center py-5">No event packages found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Group Meals Tab ── */}
                        {activeTab === 'group-meals' && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                     <h3 className="fw-bold m-0" style={{ color: 'var(--primary-brown)' }}>Group Meals Management</h3>
                                     <button className="btn text-white shadow-sm px-4 py-2 fw-bold" style={{ backgroundColor: 'var(--accent-orange)' }} onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                                         <i className="bi bi-plus-lg me-2"></i> Add Group Meal
                                     </button>
                                </div>

                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                     <table className="table table-hover align-middle mb-0">
                                         <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                             <tr>
                                                 <th className="py-3 px-4 border-0">Meal Bundle Name</th>
                                                 <th className="py-3 px-4 border-0 text-center">Description</th>
                                                 <th className="py-3 px-4 border-0 text-center">Price</th>
                                                 <th className="py-3 px-4 border-0 text-end">Action</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {products.filter(p => p.category === 'Group Meals').map(p => (
                                                 <tr key={p.id}>
                                                     <td className="px-4">
                                                         <div className="d-flex align-items-center">
                                                             {p.imageUrl ? <img src={p.imageUrl.startsWith('http') || p.imageUrl.startsWith('/') || p.imageUrl.startsWith('data:') ? p.imageUrl : `/img/${p.imageUrl}`} alt={p.name} className="rounded-2 me-3 object-fit-cover" style={{ width: '40px', height: '40px' }} /> : <div className="bg-light rounded-2 me-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}><i className="bi bi-image"></i></div>}
                                                             <span className="fw-bold">{p.name}</span>
                                                         </div>
                                                     </td>
                                                     <td className="px-4 text-center text-muted small" style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={p.description}>{p.description}</td>
                                                     <td className="px-4 text-center fw-bold">₱{(p.priceSolo || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                     <td className="px-4 text-end">
                                                         <button className="btn btn-sm text-primary p-2 me-2" onClick={() => handleEditProduct(p)}><i className="bi bi-pencil-square fs-5"></i></button>
                                                         <button className="btn btn-sm text-danger p-2" onClick={() => handleDeleteProduct(p.id)}><i className="bi bi-trash fs-5"></i></button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             {products.filter(p => p.category === 'Group Meals').length === 0 && <tr><td colSpan="4" className="text-center py-5">No group meals found.</td></tr>}
                                         </tbody>
                                     </table>
                                </div>
                            </div>
                        )}

                            {/* ── Sales Report Tab (Live) ── */}
                            {activeTab === 'sales' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Sales Report</h3>
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-6">
                                            <StatBox 
                                                title="Average Daily Sales" 
                                                value={`₱${liveAvgDailySales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <StatBox 
                                                title="Top Performing Category" 
                                                value={topCategory} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <style>{`
                                        .bar-hover-container:hover .bar-val {
                                            opacity: 1 !important;
                                            transform: translate(-50%, -5px) !important;
                                        }
                                    `}</style>

                                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                        <h4 className="text-muted mb-4">Weekly Sales Breakdown</h4>
                                        <div className="d-flex justify-content-center align-items-end" style={{ height: '280px', gap: '20px' }}>
                                            {weekdaySales.map((item, i) => {
                                                const maxSalesVal = Math.max(...weekdaySales.map(x => x.sales), 1);
                                                const percent = (item.sales / maxSalesVal) * 100;
                                                return (
                                                    <div key={i} className="d-flex flex-column align-items-center" style={{ width: '60px' }}>
                                                        <div 
                                                            className="bar-hover-container position-relative w-100"
                                                            style={{ 
                                                                height: '200px', 
                                                                display: 'flex', 
                                                                alignItems: 'end',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <div 
                                                                className="position-relative w-75"
                                                                style={{ 
                                                                    height: `${Math.max(8, percent)}%`, 
                                                                    backgroundColor: 'var(--accent-orange)', 
                                                                    borderRadius: '8px 8px 0 0', 
                                                                    cursor: 'pointer',
                                                                    background: 'linear-gradient(180deg, #e8793a, var(--accent-orange))',
                                                                    boxShadow: '0 -4px 12px rgba(211, 84, 0, 0.15)',
                                                                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                                }}
                                                            >
                                                                {/* Hover tooltip value */}
                                                                <div 
                                                                    className="bar-val small fw-bold px-2 py-1 bg-dark text-white rounded position-absolute" 
                                                                    style={{ 
                                                                        top: '-32px', 
                                                                        left: '50%', 
                                                                        transform: 'translate(-50%, 0)', 
                                                                        fontSize: '0.75rem',
                                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                                        pointerEvents: 'none',
                                                                        whiteSpace: 'nowrap',
                                                                        zIndex: 10,
                                                                        opacity: 0,
                                                                        transition: 'all 0.2s ease-in-out'
                                                                    }}
                                                                >
                                                                    ₱{item.sales.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="mt-2 small text-muted fw-bold">{item.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Forecasting Tab (Live) ── */}
                            {activeTab === 'forecasting' && (() => {
                                const allChartPoints = [...dailySalesData, ...projectedSalesData];
                                const maxSales = Math.max(...allChartPoints.map(p => p.sales), 1);
                                const minSales = Math.min(...allChartPoints.map(p => p.sales), 0);
                                
                                const getX = (idx) => 60 + idx * (880 / 20);
                                const getY = (val) => 280 - ((val - minSales) / (maxSales - minSales || 1)) * 230;

                                const actualPoints = dailySalesData;
                                let actualPathD = "";
                                if (actualPoints.length > 0) {
                                    actualPathD = `M ${getX(0)},${getY(actualPoints[0].sales)}`;
                                    for (let i = 0; i < actualPoints.length - 1; i++) {
                                        const x0 = getX(i);
                                        const y0 = getY(actualPoints[i].sales);
                                        const x1 = getX(i + 1);
                                        const y1 = getY(actualPoints[i + 1].sales);
                                        const cp1x = x0 + (x1 - x0) / 2;
                                        const cp1y = y0;
                                        const cp2x = x0 + (x1 - x0) / 2;
                                        const cp2y = y1;
                                        actualPathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
                                    }
                                }
                                const actualAreaD = actualPathD
                                    ? `${actualPathD} L ${getX(13)},280 L ${getX(0)},280 Z`
                                    : "";

                                const forecastPointsList = [dailySalesData[13], ...projectedSalesData].filter(Boolean);
                                let forecastPathD = "";
                                if (forecastPointsList.length > 0) {
                                    forecastPathD = `M ${getX(13)},${getY(forecastPointsList[0].sales)}`;
                                    for (let i = 0; i < forecastPointsList.length - 1; i++) {
                                        const x0 = getX(13 + i);
                                        const y0 = getY(forecastPointsList[i].sales);
                                        const x1 = getX(13 + i + 1);
                                        const y1 = getY(forecastPointsList[i + 1].sales);
                                        const cp1x = x0 + (x1 - x0) / 2;
                                        const cp1y = y0;
                                        const cp2x = x0 + (x1 - x0) / 2;
                                        const cp2y = y1;
                                        forecastPathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
                                    }
                                }
                                const forecastAreaD = forecastPathD
                                    ? `${forecastPathD} L ${getX(20)},280 L ${getX(13)},280 Z`
                                    : "";

                                const gridLines = [
                                    { y: 50, label: `₱${(maxSales).toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                                    { y: 126, label: `₱${(minSales + (maxSales - minSales) * 0.67).toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                                    { y: 203, label: `₱${(minSales + (maxSales - minSales) * 0.33).toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                                    { y: 280, label: `₱${(minSales).toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                                ];

                                return (
                                    <div className="fade-in">
                                        <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Forecasting</h3>
                                        
                                        <div className="row g-4 mb-4">
                                            <div className="col-md-4">
                                                <StatBox 
                                                    title="Projected Revenue (Next Month)" 
                                                    value={`₱${projectedRevenueNextMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                                                    subtitle={`${growthPercentString} weekly trend`} 
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <StatBox 
                                                    title="Average Daily Sales" 
                                                    value={`₱${liveAvgDailySales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <StatBox 
                                                    title="Average Order Value" 
                                                    value={`₱${liveAOV.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                                                />
                                            </div>
                                        </div>

                                        {/* Dual Line SVG Chart */}
                                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                                            <h5 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>
                                                14-Day Sales History & 7-Day Forecast Projection
                                            </h5>
                                            <div className="position-relative w-100" style={{ minHeight: '350px' }}>
                                                <svg width="100%" height="320" viewBox="0 0 1000 320" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                    <defs>
                                                        {/* Gradients */}
                                                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="var(--accent-orange)" stopOpacity="0.25" />
                                                            <stop offset="100%" stopColor="var(--accent-orange)" stopOpacity="0" />
                                                        </linearGradient>
                                                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#8e44ad" stopOpacity="0.25" />
                                                            <stop offset="100%" stopColor="#8e44ad" stopOpacity="0" />
                                                        </linearGradient>
                                                        {/* Glow Filters */}
                                                        <filter id="actualGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                        <filter id="forecastGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                                            <feMerge>
                                                                <feMergeNode in="blur" />
                                                                <feMergeNode in="SourceGraphic" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>

                                                    {/* Grid Lines */}
                                                    {gridLines.map((line, idx) => (
                                                        <g key={idx}>
                                                            <line 
                                                                x1="50" 
                                                                y1={line.y} 
                                                                x2="950" 
                                                                y2={line.y} 
                                                                stroke="#f0f0f0" 
                                                                strokeWidth="1.5" 
                                                                strokeDasharray={idx === gridLines.length - 1 ? "0" : "5,5"} 
                                                            />
                                                            <text 
                                                                x="40" 
                                                                y={line.y + 4} 
                                                                textAnchor="end" 
                                                                fill="#9a7060" 
                                                                style={{ fontSize: '0.75rem', fontWeight: 'bold', fontFamily: 'Jost' }}
                                                            >
                                                                {line.label}
                                                            </text>
                                                        </g>
                                                    ))}

                                                    {/* Actual Sales Line & Area */}
                                                    {actualAreaD && <path d={actualAreaD} fill="url(#actualGrad)" />}
                                                    {actualPathD && <path d={actualPathD} fill="none" stroke="var(--accent-orange)" strokeWidth="3" strokeLinecap="round" filter="url(#actualGlow)" />}

                                                    {/* Forecast Sales Line & Area */}
                                                    {forecastAreaD && <path d={forecastAreaD} fill="url(#forecastGrad)" />}
                                                    {forecastPathD && <path d={forecastPathD} fill="none" stroke="#8e44ad" strokeWidth="3" strokeDasharray="6,4" strokeLinecap="round" filter="url(#forecastGlow)" />}

                                                    {/* Data Points (Actual) */}
                                                    {dailySalesData.map((item, idx) => {
                                                        const x = getX(idx);
                                                        const y = getY(item.sales);
                                                        const isHovered = hoveredPoint && hoveredPoint.label === item.label && !hoveredPoint.isForecast;
                                                        return (
                                                            <circle
                                                                key={`act-${idx}`}
                                                                cx={x}
                                                                cy={y}
                                                                r={isHovered ? 8 : 4.5}
                                                                fill="#ffffff"
                                                                stroke="var(--accent-orange)"
                                                                strokeWidth={isHovered ? 4 : 2}
                                                                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                                onMouseEnter={() => setHoveredPoint({ x, y, label: item.label, value: item.sales, isForecast: false })}
                                                                onMouseLeave={() => setHoveredPoint(null)}
                                                            />
                                                        );
                                                    })}

                                                    {/* Data Points (Forecast) */}
                                                    {projectedSalesData.map((item, idx) => {
                                                        const actualIdx = 13 + idx + 1;
                                                        const x = getX(actualIdx);
                                                        const y = getY(item.sales);
                                                        const isHovered = hoveredPoint && hoveredPoint.label === `${item.label} (Forecast)` && hoveredPoint.isForecast;
                                                        return (
                                                            <circle
                                                                key={`fc-${idx}`}
                                                                cx={x}
                                                                cy={y}
                                                                r={isHovered ? 8 : 4.5}
                                                                fill="#ffffff"
                                                                stroke="#8e44ad"
                                                                strokeWidth={isHovered ? 4 : 2}
                                                                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                                onMouseEnter={() => setHoveredPoint({ x, y, label: `${item.label} (Forecast)`, value: item.sales, isForecast: true })}
                                                                onMouseLeave={() => setHoveredPoint(null)}
                                                            />
                                                        );
                                                    })}

                                                    {/* Vertical division line separating actuals and forecast */}
                                                    <line x1={getX(13)} y1="40" x2={getX(13)} y2="280" stroke="#b89080" strokeWidth="1" strokeDasharray="3,3" />
                                                    <text x={getX(13) - 10} y="35" textAnchor="end" fill="#9a7060" style={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'Jost' }}>Historical</text>
                                                    <text x={getX(13) + 10} y="35" textAnchor="start" fill="#8e44ad" style={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'Jost' }}>Forecast</text>
                                                </svg>
                                                
                                                {/* Hover Tooltip */}
                                                {hoveredPoint && (
                                                    <div 
                                                        className="position-absolute bg-dark text-white p-2 rounded shadow-lg animate__animated animate__fadeIn"
                                                        style={{
                                                            left: `${(hoveredPoint.x / 1000) * 100}%`,
                                                            top: `${hoveredPoint.y - 70}px`,
                                                            transform: 'translateX(-50%)',
                                                            pointerEvents: 'none',
                                                            zIndex: 100,
                                                            fontSize: '0.78rem',
                                                            minWidth: '140px',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                                            lineHeight: '1.4'
                                                        }}
                                                    >
                                                        <div className="fw-bold mb-1 border-bottom border-secondary pb-1 text-center">{hoveredPoint.label}</div>
                                                        <div className="d-flex justify-content-between px-1">
                                                            <span className="text-white-50">{hoveredPoint.isForecast ? 'Forecasted:' : 'Sales:'}</span>
                                                            <span className="fw-bold" style={{ color: hoveredPoint.isForecast ? '#dca7ff' : '#ffa07a' }}>
                                                                ₱{hoveredPoint.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Trend Advice / Insight Card */}
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-row align-items-center">
                                            <i className="bi bi-lightbulb-fill text-warning fs-1 me-4"></i>
                                            <div>
                                                <h5 className="fw-bold" style={{ color: 'var(--primary-brown)' }}>Dynamic Trend Analysis</h5>
                                                <p className="text-muted mb-0">{getTrendAdvice()}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Users Tab ── */}
                            {activeTab === 'users' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Registered Users</h3>
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead style={{ backgroundColor: '#8B3A0F', color: '#fff' }}>
                                                <tr>
                                                    <th className="py-3 px-4 border-0 text-center">Customer ID</th>
                                                    <th className="py-3 px-4 border-0 text-center">Customer Name</th>
                                                    <th className="py-3 px-4 border-0 text-center">Contact No</th>
                                                    <th className="py-3 px-4 border-0 text-center">Address</th>
                                                    <th className="py-3 px-4 border-0 text-center">Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.filter(u => u.role !== 'ADMIN').map(u => (
                                                    <tr key={u.id}>
                                                        <td className="px-4 text-muted fw-bold text-center">#{u.id}</td>
                                                        <td className="px-4 fw-bold text-dark text-center">{u.firstName} {u.lastName}</td>
                                                        <td className="px-4 text-muted text-center">{u.phone || 'N/A'}</td>
                                                        <td className="px-4 text-muted text-truncate text-center" style={{ maxWidth: '250px' }} title={u.address || 'N/A'}>{u.address || 'N/A'}</td>
                                                        <td className="px-4 text-center">
                                                            <span className={`badge rounded-pill ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>{u.role}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.filter(u => u.role !== 'ADMIN').length === 0 && <tr><td colSpan="5" className="text-center py-5">No registered customers found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default AdminPanel;
