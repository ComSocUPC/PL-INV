# 🎉 Welcome to ComSocUPC Inventory Project!

¡Bienvenido al proyecto de inventario con microservicios e IoT! Esta guía te ayudará a configurar tu entorno y empezar a contribuir rápidamente.

## 🚀 Quick Start (5 minutos)

### 1️⃣ **Configuración Inicial**

```bash
# Clonar el repositorio
git clone https://github.com/ComSocUPC/PL-INV.git
cd PL-INV

# Configurar git (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@upci.edu.pe"
```

### 2️⃣ **Identificar tu Equipo**

| 🎯 Si te interesa... | 👥 Tu equipo es... | 🌿 Tu rama es... |
|---------------------|-------------------|------------------|
| 🎨 Frontend, UI/UX, React | 🐉 **Dragons** | `E1-Dragons-🐉` |
| ⚙️ Backend, APIs, Databases | 🐙 **Kraken** | `E2-Kraken-🐙` |
| 🔌 IoT, Hardware, Sensores | 🔥 **Phoenix** | `E3-Phoenix-🔥` |
| 🛠️ DevOps, Testing, CI/CD | 🦄 **Unicorn** | `E4-Unicorn-🦄` |

### 3️⃣ **Setup de Desarrollo**

```bash
# Cambiar a la rama de tu equipo (ejemplo: Dragons)
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Instalar dependencias (proyecto completo)
npm install

# OR instalar dependencias del proyecto simple
cd example-simple-warehouse
npm install
```

### 4️⃣ **Probar el Proyecto**

#### **Opción A: Proyecto Simple (Recomendado para principiantes)**
```bash
cd example-simple-warehouse

# Iniciar todos los servicios
npm run dev

# En otra terminal - verificar que funciona
curl http://localhost:3000/api/health
```

#### **Opción B: Proyecto Completo**
```bash
# Iniciar con Docker (requiere Docker Desktop)
docker-compose up

# Verificar servicios
curl http://localhost:3000/api/health
```

### 5️⃣ **Tu Primera Contribución**

```bash
# Crear tu primera feature branch
git checkout -b feature/MI-PRIMER-CAMBIO

# Hacer un pequeño cambio (ejemplo: actualizar README)
echo "## Mi Primera Contribución\n- Configuré el entorno exitosamente!" >> ONBOARDING_SUCCESS.md

# Commit y push
git add .
git commit -m "docs: add my first contribution log"
git push origin feature/MI-PRIMER-CAMBIO

# Crear Pull Request
gh pr create --title "docs: my first contribution" --body "Mi primera contribución al proyecto!"
```

---

## 🎯 Onboarding por Equipo

### 🐉 **Dragons Team (Frontend)**

#### **Setup Específico**
```bash
cd 1-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en navegador
open http://localhost:5173
```

#### **Tu Primera Tarea Dragons**
```bash
# Crear branch para primera tarea
git checkout -b feature/DRAG-hello-world

# Crear un componente simple
mkdir src/components/HelloWorld
cat > src/components/HelloWorld/index.jsx << 'EOF'
import React from 'react';

const HelloWorld = ({ name = "Dragons Team" }) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ff6b6b', 
      borderRadius: '8px',
      backgroundColor: '#ffe0e0'
    }}>
      <h2>🐉 Hello {name}!</h2>
      <p>¡Bienvenido al equipo Dragons!</p>
    </div>
  );
};

export default HelloWorld;
EOF

# Añadir test
cat > src/components/HelloWorld/HelloWorld.test.jsx << 'EOF'
import { render, screen } from '@testing-library/react';
import HelloWorld from './index';

test('renders hello message', () => {
  render(<HelloWorld name="Test User" />);
  expect(screen.getByText(/Hello Test User/i)).toBeInTheDocument();
});
EOF

# Ejecutar test
npm test

# Commit
git add .
git commit -m "feat(components): add HelloWorld component with tests"
git push origin feature/DRAG-hello-world
```

### 🐙 **Kraken Team (Backend)**

#### **Setup Específico**
```bash
cd 2-backend/api-gateway

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Verificar API
curl http://localhost:3000/api/health
```

