import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Menu from './pages/Menu'; // Was ProductList
import CartPage from './pages/CartPage'; // Was Cart
import Footer from './components/Footer';
import Reservations from './pages/Reservations';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ScrollToTop from './components/ScrollToTop';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />
                    <div className="d-flex flex-column min-vh-100">
                        <Navigation />
                        <Routes>
                            {/* Public Auth routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Public routes — visible to everyone including guests */}
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/reservations" element={<Reservations />} />

                            {/* Protected routes — require login */}
                            <Route path="/cart" element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* Admin-only route */}
                            <Route path="/admin" element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <AdminPanel />
                                </ProtectedRoute>
                            } />
                        </Routes>
                        <Footer />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
