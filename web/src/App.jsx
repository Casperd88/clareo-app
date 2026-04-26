import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import AuroraHomeRoute from './components/AuroraHomeRoute';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import './styles/global.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuroraHomeRoute />
        <Header />
        <AnimatedRoutes />
        <AnalyticsConsentBanner />
      </BrowserRouter>
    </ThemeProvider>
  );
}
