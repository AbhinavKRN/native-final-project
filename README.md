# SkillSwap – Knowledge Barter Platform

1:1 learning where people exchange skills instead of money (React ↔ Yoga). This repo contains both the Expo mobile app and Express backend wired to Supabase.

## Problem Statement
People want hands-on help, but courses are pricey and generic. SkillSwap pairs learners with mentors who want to trade knowledge, not cash.

## Tech Stack
- Mobile: React Native (Expo), React Navigation, AsyncStorage, Axios
- Backend: Node.js, Express, Supabase JS client, JWT, bcrypt, Zod
- Database: Supabase Postgres (`users`, `swaps`)

## Features Implemented
- Email auth (register/login) with JWT session stored in AsyncStorage
- Profiles with name/bio/avatar + teach/learn skills (deduped, lowercased)
- Matching feed sorted by skill overlap; matches endpoint filters overlap > 0
- Swap requests with statuses: `pending` → `active` → `completed` / `rejected`
- Accept/reject/complete flows plus personal swaps list
- Ratings after completed swaps; profile rating updated as running average

## Repository Layout
- `backend/` – Express API + Supabase client
- `frontend/` – Expo app with navigation + screens

## PRD / Feature List
- Core: Auth, profile with teach/learn skills, matching feed, swap lifecycle, ratings
- Optional/Future: Availability scheduling, chat, push notifications, dispute handling

