# 🐙 Guía Completa de Trabajo con GitHub

Esta guía te enseñará cómo trabajar colaborativamente en el proyecto usando GitHub con las mejores prácticas de Git Flow y trabajo en equipo.

## 📋 Índice
- [🎯 Estructura de Ramas](#-estructura-de-ramas)
- [👥 Equipos y Responsabilidades](#-equipos-y-responsabilidades)
- [🔄 Flujo de Trabajo (Git Flow)](#-flujo-de-trabajo-git-flow)
- [🚀 Comandos Esenciales](#-comandos-esenciales)
- [📝 Pull Requests](#-pull-requests)
- [🛡️ Protección de Ramas](#️-protección-de-ramas)
- [🎯 Buenas Prácticas](#-buenas-prácticas)

## 🎯 Estructura de Ramas

### **🌳 Jerarquía de Ramas:**
```
main                    # 🏭 Producción - Solo releases
└── develop             # 🔧 Desarrollo principal - Integration branch
    ├── E1-Dragons-🐉   # 🎨 Frontend & UI/UX Team
    ├── E2-Kraken-🐙    # ⚙️ Backend & API Team  
    ├── E3-Phoenix-🔥   # 🌐 IoT & Hardware Team
    └── E4-Unicorn-🦄   # 🧪 DevOps & Testing Team
```

### **📊 Estado Actual de Ramas:**
| Rama | Estado | Propósito | Equipo Responsable |
|------|--------|-----------|-------------------|
| `main` | 🟢 Activa | Código de producción | Release Team |
| `develop` | 🟢 Activa | Integración continua | All Teams |
| `E1-Dragons-🐉` | 🟢 Activa | Frontend development | Dragons Team |
| `E2-Kraken-🐙` | 🟢 Activa | Backend development | Kraken Team |
| `E3-Phoenix-🔥` | 🟢 Activa | IoT development | Phoenix Team |
| `E4-Unicorn-🦄` | 🟢 Activa | DevOps & Testing | Unicorn Team |

## 👥 Equipos y Responsabilidades

### **🐉 E1-Dragons Team (Frontend & UI/UX)**
**Responsabilidades:**
- ✅ Desarrollo de la interfaz de usuario (React)
- ✅ Diseño UX/UI y prototipado
- ✅ Responsive design y accesibilidad
- ✅ Testing frontend e integración con APIs
- ✅ Optimización de performance del cliente

**Archivos Principales:**
```
1-frontend/
├── src/components/
├── src/pages/
├── src/styles/
└── public/
```

**Comandos para Dragons:**
```bash
# Cambiar a tu rama
git checkout E1-Dragons-🐉

# Crear feature branch
git checkout -b feature/login-form

# Desarrollo...
git add .
git commit -m "feat(frontend): add responsive login form with validation"
git push origin feature/login-form
```

### **🐙 E2-Kraken Team (Backend & API)**
**Responsabilidades:**
- ✅ Desarrollo de microservicios (Node.js/Express)
- ✅ APIs RESTful y documentación OpenAPI
- ✅ Autenticación y autorización (JWT)
- ✅ Integración con bases de datos
- ✅ Testing backend y APIs

**Archivos Principales:**
```
2-backend/
├── api-gateway/
├── auth-service/
├── product-service/
└── iot-gateway/
```

**Comandos para Kraken:**
```bash
# Cambiar a tu rama
git checkout E2-Kraken-🐙

# Crear feature branch
git checkout -b feature/product-api-v2

# Desarrollo...
git add .
git commit -m "feat(api): implement product search and filtering endpoints"
git push origin feature/product-api-v2
```

### **🔥 E3-Phoenix Team (IoT & Hardware)**
**Responsabilidades:**
- ✅ Simuladores de dispositivos IoT
- ✅ Integración MQTT y WebSockets
- ✅ Protocolos de comunicación IoT
- ✅ Hardware abstraction layer
- ✅ Monitoreo de dispositivos en tiempo real

**Archivos Principales:**
```
2-backend/iot-gateway/
├── src/simulators/
├── src/protocols/
├── src/websocket/
└── src/mqtt/
example-simple-warehouse/iot-service/
```

**Comandos para Phoenix:**
```bash
# Cambiar a tu rama
git checkout E3-Phoenix-🔥

# Crear feature branch
git checkout -b feature/nfc-simulator-v2

# Desarrollo...
git add .
git commit -m "feat(iot): enhance NFC simulator with real-time data"
git push origin feature/nfc-simulator-v2
```

### **🦄 E4-Unicorn Team (DevOps & Testing)**
**Responsabilidades:**
- ✅ CI/CD pipelines y automatización
- ✅ Docker containers y orquestación
- ✅ Testing automatizado (unit, integration, e2e)
- ✅ Monitoring y logging
- ✅ Infrastructure as Code

**Archivos Principales:**
```
.github/workflows/
docker-compose.yml
tests/
└── contract/
└── integration/
└── e2e/
```

**Comandos para Unicorn:**
```bash
# Cambiar a tu rama
git checkout E4-Unicorn-🦄

# Crear feature branch
git checkout -b feature/enhanced-ci-pipeline

# Desarrollo...
git add .
git commit -m "feat(ci): add automated security scanning and deployment"
git push origin feature/enhanced-ci-pipeline
```

## 🔄 Flujo de Trabajo (Git Flow)

### **📅 Ciclo de Desarrollo Semanal:**

#### **Lunes - Planificación:**
```bash
# 1. Todos los equipos sincronizan con develop
git checkout develop
git pull origin develop

# 2. Cada equipo actualiza su rama
git checkout E1-Dragons-🐉  # (o tu equipo)
git merge develop
git push origin E1-Dragons-🐉
```

#### **Martes-Jueves - Desarrollo:**
```bash
# 1. Crear feature branch desde tu rama de equipo
git checkout E1-Dragons-🐉
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits frecuentes
git add .
git commit -m "feat: implement new feature"

# 3. Push diario de la feature
git push origin feature/nueva-funcionalidad
```

#### **Viernes - Integración:**
```bash
# 1. Finalizar feature y merge a rama de equipo
git checkout E1-Dragons-🐉
git merge feature/nueva-funcionalidad
git push origin E1-Dragons-🐉

# 2. Crear PR de equipo a develop
# (Ver sección de Pull Requests)
```

### **🔄 Workflow Detallado:**

#### **1. Iniciar Nueva Funcionalidad:**
```bash
# Sincronizar con develop
git checkout develop
git pull origin develop

# Ir a rama de equipo
git checkout E1-Dragons-🐉
git merge develop

# Crear feature branch
git checkout -b feature/JIRA-123-user-dashboard
```

#### **2. Desarrollo Diario:**
```bash
# Commits atómicos y descriptivos
git add src/components/Dashboard.jsx
git commit -m "feat(dashboard): add user statistics widget"

git add src/styles/dashboard.css
git commit -m "style(dashboard): implement responsive design for mobile"

# Push regular
git push origin feature/JIRA-123-user-dashboard
```

#### **3. Finalizar Feature:**
```bash
# Sincronizar con rama de equipo
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Merge de feature
git merge feature/JIRA-123-user-dashboard

# Push a rama de equipo
git push origin E1-Dragons-🐉

# Eliminar feature branch
git branch -d feature/JIRA-123-user-dashboard
git push origin --delete feature/JIRA-123-user-dashboard
```

#### **4. Integración a Develop:**
```bash
# Crear Pull Request desde GitHub UI
# E1-Dragons-🐉 → develop
```

## 🚀 Comandos Esenciales

### **🔧 Setup Inicial:**
```bash
# Clonar repositorio
git clone https://github.com/ComSocUPC/PL-INV.git
cd PL-INV

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu.email@upc.edu"

# Ver todas las ramas
git branch -a

# Cambiar a tu rama de equipo
git checkout E1-Dragons-🐉  # o tu equipo correspondiente
```

### **📥 Sincronización:**
```bash
# Actualizar todas las ramas remotas
git fetch --all

# Sincronizar develop
git checkout develop
git pull origin develop

# Sincronizar tu rama de equipo
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Merge develop a tu rama (solo si es necesario)
git merge develop
```

### **🌿 Gestión de Ramas:**
```bash
# Crear nueva feature
git checkout -b feature/nombre-descriptivo

# Listar ramas locales
git branch

# Listar ramas remotas
git branch -r

# Eliminar rama local
git branch -d nombre-rama

# Eliminar rama remota
git push origin --delete nombre-rama
```

### **💾 Commits y Push:**
```bash
# Status y diferencias
git status
git diff

# Add selectivo
git add archivo1.js archivo2.css
# o todo
git add .

# Commit con mensaje
git commit -m "tipo(scope): descripción corta"

# Push
git push origin nombre-rama

# Push forzado (cuidado!)
git push --force-with-lease origin nombre-rama
```

### **🔄 Merge y Conflictos:**
```bash
# Merge sin conflictos
git checkout rama-destino
git merge rama-origen

# Si hay conflictos, resolverlos y luego:
git add archivos-resueltos
git commit -m "resolve: merge conflicts in component files"

# Cancelar merge en curso
git merge --abort
```

## 📝 Pull Requests

### **🎯 Cuándo Crear PR:**
- ✅ Feature completada en rama de equipo → develop
- ✅ Hotfix urgente → main
- ✅ Release candidate → main
- ✅ Updates de documentación

### **📋 Template de PR:**

```markdown
## 🎯 Descripción
Breve descripción de los cambios realizados.

## 🏷️ Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad  
- [ ] 💥 Breaking change
- [ ] 📚 Documentación
- [ ] 🎨 Mejoras de estilo
- [ ] ♻️ Refactoring
- [ ] 🚀 Performance
- [ ] 🧪 Testing

## 🧪 Testing
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Tested manualmente
- [ ] Screenshots/videos incluidos (si aplica)

## 📋 Checklist
- [ ] 🔍 Self-review realizado
- [ ] 📝 Documentación actualizada
- [ ] 🏷️ Labels apropiados asignados
- [ ] 👥 Reviewers asignados
- [ ] 🔗 Issues relacionados linkados

## 🖼️ Screenshots (si aplica)
[Incluir capturas de pantalla]

## 📚 Documentación
- [ ] README actualizado
- [ ] API docs actualizadas
- [ ] Changelog actualizado
```

### **🔍 Proceso de Review:**

#### **Para el Autor:**
```bash
# 1. Crear PR desde GitHub UI
# 2. Asignar reviewers de otros equipos
# 3. Agregar labels apropiados
# 4. Linkear issues relacionados
# 5. Responder a comentarios constructivamente
```

#### **Para Reviewers:**
```bash
# 1. Checkout de la rama para testing local
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# 2. Testing funcional
npm test
npm run lint

# 3. Review de código en GitHub UI
# 4. Aprobar o solicitar cambios
```

### **⚡ Merge Strategies:**

#### **🔄 Merge Commit (Recomendado para features):**
- Mantiene historial completo
- Agrupa commits relacionados
- Fácil de revertir

#### **🎯 Squash and Merge (Para features pequeñas):**
- Un solo commit limpio
- Historial lineal
- Mensaje de commit descriptivo

#### **⚡ Rebase and Merge (Para hotfixes):**
- Historial lineal sin merge commits
- Requiere experiencia con rebase

## 🛡️ Protección de Ramas

### **🔒 Reglas para `main`:**
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require up-to-date branches
- ✅ Include administrators
- ✅ Restrict pushes (solo via PR)

### **🔒 Reglas para `develop`:**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Allow administrators to bypass

### **⚙️ Configurar Protección:**
```bash
# Via GitHub CLI (si está instalado)
gh api repos/ComSocUPC/PL-INV/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2}'
```

## 🎯 Buenas Prácticas

### **💬 Mensajes de Commit:**

#### **Formato Estándar:**
```
tipo(scope): descripción corta en presente

[cuerpo opcional explicando el qué y por qué]

[footer opcional con breaking changes e issues]
```

#### **Tipos de Commit:**
- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `docs`: cambios en documentación
- `style`: cambios de formato (espacios, comas, etc.)
- `refactor`: refactoring sin cambio funcional
- `test`: agregar o modificar tests
- `chore`: tareas de mantenimiento

#### **Ejemplos:**
```bash
git commit -m "feat(auth): add JWT token refresh functionality"
git commit -m "fix(api): resolve CORS issue in product endpoints"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(dashboard): fix spacing in user cards"
git commit -m "refactor(utils): extract validation functions to separate module"
git commit -m "test(auth): add unit tests for login service"
git commit -m "chore(deps): update express to version 4.18.2"
```

### **🏷️ Naming Conventions:**

#### **Branches:**
```bash
# Feature branches
feature/JIRA-123-user-authentication
feature/login-form-validation
feature/dashboard-widgets

# Bug fix branches
fix/JIRA-456-memory-leak
fix/login-redirect-issue

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-api-bug

# Release branches
release/v1.2.0
release/sprint-15
```

#### **Pull Requests:**
```
feat(auth): implement OAuth2 integration
fix(api): resolve product filtering bug
docs: update API documentation for v2 endpoints
chore: upgrade dependencies to latest versions
```

### **🔄 Workflow Best Practices:**

#### **📅 Daily Routine:**
```bash
# Morning sync
git checkout develop
git pull origin develop
git checkout E1-Dragons-🐉
git merge develop

# Before starting work
git checkout -b feature/today-task

# End of day
git add .
git commit -m "wip: progress on user dashboard"
git push origin feature/today-task
```

#### **🧹 Cleanup Routine:**
```bash
# Weekly cleanup - eliminar ramas mergeadas
git branch --merged develop | grep -v "develop\|main\|E1-\|E2-\|E3-\|E4-" | xargs -n 1 git branch -d

# Cleanup remote tracking branches
git remote prune origin
```

### **🚨 Situaciones Comunes:**

#### **❌ Error: Committed to wrong branch**
```bash
# Si no has hecho push
git reset --soft HEAD~1
git stash
git checkout rama-correcta
git stash pop
git commit -m "tu mensaje"

# Si ya hiciste push
git checkout rama-correcta
git cherry-pick hash-del-commit
git checkout rama-incorrecta
git revert hash-del-commit
git push origin rama-incorrecta
```

#### **🔥 Conflictos de Merge**
```bash
# 1. Identificar archivos en conflicto
git status

# 2. Abrir archivos y resolver conflictos
# Buscar marcadores: <<<<<<<, =======, >>>>>>>

# 3. Después de resolver
git add archivos-resueltos
git commit -m "resolve: merge conflicts in user components"
```

#### **🔄 Sync con Develop**
```bash
# Opción 1: Merge (recomendado para teams)
git checkout E1-Dragons-🐉
git merge develop

# Opción 2: Rebase (para mantener historial lineal)
git checkout E1-Dragons-🐉
git rebase develop
```

### **📊 Monitoring y Métricas:**

#### **📈 GitHub Insights:**
- Pulse: actividad reciente
- Contributors: contribuciones por desarrollador  
- Traffic: clones y vistas
- Network: visualización de branches

#### **🎯 KPIs del Equipo:**
- Tiempo promedio de PR review
- Número de conflictos por semana
- Cobertura de tests por equipo
- Deployment frequency

### **🔧 Tools Recomendadas:**

#### **CLI Tools:**
```bash
# GitHub CLI
gh pr create --title "feat: new dashboard" --body "..."
gh pr merge 123 --squash

# Git aliases útiles
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

#### **VS Code Extensions:**
- GitLens
- GitHub Pull Requests
- Git Graph
- Git History

---

## 🎓 Recursos de Aprendizaje

### **📚 Documentación Oficial:**
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### **🎥 Tutoriales:**
- [Pro Git Book](https://git-scm.com/book)
- [GitHub Learning Lab](https://lab.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

### **🛠️ Práctica:**
- [Learn Git Branching](https://learngitbranching.js.org/)
- [GitHub Desktop](https://desktop.github.com/) (para principiantes)

---

**🎯 ¡Con esta guía tienes todo lo necesario para trabajar colaborativamente de manera profesional! Recuerda: la práctica hace al maestro.** 🚀
