# DukanBaz - Pakistan's Premier B2B Wholesale Marketplace

DukanBaz is a comprehensive B2B wholesale marketplace platform designed specifically for the Pakistani market. Built with Next.js 15 and modern web technologies, it connects suppliers and buyers across Pakistan with a focus on local business needs.

## 🚀 Features

- **B2B Marketplace**: Connect suppliers and buyers across Pakistan
- **User Authentication**: Secure login/registration with role-based access (Buyer/Supplier)
- **Product Management**: Comprehensive product catalog with variations, bulk pricing, and inventory management
- **Smart Cart System**: Advanced cart with bulk pricing tiers and quantity management
- **Checkout & Orders**: Complete order management with address auto-fill and Pakistan-specific payment methods
- **Supplier Dashboard**: Analytics, order management, and product management tools
- **Search & Filters**: Advanced product search with category and price filtering
- **Responsive Design**: Mobile-first design optimized for all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **Payment**: Pakistan-specific payment methods (JazzCash, EasyPaisa, Bank Transfer, COD)
- **Icons**: React Icons (Feather Icons)
- **Development**: Turbopack for fast development builds

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/dukanbaz.git
cd dukanbaz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌍 Pakistan-Specific Features

- **Currency**: Pakistani Rupees (PKR)
- **Payment Methods**: JazzCash, EasyPaisa, Local Banks, Cash on Delivery
- **Shipping**: Pakistan domestic shipping only
- **Localization**: English with Pakistani business context
- **Business Focus**: B2B wholesale marketplace for Pakistani suppliers and buyers

## 📱 Key Pages

- **Homepage**: Featured products and categories
- **Products**: Browse and search products with filters
- **Product Details**: Detailed product information with bulk pricing
- **Cart**: Smart cart with quantity management
- **Checkout**: Complete checkout with address auto-fill
- **Dashboard**: Supplier/buyer dashboards with analytics
- **Profile**: User profile management

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── contexts/           # React Context providers
├── lib/                # Utility functions and configurations
├── models/             # MongoDB/Mongoose models
└── types/              # TypeScript type definitions
```

## 🚀 Deployment

The application is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred platform following their Next.js deployment guides.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Live Demo

Visit [https://dukanbaz.com](https://dukanbaz.com) to see the live application.

---

**DukanBaz** - Empowering Pakistani businesses through digital wholesale marketplace solutions.
