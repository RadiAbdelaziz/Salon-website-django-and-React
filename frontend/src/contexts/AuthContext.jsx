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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')
        const customerData = localStorage.getItem('customerData')

        if (token && userData) {
          // حاول جلب البروفايل من السيرفر
          const profile = await authAPI.getProfile()
          setUser(profile.user)
          setCustomer(profile.customer || null)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setCustomer(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // إذا حصل خطأ، نظف التوكن والبيانات
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('customerData')
        setUser(null)
        setCustomer(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false) // هذا مهم جدًا لكي تظهر الصفحة
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (phoneData) => {
    try {
      const response = await authAPI.login(phoneData) // هنا تستخدم الهاتف فقط
      
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }

      setUser(response.user)
      setCustomer(response.customer || null)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (phoneData) => {
    try {
      const response = await authAPI.register(phoneData) // الهاتف فقط
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }
      setUser(response.user)
      setCustomer(response.customer || null)
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
      localStorage.setItem('userData', JSON.stringify(response.user))
      if (response.customer) {
        localStorage.setItem('customerData', JSON.stringify(response.customer))
      }
      setUser(response.user)
      setCustomer(response.customer || null)
      return response
    } catch (error) {
      throw error
    }
  }
const verifyPhoneOTP = async (phone, code) => {
  try {
    const response = await phoneAuthAPI.verifyOTP(phone, code);

    localStorage.setItem('authToken', response.token);

    setUser({ id: response.user_id, phone });
    setIsAuthenticated(true);

    return response;
  } catch (error) {
    throw error;
  }
};



  const value = {
    user,
    customer,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    verifyPhoneOTP
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
