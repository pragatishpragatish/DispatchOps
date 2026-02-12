# Deployment Guide - DispatchOps on Vercel

This guide will walk you through deploying DispatchOps to Vercel, a platform optimized for Next.js applications.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Supabase project (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed locally (for testing)

## Step 1: Prepare Your Code Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub/GitLab/Bitbucket**:
   ```bash
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

## Step 2: Set Up Supabase

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set a project name
   - Select a region closest to your users
   - Set a database password (save this securely)

2. **Run Database Migrations**:
   - In Supabase Dashboard, go to SQL Editor
   - Run the following files in order:
     1. `supabase/schema.sql` - Creates all tables
     2. `supabase/rls_policies.sql` - Sets up Row Level Security
     3. `supabase/migrations/add_distance_to_load_requests.sql` (if not already in schema)
     4. `supabase/migrations/create_invoices_table.sql`
     5. `supabase/migrations/create_other_income_expenses.sql`
     6. `supabase/migrations/make_owner_rate_nullable.sql`

3. **Get Supabase Credentials**:
   - Go to Project Settings → API
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

4. **Set Up Authentication** (Optional - for email/password):
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates if needed

5. **Seed Database** (Optional - for testing):
   - In SQL Editor, run `supabase/seed.sql` to add sample data

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** (for local testing):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Test Locally**:
   ```bash
   npm install
   npm run dev
   ```
   - Visit `http://localhost:3000`
   - Verify the app connects to Supabase correctly

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Select your repository and click "Import"

2. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**:
   - In the "Environment Variables" section, add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```
   - Make sure to add these for:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 5: Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URLs to **Redirect URLs**:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**` (for wildcard)

3. Add to **Site URL**:
   - `https://your-project.vercel.app`

### 2. Verify Deployment

1. Visit your Vercel deployment URL
2. Test the following:
   - ✅ Login page loads
   - ✅ Can create an account/login
   - ✅ Dashboard displays correctly
   - ✅ Can create/view owners, vehicles, trips, etc.
   - ✅ Invoice generation works

### 3. Set Up Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

## Step 6: Database Migrations (Future Updates)

When you need to update the database schema:

1. **Create Migration File**:
   - Add SQL migration to `supabase/migrations/`
   - Name it descriptively (e.g., `YYYYMMDD_description.sql`)

2. **Run Migration**:
   - In Supabase SQL Editor, run the new migration file
   - Or use Supabase CLI if configured

3. **Redeploy** (if code changes):
   - Push changes to Git
   - Vercel will automatically redeploy

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Yes |

## Build Configuration

Vercel automatically detects Next.js and uses these defaults:

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x (auto-detected)

## Troubleshooting

### Build Fails

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments → Click on failed deployment
   - Review build logs for errors

2. **Common Issues**:
   - **Missing environment variables**: Ensure all required env vars are set
   - **TypeScript errors**: Fix any TS errors locally first
   - **Dependency issues**: Check `package.json` for correct versions

### Authentication Not Working

1. **Check Redirect URLs**:
   - Verify Supabase redirect URLs include your Vercel domain
   - Format: `https://your-project.vercel.app/auth/callback`

2. **Check Environment Variables**:
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
   - Ensure they're set for Production environment

### Database Connection Issues

1. **Verify Supabase URL**:
   - Check that `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project URL
   - Should be: `https://xxxxx.supabase.co`

2. **Check RLS Policies**:
   - Ensure RLS policies are set up correctly
   - Verify authenticated users have proper permissions

### PDF Generation Issues

1. **Check Logo Path**:
   - Ensure `public/logo.png` exists in your repository
   - Logo should be accessible at `/logo.png`

2. **Browser Compatibility**:
   - PDF generation uses client-side libraries
   - Test in modern browsers (Chrome, Firefox, Safari, Edge)

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Production**: Deploys from `main` or `master` branch
- **Preview**: Creates preview deployments for pull requests
- **Development**: Deploys from other branches

## Performance Optimization

Vercel automatically optimizes Next.js apps, but you can:

1. **Enable Edge Functions** (if needed):
   - Configure in `vercel.json` for API routes

2. **Optimize Images**:
   - Use Next.js Image component (already implemented)
   - Images are automatically optimized by Vercel

3. **Enable Caching**:
   - Vercel automatically caches static assets
   - API routes can use caching headers

## Monitoring & Analytics

1. **Vercel Analytics** (Optional):
   - Enable in Vercel Dashboard → Analytics
   - Provides performance metrics and insights

2. **Error Tracking**:
   - Check Vercel Dashboard → Logs for runtime errors
   - Consider integrating Sentry or similar for production

## Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ Supabase RLS policies are enabled
- ✅ Authentication is properly configured
- ✅ Redirect URLs are whitelisted in Supabase
- ✅ HTTPS is enabled (automatic on Vercel)
- ✅ API routes are protected (middleware checks authentication)

## Rollback Deployment

If you need to rollback:

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "..." menu → "Promote to Production"

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## Quick Deploy Checklist

- [ ] Code pushed to Git repository
- [ ] Supabase project created and configured
- [ ] Database migrations run successfully
- [ ] Environment variables configured in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Deployment successful
- [ ] Login/authentication tested
- [ ] Core features tested (CRUD operations)
- [ ] Invoice generation tested
- [ ] Custom domain configured (if applicable)

---

**Note**: Keep your Supabase credentials secure. Never commit `.env.local` to Git. Always use Vercel's environment variables for production deployments.
