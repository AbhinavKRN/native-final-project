# 🔄 SkillSwap – Knowledge Barter Platform

> A 1-on-1 learning platform where users exchange skills instead of money.  
> **Example:** "I teach React ↔️ You teach Yoga"

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Demo Video](#-demo-video)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Traditional online courses are expensive and lack personalization. Many people want hands-on guidance from mentors, but can't afford paid sessions. Meanwhile, skilled individuals want to learn new things but don't have the budget.

**SkillSwap solves this** by enabling skill-for-skill exchanges:
- ✅ No money involved – pure knowledge barter
- ✅ 1-on-1 personalized learning
- ✅ Build teaching credibility and portfolio
- ✅ Learn from real people, not generic videos

---

## ✨ Features

### Core Features (MVP)
- 🔐 **Authentication**: Email-based register/login with JWT sessions
- 👤 **User Profiles**: Name, bio, avatar, teach/learn skills management
- 🔍 **Smart Matching**: Feed sorted by skill overlap (their teach skills ∩ your learn skills)
- 💬 **Swap Requests**: Send, accept, reject, and complete skill swaps
- ⭐ **Rating System**: Rate partners after completed swaps (1-5 stars)
- 📊 **Profile Stats**: Rating average and swap count displayed

### User Flow
1. **Signup** → Create account with email/password
2. **Add Skills** → List what you can teach and what you want to learn
3. **Discover** → Browse feed of users sorted by best matches
4. **Request Swap** → Send a swap request to a matched user
5. **Accept/Reject** → Partner responds to your request
6. **Complete** → Mark swap as done after session
7. **Rate** → Both users rate each other (updates profile ratings)

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation (Tabs + Stack)
- **State Management**: React Context API
- **Storage**: AsyncStorage (JWT tokens)
- **HTTP Client**: Axios
- **UI**: Custom dark theme with Gen-Z trendy design

### Backend (API Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod schemas
- **Environment**: dotenv

### Database (Supabase)
- **Tables**: `users`, `swaps`
- **Features**: UUID primary keys, foreign key constraints, timestamps

---

## 🎥 Demo Video

> **📹 Demo Video Coming Soon!**  
> A 5-10 minute walkthrough showing:
> - App functionality and user flows
> - Backend API interactions
> - Database operations
> - Matching algorithm in action
> - Rating system demonstration

**Video Link:** 
https://github.com/user-attachments/assets/b2a7f4f1-21f0-4c28-91f2-9cdc5307716f

---




## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)
- Expo Go app on your phone (for testing)

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/skillswap.git
cd skillswap
```

### Step 2: Database Setup (Supabase)

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run this SQL in Supabase SQL Editor:**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  skills_teach TEXT[] DEFAULT '{}',
  skills_learn TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  swaps_done INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_offered TEXT NOT NULL,
  skill_requested TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **Get your Supabase credentials:**
   - Go to Project Settings → API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# PORT=4000
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# JWT_SECRET=your-long-random-secret-key

# Start development server
npm run dev
```

Backend should now be running on `http://localhost:4000`

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000" > .env

# For device testing, replace YOUR_LOCAL_IP with your computer's IP:
# Windows: Run `ipconfig` and use IPv4 Address
# Mac/Linux: Run `ifconfig` or `ip addr`

# Start Expo
npx expo start
```

**For device testing:**
- Make sure phone and computer are on the same Wi-Fi
- Scan QR code with Expo Go app
- Or press `a` for Android emulator / `i` for iOS simulator

---

## 📚 API Documentation

### Base URL
```
http://localhost:4000  (development)
```

### Authentication
All endpoints except `/auth/*` require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 🔐 Authentication

**POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "bio": "I love teaching React!",
    "skillsTeach": ["react", "javascript"],
    "skillsLearn": ["yoga", "guitar"]
  }
  ```
- **Response:** `{ token: "...", user: {...} }`

**POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response:** `{ token: "...", user: {...} }`

#### 👥 Users

**GET** `/users/all`
- Returns all users sorted by skill overlap (descending)
- **Response:** `{ users: [...] }`

**GET** `/users/matches`
- Returns only users with overlap > 0 (perfect matches)
- **Response:** `{ users: [...] }`

**GET** `/users/profile`
- Returns current authenticated user's profile
- **Response:** `{ user: {...} }`

**PATCH** `/users/profile`
- **Body:**
  ```json
  {
    "bio": "Updated bio",
    "skillsTeach": ["react", "node"],
    "skillsLearn": ["yoga"]
  }
  ```
- **Response:** `{ user: {...} }`

#### 🔄 Swaps

**GET** `/swaps/mine`
- Returns all swaps where user is sender or receiver
- **Response:** `{ swaps: [...] }`

**POST** `/swaps/request`
- **Body:**
  ```json
  {
    "receiverId": "uuid-here",
    "skillOffered": "react",
    "skillRequested": "yoga"
  }
  ```
- **Response:** `{ swap: {...} }`

**PATCH** `/swaps/respond`
- **Body:**
  ```json
  {
    "swapId": "uuid-here",
    "action": "accept"  // or "reject"
  }
  ```
- **Response:** `{ swap: {...} }`

**PATCH** `/swaps/complete`
- **Body:**
  ```json
  {
    "swapId": "uuid-here"
  }
  ```
- **Response:** `{ swap: {...} }`

#### ⭐ Ratings

**POST** `/ratings/user`
- **Body:**
  ```json
  {
    "targetUserId": "uuid-here",
    "rating": 5  // 1-5
  }
  ```
- **Response:** `{ message: "Rating submitted" }`
- **Note:** Only works if you have a completed swap with the target user

---

## 📁 Project Structure

```
skillswap/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Supabase client config
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js              # Register/login endpoints
│   │   │   ├── users.js             # User profile & feed endpoints
│   │   │   ├── swaps.js             # Swap CRUD endpoints
│   │   │   └── ratings.js           # Rating endpoints
│   │   ├── utils/
│   │   │   └── helpers.js           # Matching logic & sanitization
│   │   ├── validators/
│   │   │   └── schemas.js           # Zod validation schemas
│   │   └── server.js                 # Express app entry point
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios instance with auth
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   └── screens/
│   │       ├── LoginScreen.js       # Login UI
│   │       ├── RegisterScreen.js    # Signup UI
│   │       ├── FeedScreen.js        # All users feed
│   │       ├── MatchesScreen.js     # Matched users only
│   │       ├── SwapsScreen.js       # User's swaps list
│   │       └── ProfileScreen.js     # Profile editor
│   ├── assets/                      # Images, icons
│   ├── App.js                       # Root component + navigation
│   ├── app.json                     # Expo config
│   ├── .env                         # API URL (not committed)
│   ├── .gitignore
│   └── package.json
│
├── README.md                        # This file
└── .gitignore                       # Root ignores
```

---

## 📱 Usage Guide

### For Users

1. **Sign Up**: Create an account with email and password
2. **Complete Profile**: Add your bio and skills (what you teach + what you want to learn)
3. **Browse Feed**: See all users sorted by how well they match your learning goals
4. **View Matches**: Check the "Matches" tab for users with perfect skill overlap
5. **Request Swap**: Tap "Request swap" on any user card
6. **Manage Swaps**: Go to "Swaps" tab to accept/reject incoming requests or complete active swaps
7. **Rate Partners**: After completing a swap, rate your partner (1-5 stars)

### Matching Algorithm

The app calculates **skill overlap**:
- **Overlap** = Number of skills where `their_teach_skills ∩ your_learn_skills`
- Users are sorted by:
  1. Highest overlap count
  2. Highest rating (if overlap is equal)

Example:
- You want to learn: `["react", "yoga", "guitar"]`
- They teach: `["react", "javascript", "yoga"]`
- **Overlap = 2** (react, yoga)

---

## 📸 Screenshots

> **📷 Screenshots Coming Soon!**
> 
> Will include:
> - Login/Register screens
> - Feed with user cards
> - Matches screen
> - Swaps management
> - Profile editor
> - Rating flow

---

## 🔮 Future Enhancements

### Planned Features
- 📅 **Scheduling System**: Book swap sessions with calendar integration
- 💬 **In-App Chat**: Direct messaging between swap partners
- 🔔 **Push Notifications**: Alerts for swap requests and messages
- 📍 **Location-Based Matching**: Find nearby skill swappers
- 🎥 **Video Integration**: Built-in video calls for swap sessions
- 📊 **Analytics Dashboard**: Track your teaching/learning stats
- ⚖️ **Dispute Resolution**: Mediation system for conflicts
- 🌐 **Multi-language Support**: Internationalization

### Technical Improvements
- [ ] Add unit tests (Jest)
- [ ] Add E2E tests (Detox)
- [ ] Implement caching (Redis)
- [ ] Add rate limiting
- [ ] Optimize database queries
- [ ] Add API documentation (Swagger)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update README if adding features
- Test on both iOS and Android

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**AbhinavKRN**
- GitHub: [@AbhinavKRN](https://github.com/AbhinavKRN)
- Project Link: [https://github.com/AbhinavKRN/native-final-project](https://github.com/AbhinavKRN/native-final-project)

---

## 🙏 Acknowledgments

- React Native and Expo teams for the amazing framework
- Supabase for the backend infrastructure
- React Navigation for navigation solutions
- All open-source contributors whose packages made this possible

---

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the API documentation above

---

**Made with ❤️ for the learning community**
