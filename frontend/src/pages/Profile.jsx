import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, login } = useAuth(); // We might need to update auth context if email/name changes
    
    const [myOrders, setMyOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    
    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [commPrefs, setCommPrefs] = useState({
        offersPush: false,
        offersEmail: false,
        offersSms: false,
        updatesPush: true
    });

    useEffect(() => {
        if (user?.token) {
            fetchUserProfile();
        } else {
            setLoadingProfile(false);
        }
    }, [user?.token]);

    const fetchUserProfile = () => {
        setLoadingProfile(true);
        fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        })
        .then(data => {
            setProfileData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            });
        })
        .catch(err => console.error("Error fetching profile:", err))
        .finally(() => setLoadingProfile(false));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        if (!profileData.firstName || !profileData.lastName) {
            Swal.fire('Error', 'First Name and Last Name are required.', 'error');
            return;
        }

        fetch(`${API_URL}/api/auth/me`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}` 
            },
            body: JSON.stringify(profileData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your information has been successfully updated.',
                    confirmButtonColor: '#8B3A0F'
                });
                setIsEditing(false);
                // Update context if name changed
                if (login && user) {
                    const updatedUser = { ...user, firstName: data.firstName, lastName: data.lastName };
                    login(updatedUser);
                }
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'An unexpected error occurred.', 'error');
        });
    };

    const handleToggle = (key) => {
        setCommPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchOrders = () => {
        if (user?.token) {
            setLoadingOrders(true);
            fetch(`${API_URL}/api/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMyOrders(data);
            })
            .catch(err => console.error("Error fetching orders:", err))
            .finally(() => setLoadingOrders(false));
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab, user?.token]);

    const getStatusInfo = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return { text: 'Order Placed', width: '33%', color: 'var(--accent-orange)', icon: 'bi-clock' };
            case 'PREPARING': return { text: 'Preparing Food', width: '66%', color: '#f39c12', icon: 'bi-fire' };
            case 'COMPLETED': return { text: 'Completed', width: '100%', color: '#2ecc71', icon: 'bi-check-circle-fill' };
            case 'CANCELLED': return { text: 'Cancelled', width: '100%', color: '#e74c3c', icon: 'bi-x-circle' };
            default: return { text: 'Pending', width: '33%', color: 'var(--accent-orange)', icon: 'bi-clock' };
        }
    };

    const renderMainContent = () => {
        if (activeTab === 'profile') {
            return (
                <>
                    <div className="mb-4 d-flex justify-content-between align-items-end">
                        <div>
                            <h4 className="fw-bold mb-1" style={{ color: 'var(--text-dark)' }}>My Profile</h4>
                            <p className="text-muted small mb-0">Manage your personal information</p>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="btn btn-sm text-white px-3 py-2 fw-bold shadow-sm" style={{ backgroundColor: 'var(--accent-orange)', borderRadius: '8px' }}>
                                <i className="bi bi-pencil-square me-1"></i> Edit Profile
                            </button>
                        ) : (
                            <div className="d-flex gap-2">
                                <button onClick={() => { setIsEditing(false); fetchUserProfile(); }} className="btn btn-sm btn-light px-3 py-2 fw-bold shadow-sm" style={{ borderRadius: '8px' }}>
                                    Cancel
                                </button>
                                <button onClick={handleSaveProfile} className="btn btn-sm text-white px-3 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#2ecc71', borderRadius: '8px' }}>
                                    <i className="bi bi-check-circle me-1"></i> Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {loadingProfile ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-secondary" role="status"></div>
                            <p className="text-muted mt-3 small">Loading profile...</p>
                        </div>
                    ) : (
                        <div className="card border-0 bg-white" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <div className="card-body p-4 p-md-5">
                                
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase tracking-wide"><i className="bi bi-person me-2"></i>First Name</label>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-lg bg-light border-0" name="firstName" value={profileData.firstName} onChange={handleProfileChange} />
                                        ) : (
                                            <p className="fs-5 fw-medium mb-0">{profileData.firstName || <span className="text-muted fst-italic fs-6">Not provided</span>}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase tracking-wide"><i className="bi bi-person me-2"></i>Last Name</label>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-lg bg-light border-0" name="lastName" value={profileData.lastName} onChange={handleProfileChange} />
                                        ) : (
                                            <p className="fs-5 fw-medium mb-0">{profileData.lastName || <span className="text-muted fst-italic fs-6">Not provided</span>}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase tracking-wide"><i className="bi bi-envelope me-2"></i>Email Address</label>
                                        <p className="fs-5 fw-medium mb-0 text-muted">{profileData.email}</p>
                                        {isEditing && <small className="text-muted d-block mt-1"><i className="bi bi-info-circle me-1"></i>Email cannot be changed.</small>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase tracking-wide"><i className="bi bi-telephone me-2"></i>Mobile Number</label>
                                        {isEditing ? (
                                            <input type="text" className="form-control form-control-lg bg-light border-0" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="+63 9XX XXX XXXX" />
                                        ) : (
                                            <p className="fs-5 fw-medium mb-0">{profileData.phone || <span className="text-muted fst-italic fs-6">Not provided</span>}</p>
                                        )}
                                    </div>
                                    <div className="col-12 mt-4 pt-3 border-top">
                                        <label className="form-label text-muted small fw-bold text-uppercase tracking-wide"><i className="bi bi-geo-alt me-2"></i>Delivery Address</label>
                                        {isEditing ? (
                                            <textarea className="form-control bg-light border-0" rows="3" name="address" value={profileData.address} onChange={handleProfileChange} placeholder="Enter your full delivery address..."></textarea>
                                        ) : (
                                            <p className="fs-5 fw-medium mb-0">{profileData.address || <span className="text-muted fst-italic fs-6">Not provided</span>}</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </>
            );
        }



        if (activeTab === 'orders') {
            return (
                <>
                    <div className="mb-4 d-flex justify-content-between align-items-end">
                        <div>
                            <h4 className="fw-bold mb-1" style={{ color: 'var(--text-dark)' }}>My Orders</h4>
                            <p className="text-muted small mb-0">Track your order history effortlessly</p>
                        </div>
                        <button onClick={fetchOrders} className="btn btn-sm text-white px-3 py-2 fw-bold" style={{ backgroundColor: 'var(--accent-orange)', borderRadius: '8px' }}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Status
                        </button>
                    </div>

                    {loadingOrders ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-secondary" role="status"></div>
                            <p className="text-muted mt-3 small">Fetching your orders...</p>
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="card border-0 bg-white text-center py-5" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <i className="bi bi-bag text-muted mb-3 d-block" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <h5 className="fw-bold mb-2" style={{ color: 'var(--text-dark)' }}>Your order history is empty</h5>
                            <p className="text-muted small mb-4">You haven't placed any orders yet.</p>
                            <div>
                                <Link to="/menu" className="btn btn-sm shadow-sm" style={{ backgroundColor: 'var(--accent-orange)', color: '#fff', borderRadius: '50px', padding: '10px 30px', fontWeight: 'bold' }}>
                                    Order Now
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="orders-list d-flex flex-column gap-4">
                            {myOrders.map(order => {
                                const statusInfo = getStatusInfo(order.status);
                                const dateStr = new Date(order.orderDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                                
                                return (
                                    <div key={order.id} className="card border-0 bg-white" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                                        <div className="card-header bg-transparent border-bottom-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="fw-bold mb-1" style={{ color: 'var(--primary-brown)' }}>Order #{order.id}</h6>
                                                <p className="text-muted small mb-0"><i className="bi bi-calendar3 me-1"></i> {dateStr}</p>
                                            </div>
                                            <div className="text-end">
                                                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>₱{order.totalAmount.toFixed(2)}</h5>
                                                <span className="badge rounded-pill" style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}>
                                                    <i className={`bi ${statusInfo.icon} me-1`}></i>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body px-4 py-3">
                                            {order.status !== 'CANCELLED' && (
                                                <div className="mb-4 mt-2">
                                                    <div className="progress" style={{ height: '6px', borderRadius: '10px', backgroundColor: '#f0f0f0' }}>
                                                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" 
                                                             style={{ width: statusInfo.width, backgroundColor: statusInfo.color, borderRadius: '10px' }}></div>
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                                        <span style={{ color: statusInfo.width === '33%' ? statusInfo.color : '' }}>Placed</span>
                                                        <span style={{ color: statusInfo.width === '66%' ? statusInfo.color : '' }}>Preparing</span>
                                                        <span style={{ color: statusInfo.width === '100%' ? statusInfo.color : '' }}>Completed</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="order-items-preview bg-light rounded-3 p-3 mt-3">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="d-flex justify-content-between mb-2 small">
                                                        <span><span className="fw-bold me-2 text-primary">{item.quantity}x</span> {item.product?.name || 'Item'}</span>
                                                        <span className="fw-medium">₱{item.subtotal.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                                {order.notes && (
                                                    <div className="mt-3 pt-3 border-top small text-muted">
                                                        <i className="bi bi-chat-text me-1"></i> Note: {order.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            );
        }

        if (activeTab === 'communications') {
            return (
                <>
                    <div className="mb-4">
                        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-dark)' }}>Communications</h4>
                        <p className="text-muted small mb-0">Manage your communication preferences and notifications</p>
                    </div>

                    <div className="card border-0 bg-white" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div className="card-body p-4 p-md-5">
                            
                            <div className="row mb-5">
                                <div className="col-12 col-md-6 mb-3 mb-md-0">
                                    <h6 className="fw-bold" style={{ color: 'var(--text-dark)' }}>Offers & Deals</h6>
                                    <p className="text-muted small mb-0 pe-md-4">Get notified and be the first to know about Duyanan exclusive offers and marketing communications.</p>
                                </div>
                                <div className="col-12 col-md-6 d-flex flex-column justify-content-center gap-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                        <input className="form-check-input m-0 toggle-switch" type="checkbox" role="switch" id="offersPush" 
                                            checked={commPrefs.offersPush} onChange={() => handleToggle('offersPush')} 
                                            style={{ cursor: 'pointer', height: '1.2rem', width: '2.4rem' }}/>
                                        <label className="form-check-label small fw-medium" htmlFor="offersPush" style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>Push notification</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                        <input className="form-check-input m-0 toggle-switch" type="checkbox" role="switch" id="offersEmail" 
                                            checked={commPrefs.offersEmail} onChange={() => handleToggle('offersEmail')} 
                                            style={{ cursor: 'pointer', height: '1.2rem', width: '2.4rem' }}/>
                                        <label className="form-check-label small fw-medium" htmlFor="offersEmail" style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>Email</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                        <input className="form-check-input m-0 toggle-switch" type="checkbox" role="switch" id="offersSms" 
                                            checked={commPrefs.offersSms} onChange={() => handleToggle('offersSms')} 
                                            style={{ cursor: 'pointer', height: '1.2rem', width: '2.4rem' }}/>
                                        <label className="form-check-label small fw-medium" htmlFor="offersSms" style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>SMS</label>
                                    </div>
                                </div>
                            </div>
                            
                            <hr style={{ opacity: 0.1 }} />

                            <div className="row mt-4">
                                <div className="col-12 col-md-6 mb-3 mb-md-0">
                                    <h6 className="fw-bold" style={{ color: 'var(--text-dark)' }}>Important Updates</h6>
                                    <p className="text-muted small mb-0 pe-md-4">Receive important updates on your orders and new features via push notification, email, and SMS.</p>
                                </div>
                                <div className="col-12 col-md-6 d-flex align-items-center">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                        <input className="form-check-input m-0 toggle-switch" type="checkbox" role="switch" id="updatesPush" 
                                            checked={commPrefs.updatesPush} onChange={() => handleToggle('updatesPush')} 
                                            style={{ cursor: 'pointer', height: '1.2rem', width: '2.4rem' }}/>
                                        <label className="form-check-label small fw-medium" htmlFor="updatesPush" style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>Enabled</label>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            );
        }

        return (
            <div className="card border-0 bg-white text-center py-5" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <i className="bi bi-tools text-muted mb-3 d-block" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h5 className="fw-bold mb-2" style={{ color: 'var(--text-dark)' }}>Under Construction</h5>
                <p className="text-muted small mb-0">This section is currently being updated.</p>
            </div>
        );
    };

    return (
        <div className="container" style={{ marginTop: 'calc(var(--nav-height) + 40px)', marginBottom: '60px', minHeight: '60vh' }}>
            <div className="mb-4 d-flex align-items-center">
                <Link to="/" className="text-decoration-none me-2" style={{ color: 'var(--text-dark)' }}>
                    <i className="bi bi-arrow-left fs-5"></i>
                </Link>
                <h3 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Account Management</h3>
            </div>

            <div className="row g-5">
                {/* Sidebar Navigation */}
                <div className="col-12 col-md-3">
                    <style>
                        {`
                        .profile-sidebar-btn {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            width: 100%;
                            padding: 12px 16px;
                            margin-bottom: 8px;
                            border: none;
                            background: transparent;
                            border-radius: 10px;
                            color: #6c757d;
                            font-weight: 500;
                            text-align: left;
                            transition: all 0.2s ease;
                        }
                        .profile-sidebar-btn i {
                            font-size: 1.1rem;
                            transition: transform 0.2s ease;
                        }
                        .profile-sidebar-btn:hover {
                            background-color: rgba(139, 58, 15, 0.05);
                            color: var(--primary-brown);
                            transform: translateX(4px);
                        }
                        .profile-sidebar-btn.active {
                            background-color: var(--accent-orange);
                            color: white;
                            box-shadow: 0 4px 12px rgba(230, 126, 34, 0.2);
                        }
                        .profile-sidebar-btn.active:hover {
                            transform: none;
                        }
                        .profile-sidebar-btn.active i {
                            color: white;
                        }
                        .sidebar-heading {
                            font-size: 0.75rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #adb5bd;
                            margin-bottom: 12px;
                            margin-top: 24px;
                            padding-left: 16px;
                        }
                        .sidebar-heading:first-child {
                            margin-top: 0;
                        }
                        `}
                    </style>

                    <div className="sidebar-heading">Account</div>
                    <div className="d-flex flex-column mb-3">
                        <button className={`profile-sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            <i className="bi bi-person"></i> My Profile
                        </button>
                        <button className={`profile-sidebar-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
                            <i className="bi bi-credit-card"></i> Payment Methods
                        </button>
                        <button className={`profile-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <i className="bi bi-receipt"></i> My Orders
                        </button>
                    </div>

                    <div className="sidebar-heading">Settings</div>
                    <div className="d-flex flex-column mb-3">
                        <button className={`profile-sidebar-btn ${activeTab === 'communications' ? 'active' : ''}`} onClick={() => setActiveTab('communications')}>
                            <i className="bi bi-arrow-left-right"></i> Communications
                        </button>
                    </div>

                    <div className="sidebar-heading">Support</div>
                    <div className="d-flex flex-column mb-4">
                        <button className={`profile-sidebar-btn ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
                            <i className="bi bi-question-circle"></i> Help Center
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-12 col-md-9">
                    <style>
                        {`
                        @keyframes slideFadeIn {
                            from { opacity: 0; transform: translateY(15px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .fade-in-content {
                            animation: slideFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        }
                        `}
                    </style>
                    <div className="fade-in-content" key={activeTab}>
                        {renderMainContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
