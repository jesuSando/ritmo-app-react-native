# Ritmo - Gestor Personal Integral

Una aplicación móvil completa para gestión personal que combina finanzas, organización del tiempo, seguimiento de hábitos y notas personales en una sola plataforma, construida con Expo y React Native.

## Requerimientos

- Node.js >= 20.19.4 (recommended via nvm)
- npm >= 10
- Expo CLI

## Instalación

```bash
npm install
npm run start
```

## Estructura Actual

```
app/(app)/
  ├── _layout.tsx          # Drawer principal
  ├── index.tsx            # Dashboard
  ├── finances/            # Módulo de finanzas
  │   ├── _layout.tsx      # Tabs internas de finanzas
  │   ├── index.tsx        # Resumen financiero
  │   ├── accounts.tsx     # Cuentas
  │   ├── transactions.tsx # Transacciones
  │   └── budgets.tsx      # Presupuestos
  ├── tasks/               # Módulo de tareas
  │   ├── _layout.tsx
  │   ├── index.tsx        # Calendario/Lista
  │   ├── today.tsx        # Tareas de hoy
  │   └── routines.tsx     # Rutinas programadas
  ├── habits/              # Módulo de hábitos
  │   ├── _layout.tsx
  │   ├── index.tsx        # Seguimiento diario
  │   ├── tracker.tsx      # Tracker
  │   └── stats.tsx        # Estadísticas
  ├── notes/               # Módulo de notas
  │   ├── _layout.tsx
  │   ├── index.tsx        # Lista de notas
  │   └── editor.tsx       # Editor
  └── settings/            # Configuración
      ├── _layout.tsx
      ├── index.tsx        # Perfil
      └── preferences.tsx  # Preferencias
```

## Commit Convention

Este proyecto utiliza Conventional Commits, validados automáticamente
mediante `husky` y `commitlint`.

Ejemplos:
- feat: add daily habit tracking
- fix: handle empty database state
- chore: setup commitlint and husky

## Versionamiento y Changelog

Este proyecto sigue Semantic Versioning.

Todos los cambios notables son documentados en
[CHANGELOG.md](./CHANGELOG.md) y se generan automáticamente usando
`standard-version`, basado en Conventional Commits.

### Releases

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

## Development Notes

- This project uses Expo Router with file-based routing.
- Navigation is organized by feature modules.
- Commit messages are validated automatically on commit.

## Autor

[![Jesús Sandoval](https://img.shields.io/badge/Jesús%20Sandoval-github-black?logo=github&labelColor=black&color=gray)](https://github.com/jesuSando)