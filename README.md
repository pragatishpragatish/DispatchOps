# DispatchOps - Logistics Dispatch Management System

A full-stack web application for managing vehicle coordination and dispatch operations for small logistics businesses.

## Features

- **Authentication**: Secure email/password login with Supabase
- **Dashboard**: Overview with key metrics and reliability leaderboard
- **Owners Management**: CRUD operations for vehicle owners with contact management
- **Vehicles Management**: Vehicle tracking with filters, reliability scores, and capacity management
- **Load Providers**: Manage client relationships with trust levels and payment cycles
- **Load Requests**: Create and track load requests with status pipeline (open → matching → matched → closed)
- **Trip Execution**: Track trips with margin calculation, status checklists, and reliability scoring
- **Smart Matching**: AI-powered vehicle matching based on route preferences, capacity, reliability, and rates
- **Mobile Responsive**: Works seamlessly on both desktop and mobile browsers
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd dispatchops
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql` to create all tables
4. Run the SQL from `supabase/rls_policies.sql` to set up Row Level Security
5. (Optional) Run `supabase/seed.sql` to populate sample data

### 5. Create Your First User

1. Go to Authentication → Users in Supabase dashboard
2. Click "Add User" → "Create new user"
3. Enter email and password
4. You can now log in with these credentials

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **owners**: Vehicle owners and drivers
- **vehicles**: Vehicle details, capacity, rates, and preferences
- **reliability_scores**: Performance tracking for vehicles
- **load_providers**: Client companies and their details
- **load_requests**: Load booking requests
- **trips**: Executed trips with financial tracking

See `supabase/schema.sql` for complete schema definition.

## Project Structure

```
dispatchops/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── owners/            # Owners management
│   ├── vehicles/          # Vehicles management
│   ├── load-providers/    # Load providers management
│   ├── load-requests/     # Load requests and matching
│   ├── trips/             # Trip execution and tracking
│   └── login/             # Authentication
├── components/            # React components
│   ├── owners/           # Owner-related components
│   ├── vehicles/         # Vehicle-related components
│   ├── load-providers/   # Provider-related components
│   ├── load-requests/    # Request-related components
│   └── trips/            # Trip-related components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client setup
│   └── matching.ts       # Vehicle matching logic
├── supabase/              # Database scripts
│   ├── schema.sql        # Database schema
│   ├── rls_policies.sql  # Row Level Security policies
│   └── seed.sql          # Sample data
└── public/                # Static assets
```

## Key Features Explained

### Smart Vehicle Matching

The matching algorithm considers:
- Vehicle type compatibility
- Route preferences (preferred/avoided routes)
- Weight/capacity requirements
- Reliability scores
- Rate competitiveness
- Distance limits

### Reliability Scoring

After trip completion, rate vehicles on:
- On-time pickup (1-5)
- On-time delivery (1-5)
- Communication quality (1-5)
- Driver behavior (1-5)
- Vehicle condition (1-5)

Scores are averaged and displayed as star ratings.

### Margin Calculation

Trips automatically calculate margin:
- Margin = Client Rate - Owner Rate
- Margin percentage = (Margin / Client Rate) × 100

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The app is optimized for Vercel deployment with Next.js.

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all routes
- Secure password handling via Supabase Auth
- Environment variables for sensitive data

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Authentication Issues

- Ensure Supabase URL and keys are correct in `.env.local`
- Check that RLS policies are applied
- Verify user exists in Supabase Auth

### Database Connection

- Verify Supabase project is active
- Check network connectivity
- Review Supabase dashboard for errors

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

This project is open source and available for use in logistics operations.

## Support

For issues or questions, please check:
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs

## Future Enhancements

Potential features to add:
- CSV import/export for owners and vehicles
- Excel export functionality
- Trip margin charts and analytics
- Lane rate history tracking
- SMS/WhatsApp notifications
- Mobile app version

---

Built with ❤️ for efficient logistics management
