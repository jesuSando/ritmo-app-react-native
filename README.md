# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

```
my-app/
│
├─ app/
│   ├─ _layout.tsx          # Layout global con providers
│   ├─ index.tsx            # Home screen
│   ├─ users/
│   │   ├─ index.tsx        # Lista de usuarios
│   │   ├─ create.tsx       # Form de creación
│   │   └─ [id].tsx         # Detalle de usuario
│   ├─ settings/
│   │   └─ index.tsx
│   └─ dashboard/
│       └─ index.tsx
│
├─ components/              # UI reutilizable
│   ├─ Button.tsx
│   ├─ InputField.tsx
│   └─ Card.tsx
│
├─ db/                      # Base de datos y migraciones
│   ├─ database.ts
│   ├─ migrations/
│   │   ├─ 001_create_users.ts
│   │   └─ 002_add_age_column.ts
│   └─ repositories/
│       └─ UserRepository.ts
│
├─ hooks/                   # Custom hooks
│   └─ useUsers.ts
│
├─ context/                 # Providers y contextos globales
│   └─ UserContext.tsx
│
├─ services/                # Lógica de negocio y APIs
│   └─ apiService.ts
│
├─ types/                   # Tipos TypeScript
│   └─ User.ts
│
├─ utils/                   # Helpers y utilidades
├─ assets/                  # Imágenes, fuentes
├─ package.json
├─ tsconfig.json
└─ app.json / expo.config.js
```

version 2: 
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