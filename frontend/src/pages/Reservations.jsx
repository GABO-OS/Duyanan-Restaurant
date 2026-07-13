import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

// Placeholder imports - using existing images. 
// You can replace these files in the assets folder with the 3 images you uploaded!
import bg1 from '../assets/img/duyanan_bg.jpg';
import bg2 from '../assets/img/sfc.png';
import bg3 from '../assets/img/habhab.jpg';

const bgImages = [bg1, bg2, bg3];

const Reservations = () => {
    const navigate = useNavigate();
    const [currentBg, setCurrentBg] = useState(0);
    const [formData, setFormData] = useState({
        seatingType: '',
        date: '',
        time: '',
        guests: '',
        request: '',
        eventType: ''
    });
    const { user, isAuthenticated } = useAuth();

    // Handle background slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Log In',
                text: 'You need to be logged in to make a reservation.',
                confirmButtonColor: 'var(--primary-brown)'
            });
            navigate('/login');
            return;
        }

        const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
        if (selectedDateTime < new Date()) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Date/Time',
                text: 'Reservation date and time cannot be in the past!',
                confirmButtonColor: 'var(--primary-brown)'
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    guestName: `${user.firstName} ${user.lastName}`,
                    contactNumber: "N/A",
                    reservationDate: formData.date,
                    reservationTime: formData.time,
                    numberOfGuests: formData.guests,
                    specialRequests: formData.request,
                    seatingType: formData.seatingType,
                    eventType: formData.eventType
                })
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Reservation Confirmed!',
                    text: 'Your table has been successfully booked. Redirecting to home...',
                    confirmButtonColor: 'var(--primary-brown)',
                    timer: 3000,
                    showConfirmButton: false
                });
                navigate('/');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Reservation Failed',
                    text: data.error || 'Something went wrong. Please try again.',
                    confirmButtonColor: 'var(--primary-brown)'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Something Went Wrong',
                text: 'Unable to submit your reservation. Please try again later.',
                confirmButtonColor: 'var(--primary-brown)'
            });
        }
    };

    const inputStyle = {
        borderRadius: '6px',
        border: '1px solid #ced4da',
        backgroundColor: '#fff',
        padding: '12px 16px',
        fontSize: '1rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        width: '100%',
        outline: 'none',
        color: '#333'
    };

    const labelStyle = {
        color: '#495057',
        fontWeight: '600',
        fontSize: '0.9rem',
        marginBottom: '6px',
        display: 'block'
    };

    return (
        <div className="container-fluid p-0" style={{ minHeight: '100vh', display: 'flex' }}>
            <div className="row g-0 w-100">
                {/* Left Side: Background Slider */}
                <div className="col-lg-7 d-none d-lg-block position-relative" style={{ minHeight: '100vh', overflow: 'hidden' }}>
                    {bgImages.map((img, index) => (
                        <div 
                            key={index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: index === currentBg ? 1 : 0,
                                transition: 'opacity 1s ease-in-out',
                            }}
                        />
                    ))}
                    {/* Dark gradient overlay for smooth transition into the form */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                </div>

                {/* Right Side: Form Container */}
                <div className="col-12 col-lg-5 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#e9ecef', padding: '40px 0', minHeight: '100vh' }}>
                    
                    {/* The form wrapper */}
                    <div style={{ width: '100%', maxWidth: '450px', padding: '0 30px', marginTop: 'var(--nav-height)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🍃</div>
                            <h2 style={{ color: 'var(--primary-brown)', fontWeight: 800, margin: 0, letterSpacing: '0.02em', fontSize: '2rem' }}>
                                Duyanan Reservations
                            </h2>
                            <p style={{ color: '#555', marginTop: '8px' }}>
                                Book a table to start your session
                            </p>
                        </div>

                        {/* ── Guest Login Wall: replaces the form entirely ── */}
                        {!isAuthenticated ? (
                            <div style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '36px 28px',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                                border: '1.5px solid #f0ece8',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔒</div>
                                <h4 style={{ color: 'var(--primary-brown)', fontWeight: 800, marginBottom: '8px' }}>
                                    Login Required
                                </h4>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                    You must be <strong>logged in</strong> or <strong>registered</strong> to make a reservation.
                                    Create a free account to get started!
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <a
                                        href="/login"
                                        style={{
                                            display: 'block',
                                            padding: '13px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, var(--accent-orange), var(--primary-brown))',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textDecoration: 'none',
                                            boxShadow: '0 4px 14px rgba(160,64,0,0.25)'
                                        }}
                                    >
                                        <i className="bi bi-box-arrow-in-right me-2"></i>Log In
                                    </a>
                                    <a
                                        href="/register"
                                        style={{
                                            display: 'block',
                                            padding: '13px',
                                            borderRadius: '10px',
                                            background: 'transparent',
                                            color: 'var(--primary-brown)',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textDecoration: 'none',
                                            border: '1.5px solid var(--primary-brown)'
                                        }}
                                    >
                                        <i className="bi bi-person-plus me-2"></i>Create an Account
                                    </a>
                                </div>
                            </div>
                        ) : (
                        
                        <form onSubmit={handleSubmit}>
                            {/* Event Type */}
                            <div className="mb-3">
                                <label style={labelStyle}>Event Type</label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="" disabled hidden style={{ color: '#aaa' }}>Select Event Type</option>
                                    <option value="Casual Dining 🍽️">Casual Dining 🍽️</option>
                                    <option value="Birthday Celebration 🎂">Birthday Celebration 🎂</option>
                                    <option value="Anniversary 💑">Anniversary 💑</option>
                                    <option value="Wedding / Reception 💍">Wedding / Reception 💍</option>
                                    <option value="Business Meeting 💼">Business Meeting 💼</option>
                                    <option value="Other Event 🎉">Other Event 🎉</option>
                                </select>
                            </div>

                            {/* Seating Type */}
                            <div className="mb-3">
                                <label style={labelStyle}>Seating Type</label>
                                <select
                                    name="seatingType"
                                    value={formData.seatingType}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="" disabled hidden style={{ color: '#aaa' }}>Select Seating Type</option>
                                    <option value="indoor">🏠 Indoor</option>
                                    <option value="outdoor">🌿 Outdoor</option>
                                </select>
                            </div>

                            {/* Date & Time row */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label style={labelStyle}>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toLocaleDateString('en-CA')}
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label style={labelStyle}>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="mb-3">
                                <label style={labelStyle}>Number of Guests</label>
                                <input
                                    type="number"
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="e.g. 4"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Special Request */}
                            <div className="mb-4">
                                <label style={labelStyle}>Special Request <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
                                <textarea
                                    name="request"
                                    value={formData.request}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="e.g. Birthday celebration, dietary restrictions..."
                                    style={{ ...inputStyle, resize: 'none' }}
                                ></textarea>
                            </div>

                            {/* Submit */}
                            <button 
                                type="submit"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 0', 
                                    fontSize: '1.1rem', 
                                    borderRadius: '6px', 
                                    backgroundColor: isAuthenticated ? 'var(--accent-orange)' : '#aaa', 
                                    color: '#fff', 
                                    border: 'none', 
                                    fontWeight: 'bold',
                                    boxShadow: isAuthenticated ? '0 4px 6px rgba(211, 84, 0, 0.2)' : 'none',
                                    transition: 'background-color 0.2s',
                                    cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {!isAuthenticated && <i className="bi bi-lock-fill"></i>}
                                {isAuthenticated ? 'Confirm Reservation' : 'Login to Reserve'}
                            </button>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reservations;
