import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Contact from './components/Contact'
import Location from './components/Location'
import Footer from './components/Footer'
import BookingModal from './components/BookingModal'
import AdminPage from './components/AdminPage'

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Contact />
        <Location />
      </main>
      <Footer />
      <BookingModal />
    </>
  )
}

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </BookingProvider>
  )
}
