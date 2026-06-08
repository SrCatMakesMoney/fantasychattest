# 🏰 FantasyChat - Dark Realm Social

A dark fantasy social network inspired by Twitter/TikTok with DMs. Built with Next.js, MongoDB, and a full castle-themed dark fantasy aesthetic.

## Features

- **📜 Realm Feed** – Post proclamations to the dark realm (like tweets)
- **💀 Dark Messages** – Private DMs between souls
- **⚔️ Soul Likes** – React to posts with dark energy
- **👤 Soul Profiles** – Unique realm-based identity
- **🔐 Authentication** – JWT-based auth with cookies
- **🏰 Castle UI** – Full dark fantasy theme with gothic fonts, ornamental borders, glowing accents

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + bcrypt
- **Styling**: Tailwind CSS v4 with custom dark fantasy theme
- **Fonts**: Cinzel (gothic headings) + Crimson Text (body)
- **Deploy**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YoSoySrCat/fantasychat.git
cd fantasychat
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with your MongoDB URI:
```env
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/fantasychat
JWT_SECRET=your-secret-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI` – Your MongoDB Atlas connection string
   - `JWT_SECRET` – A random secret string for JWT signing
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/       # Login, register, session
│   │   ├── posts/      # Feed CRUD + likes
│   │   ├── messages/   # DMs + conversations
│   │   └── users/      # User search
│   ├── feed/           # Main feed page
│   ├── messages/       # DM interface
│   ├── profile/        # User profile
│   └── login/          # Auth page
├── components/         # Reusable UI components
├── lib/                # MongoDB connection, auth helpers
└── models/             # Mongoose schemas
```

## Dark Fantasy Theme

The UI features:
- Deep black/purple gradients
- Gothic Cinzel font for headings
- Gold accent text with glow effects
- Ornamental card borders with shadow
- Castle-inspired visual language
- Blood red interaction states

---

*Forged in the depths of the Shadow Keep* 🗡️
