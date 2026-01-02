# Lost & Found - Authentication UI Kit

A complete, production-ready authentication system UI kit for a university lost-and-found web application.

## 🎯 Overview

This is a comprehensive authentication UI kit with:
- **Persian (fa-IR)** language support with RTL layout
- **React** frontend components
- Design ready for **Django** backend integration
- Modern, minimal, student-focused design
- Fully responsive (Desktop + Mobile)

## 📋 Features

### Authentication Flow
- **Password-based authentication** (email + password)
- **OTP verification** for email confirmation during signup
- **Optional OTP** for password reset
- **Guest mode** - users can browse without login
- **Login gates** for protected actions (post items, comment, edit/delete)

### Included Pages

1. **Login** - Standard email + password login
2. **Signup** - Email entry for new users
3. **Verify Email** - 6-digit OTP verification
4. **Set Password** - Password creation after email verification
5. **Forgot Password** - Password recovery entry
6. **Reset OTP** - OTP verification for password reset
7. **Set New Password** - Create new password
8. **Login Required Modal** - Gate for unauthorized actions

## 🛠️ Tech Stack

- **React 18.3.1**
- **TypeScript**
- **Tailwind CSS 4.0**
- **Vazirmatn** font for Persian text
- **Lucide React** icons
- **RTL layout** support

## 📁 Project Structure

```
/src/app/
  ├── App.tsx                    # Main app with navigation
  ├── components/
  │   ├── FlowPage.tsx          # Authentication flow diagram
  │   ├── ComponentsPage.tsx    # UI component library
  │   ├── ScreensPage.tsx       # All auth screens showcase
  │   ├── ui/                   # Reusable UI components
  │   │   ├── Button.tsx
  │   │   ├── Input.tsx
  │   │   ├── OTPInput.tsx
  │   │   ├── Checkbox.tsx
  │   │   ├── Link.tsx
  │   │   ├── Toast.tsx
  │   │   └── Modal.tsx
  │   └── screens/              # Authentication screens
  │       ├── LoginScreen.tsx
  │       ├── SignupScreen.tsx
  │       ├── VerifyEmailScreen.tsx
  │       ├── SetPasswordScreen.tsx
  │       ├── ForgotPasswordScreen.tsx
  │       ├── ResetOTPScreen.tsx
  │       ├── SetNewPasswordScreen.tsx
  │       └── LoginRequiredModal.tsx
/src/styles/
  ├── fonts.css                 # Persian font import
  ├── theme.css                 # Design tokens & animations
  └── ...
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray
- **Success**: Green
- **Error**: Red
- **Warning**: Yellow

### Spacing
8pt spacing system (8px, 16px, 24px, 32px, 48px, 64px)

### Typography
- Font: Vazirmatn (supports Persian/Farsi)
- Hierarchy: H1, H2, H3, Body, Small
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
All components support:
- Default, hover, active, disabled states
- Error states with inline validation messages
- Loading states with spinners
- RTL layout

## 🔐 Authentication Logic

### Signup Flow
1. User enters email
2. System sends 6-digit OTP to email
3. User verifies OTP (45s timer, resend option)
4. User sets password (min 8 chars)
5. Account created → auto login

### Login Flow
1. User enters email + password
2. Direct login (no OTP required)
3. Optional "Remember me" checkbox
4. Link to password recovery

### Password Reset Flow
1. User enters email
2. System sends 6-digit OTP
3. User verifies OTP
4. User sets new password
5. Redirect to login

### Guest Mode
**Allowed without login:**
- Browse map
- View item list
- Search

**Requires login (shows modal):**
- Post new item
- Comment on items
- Edit/delete own posts

## 🔌 Backend Integration (Django)

### Suggested API Endpoints

```
POST /api/auth/signup/
  → body: { email }
  
POST /api/auth/verify-email/
  → body: { email, otp }
  
POST /api/auth/set-password/
  → body: { email, password }
  
POST /api/auth/login/
  → body: { email, password }
  
POST /api/auth/forgot-password/
  → body: { email }
  
POST /api/auth/reset-password/
  → body: { email, otp, password }
```

### State Management
Recommended to use:
- **Context API** or **Redux** for auth state
- **LocalStorage** for token persistence
- **JWT** or **Session-based** authentication

### Required Backend Features
- User model (Django User or custom)
- OTP generation & validation (with expiry)
- Email service (SMTP configuration)
- Password hashing (bcrypt/argon2)
- Rate limiting (prevent abuse)
- CORS configuration

## 🚀 Getting Started

The UI kit is ready to use. Simply integrate with your Django backend:

1. **Set up state management** (Context API or Redux)
2. **Configure API endpoints** in your service layer
3. **Implement protected routes** with auth guards
4. **Add form validation** (react-hook-form recommended)
5. **Connect toast notifications** for user feedback
6. **Test RTL layout** and Persian text rendering

## ✅ Validation Rules

- **Email**: Valid email pattern + optional domain restriction
- **Password**: Min 8 characters, must include letter + number
- **OTP**: Exactly 6 digits, numeric only
- **OTP Timer**: 45 seconds before resend allowed
- **Rate Limiting**: Max 3 failed attempts recommended

## 📱 Responsive Design

All screens are fully responsive:
- **Desktop**: Centered auth card (max-width: 448px)
- **Mobile**: Full-width layout with proper spacing
- **Breakpoints**: Tailwind default (sm, md, lg, xl)

## 🌐 RTL Support

The entire UI kit is built with RTL in mind:
- All layouts use `dir="rtl"`
- Text alignment is automatic
- Flexbox/Grid layouts are mirrored
- Icons and spacing adjust automatically

## 🧪 Testing Checklist

- [ ] Unit tests for components
- [ ] Integration tests for API calls
- [ ] E2E tests for complete flows
- [ ] Mobile responsive verification
- [ ] RTL layout check
- [ ] Error state coverage
- [ ] Loading state behavior
- [ ] Security audit (XSS, CSRF)

## 📄 License

This is a UI kit template. Customize and use as needed for your project.

---

**Built with ❤️ for university students**