#### **Tu Primera Tarea Kraken**
```bash
# Crear branch
git checkout -b feature/KRAK-hello-endpoint

# Añadir nuevo endpoint
cat >> 2-backend/api-gateway/src/routes/index.js << 'EOF'

// Hello endpoint for new team members
app.get('/api/hello/:team', (req, res) => {
  const { team } = req.params;
  res.json({
    message: `🐙 Hello from Kraken team to ${team}!`,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0'
  });
});
EOF

# Añadir test
cat > 2-backend/api-gateway/tests/hello.test.js << 'EOF'
const request = require('supertest');
const app = require('../src/index');

describe('Hello Endpoint', () => {
  test('GET /api/hello/:team should return welcome message', async () => {
    const response = await request(app)
      .get('/api/hello/dragons')
      .expect(200);
    
    expect(response.body.message).toContain('Hello from Kraken team');
    expect(response.body.timestamp).toBeDefined();
  });
});
EOF

# Ejecutar tests
npm test

# Commit
git add .
git commit -m "feat(api): add hello endpoint for team welcome"
git push origin feature/KRAK-hello-endpoint
```

### 🔥 **Phoenix Team (IoT)**

#### **Setup Específico**
```bash
cd 2-backend/iot-gateway

# Instalar dependencias
npm install

# Ejecutar simuladores
npm run dev

# Verificar WebSocket
# (Abrir navegador en http://localhost:3004)
```

#### **Tu Primera Tarea Phoenix**
```bash
# Crear branch
git checkout -b feature/PHOE-welcome-sensor

# Crear simulador de bienvenida
mkdir 2-backend/iot-gateway/src/simulators/welcome
cat > 2-backend/iot-gateway/src/simulators/welcome/index.js << 'EOF'
class WelcomeSensor {
  constructor() {
    this.deviceId = 'welcome-sensor-001';
    this.teamMembers = ['Dragons', 'Kraken', 'Phoenix', 'Unicorn'];
    this.currentIndex = 0;
  }

  start() {
    console.log(`🔥 Welcome Sensor started - Device ID: ${this.deviceId}`);
    
    setInterval(() => {
      const currentTeam = this.teamMembers[this.currentIndex];
      const welcomeData = {
        deviceId: this.deviceId,
        type: 'welcome',
        team: currentTeam,
        message: `¡Bienvenido al equipo ${currentTeam}! 🎉`,
        timestamp: new Date().toISOString(),
        temperature: 22 + Math.random() * 5, // Temp ambiente
        mood: 'excited'
      };
      
      // Emitir evento
      this.emit('welcome', welcomeData);
      
      this.currentIndex = (this.currentIndex + 1) % this.teamMembers.length;
    }, 5000); // Cada 5 segundos
  }

  emit(event, data) {
    console.log(`📡 [${event.toUpperCase()}]`, JSON.stringify(data, null, 2));
  }
}

module.exports = WelcomeSensor;
EOF

# Integrar en simulador principal
cat >> 2-backend/iot-gateway/src/simulators/index.js << 'EOF'

const WelcomeSensor = require('./welcome');

// Iniciar sensor de bienvenida
const welcomeSensor = new WelcomeSensor();
welcomeSensor.start();
EOF

# Test
npm test

# Commit
git add .
git commit -m "feat(iot): add welcome sensor for team onboarding"
git push origin feature/PHOE-welcome-sensor
```

### 🦄 **Unicorn Team (DevOps)**

#### **Setup Específico**
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar herramientas
npm --version
git --version

# Setup testing environment
npm install -g jest cypress k6
```

#### **Tu Primera Tarea Unicorn**
```bash
# Crear branch
git checkout -b feature/UNI-health-check-improved

# Mejorar health check
cat > .github/workflows/health-check.yml << 'EOF'
name: Health Check

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run health checks
      run: |
        echo "🦄 Unicorn Team Health Check"
        npm run test:health || echo "Health tests not configured yet"
        
    - name: Docker health check
      run: |
        docker-compose -f docker-compose.yml config
        echo "✅ Docker Compose configuration is valid"
        
    - name: Generate health report
      run: |
        echo "## 🦄 Health Check Report" > health-report.md
        echo "- ✅ Node.js: $(node --version)" >> health-report.md
        echo "- ✅ NPM: $(npm --version)" >> health-report.md
        echo "- ✅ Docker Compose: $(docker-compose --version)" >> health-report.md
        echo "- ✅ Date: $(date)" >> health-report.md
        cat health-report.md
        
    - name: Upload health report
      uses: actions/upload-artifact@v3
      with:
        name: health-report
        path: health-report.md
