'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UtensilsCrossed, User, Users, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Import role-based dashboards
import ClientDashboard from '@/components/dashboards/ClientDashboard'
import WaiterDashboard from '@/components/dashboards/WaiterDashboard'
import ManagerDashboard from '@/components/dashboards/ManagerDashboard'
import OwnerDashboard from '@/components/dashboards/OwnerDashboard'

const App = () => {
  const [user, setUser] = useState(null)
  const [loginType, setLoginType] = useState('client')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  })
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role_type: loginType
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (!formData.full_name) {
      setError('Por favor, preencha seu nome completo')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'client' // Only clients can register, staff is added by owner
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setFormData({ email: '', password: '', full_name: '', phone: '' })
  }
  
  // Render appropriate dashboard based on user role
  if (user) {
    switch(user.role) {
      case 'client':
        return <ClientDashboard user={user} onLogout={handleLogout} />
      case 'waiter':
        return <WaiterDashboard user={user} onLogout={handleLogout} />
      case 'manager':
        return <ManagerDashboard user={user} onLogout={handleLogout} />
      case 'owner':
        return <OwnerDashboard user={user} onLogout={handleLogout} />
      default:
        return <ClientDashboard user={user} onLogout={handleLogout} />
    }
  }
  
  // Login/Register screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UtensilsCrossed className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurante Pai Thiag</h1>
          <p className="text-lg text-gray-600">Sabor e tradição em cada prato</p>
        </div>
        
        {/* Login Type Selection */}
        <div className="flex justify-center mb-6">
          <Tabs value={loginType} onValueChange={setLoginType} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Funcionário
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Login/Register Card */}
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? `${loginType === 'client' ? 'Entre com sua conta de cliente' : 'Acesso para funcionários'}` 
                : 'Crie sua conta para fazer pedidos e reservas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </>
              )}
              
              <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </Button>
            </form>
            
            {loginType === 'client' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setFormData({ email: '', password: '', full_name: '', phone: '' })
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entrar'}
                </button>
              </div>
            )}
            
            {loginType === 'staff' && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Apenas funcionários autorizados podem fazer login aqui
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Demo credentials info */}
        <div className="mt-6 text-center text-sm text-gray-600 max-w-md mx-auto">
          <p className="font-semibold mb-2">👉 Primeira vez? Crie sua conta de cliente!</p>
          <p className="text-xs">Funcionários: Entre em contato com o gerente para obter suas credenciais</p>
        </div>
      </div>
    </div>
  )
}

export default App