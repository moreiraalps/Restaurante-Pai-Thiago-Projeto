import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Helper to get auth token from headers
const getAuthUser = (request) => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  return verifyToken(token)
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  try {
    // Root endpoint
    if (pathname === '/api' || pathname === '/api/') {
      return NextResponse.json({ message: 'Restaurante Pai Thiag API' }, { headers: corsHeaders })
    }
    
    // Get menu items
    if (pathname === '/api/menu') {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
      
      if (error) throw error
      return NextResponse.json({ menu: data || [] }, { headers: corsHeaders })
    }
    
    // Get user orders
    if (pathname.startsWith('/api/orders/user/')) {
      const user = getAuthUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: corsHeaders })
      }
      
      const userId = pathname.split('/').pop()
      if (userId !== user.id && !['owner', 'manager'].includes(user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return NextResponse.json({ orders: data || [] }, { headers: corsHeaders })
    }
    
    // Get all orders (for staff)
    if (pathname === '/api/orders') {
      const user = getAuthUser(request)
      if (!user || user.role === 'client') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
      
      // Waiters only see active orders
      if (user.role === 'waiter') {
        query = query.in('status', ['pending', 'preparing', 'ready'])
      }
      
      const { data, error } = await query
      if (error) throw error
      return NextResponse.json({ orders: data || [] }, { headers: corsHeaders })
    }
    
    // Get reservations
    if (pathname === '/api/reservations') {
      const user = getAuthUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: corsHeaders })
      }
      
      let query = supabase.from('reservations').select('*').order('date', { ascending: true })
      
      // Clients only see their own reservations
      if (user.role === 'client') {
        query = query.eq('user_id', user.id)
      }
      
      const { data, error } = await query
      if (error) throw error
      return NextResponse.json({ reservations: data || [] }, { headers: corsHeaders })
    }
    
    // Get tables
    if (pathname === '/api/tables') {
      const user = getAuthUser(request)
      if (!user || user.role === 'client') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number')
      
      if (error) throw error
      return NextResponse.json({ tables: data || [] }, { headers: corsHeaders })
    }
    
    // Get dashboard stats (for manager/owner)
    if (pathname === '/api/stats') {
      const user = getAuthUser(request)
      if (!user || !['owner', 'manager'].includes(user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      // Get today's stats
      const today = new Date().toISOString().split('T')[0]
      
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
      
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('date', today)
      
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const todayReservations = reservations?.length || 0
      
      return NextResponse.json({
        totalRevenue,
        totalOrders,
        pendingOrders,
        todayReservations
      }, { headers: corsHeaders })
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  
  try {
    const body = await request.json()
    
    // User registration
    if (pathname === '/api/auth/register') {
      const { email, password, full_name, phone, role = 'client' } = body
      
      if (!email || !password || !full_name) {
        return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400, headers: corsHeaders })
      }
      
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      
      if (existing) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400, headers: corsHeaders })
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password)
      
      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          email,
          password_hash: hashedPassword,
          full_name,
          phone: phone || null,
          role,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      const token = generateToken(user)
      
      return NextResponse.json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }, { headers: corsHeaders })
    }
    
    // User login
    if (pathname === '/api/auth/login') {
      const { email, password, role_type } = body
      
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400, headers: corsHeaders })
      }
      
      // Get user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error || !user) {
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401, headers: corsHeaders })
      }
      
      // Check role type
      if (role_type === 'client' && user.role !== 'client') {
        return NextResponse.json({ error: 'Use o login de funcionários' }, { status: 401, headers: corsHeaders })
      }
      if (role_type === 'staff' && user.role === 'client') {
        return NextResponse.json({ error: 'Use o login de clientes' }, { status: 401, headers: corsHeaders })
      }
      
      // Verify password
      const isValid = await comparePassword(password, user.password_hash)
      if (!isValid) {
        return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401, headers: corsHeaders })
      }
      
      const token = generateToken(user)
      
      return NextResponse.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }, { headers: corsHeaders })
    }
    
    // Create order
    if (pathname === '/api/orders') {
      const user = getAuthUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: corsHeaders })
      }
      
      const { items, table_number, notes } = body
      
      if (!items || items.length === 0) {
        return NextResponse.json({ error: 'Pedido vazio' }, { status: 400, headers: corsHeaders })
      }
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          table_number: table_number || null,
          items: JSON.stringify(items),
          total,
          status: 'pending',
          notes: notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Pedido criado com sucesso',
        order
      }, { headers: corsHeaders })
    }
    
    // Create reservation
    if (pathname === '/api/reservations') {
      const user = getAuthUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: corsHeaders })
      }
      
      const { date, time, guests, notes } = body
      
      if (!date || !time || !guests) {
        return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400, headers: corsHeaders })
      }
      
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          date,
          time,
          guests,
          status: 'pending',
          notes: notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Reserva criada com sucesso',
        reservation
      }, { headers: corsHeaders })
    }
    
    // Create menu item (manager/owner only)
    if (pathname === '/api/menu') {
      const user = getAuthUser(request)
      if (!user || !['owner', 'manager'].includes(user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { name, description, price, category, image_url } = body
      
      const { data: item, error } = await supabase
        .from('menu_items')
        .insert({
          id: uuidv4(),
          name,
          description,
          price,
          category,
          image_url: image_url || null,
          available: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Item criado com sucesso',
        item
      }, { headers: corsHeaders })
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url)
  
  try {
    const body = await request.json()
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401, headers: corsHeaders })
    }
    
    // Update order status
    if (pathname.startsWith('/api/orders/')) {
      const orderId = pathname.split('/').pop()
      const { status } = body
      
      if (user.role === 'client') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Pedido atualizado',
        order: data
      }, { headers: corsHeaders })
    }
    
    // Update reservation status
    if (pathname.startsWith('/api/reservations/')) {
      const reservationId = pathname.split('/').pop()
      const { status } = body
      
      if (!['owner', 'manager'].includes(user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Reserva atualizada',
        reservation: data
      }, { headers: corsHeaders })
    }
    
    // Update menu item
    if (pathname.startsWith('/api/menu/')) {
      const itemId = pathname.split('/').pop()
      
      if (!['owner', 'manager'].includes(user.role)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('menu_items')
        .update(body)
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Item atualizado',
        item: data
      }, { headers: corsHeaders })
    }
    
    // Update table status
    if (pathname.startsWith('/api/tables/')) {
      const tableId = pathname.split('/').pop()
      const { status } = body
      
      if (user.role === 'client') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
      }
      
      const { data, error } = await supabase
        .from('tables')
        .update({ status })
        .eq('id', tableId)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({
        message: 'Mesa atualizada',
        table: data
      }, { headers: corsHeaders })
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url)
  
  try {
    const user = getAuthUser(request)
    
    if (!user || !['owner', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403, headers: corsHeaders })
    }
    
    // Delete menu item
    if (pathname.startsWith('/api/menu/')) {
      const itemId = pathname.split('/').pop()
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      
      return NextResponse.json({ message: 'Item deletado' }, { headers: corsHeaders })
    }
    
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404, headers: corsHeaders })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}