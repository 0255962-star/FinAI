# FinAI - Gestor de Finanzas Personales con IA

Aplicación web moderna para control de gastos, ingresos y traspasos, diseñada con **React**, **TypeScript** y **Supabase**. Incluye integración (stub) para lectura de recibos mediante IA (Claude/OpenAI).

## Características

- 📊 **Dashboard Financiero**: Resumen de patrimonio y actividad reciente.
- 💳 **Gestión de Cuentas**: Soporte para débito, crédito y ahorro.
- 📝 **Registro de Movimientos**: 
  - Manual (tabla tipo Excel).
  - Automático (stub listo para procesar imágenes con IA).
- 🔄 **Lógica de Traspasos**: Creación automática de movimientos espejo.
- 🔐 **Seguridad**: Autenticación y Row Level Security (RLS) con Supabase.

## Stack Tecnológico

- **Frontend**: React + Vite + TypeScript
- **Estilos**: Tailwind CSS + Lucide Icons
- **Backend/DB**: Supabase (PostgreSQL + Auth)

## Instalación y Uso Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/finai.git
    cd finai
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz (puedes copiar el ejemplo si lo hubiera, o usar tus credenciales):
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```
    *Nota: Si no configuras esto, la app funcionará en "Modo Demo" con datos falsos.*

4.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

## Configuración de Base de Datos (Supabase)

Ejecuta el script SQL ubicado en `supabase_schema.sql` en el Editor SQL de tu proyecto en Supabase para crear las tablas y políticas de seguridad necesarias.

## Estructura del Proyecto

- `/services`: Lógica de negocio y llamadas a Supabase.
- `/pages`: Vistas principales (Dashboard, Cuentas, Registro).
- `/components`: Componentes reutilizables (Layout, etc).
- `/lib`: Configuración de clientes (Supabase).
- `/types`: Definiciones de TypeScript.
