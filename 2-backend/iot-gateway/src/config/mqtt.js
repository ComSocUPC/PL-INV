const mqtt = require('mqtt');
const logger = require('../utils/logger');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const options = {
  clientId: `iot-gateway-${Math.random().toString(16).substr(2, 8)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD
};

const client = mqtt.connect(MQTT_BROKER_URL, options);

client.on('error', (error) => {
  logger.error('Error de conexión MQTT:', error);
});

client.on('offline', () => {
  logger.warn('Cliente MQTT desconectado');
});

client.on('reconnect', () => {
  logger.info('Reconectando cliente MQTT...');
});

// Función para publicar mensajes
function publish(topic, message, options = {}) {
  return new Promise((resolve, reject) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    client.publish(topic, payload, options, (error) => {
      if (error) {
        logger.error(`Error publicando en ${topic}:`, error);
        reject(error);
      } else {
        logger.info(`Mensaje publicado en ${topic}`);
        resolve();
      }
    });
  });
}

// Función para suscribirse a topics
function subscribe(topic, callback) {
  client.subscribe(topic, (error) => {
    if (error) {
      logger.error(`Error suscribiéndose a ${topic}:`, error);
    } else {
      logger.info(`Suscrito a topic: ${topic}`);
    }
  });

  if (callback) {
    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        callback(receivedTopic, message);
      }
    });
  }
}

module.exports = {
  client,
  publish,
  subscribe
};
