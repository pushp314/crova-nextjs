# NOVA Fashion E-commerce Store


# 3. Make deploy script executable
chmod +x deploy.sh
# 4. Run deploy
./deploy.sh


# Just push to GitHub, then:
ssh user@your-vps
cd /opt/crova
./deploy.sh

This is a modern e-commerce fashion store called "NOVA", built with Next.js and TypeScript.

## Overview

The application is a customer-facing storefront inspired by minimalist and modern fashion brands. It features a clean, responsive design, product listings, a shopping cart, and an AI-powered feature to summarize product descriptions.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Shadcn UI
- **State Management**: React Context API
- **Icons**: Lucide React
- **GenAI**: Firebase Genkit for AI features

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start by editing `src/app/page.tsx`. The page auto-updates as you edit the file.
