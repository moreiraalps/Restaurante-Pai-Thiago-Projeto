'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, ShoppingCart, Calendar, Clock, User, LogOut, Plus, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const ClientDashboard = ({ user, onLogout }) => {
  const [menu, setMenu] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')
  
  const [reservationForm, setReservationForm] = useState({
    date: '',
    time: '',
    guests: 2,
    notes: ''
  })
  
  useEffect(() => {
    fetchMenu()
    fetchOrders()
    fetchReservations()
  }, [])
  
  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu')
      const data = await response.json()
      setMenu(data.menu || [])
    } catch (error) {
      toast.error('Erro ao carregar cardápio')
    }
  }
  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      toast.error('Erro ao carregar pedidos')
    }
  }
  
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setReservations(data.reservations || [])
    } catch (error) {
      toast.error('Erro ao carregar reservas')
    }
  }
  
  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id)
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    toast.success(`${item.name} adicionado ao carrinho`)
  }
  
  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }
  
  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Pedido realizado com sucesso!')
      setCart([])
      fetchOrders()
      setActiveTab('orders')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const createReservation = async () => {
    if (!reservationForm.date || !reservationForm.time) {
      toast.error('Preencha data e horário')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationForm)
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Reserva criada com sucesso!')
      setReservationForm({ date: '', time: '', guests: 2, notes: '' })
      fetchReservations()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'Pendente',
      preparing: 'Preparando',
      ready: 'Pronto',
      delivered: 'Entregue',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada'
    }
    return <Badge className={variants[status] || 'bg-gray-100'}>{labels[status] || status}</Badge>
  }
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pai Thiag</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user.full_name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Meu Carrinho</DialogTitle>
                    <DialogDescription>
                      {cart.length === 0 ? 'Seu carrinho está vazio' : `${cart.length} item(ns) no carrinho`}
                    </DialogDescription>
                  </DialogHeader>
                  {cart.length > 0 && (
                    <div>
                      <div className="space-y-3 mb-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 mb-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-red-600">R$ {cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={placeOrder} disabled={loading}>
                        {loading ? 'Processando...' : 'Finalizar Pedido'}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
            <TabsTrigger value="orders">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
          </TabsList>
          
          {/* Menu Tab */}
          <TabsContent value="menu">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription className="mt-1">{item.category}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-lg font-bold text-red-600">
                        R$ {item.price.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => addToCart(item)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {menu.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Cardápio em breve...</p>
              </div>
            )}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.map(order => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                          </CardDescription>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-red-600">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Você ainda não fez nenhum pedido</p>
              </div>
            )}
          </TabsContent>
          
          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Reserva</CardTitle>
                    <CardDescription>Reserve uma mesa conosco</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Data</Label>
                        <Input 
                          type="date" 
                          value={reservationForm.date}
                          onChange={(e) => setReservationForm({...reservationForm, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label>Horário</Label>
                        <Input 
                          type="time" 
                          value={reservationForm.time}
                          onChange={(e) => setReservationForm({...reservationForm, time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Número de Pessoas</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="20"
                          value={reservationForm.guests}
                          onChange={(e) => setReservationForm({...reservationForm, guests: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Textarea 
                          placeholder="Alguma solicitação especial?"
                          value={reservationForm.notes}
                          onChange={(e) => setReservationForm({...reservationForm, notes: e.target.value})}
                        />
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={createReservation} disabled={loading}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {loading ? 'Criando...' : 'Criar Reserva'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {reservations.map(reservation => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              {new Date(reservation.date).toLocaleDateString('pt-BR')}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4" />
                              {reservation.time} - {reservation.guests} pessoa(s)
                            </CardDescription>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </CardHeader>
                      {reservation.notes && (
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            <strong>Observações:</strong> {reservation.notes}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
                {reservations.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Você não tem reservas</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ClientDashboard