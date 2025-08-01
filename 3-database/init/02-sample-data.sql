-- Insertar datos de ejemplo para desarrollo y testing

-- Insertar usuario administrador por defecto
INSERT INTO users (id, email, password, first_name, last_name, role, active) VALUES 
(uuid_generate_v4(), 'admin@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewREyh.7nDJbgW6u', 'Admin', 'System', 'admin', true),
(uuid_generate_v4(), 'manager@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewREyh.7nDJbgW6u', 'Manager', 'Test', 'manager', true),
(uuid_generate_v4(), 'operator@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewREyh.7nDJbgW6u', 'Operator', 'Test', 'operator', true)
ON CONFLICT (email) DO NOTHING;

-- Nota: Contraseña por defecto es "password123" para todos los usuarios de ejemplo

-- Insertar ubicaciones de ejemplo
INSERT INTO locations (id, name, code, description, type) VALUES 
(uuid_generate_v4(), 'Almacén Principal', 'MAIN-01', 'Almacén principal de la empresa', 'warehouse'),
(uuid_generate_v4(), 'Almacén Secundario', 'SEC-01', 'Almacén secundario para overflow', 'warehouse'),
(uuid_generate_v4(), 'Tienda Central', 'STORE-01', 'Tienda principal', 'retail'),
(uuid_generate_v4(), 'Zona de Recepción', 'REC-01', 'Zona de recepción de mercancía', 'receiving'),
(uuid_generate_v4(), 'Zona de Envíos', 'SHIP-01', 'Zona de preparación de envíos', 'shipping')
ON CONFLICT (code) DO NOTHING;

-- Insertar categorías de productos
INSERT INTO categories (id, name, description) VALUES 
(uuid_generate_v4(), 'Electrónicos', 'Productos electrónicos y tecnológicos'),
(uuid_generate_v4(), 'Oficina', 'Suministros y equipos de oficina'),
(uuid_generate_v4(), 'Hogar', 'Productos para el hogar'),
(uuid_generate_v4(), 'Herramientas', 'Herramientas y equipos de trabajo'),
(uuid_generate_v4(), 'Componentes', 'Componentes y partes')
ON CONFLICT DO NOTHING;

-- Obtener IDs de categorías para usar en productos
DO $$
DECLARE
    cat_electronics UUID;
    cat_office UUID;
    cat_home UUID;
    cat_tools UUID;
    cat_components UUID;
    loc_main UUID;
    loc_secondary UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_electronics FROM categories WHERE name = 'Electrónicos' LIMIT 1;
    SELECT id INTO cat_office FROM categories WHERE name = 'Oficina' LIMIT 1;
    SELECT id INTO cat_home FROM categories WHERE name = 'Hogar' LIMIT 1;
    SELECT id INTO cat_tools FROM categories WHERE name = 'Herramientas' LIMIT 1;
    SELECT id INTO cat_components FROM categories WHERE name = 'Componentes' LIMIT 1;
    
    -- Obtener IDs de ubicaciones
    SELECT id INTO loc_main FROM locations WHERE code = 'MAIN-01' LIMIT 1;
    SELECT id INTO loc_secondary FROM locations WHERE code = 'SEC-01' LIMIT 1;

    -- Insertar productos de ejemplo
    INSERT INTO products (id, sku, name, description, category_id, unit_price, cost_price, minimum_stock, reorder_point, barcode, nfc_id) VALUES 
    (uuid_generate_v4(), 'LAPTOP-001', 'Laptop Dell Inspiron 15', 'Laptop para oficina con Windows 11', cat_electronics, 899.99, 650.00, 5, 10, '1234567890123', 'NFC001'),
    (uuid_generate_v4(), 'MOUSE-001', 'Mouse Inalámbrico Logitech', 'Mouse inalámbrico con receptor USB', cat_electronics, 29.99, 18.00, 20, 30, '2345678901234', 'NFC002'),
    (uuid_generate_v4(), 'CHAIR-001', 'Silla de Oficina Ergonómica', 'Silla ergonómica con soporte lumbar', cat_office, 199.99, 120.00, 10, 15, '3456789012345', 'NFC003'),
    (uuid_generate_v4(), 'COFFEE-001', 'Cafetera Programable', 'Cafetera automática 12 tazas', cat_home, 79.99, 45.00, 8, 12, '4567890123456', 'NFC004'),
    (uuid_generate_v4(), 'DRILL-001', 'Taladro Inalámbrico 18V', 'Taladro con batería de litio incluida', cat_tools, 149.99, 89.00, 6, 10, '5678901234567', 'NFC005'),
    (uuid_generate_v4(), 'CABLE-001', 'Cable USB-C a USB-A', 'Cable de datos y carga 2 metros', cat_components, 12.99, 6.00, 50, 75, '6789012345678', 'NFC006'),
    (uuid_generate_v4(), 'MONITOR-001', 'Monitor LED 24 pulgadas', 'Monitor Full HD con entrada HDMI', cat_electronics, 189.99, 140.00, 8, 12, '7890123456789', 'NFC007'),
    (uuid_generate_v4(), 'DESK-001', 'Escritorio de Oficina', 'Escritorio con cajones laterales', cat_office, 299.99, 180.00, 5, 8, '8901234567890', 'NFC008'),
    (uuid_generate_v4(), 'PHONE-001', 'Teléfono IP', 'Teléfono VoIP para oficina', cat_electronics, 89.99, 55.00, 15, 20, '9012345678901', 'NFC009'),
    (uuid_generate_v4(), 'PAPER-001', 'Papel A4 500 hojas', 'Resma de papel blanco 75g', cat_office, 8.99, 5.50, 100, 150, '0123456789012', 'NFC010')
    ON CONFLICT (sku) DO NOTHING;

    -- Insertar inventario inicial
    INSERT INTO inventory (product_id, location_id, quantity, last_counted_at) 
    SELECT p.id, loc_main, 
           CASE 
               WHEN p.sku LIKE 'LAPTOP%' THEN 15
               WHEN p.sku LIKE 'MOUSE%' THEN 45
               WHEN p.sku LIKE 'CHAIR%' THEN 25
               WHEN p.sku LIKE 'COFFEE%' THEN 18
               WHEN p.sku LIKE 'DRILL%' THEN 12
               WHEN p.sku LIKE 'CABLE%' THEN 150
               WHEN p.sku LIKE 'MONITOR%' THEN 20
               WHEN p.sku LIKE 'DESK%' THEN 10
               WHEN p.sku LIKE 'PHONE%' THEN 35
               WHEN p.sku LIKE 'PAPER%' THEN 250
               ELSE 10
           END,
           CURRENT_TIMESTAMP
    FROM products p
    ON CONFLICT (product_id, location_id) DO NOTHING;

    -- Insertar algunos productos también en almacén secundario
    INSERT INTO inventory (product_id, location_id, quantity, last_counted_at) 
    SELECT p.id, loc_secondary, 
           CASE 
               WHEN p.sku LIKE 'CABLE%' THEN 75
               WHEN p.sku LIKE 'MOUSE%' THEN 25
               WHEN p.sku LIKE 'PAPER%' THEN 100
               ELSE 5
           END,
           CURRENT_TIMESTAMP
    FROM products p
    WHERE p.sku IN ('CABLE-001', 'MOUSE-001', 'PAPER-001', 'PHONE-001')
    ON CONFLICT (product_id, location_id) DO NOTHING;

