'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, LogOut, DollarSign, ShoppingBag, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const ManagerDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayReservations: 0
  })
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Prato Principal',
    image_url: ''
  })
  
  useEffect(() => {
    fetchStats()
    fetchMenu()
    fetchOrders()
    fetchReservations()
    
    const interval = setInterval(() => {
      fetchStats()
      fetchOrders()
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }
  
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
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
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
      console.error('Error fetching reservations:', error)
    }
  }
  
  const handleCreateMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) {
      toast.error('Nome e preço são obrigatórios')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...menuForm,
          price: parseFloat(menuForm.price)
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Item criado com sucesso!')
      setDialogOpen(false)
      setMenuForm({ name: '', description: '', price: '', category: 'Prato Principal', image_url: '' })
      fetchMenu()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateMenuItem = async () => {
    if (!editingItem) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...menuForm,
          price: parseFloat(menuForm.price)
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Item atualizado!')
      setEditingItem(null)
      setMenuForm({ name: '', description: '', price: '', category: 'Prato Principal', image_url: '' })
      fetchMenu()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Erro ao deletar')
      
      toast.success('Item deletado!')
      fetchMenu()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  const updateReservationStatus = async (reservationId, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar reserva')
      
      toast.success('Reserva atualizada!')
      fetchReservations()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  const openEditDialog = (item) => {
    setEditingItem(item)
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || ''
    })
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
    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }
  
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
                <h1 className="text-2xl font-bold text-gray-900">Pai Thiag - Gerente</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user.full_name}!</p>
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
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Receita Hoje</CardDescription>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-2xl">R$ {stats.totalRevenue.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Pedidos Hoje</CardDescription>
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">{stats.totalOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Pedidos Pendentes</CardDescription>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">{stats.pendingOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Reservas Hoje</CardDescription>
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">{stats.todayReservations}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
          </TabsList>
          
          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <div className="mb-4">
              <Dialog open={dialogOpen || !!editingItem} onOpenChange={(open) => {
                if (!open) {
                  setDialogOpen(false)
                  setEditingItem(null)
                  setMenuForm({ name: '', description: '', price: '', category: 'Prato Principal', image_url: '' })
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item ao Cardápio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item do Cardápio'}</DialogTitle>
                    <DialogDescription>
                      {editingItem ? 'Atualize as informações do item' : 'Adicione um novo prato ao cardápio'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome do Prato</Label>
                      <Input 
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                        placeholder="Ex: Feijoada Completa"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        value={menuForm.description}
                        onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                        placeholder="Descrição do prato"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preço (R$)</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={menuForm.price}
                          onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select value={menuForm.category} onValueChange={(value) => setMenuForm({...menuForm, category: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entrada">Entrada</SelectItem>
                            <SelectItem value="Prato Principal">Prato Principal</SelectItem>
                            <SelectItem value="Sobremesa">Sobremesa</SelectItem>
                            <SelectItem value="Bebida">Bebida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>URL da Imagem (opcional)</Label>
                      <Input 
                        value={menuForm.image_url}
                        onChange={(e) => setMenuForm({...menuForm, image_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="bg-red-600 hover:bg-red-700" 
                      onClick={editingItem ? handleUpdateMenuItem : handleCreateMenuItem}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar Item')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.category}</CardDescription>
                      </div>
                      <Badge className="text-lg font-bold">R$ {item.price.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(item)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {menu.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>Nenhum item no cardápio. Adicione o primeiro!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.slice(0, 20).map(order => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                            {order.table_number && ` - Mesa ${order.table_number}`}
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
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>Nenhum pedido registrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <div className="space-y-4">
              {reservations.map(reservation => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {new Date(reservation.date).toLocaleDateString('pt-BR')} às {reservation.time}
                        </CardTitle>
                        <CardDescription>
                          {reservation.guests} pessoa(s) - Reserva #{reservation.id.slice(0, 8)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {reservation.notes && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Observações:</strong> {reservation.notes}
                      </p>
                    )}
                    {reservation.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        >
                          Confirmar
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {reservations.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>Nenhuma reserva registrada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ManagerDashboard