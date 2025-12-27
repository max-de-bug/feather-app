# Feather app

<div align="center">
  <img src="public/dashboard-preview.jpg" alt="Feather Dashboard Preview" width="800"/>
  
  **Transform Documents Into Conversations**
  
  Experience a new way to interact with your PDFs. Powered by advanced AI for seamless document conversations.
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748)](https://www.prisma.io/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991)](https://openai.com/)
</div>

## 🌟 Overview

Feather is a modern SaaS application that revolutionizes how you interact with PDF documents. Upload your PDFs and have intelligent conversations with them using advanced AI technology. Perfect for students, researchers, and professionals who need quick insights from their documents.

![Feather Landing Page](./public/dashboard-preview.jpg)

## ✨ Features

### 🚀 Core Functionality

- **AI-Powered Document Chat**: Ask questions and get instant answers from your PDF documents
- **Smart Vector Search**: Advanced semantic search using Pinecone vector database
- **PDF Processing**: Upload and process PDF files with automatic text extraction
- **Real-time Conversations**: Stream responses for a seamless chat experience
- **Document Management**: Organize and manage all your uploaded documents in one place

### 💼 User Features

- **User Authentication**: Secure authentication system
- **Subscription Plans**: Free and Pro plans with different quotas
- **File Upload**: Drag-and-drop interface for easy file uploads
- **Mobile-Friendly**: Responsive design that works on all devices
- **Dashboard**: Clean and intuitive dashboard for managing your documents

### 🎯 Pricing Plans

#### Free Plan

- 5 pages per PDF
- 4MB file size limit
- Mobile-friendly interface
- 10 PDFs per month

#### Pro Plan

- 25 pages per PDF
- 16MB file size limit
- Higher-quality AI responses
- Priority support
- Unlimited PDFs

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **tRPC** - End-to-end typesafe APIs
- **Prisma 7** - Modern ORM with PostgreSQL adapter
- **PostgreSQL** - Database (Supabase)

### AI & Services

- **OpenAI GPT** - AI language model for document conversations
- **OpenAI Embeddings** - Vector embeddings for semantic search
- **Pinecone** - Vector database for document search
- **AWS S3** - File storage
- **Stripe** - Payment processing

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Prisma Migrate** - Database migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- OpenAI API key
- Pinecone API key
- AWS S3 bucket (for file storage)
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/feather-app.git
   cd feather-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"

   # Pinecone
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_ENVIRONMENT="your-pinecone-environment"
   PINECONE_INDEX_NAME="feather"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   S3_BUCKET_NAME="your-s3-bucket-name"

   # Stripe
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

   # Next.js
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Start Chatting in Minutes

1. **Create Account**

   - Sign up for a free account or choose the Pro plan for more features

2. **Upload PDF**

   - Go to your dashboard
   - Drag and drop your PDF file or click to upload
   - Wait for processing to complete

3. **Start Chatting**
   - Open your uploaded document
   - Ask questions about the content
   - Get instant AI-powered answers

### Example Queries

- "What is the main topic of this document?"
- "Summarize the key points"
- "What does section 3 discuss?"
- "Find information about [specific topic]"

## 🏗️ Project Structure

```
feather-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/             # Database migrations
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes
│   │   ├── components/         # React components
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── lib/                # Utility functions
│   │   └── page.tsx            # Landing page
│   ├── db/                     # Database client
│   ├── trpc/                   # tRPC routers
│   └── types/                  # TypeScript types
├── .env                        # Environment variables
└── package.json                # Dependencies
```

## 🔧 Configuration

### Prisma Configuration

The project uses Prisma 7 with the PostgreSQL adapter. Configuration is split between:

- `prisma/schema.prisma` - Database schema definition
- `prisma.config.ts` - Migration configuration
- `src/db/index.ts` - Prisma client with adapter setup

### Database Connection

For Supabase users, use the direct connection URL (port 5432) for migrations and the pooler URL (port 6543) for application connections.

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contributions are not currently accepted.

## 📧 Support

For support, please contact the development team or open an issue in the repository.

---

<div align="center">
  Made with ❤️ by the Connor
</div>
