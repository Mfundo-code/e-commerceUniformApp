// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Schools from './pages/Schools';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import TailorLogin from './pages/TailorLogin';
import DeliveryLogin from './pages/DeliveryLogin';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import { CartProvider } from './context/CartContext';

// ADD:
import OrderNow from './pages/OrderNow';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/schools/:schoolId/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/tailor-login" element={<TailorLogin />} />
                <Route path="/delivery-login" element={<DeliveryLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/terms" element={<Terms />} />

                {/* NEW: Order Now route */}
                <Route path="/order-now" element={<OrderNow />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
