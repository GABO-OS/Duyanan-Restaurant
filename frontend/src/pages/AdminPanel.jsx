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

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', priceSolo: '', priceALaCarte: '', price1Liter: '', price1Point5Liter: '', price2Liter: '', description: '', imageUrl: '', category: 'Rice Meals', flavors: ''
    });

    const categories = ['Rice Meals', 'Sizzling Meals', 'Duyanan Specials', 'Burger', 'French Fries', 'Nachos', 'Home-Made Siomai', 'Drinks', 'Soup', 'Milk Shakes', 'Sandwich', 'Student Meals', 'Extras'];

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
    });

    // ── Fetch Data ────────────────────────────────────────
    const fetchData = async () => {
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const [isAlertVisible, setIsAlertVisible] = useState(false);

    useEffect(() => {
        fetchData();
        setMessage(`Welcome, ${user?.firstName || 'Admin'}! You have securely accessed the Admin Panel.`);
        setIsAlertVisible(true);
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
        setProductForm({ name: '', priceSolo: '', priceALaCarte: '', price1Liter: '', price1Point5Liter: '', price2Liter: '', description: '', imageUrl: '', category: 'Rice Meals', flavors: '' });
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
            price1Liter: productForm.price1Liter ? parseFloat(productForm.price1Liter) : 0,
            price1Point5Liter: productForm.price1Point5Liter ? parseFloat(productForm.price1Point5Liter) : 0,
            price2Liter: productForm.price2Liter ? parseFloat(productForm.price2Liter) : 0
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
            price1Liter: product.price1Liter || '',
            price1Point5Liter: product.price1Point5Liter || '',
            price2Liter: product.price2Liter || '',
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            category: product.category || 'Rice Meals',
            flavors: product.flavors || ''
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

    // ── Components ────────────────────────────────────────
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { id: 'orders', label: 'Orders', icon: 'bi-bag-check' },
        { id: 'reservations', label: 'Reservations', icon: 'bi-calendar-event' },
        { id: 'products', label: 'Menu', icon: 'bi-card-list' },
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
                                        <div className="col-md-4"><StatBox title="Total Sales" value={`₱${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}`} subtitle="15% vs last week" /></div>
                                        <div className="col-md-4"><StatBox title="Total Orders" value={orders.length} subtitle="5 new today" /></div>
                                        <div className="col-md-4"><StatBox title="Pending Reservations" value={pendingRes} /></div>
                                    </div>

                                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Sales Forecasting (Mock)</h5>
                                            <div style={{ height: '200px', width: '100%', position: 'relative', borderBottom: '2px solid #eee', borderLeft: '2px solid #eee' }}>
                                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10" fill="none" stroke="var(--accent-orange)" strokeWidth="2" />
                                                    <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10 L100,100 L0,100 Z" fill="rgba(211, 84, 0, 0.1)" />
                                                </svg>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2 text-muted small">
                                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
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
                                                    <th className="py-3 px-4 border-0 text-start">Customer Info</th>
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
                                                            <div>{new Date(o.orderDate || Date.now()).toLocaleString()}</div>
                                                            <div className="mt-2 text-start bg-light p-2 rounded" style={{ fontSize: '0.8rem' }}>
                                                                <div className="fw-bold mb-1">Items:</div>
                                                                {o.items?.map((item, idx) => (
                                                                    <div key={idx} className="text-truncate" style={{ maxWidth: '200px' }} title={`${item.quantity}x ${item.product?.name} ${item.variant ? `(${item.variant})` : ''}`}>
                                                                        {item.quantity}x {item.product?.name} {item.variant ? <span className="fst-italic text-primary">({item.variant})</span> : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
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
                                                                <input type="text" list="categoryOptions" className="form-control bg-white" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} placeholder="Type or select category" required />
                                                                <datalist id="categoryOptions">
                                                                    {categories.map(c => <option key={c} value={c} />)}
                                                                </datalist>
                                                            </div>

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

                                                            {['Duyanan Specials'].includes(productForm.category) && (
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

                                                            {['French Fries', 'Nachos', 'Home-Made Siomai', 'Soup'].includes(productForm.category) && (
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

                                                            {!['Milk Shakes', 'Drinks', 'Sandwich', 'Student Meals', 'Duyanan Specials', 'French Fries', 'Nachos', 'Home-Made Siomai', 'Soup'].includes(productForm.category) && (
                                                                <>
                                                                    <div className="col-md-6">
                                                                        <label className="form-label small fw-bold text-muted">Solo Price (₱)</label>
                                                                        <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceSolo} onChange={e => setProductForm(p => ({ ...p, priceSolo: e.target.value }))} />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <label className="form-label small fw-bold text-muted">A La Carte (₱)</label>
                                                                        <input type="number" step="0.01" className="form-control bg-white" value={productForm.priceALaCarte} onChange={e => setProductForm(p => ({ ...p, priceALaCarte: e.target.value }))} />
                                                                    </div>
                                                                    <div className="col-md-12">
                                                                        <label className="form-label small fw-bold text-muted">Description</label>
                                                                        <input type="text" className="form-control bg-white" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
                                                                    </div>
                                                                </>
                                                            )}
                                                            
                                                            <div className="col-md-12">
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
                                                    <th className="py-3 px-4 border-0">Category</th>
                                                    <th className="py-3 px-4 border-0">Price</th>
                                                    <th className="py-3 px-4 border-0 text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="px-4">
                                                            <div className="d-flex align-items-center">
                                                                {p.imageUrl ? <img src={p.imageUrl.startsWith('http') || p.imageUrl.startsWith('/') || p.imageUrl.startsWith('data:') ? p.imageUrl : `/img/${p.imageUrl}`} alt={p.name} className="rounded-2 me-3 object-fit-cover" style={{ width: '40px', height: '40px' }} /> : <div className="bg-light rounded-2 me-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}><i className="bi bi-image"></i></div>}
                                                                <span className="fw-bold">{p.category === 'Milk Shakes' && p.flavors ? p.flavors : p.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4">{p.category}</td>
                                                        <td className="px-4 text-muted small">
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
                                                            ) : ['Duyanan Specials'].includes(p.category) ? (
                                                                <div>
                                                                    {p.priceSolo > 0 && p.priceALaCarte > 0 
                                                                        ? `₱${p.priceSolo.toFixed(2)} - ₱${p.priceALaCarte.toFixed(2)}` 
                                                                        : `₱${(p.priceSolo || p.priceALaCarte || 0).toFixed(2)}`}
                                                                </div>
                                                            ) : ['French Fries', 'Nachos', 'Home-Made Siomai', 'Soup', 'Sandwich', 'Student Meals'].includes(p.category) ? (
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
                                                {products.length === 0 && <tr><td colSpan="4" className="text-center py-5">No items found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                            {/* ── Sales Report Tab (Mock) ── */}
                            {activeTab === 'sales' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Sales Report</h3>
                                    <div className="row g-4 mb-5">
                                        <div className="col-md-6"><StatBox title="Average Daily Sales" value="₱8,450.00" /></div>
                                        <div className="col-md-6"><StatBox title="Top Performing Category" value="Set Meals" /></div>
                                    </div>
                                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                        <h4 className="text-muted mb-4">Weekly Sales Breakdown</h4>
                                        <div className="d-flex justify-content-center align-items-end" style={{ height: '250px', gap: '20px' }}>
                                            {/* Simple CSS Bar Chart */}
                                            {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                                                <div key={i} className="d-flex flex-column align-items-center">
                                                    <div style={{ width: '40px', height: `${h}%`, backgroundColor: 'var(--accent-orange)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
                                                    <span className="mt-2 small text-muted fw-bold">Day {i+1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Forecasting Tab (Mock) ── */}
                            {activeTab === 'forecasting' && (
                                <div className="fade-in">
                                    <h3 className="fw-bold mb-4" style={{ color: 'var(--primary-brown)' }}>Forecasting</h3>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-4"><StatBox title="Projected Revenue (Next Month)" value="₱124,500" subtitle="+12% growth" /></div>
                                        <div className="col-md-8">
                                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-row align-items-center">
                                                <i className="bi bi-lightbulb text-warning fs-1 me-4"></i>
                                                <div>
                                                    <h5 className="fw-bold" style={{ color: 'var(--primary-brown)' }}>Trend Analysis</h5>
                                                    <p className="text-muted mb-0">Based on recent data, weekend sales are projected to increase by 20% due to upcoming local events. Consider stocking up on Party Meals.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
