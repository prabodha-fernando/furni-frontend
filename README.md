# 🛋️ Furni - Modern E-Commerce Frontend

A sleek, responsive, and premium e-commerce frontend application tailored for modern furniture. Built with modern web technologies, this project features robust authentication, role-based dashboards, interactive cart/wishlist management, and real-time form validation.

---

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Distinct interfaces, dashboards, and system permissions for `Admin` and `Customer` roles.
* **Secure NextAuth Authentication:** Credentials-based login and Google Sign-In.
* **Credentials & Role Matching Security:** Strict client/server validation preventing customers from signing into the admin dashboard and vice versa. 
* **Persistent In-Memory User Database:** Utilizes a Node `globalThis` user store to persist registered credentials across server hot-reloads (HMR) during local development.
* **Inline Form Validations:** Interactive inline validation styled with Tailwind CSS, checking inputs on-the-fly (blur and change events) with warning borders (`border-red-500`) and clear text alerts.
* **Customer Portal:**
    * Dynamic shopping cart management with real-time stock updates.
    * Interactive wishlist management.
    * Customer Support ticketing system with instant automated assistant responses.
    * Profile information and account security management tools.
* **Admin Dashboard:**
    * Live store configuration manager (default currencies, base shipping fee, tax rate, and maintenance toggles).
    * Product catalog CRUD operations (Add/Edit/Delete furniture items with simulated image uploads).
    * CSV export functionality for sales and inventory reports.
    * Low stock warnings and real-time revenue analytics.
* **Live System Logs:** Real-time log tracking of user activity, orders, and system synchronization events.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui & Lucide Icons
* **Authentication:** NextAuth.js
* **Email Service:** Resend API

---

## 🔑 Login Credentials

Use the following preset accounts to explore the dashboards:

| Role | Email | Password |
| :--- | :--- | :--- |
| 👑 **Admin** | `admin@furniture.com` | `admin123` |
| 🛒 **Customer** | `john@example.com` | `password123` |

---

## 🔐 Authentication & Role Security Model

To ensure security across pages and roles, the application integrates NextAuth with a dual validation layer:

1. **Server-Side Validation:** The `authorize` callback in `lib/auth.ts` validates credentials against the store and compares the requested login role. If a role mismatch is detected, NextAuth throws a custom `RoleMismatch` error.
2. **Client-Side Verification & Auto Sign-Out:** If a user bypasses normal redirects, the root dashboard layout checks the current active NextAuth session role against the workspace theme. If a role mismatch is confirmed (e.g., a customer gets authenticated but tries to view the admin area), the client immediately displays a warning, triggers a silent `signOut({ redirect: false })` to purge cookies, and redirects the user to the login screen.
3. **Registration Email Deduplication:** The signup API route (`app/api/auth/signup/route.ts`) checks existing accounts before registering a new user, returning a `400 Bad Request` if the email address is already in use.

---

## 📝 Form Validation Specifications

Comprehensive client-side validations are active on all forms in the application. Invalid fields dynamically display in red borders with immediate feedback message sub-texts.

### 1. Authentication Forms
* **Login Form** ([login-form.tsx](file:///Users/chanthiprabodha/frontend-task/components/auth/login-form.tsx)):
  * **Email:** Must not be empty and must match standard email pattern.
  * **Password:** Must not be empty and must be at least 6 characters.
  * **Role Alignment:** Validates that the credentials entered correspond to the selected role tab ("User" or "Admin").
* **Registration Form** ([register-form.tsx](file:///Users/chanthiprabodha/frontend-task/components/auth/register-form.tsx)):
  * **Full Name:** Required and must be at least 2 characters.
  * **Email:** Required, must be a valid format, and checks for deduplication.
  * **Password:** Required and must be at least 6 characters.

### 2. Admin Settings Forms ([settings-tab.tsx](file:///Users/chanthiprabodha/frontend-task/components/dashboard/settings-tab.tsx))
* **General Settings**:
  * **Store Name:** Required, must be at least 3 characters.
  * **Store Email:** Required, must be a valid email format.
* **Billing Settings**:
  * **Currency:** Required (e.g., USD, EUR, GBP).
  * **Shipping Fee:** Must be a valid positive number.
  * **Tax Rate:** Must be a valid percentage between 0% and 100%.
* **Security (Password change)**:
  * **Current Password:** Required.
  * **New Password:** Required, must be at least 6 characters, and cannot match the current password.
  * **Confirm Password:** Must match the New Password.

### 3. Customer Profile & Support Forms
* **Profile Settings** ([settings-tab.tsx](file:///Users/chanthiprabodha/frontend-task/components/dashboard/settings-tab.tsx)):
  * **Profile Name:** Required, must be at least 2 characters.
  * **Profile Email:** Required, must be a valid email format.
  * **Phone Number:** Required, must match a standard 10-15 digit phone pattern.
  * **City / Address:** Required, must not be empty.
* **Customer Support Tickets** ([customers-tab.tsx](file:///Users/chanthiprabodha/frontend-task/components/dashboard/customers-tab.tsx)):
  * **Subject:** Required, must be at least 5 characters.
  * **Message:** Required, must be at least 15 characters to prevent spam.

### 4. Product Catalog Modals ([modals.tsx](file:///Users/chanthiprabodha/frontend-task/components/dashboard/modals.tsx))
* **Add & Edit Product Modals**:
  * **Product Name:** Required, must be at least 2 characters.
  * **Product Price:** Must be a valid positive number greater than 0.
  * **Product Stock:** Must be a valid non-negative integer (0 or greater).

---

## 📂 Project Architecture

Key file locations for the forms and validation systems:

```
frontend-task/
├── app/
│   ├── api/auth/signup/route.ts  # Registration API & email deduplication check
│   └── layout.tsx                # Session provider & root client structure
├── components/
│   ├── auth/
│   │   ├── login-form.tsx        # Login form with role mismatch & credentials validation
│   │   └── register-form.tsx     # Sign-up form with input criteria & validation hooks
│   └── dashboard/
│       ├── customers-tab.tsx     # Customer dashboard, includes support tickets validation
│       ├── settings-tab.tsx      # Admin store settings & Customer profile/password forms
│       └── modals.tsx            # Product catalog Add/Edit forms with numeric validations
└── lib/
    └── auth.ts                   # NextAuth core configuration & persistent user store
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prabodha-fernando/furni-frontend.git
   cd furni-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # NextAuth Configurations
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_jwt_secret_here

   # Google OAuth Credentials (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Resend Email API (Optional)
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```