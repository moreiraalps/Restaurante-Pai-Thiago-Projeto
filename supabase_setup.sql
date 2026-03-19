-- ====================================
-- RESTAURANTE PAI THIAG - DATABASE SETUP
-- ====================================
-- Execute este SQL no Supabase Dashboard:
-- 1. Acesse: https://supabase.com/dashboard/project/gxrdmnjvazoxlyudczmx/sql/new
-- 2. Cole este código completo
-- 3. Clique em "RUN" para criar todas as tabelas
-- ====================================

-- Tabela de Usuários (Clientes e Funcionários)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'waiter', 'manager', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Tabela de Itens do Cardápio
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_available ON menu_items(available);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    table_number INTEGER,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Tabela de Mesas
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'occupied', 'reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tables_status ON tables(status);

-- ====================================
-- DADOS INICIAIS (SEEDS)
-- ====================================

-- Inserir usuários de exemplo (senha para todos: "senha123")
-- Hash bcrypt de "senha123": $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa

INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
-- Cliente
(gen_random_uuid(), 'cliente@teste.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Maria Cliente', '(11) 98765-4321', 'client'),
-- Garçom
(gen_random_uuid(), 'garcom@paithiag.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'João Garçom', '(11) 91111-1111', 'waiter'),
-- Gerente
(gen_random_uuid(), 'gerente@paithiag.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Ana Gerente', '(11) 92222-2222', 'manager'),
-- Dono
(gen_random_uuid(), 'dono@paithiag.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Pai Thiag', '(11) 93333-3333', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Inserir itens do cardápio
INSERT INTO menu_items (id, name, description, price, category, available) VALUES
(gen_random_uuid(), 'Feijoada Completa', 'Feijoada tradicional com todos os acompanhamentos: arroz, couve, laranja, farofa e torresmo', 45.90, 'Prato Principal', true),
(gen_random_uuid(), 'Moqueca de Peixe', 'Moqueca capixaba com peixe fresco, pimentões, tomates e leite de coco', 52.90, 'Prato Principal', true),
(gen_random_uuid(), 'Picanha na Brasa', 'Picanha nobre grelhada na brasa, acompanha arroz, feijão, batata frita e vinagrete', 68.90, 'Prato Principal', true),
(gen_random_uuid(), 'Filé à Parmegiana', 'Filé mignon empanado com molho de tomate e queijo derretido, arroz e fritas', 54.90, 'Prato Principal', true),
(gen_random_uuid(), 'Bacalhau à Brasileira', 'Bacalhau desfiado com batatas, ovos, azeitonas e cebolas', 62.90, 'Prato Principal', true),
(gen_random_uuid(), 'Pastel de Carne', 'Pastel crocante recheado com carne moída temperada', 12.90, 'Entrada', true),
(gen_random_uuid(), 'Bolinho de Bacalhau', 'Porção com 8 unidades de bolinhos crocantes de bacalhau', 28.90, 'Entrada', true),
(gen_random_uuid(), 'Calabresa Acebolada', 'Calabresa artesanal grelhada com cebolas caramelizadas', 32.90, 'Entrada', true),
(gen_random_uuid(), 'Pudim de Leite', 'Pudim caseiro cremoso com calda de caramelo', 15.90, 'Sobremesa', true),
(gen_random_uuid(), 'Petit Gateau', 'Bolinho de chocolate quente com sorvete de creme', 22.90, 'Sobremesa', true),
(gen_random_uuid(), 'Mousse de Maracujá', 'Mousse leve e refrescante de maracujá', 14.90, 'Sobremesa', true),
(gen_random_uuid(), 'Caipirinha', 'Caipirinha tradicional de limão, cachaça e açúcar', 18.90, 'Bebida', true),
(gen_random_uuid(), 'Suco Natural', 'Suco natural de frutas da estação (laranja, limão, maracujá, abacaxi)', 12.90, 'Bebida', true),
(gen_random_uuid(), 'Refrigerante Lata', 'Coca-Cola, Guaraná, Fanta ou Sprite', 6.90, 'Bebida', true),
(gen_random_uuid(), 'Cerveja Artesanal', 'Cerveja artesanal local 500ml', 16.90, 'Bebida', true)
ON CONFLICT DO NOTHING;

-- Inserir mesas
INSERT INTO tables (id, number, capacity, status) VALUES
(gen_random_uuid(), 1, 2, 'available'),
(gen_random_uuid(), 2, 2, 'available'),
(gen_random_uuid(), 3, 4, 'available'),
(gen_random_uuid(), 4, 4, 'available'),
(gen_random_uuid(), 5, 4, 'available'),
(gen_random_uuid(), 6, 6, 'available'),
(gen_random_uuid(), 7, 6, 'available'),
(gen_random_uuid(), 8, 8, 'available'),
(gen_random_uuid(), 9, 2, 'available'),
(gen_random_uuid(), 10, 2, 'available')
ON CONFLICT DO NOTHING;

-- ====================================
-- CONFIGURAÇÕES DE SEGURANÇA
-- ====================================
-- Por padrão, o RLS (Row Level Security) está desativado.
-- Se você ativar o RLS no futuro, adicione as policies adequadas.

-- ====================================
-- SETUP COMPLETO!
-- ====================================
-- Agora você pode usar o sistema com as seguintes credenciais:
--
-- CLIENTE:
--   Email: cliente@teste.com
--   Senha: senha123
--
-- GARÇOM:
--   Email: garcom@paithiag.com
--   Senha: senha123
--
-- GERENTE:
--   Email: gerente@paithiag.com
--   Senha: senha123
--
-- DONO:
--   Email: dono@paithiag.com
--   Senha: senha123
-- ====================================
