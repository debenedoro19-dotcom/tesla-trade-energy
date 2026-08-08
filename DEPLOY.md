# Tesla Trade — Go Live Guide (Vercel)

## 1. Prepare
- Make sure the site works locally: `npm run dev`
- Set your WhatsApp number in Admin → Site Settings (e.g. +2348012345678)
- Change admin password via `.env.local`:
  ```
  NEXT_PUBLIC_ADMIN_PASSWORD=YourStrongPassword
  ```

## 2. Create free accounts
1. GitHub: https://github.com (upload your project)
2. Vercel: https://vercel.com (sign up with GitHub)

## 3. Deploy on Vercel
1. Click **Add New Project**
2. Import your GitHub repository
3. Framework: Next.js (auto-detected)
4. Environment Variables → add:
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = your password
5. Click **Deploy**
6. Wait 1–2 minutes → you get a live URL like `https://tesla-trade.vercel.app`

## 4. Custom domain (optional)
Vercel → Project → Settings → Domains → add your domain

## 5. After go-live
- Open Admin → set WhatsApp number
- Test Sign Up, Login, KYC, Chat, Orders
- Bookmark your admin URL: `https://your-site.vercel.app/admin`

## Important notes
- Current data storage is browser localStorage (fine for demos and single-device admin).
- For real multi-user cloud data across devices, connect Supabase (see SUPABASE_SETUP.md if present).
- WhatsApp opens the official WhatsApp chat with your number.
- Live chat messages appear in Admin → Live Chat so you can reply.
