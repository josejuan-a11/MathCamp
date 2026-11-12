# React + Vite

## Firebase

1. Crea un proyecto Firebase y habilita **Authentication > Email/Password** y **Cloud Firestore**.
2. Copia `.env.example` a `.env.local` y completa las seis variables `VITE_FIREBASE_*` con la configuración de la aplicación web de Firebase.
3. Reinicia Vite después de cambiar `.env.local`.
4. Crea los índices compuestos que solicite Firestore para las consultas de ranking por grupo y puntos.

Los documentos de estudiantes se guardan en `usuarios/{uid}` con `nombre`, `correo`, `grupo`, `puntos`, `juegosJugados`, `intentosCarrera`, `enLinea`, `ultimoLogin` y `tiempoTotalSegundos`.

**Seguridad:** la clave `MIGOJJ26` solo controla la interfaz del panel en el navegador; no es una credencial segura ni protege los datos de Firestore. Configura Firestore Security Rules (y preferiblemente un custom claim administrativo) para que cada alumno solo pueda actualizar su propio perfil y solo el administrador pueda listar todos los usuarios. No publiques credenciales de servidor ni reglas que permitan leer/escribir toda la colección a cualquier usuario autenticado.

Sin las variables Firebase completas, el build sigue funcionando, pero login, ranking y sincronización permanecen deshabilitados y el formulario muestra un aviso de configuración.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
