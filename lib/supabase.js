import { createClient } from '@supabase/supabase-js'

// Suas credenciais do Supabase (Inseridas diretamente)
const supabaseUrl = 'https://gxrdmnjvazoxlyudczmx.supabase.co'
const supabaseAnonKey = 'sb_publishable_FL2wUOj13gYs4CQIu2ZlTw_wfvUlvmm'
const supabaseServiceKey = 'sb_secret_cijalMe0HIgegl--i0R5jg_uVIPriCF'

// Cliente para o navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para o servidor (Admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)