END $$;

-- Insertar dispositivos IoT de ejemplo
INSERT INTO iot.devices (device_id, device_type, name, status, configuration) VALUES 
('NFC-READER-001', 'nfc_reader', 'Lector NFC Entrada Principal', 'active', '{"read_range": "5cm", "frequency": "13.56MHz"}'),
('NFC-READER-002', 'nfc_reader', 'Lector NFC Almacén', 'active', '{"read_range": "5cm", "frequency": "13.56MHz"}'),
('TEMP-SENSOR-001', 'temperature_sensor', 'Sensor Temperatura Almacén 1', 'active', '{"unit": "celsius", "range": "-40 to 85"}'),
('TEMP-SENSOR-002', 'temperature_sensor', 'Sensor Temperatura Almacén 2', 'active', '{"unit": "celsius", "range": "-40 to 85"}'),
('MOTION-SENSOR-001', 'motion_sensor', 'Sensor Movimiento Entrada', 'active', '{"detection_range": "10m", "angle": "120°"}'),
('HUM-SENSOR-001', 'humidity_sensor', 'Sensor Humedad Almacén', 'active', '{"unit": "percent", "range": "0 to 100"}')
ON CONFLICT (device_id) DO NOTHING;

-- Insertar algunos movimientos de inventario de ejemplo
DO $$
DECLARE
    product_laptop UUID;
    product_mouse UUID;
    main_location UUID;
    admin_user UUID;
BEGIN
    -- Obtener IDs necesarios
    SELECT id INTO product_laptop FROM products WHERE sku = 'LAPTOP-001' LIMIT 1;
    SELECT id INTO product_mouse FROM products WHERE sku = 'MOUSE-001' LIMIT 1;
    SELECT id INTO main_location FROM locations WHERE code = 'MAIN-01' LIMIT 1;
    SELECT id INTO admin_user FROM users WHERE email = 'admin@inventory.com' LIMIT 1;

    -- Insertar movimientos de ejemplo
    INSERT INTO inventory_movements (product_id, location_id, movement_type, quantity, quantity_before, quantity_after, reason, performed_by) VALUES 
    (product_laptop, main_location, 'in', 10, 5, 15, 'Recepción de nuevo stock', admin_user),
    (product_mouse, main_location, 'out', 5, 50, 45, 'Venta al por mayor', admin_user),
    (product_laptop, main_location, 'adjustment', -1, 15, 14, 'Producto dañado en inspección', admin_user);
END $$;

-- Insertar datos de sensores de ejemplo (últimas 24 horas)
INSERT INTO iot.sensor_data (device_id, sensor_type, value, unit, recorded_at) 
SELECT 
    'TEMP-SENSOR-001',
    'temperature',
    20 + (random() * 5), -- Temperatura entre 20-25°C
    'celsius',
    NOW() - (random() * interval '24 hours')
FROM generate_series(1, 100);

INSERT INTO iot.sensor_data (device_id, sensor_type, value, unit, recorded_at) 
SELECT 
    'HUM-SENSOR-001',
    'humidity',
    45 + (random() * 20), -- Humedad entre 45-65%
    'percent',
    NOW() - (random() * interval '24 hours')
FROM generate_series(1, 100);

-- Insertar algunas alertas de ejemplo
INSERT INTO iot.alerts (device_id, alert_type, severity, message) VALUES 
('TEMP-SENSOR-001', 'temperature_high', 'warning', 'Temperatura elevada detectada en almacén principal'),
('NFC-READER-001', 'device_offline', 'error', 'Lector NFC no responde desde hace 30 minutos'),
('MOTION-SENSOR-001', 'unauthorized_access', 'critical', 'Movimiento detectado fuera del horario laboral')
ON CONFLICT DO NOTHING;
