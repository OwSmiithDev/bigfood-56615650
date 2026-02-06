# BigFood - Food Delivery Marketplace

BigFood is a modern, feature-rich food delivery marketplace built with the latest web technologies. It provides a platform for restaurants to showcase their products and for customers to order food from their favorite local eateries.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

## Features

- **For Customers:**
  - Browse restaurants and menus
  - Advanced search and filtering
  - Real-time order tracking
  - Secure online payments
  - Order history and reordering
  - PWA support for a native-like experience on mobile devices
- **For Restaurants:**
  - Manage restaurant profile and opening hours
  - Add, edit, and remove products
  - Order management dashboard with real-time updates
  - Sales analytics and charts
  - Coupon and discount management
- **For Admins:**
  - User and company management
  - Platform-wide configuration
  - Order and coupon monitoring

## Technologies

This project is built with:

- **Frontend:**
  - [Vite](https://vitejs.dev/) - A next-generation frontend tooling
  - [React](https://reactjs.org/) - A JavaScript library for building user interfaces
  - [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript
  - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
  - [shadcn-ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS
- **Backend & Database:**
  - [Supabase](https://supabase.io/) - The open-source Firebase alternative
- **Deployment:**
  - The project can be deployed on any platform that supports Node.js, such as Vercel, Netlify, or your own server.

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Set up your environment variables:**

    Create a `.env` file in the root of the project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section for more details.

4.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## Environment Variables

This project uses [Supabase](https://supabase.io/) as its backend. You will need to create a Supabase project and obtain the following environment variables:

- `VITE_SUPABASE_URL`: The URL of your Supabase project.
- `VITE_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project.

Add these to a `.env` file in the root of the project:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these keys in your Supabase project's API settings.

## Project Structure

The project is organized as follows:

- `src/`: Contains the main source code of the application.
  - `assets/`: Static assets like images and fonts.
  - `components/`: Reusable UI components.
  - `constants/`: Application-wide constants.
  - `contexts/`: React contexts for state management.
  - `hooks/`: Custom React hooks.
  - `integrations/`: Integration with external services like Supabase.
  - `lib/`: Utility functions.
  - `pages/`: Application pages.
  - `utils/`: Miscellaneous utility functions.
- `public/`: Public assets that are not processed by Vite.
- `supabase/`: Supabase database migrations and edge functions.

## Deployment

You can deploy this project to any platform that supports Node.js. Here are some popular choices:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)

The general steps are:

1.  Connect your Git repository to the deployment platform.
2.  Configure the build command: `npm run build`.
3.  Configure the output directory: `dist`.
4.  Add your environment variables.
5.  Deploy!