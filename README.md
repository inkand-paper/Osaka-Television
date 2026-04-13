# Osaka Group - Official Digital Experience

Welcome to the official online platform and e-commerce portal for **Osaka Group**. Built with modern web technologies, this platform serves as the digital front door for Osaka's premium electronics—including Televisions, Fans, and Cookers. It features a highly interactive and responsive UI, real-time product updates, and an integrated secure administrative dashboard.

## 🌟 Key Features

*   **Interactive Showroom**: Browse products by category (TV, Fan, Cooker) with fluid animations powered by Framer Motion.
*   **Detailed Product Views**: Instant-load modals with comprehensive specifications, pricing, and 1-click sharing functionality (deep linking included).
*   **Seamless Conversions**: Direct integration with WhatsApp and Phone endpoints for immediate expert consultation and order placement.
*   **Real-time Synchronization**: Powered by Supabase, the product listings and gallery updates reflect in real-time across all active clients.
*   **Integrated Admin Dashboard**: Secure, role-based operations dashboard (`/osaka-ops`) for managing products and gallery assets centrally.
*   **Fully Responsive**: Meticulously crafted to provide a premium experience whether on mobile, tablet, or desktop.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL & Realtime channels)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: UI primitives (Dialogs, Badges, etc.) via shadcn.

## 🛠️ Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <repository-url>
cd osakaWebsite
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root of the project and add the necessary environment variables required for Supabase and the Admin Dashboard:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Authentication
SESSION_SECRET=your_secure_session_secret
ADMIN_SECRET_KEY=your_secure_admin_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

- `/app`: Contains all Next.js App Router pages including the home store interface and the `/osaka-ops` admin dashboard.
- `/components`: Reusable UI components including the `Navbar`, `Footer`, `HeroCarousel`, and more.
- `/components/ui`: Core UI components.
- `/lib`: Shared utilities, including the Supabase client configuration.
- `/public`: Static assets like images and branding.

## 🔒 Security & Operations

Access to the `osaka-ops` dashboard is strictly controlled via middleware and server actions using securely hashed cookies and secret tokens established in `.env.local`.

---
*Developed for Osaka Group - Reliable • Genuine • Verified*