EOF

# Añadir script de salud en package.json
npm run test -- --passWithNoTests || echo "Tests not configured yet"

# Commit
git add .
git commit -m "feat(ci): add comprehensive health check workflow"
git push origin feature/UNI-health-check-improved
```

---

## 📚 Learning Path

### 🎓 **Semana 1: Foundations**
- [ ] ✅ Configurar entorno de desarrollo
- [ ] 📖 Leer documentación del proyecto
- [ ] 🤝 Conocer a tu equipo
- [ ] 🔧 Completar primera tarea
- [ ] 📝 Hacer tu primer Pull Request

### 🎓 **Semana 2: Integration**
- [ ] 🔄 Entender el workflow del equipo
- [ ] 🧪 Aprender testing estrategies
- [ ] 🤝 Colaborar con otros equipos
- [ ] 📊 Entender métricas del proyecto
- [ ] 🎯 Tomar ownership de una feature

### 🎓 **Semana 3: Mastery**
- [ ] 🚀 Lead a small feature
- [ ] 🎓 Mentorear a nuevo team member
- [ ] 📖 Contribuir a documentación
- [ ] 🔧 Mejorar tooling/processes
- [ ] 🎉 Celebrate achievements!

---

## 🆘 Getting Help

### 🔍 **Self-Service Resources**
1. 📖 **Documentation**: Check `/docs/` folder
2. 🐛 **Common Issues**: See FAQ section below
3. 💬 **Past Discussions**: Search GitHub Issues/PRs
4. 🧪 **Examples**: Look at `/example-simple-warehouse/`

### 👥 **Team Support**
1. **Team Lead**: Ask in team branch PR/Issues
2. **Cross-Team**: Use `@team-name` in GitHub comments
3. **Urgent**: Create Issue with `priority:high` label
4. **General**: Ask in project Discussions

### 🚨 **Escalation Path**
```
You → Team Lead → Technical Lead → Project Maintainer
```

---

## ❓ FAQ for New Contributors

### **Q: ¿Qué equipo debería elegir?**
**A:** Elige basándote en tus intereses y skills:
- 🎨 **Frontend/UI** → Dragons
- ⚙️ **Backend/APIs** → Kraken  
- 🔌 **IoT/Hardware** → Phoenix
- 🛠️ **DevOps/Testing** → Unicorn

### **Q: ¿Puedo cambiar de equipo después?**
**A:** ¡Sí! Los equipos son flexibles. Habla con los team leads.

### **Q: No tengo experiencia en el stack tecnológico**
**A:** ¡Perfecto! Cada equipo tiene mentors y learning resources.

### **Q: ¿Cómo sé qué tarea tomar?**
**A:** Busca issues con labels `good-first-issue` o `help-wanted` en tu equipo.

### **Q: Mi PR fue rechazado, ¿qué hago?**
**A:** Normal! Lee los comments, haz los cambios, y re-submit. ¡Es parte del learning!

### **Q: ¿Cómo mantengo mi fork actualizado?**
**A:** 
```bash
git checkout develop
git pull origin develop
git checkout tu-branch
git rebase develop
```

### **Q: ¿Qué pasa si rompo algo?**
**A:** ¡No worries! Tenemos tests y CI/CD. Si algo se rompe, team Unicorn lo arregla.

### **Q: ¿Cuánto tiempo debo dedicar?**
**A:** Lo que puedas. Desde 2 horas/semana hasta full-time está bien.

---

## 🎉 Welcome Message

```
🎊 ¡FELICIDADES! 🎊

Has completado el onboarding básico del proyecto ComSocUPC Inventory.

🎯 NEXT STEPS:
1. Únete a tu equipo en su rama específica
2. Toma tu primera issue 
3. Haz tu primer Pull Request
4. ¡Celebra tu primera contribución!

🤝 REMEMBER:
- Haz preguntas sin miedo
- Ayuda a otros cuando puedas  
- Celebra pequeños wins
- Ten fun coding! 🚀

Welcome to the team! 🎉
```

---

**🎯 Con esta guía, cualquier nuevo contribuidor puede empezar a trabajar en menos de 10 minutos!** 🚀
