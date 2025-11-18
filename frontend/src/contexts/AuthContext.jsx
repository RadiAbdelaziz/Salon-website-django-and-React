import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      const customerData = localStorage.getItem('customerData')

      if (token && userData) {
        try {
          // Verify token is still valid by fetching profile
          const profile = await authAPI.getProfile()
          setUser(profile.user)
          setCustomer(profile.customer)
          setIsAuthenticated(true)
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          localStorage.removeItem('customerData')
          setUser(null)
          setCustomer(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setCustomer(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      
      // Store data in localStorage
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }
      
      // Update state
      setUser(response.user)
      setCustomer(response.customer)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      // Store data in localStorage
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }
      
      // Update state
      setUser(response.user)
      setCustomer(response.customer)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear storage and state regardless of API call success
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('customerData')
      setUser(null)
      setCustomer(null)
      setIsAuthenticated(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      // Update stored data
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }
      
      // Update state
      setUser(response.user)
      setCustomer(response.customer)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    customer,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
