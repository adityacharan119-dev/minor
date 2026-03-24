import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home/Home';
import Traditional from './pages/Traditional/Traditional';
import Modern from './pages/Modern/Modern';
import Streetwear from './pages/Streetwear/Streetwear';
import Jewelry from './pages/Jewelry/Jewelry';
import Custom from './pages/Custom/Custom';
import Admin from './pages/Admin/Admin';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import ProductPage from './pages/Product/ProductPage';
import SearchPage from './pages/Search/SearchPage';
import TrackOrderPage from './pages/Track/TrackOrderPage';
import LoginPage from './pages/Auth/LoginPage';
import RequireCustomerAuth from './components/RequireCustomerAuth';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-obsidian text-stone-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/traditional" element={<Traditional />} />
            <Route path="/modern" element={<Modern />} />
            <Route path="/streetwear" element={<Streetwear />} />
            <Route path="/jewelry" element={<Jewelry />} />
            <Route
              path="/custom"
              element={
                <RequireCustomerAuth>
                  <Custom />
                </RequireCustomerAuth>
              }
            />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <RequireCustomerAuth>
                  <CheckoutPage />
                </RequireCustomerAuth>
              }
            />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/track-order/:trackingCode" element={<TrackOrderPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
