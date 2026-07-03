import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [preselectedService, setPreselectedService] = useState(null)

  const openBooking = (serviceId = null) => {
    setPreselectedService(serviceId)
    setBookingOpen(true)
  }

  const closeBooking = () => {
    setBookingOpen(false)
    setPreselectedService(null)
  }

  return (
    <BookingContext.Provider value={{ bookingOpen, preselectedService, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking mora biti znotraj BookingProvider')
  return ctx
}
