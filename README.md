# NeoVecino

App web MVP para administración de edificios residenciales y condominios.

## Módulos incluidos

- Dashboard por edificio
- Administración de residentes
- Pagos / estado de cuenta
- Visitas con QR demo
- Modo guardia con foto de placa
- Reservas con calendario
- Tickets de mantenimiento
- Documentos

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

Configuración recomendada:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Variables de entorno

Copia `.env.example` como `.env.local` y completa:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_public_key
```

> La versión actual conserva datos demo en el frontend. El archivo `src/lib/supabase.js` queda listo para la siguiente fase de conexión con Supabase Auth, Database y Storage.
