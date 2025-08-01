<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Proyecto de Inventario con Microservicios e IoT

Este proyecto implementa un sistema de inventario de productos utilizando arquitectura de microservicios, con integración IoT (acceso NFC) y Docker Compose para facilitar el despliegue.

## Arquitectura
- **API Gateway**: Punto de entrada principal
- **Servicio de Productos**: Gestión del catálogo de productos
- **Servicio de Inventario**: Control de stock y movimientos
- **Servicio de Autenticación**: Manejo de usuarios y seguridad
- **Gateway IoT**: Interfaz para dispositivos IoT (NFC, sensores)
- **Base de Datos**: PostgreSQL para persistencia
- **Message Broker**: Redis para comunicación entre servicios

## Tecnologías
- Node.js con Express
- PostgreSQL
- Redis
- Docker & Docker Compose
- MQTT para IoT
- JWT para autenticación
