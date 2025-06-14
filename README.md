# Prompt Enhancer - AI-Powered Prompt Enhancement SaaS

A streamlined prompt enhancement application that uses AI to ask clarifying questions before generating improved prompts. Built with React, Node.js, PostgreSQL, and integrates with OpenRouter AI and Stripe for payments.

## Features

- **Two-Step Enhancement Process**: AI asks clarifying questions first, then provides enhanced prompts
- **Subscription Plans**: Free (10 prompts), Basic ($1/75 prompts), Plus ($3/300 prompts), Pro ($5/500 prompts)
- **User Authentication**: Secure login with Replit Auth
- **Usage Tracking**: Monitor prompt usage and subscription limits
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Payment Integration**: Stripe-powered subscription management

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenRouter API
- **Payments**: Stripe
- **Deployment**: Replit

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Required API keys (see Environment Variables section)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_db_host
PGPORT=5432
PGDATABASE=your_db_name
PGUSER=your_db_user
PGPASSWORD=your_db_password

# Authentication
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-app-domain.replit.app

# OpenRouter API (for AI functionality)
OPENROUTER_API_KEY=your_openrouter_api_key
# Optional: override the default model
# OPENROUTER_MODEL=mistralai/mistral-7b-instruct

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### API Keys Setup

#### OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account
3. Generate an API key from your dashboard
4. Add it as `OPENROUTER_API_KEY` in your environment
5. Optionally set `OPENROUTER_MODEL` to choose a different model (defaults to `mistralai/mistral-7b-instruct`)

#### Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your "Publishable key" (starts with `pk_`) → `VITE_STRIPE_PUBLIC_KEY`
3. Copy your "Secret key" (starts with `sk_`) → `STRIPE_SECRET_KEY`
4. Set up webhook endpoint for subscription events → `STRIPE_WEBHOOK_SECRET`

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd prompt-enhancer
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see above)

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### For Users

1. **Sign In**: Click "Get Started" and authenticate with Replit
2. **Enter Prompt**: Type your initial prompt in the text area
3. **Configure Options**: Set enhancement preferences (variations, style, format, etc.)
4. **Answer Questions**: AI will ask 3-5 clarifying questions
5. **Get Enhanced Prompt**: Receive your improved, context-aware prompt
6. **Upgrade Plan**: Subscribe to higher plans for more prompts per month

### Enhancement Options

- **Variations**: Number of alternative versions (1-5)
- **Style**: Formal, casual, technical, creative
- **Format**: Paragraph, bullet points, numbered list, outline
- **Length**: Brief, moderate, detailed, comprehensive
- **Constraints**: Statistics, examples, balanced tone, citations, step-by-step, avoid jargon
- **Custom Instructions**: Additional context or requirements

## Database Schema

The application uses the following main tables:

- `users`: User profiles and subscription information
- `prompts`: Original and enhanced prompt pairs
- `questionnaires`: AI-generated questions and user responses
- `sessions`: User session storage

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Prompt Enhancement
- `POST /api/generate-questions` - Generate clarifying questions
- `POST /api/enhance-prompt` - Create enhanced prompt
- `GET /api/prompts` - Get user's prompt history

### Subscriptions
- `POST /api/create-subscription` - Create Stripe subscription
- `POST /api/stripe-webhook` - Handle Stripe events

## Deployment

### On Replit

1. Import this repository to Replit
2. Set up environment variables in the Secrets tab
3. Ensure PostgreSQL database is provisioned
4. Run `npm run db:push` to initialize the database
5. Start the application with the "Run" button

### Other Platforms

The application can be deployed on any Node.js hosting platform that supports:
- PostgreSQL database
- Environment variables
- WebSocket connections (for Vite HMR in development)

## Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and types
└── package.json         # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Adding New Features

1. Update database schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update storage interface in `server/storage.ts`
4. Add API routes in `server/routes.ts`
5. Create frontend components in `client/src/components/`
6. Add pages in `client/src/pages/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the GitHub Issues page
2. Ensure all environment variables are correctly set
3. Verify API keys are valid and have sufficient credits/permissions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
