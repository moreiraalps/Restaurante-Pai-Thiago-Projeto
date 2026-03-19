'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, LogOut, Clock, CheckCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const WaiterDashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetchOrders()
    fetchTables()
    const interval = setInterval(fetchOrders, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])
  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }
  
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tables', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setTables(data.tables || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }
  
  const updateOrderStatus = async (orderId, status) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar pedido')
      
      toast.success('Status atualizado!')
      fetchOrders()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const updateTableStatus = async (tableId, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar mesa')
      
      toast.success('Mesa atualizada!')
      fetchTables()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      pending: 'Pendente',
      preparing: 'Preparando',
      ready: 'Pronto',
      delivered: 'Entregue'
    }
    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }
  
  const getTableStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 border-green-300',
      occupied: 'bg-red-100 border-red-300',
      reserved: 'bg-yellow-100 border-yellow-300'
    }
    return colors[status] || 'bg-gray-100'
  }
  
  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'delivered')
  
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
                <h1 className="text-2xl font-bold text-gray-900">Pai Thiag - Garçom</h1>
                <p className="text-sm text-gray-600">Olá, {user.full_name}!</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pedidos Ativos</CardDescription>
              <CardTitle className="text-3xl">{activeOrders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pedidos Pendentes</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Prontos para Entregar</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {orders.filter(o => o.status === 'ready').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Orders */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Pedidos Ativos</h2>
            <div className="space-y-4">
              {activeOrders.map(order => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            {order.table_number && ` - Mesa ${order.table_number}`}
                          </CardDescription>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 mb-4">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-red-600">R$ {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700" 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            disabled={loading}
                          >
                            Em Preparo
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700" 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            disabled={loading}
                          >
                            Pronto
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            className="flex-1 bg-gray-600 hover:bg-gray-700" 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Entregar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {activeOrders.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>Nenhum pedido ativo no momento</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Tables */}
          <div>
            <h2 className="text-xl font-bold mb-4">Mesas</h2>
            <div className="grid grid-cols-2 gap-3">
              {tables.map(table => (
                <Card key={table.id} className={`${getTableStatusColor(table.status)} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl text-center">Mesa {table.number}</CardTitle>
                    <CardDescription className="text-center">
                      {table.capacity} pessoas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Select 
                      value={table.status} 
                      onValueChange={(value) => updateTableStatus(table.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="occupied">Ocupada</SelectItem>
                        <SelectItem value="reserved">Reservada</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
            {tables.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p>Nenhuma mesa cadastrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default WaiterDashboard