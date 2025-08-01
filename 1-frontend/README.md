# 🎨 Frontend - Capa de Presentación

Esta carpeta contiene toda la interfaz de usuario del sistema de inventario.

## 📋 ¿Qué es esto?

En una arquitectura de 3 capas tradicional, esto sería tu **capa de presentación**. Aquí vive todo lo que el usuario ve e interactúa:

- ✅ Interfaz de usuario (React)
- ✅ Componentes visuales
- ✅ Lógica de navegación
- ✅ Validación de formularios
- ✅ Llamadas a la API

## 🏗️ Estructura

```
1-frontend/
├── 📄 Dockerfile                    # Para containerizar el frontend
├── 📄 package.json                  # Dependencias de React
├── 📄 README.md                     # Este archivo
├── 📁 public/                       # Archivos estáticos
│   ├── index.html
│   └── favicon.ico
├── 📁 src/                          # Código fuente
│   ├── 📁 components/               # Componentes reutilizables
│   │   ├── Header.js
│   │   ├── ProductCard.js
│   │   └── InventoryTable.js
│   ├── 📁 pages/                    # Páginas principales
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Products.js
│   │   └── Inventory.js
│   ├── 📁 services/                 # Comunicación con backend
│   │   ├── api.js                   # Configuración base
│   │   ├── authService.js           # Llamadas de autenticación
│   │   ├── productService.js        # Llamadas de productos
│   │   └── inventoryService.js      # Llamadas de inventario
│   ├── 📁 utils/                    # Utilidades
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── 📁 styles/                   # Estilos CSS
│   │   ├── global.css
│   │   └── components.css
│   ├── App.js                       # Componente principal
│   └── index.js                     # Punto de entrada
└── 📄 .env.local                    # Variables de entorno locales
```

## 🔄 Cómo Funciona

### 1. Punto de Entrada Único
El frontend se comunica **solo** con el API Gateway. No conoce la existencia de microservicios individuales.

```javascript
// ❌ MAL: Llamar directamente a servicios
const products = await fetch('http://product-service:3000/products');
const inventory = await fetch('http://inventory-service:3000/stock');

// ✅ BIEN: Llamar solo al API Gateway
const products = await fetch('/api/products');
const inventory = await fetch('/api/inventory/stock');
```

### 2. Estructura de Servicios

```javascript
// src/services/api.js - Configuración base
const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// src/services/productService.js - Operaciones de productos
export const getProducts = () => apiCall('/products');
export const createProduct = (product) => apiCall('/products', {
  method: 'POST',
  body: JSON.stringify(product)
});
export const updateProduct = (id, product) => apiCall(`/products/${id}`, {
  method: 'PUT',
  body: JSON.stringify(product)
});
```

### 3. Comunicación en Tiempo Real (IoT)

```javascript
// src/services/iotService.js - WebSockets para eventos IoT
import io from 'socket.io-client';

const socket = io('/api/iot');

export const subscribeToInventoryUpdates = (callback) => {
  socket.on('inventory_updated', callback);
};

export const subscribeToNFCScans = (callback) => {
  socket.on('nfc_scan', callback);
};

// En un componente React
useEffect(() => {
  subscribeToInventoryUpdates((data) => {
    setInventoryData(prev => updateInventory(prev, data));
  });
}, []);
```

## 🚀 Desarrollo

### Ejecutar Solo el Frontend

```bash
cd 1-frontend
npm install
npm start
```

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up frontend
```

### Variables de Entorno

```bash
# .env.local
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WEBSOCKET_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## 📱 Páginas Principales

### 1. Dashboard
- **Ruta**: `/dashboard`
- **Función**: Vista general del sistema
- **APIs usadas**: `/api/dashboard/stats`

### 2. Productos
- **Ruta**: `/products`
- **Función**: Gestión del catálogo
- **APIs usadas**: `/api/products`, `/api/categories`

### 3. Inventario
- **Ruta**: `/inventory`
- **Función**: Control de stock
- **APIs usadas**: `/api/inventory`, `/api/movements`

### 4. IoT Dashboard
- **Ruta**: `/iot`
- **Función**: Estado de dispositivos
- **APIs usadas**: `/api/iot/devices`, WebSockets

## 🎯 Principios de Diseño

### 1. Separación de Responsabilidades
```javascript
// ❌ Componente que hace todo
function ProductPage() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Lógica de API
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
  
  const handleCreate = async (product) => {
    // Lógica de creación
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    // Actualizar estado...
  };
  
  return (
    <div>
      {/* Renderizado complejo */}
    </div>
  );
}

// ✅ Separado en servicios y componentes
function ProductPage() {
  const { products, loading, createProduct } = useProducts();
  
  return (
    <div>
      <ProductList products={products} loading={loading} />
      <ProductForm onSubmit={createProduct} />
    </div>
  );
}
```

### 2. Estado Global con Context/Redux
```javascript
// src/contexts/AppContext.js
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  
  return (
    <AppContext.Provider value={{ user, setUser, inventory, setInventory }}>
      {children}
    </AppContext.Provider>
  );
};
```

## 🧪 Testing del Frontend

```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 🔧 Build y Deployment

### Desarrollo
```bash
npm start  # Puerto 3000
```

### Producción
```bash
npm run build  # Genera carpeta build/
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 💡 Tips para Principiantes

1. **Piensa en componentes**: Cada pieza de UI es un componente
2. **Estado local vs global**: No todo necesita estar en Redux/Context
3. **Un servicio por dominio**: authService, productService, etc.
4. **Maneja errores**: Siempre ten estados de loading y error
5. **Usa el API Gateway**: Nunca llames directamente a microservicios

## 🔗 Comunicación con Backend

El frontend **SOLO** conoce estas URLs:

- `GET /api/auth/login` - Autenticación
- `GET /api/products` - Lista de productos
- `GET /api/inventory` - Estado del inventario
- `WebSocket /api/events` - Eventos en tiempo real

El API Gateway se encarga de redirigir a los servicios correctos.

---

**Recuerda**: Este frontend funciona igual que en una arquitectura de 3 capas tradicional. La diferencia está en el backend, que ahora está dividido en microservicios, pero eso es transparente para el frontend.
