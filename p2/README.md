# Royal Purple | Luxury Event Management Platform

A high-end, premium event management platform built with React, Vite, and Tailwind CSS. This application features a sophisticated "Royal Purple" aesthetic designed for luxury branding.

## Features

- **Luxury Brand Aesthetic**: Custom color palette (Royal Purple, Soft Gold, White Smoke, Deep Violet).
- **Authentication**: Full mock authentication system with context state management and persistent sessions using `localStorage`.
- **Protected Routes**: Secure access to member-only areas like the Dashboard and Booking system.
- **Dynamic Dashboard**: Interactive user overview showing upcoming events, membership stats, and premium recommendations.
- **Multi-step Booking Form**: Sophisticated event request flow with progress tracking.
- **Responsive & Animated**: Fully mobile-responsive layout with smooth animations powered by `framer-motion`.

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn

## Installation

1. Clone or download the project files.
2. Open your terminal in the project directory.
3. Install dependencies:
    npm install

## Running the Application

To start the development server:
    npm run dev

The application will be accessible at: `http://localhost:5173`

## Usage Instructions

1. **Browsing**: Explore the luxury services on the homepage.
2. **Account Creation**: Click "Get Started" to sign up for a mock membership.
3. **Login**: Access your account using the email/password you registered with (or any non-empty string in development).
4. **Dashboard**: View your profile, upcoming events, and elite membership benefits.
5. **Booking**: Navigate to "Events" or "New Event +" to use the multi-step form to request a luxury event orchestration.

## Project Structure

- `src/components/`: Reusable UI components and layouts.
- `src/context/`: Auth state management.
- `src/pages/`: Individual view components (Home, Login, Dashboard, etc.).
- `src/App.jsx`: Main routing configuration and protected route logic.
- `tailwind.config.js`: Custom theme configuration for colors and typography.

## Common Issues

- **Port Conflict**: If port 5173 is in use, Vite will automatically select the next available port. Check your terminal output for the correct URL.
- **Assets Not Loading**: Ensure you have an active internet connection as images are served via Unsplash CDN.
