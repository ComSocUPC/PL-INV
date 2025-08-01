// Configuración para commitlint
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Permitir tipos personalizados
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Solo cambios en documentación
        'style',    // Cambios que no afectan el significado del código
        'refactor', // Cambio de código que no corrige un bug ni añade una funcionalidad
        'perf',     // Cambio de código que mejora el rendimiento
        'test',     // Añadir tests faltantes o corregir tests existentes
        'chore',    // Cambios en el proceso de build o herramientas auxiliares
        'ci',       // Cambios en archivos de configuración de CI
        'build',    // Cambios que afectan el sistema de build o dependencias externas
        'revert'    // Revertir un commit anterior
      ]
    ],
    // Scopes permitidos (basados en los servicios del proyecto)
    'scope-enum': [
      2,
      'always',
      [
        'api-gateway',
        'auth',
        'products',
        'inventory',
        'iot',
        'frontend',
        'docs',
        'tests',
        'ci',
        'deps',
        'config',
        'docker',
        'db',
        'security',
        'monitoring'
      ]
    ],
    // El subject debe estar en minúsculas
    'subject-case': [2, 'always', 'lower-case'],
    // El subject no debe terminar con punto
    'subject-full-stop': [2, 'never', '.'],
    // El subject no debe estar vacío
    'subject-empty': [2, 'never'],
    // El header no debe ser más largo de 100 caracteres
    'header-max-length': [2, 'always', 100],
    // El body debe tener una línea en blanco antes
    'body-leading-blank': [2, 'always'],
    // El footer debe tener una línea en blanco antes
    'footer-leading-blank': [2, 'always']
  }
};
