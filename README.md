# InterviewAI 🧠

![InterviewAI Banner](https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200&h=400)

**An AI-Powered Mock Interview & Placement Preparation Platform**

InterviewAI is a production-grade, full-stack application designed to help engineering students and job seekers prepare for technical and behavioral interviews. By leveraging advanced generative AI models (like Google Gemini and OpenAI), it dynamically generates tailored interview questions, analyzes resumes, and provides actionable, real-time feedback on user responses.

---

## 🚀 Features

- **Dynamic Interview Generation**: Choose from HR, Technical, DSA, Core CS, or Mixed interviews tailored to specific roles (e.g., Software Engineer, Data Scientist) and experience levels.
- **Resume Intelligence**: Upload your resume (PDF/TXT) to give the AI context. The platform extracts skills, experience, and projects to ask highly relevant, personalized questions.
- **Real-Time Evaluation**: Get instant, objective scoring (0-10) on correctness, completeness, and clarity for every answer you provide.
- **Voice Mode**: Practice speaking your answers using the browser's native Speech Recognition API (with seamless text-input fallback).
- **Comprehensive Analytics & Reports**: View detailed post-interview reports highlighting your strengths, weaknesses, and a suggested action plan. Track your progress over time via the interactive dashboard.
- **Adaptive Difficulty**: The AI adjusts the complexity of follow-up questions based on how well you answer.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 18, Tailwind CSS, Radix UI (shadcn/ui), Recharts
- **Backend**: Next.js Route Handlers, Node.js
- **Database**: SQLite (via Prisma ORM) — easily swappable to PostgreSQL
- **Authentication**: Auth.js (NextAuth v5) supporting Credentials and Google OAuth
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash) via official SDK
- **Validation**: Zod (for both API payloads and structured AI outputs)
- **Styling**: Modern, responsive glassmorphism UI with Dark/Light mode support

## 🚦 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/interview-ai.git
   cd interview-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env.local
   ```
   *Required variables for full functionality:*
   - `AUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `GEMINI_API_KEY`: Get a free key from Google AI Studio
   - `DATABASE_URL`: Defaults to `file:./prisma/dev.db`

4. **Initialize the Database**
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable UI components (Dashboard, Charts, Interview Wizard)
- `/src/lib/ai` - AI Provider architecture (Gemini, Mock, interface)
- `/src/lib/schemas` - Zod schemas serving as the single source of truth for types
- `/prisma` - Database schema and SQLite database file

## 🔒 Privacy & Security

- **Client-Side Safety**: All sensitive AI API keys are kept safely on the server.
- **Data Protection**: Resumes are parsed locally in memory or stored securely if the `UPLOAD_PROVIDER` is configured for production.
- **Auth**: Fully session-based authentication prevents unauthorized access to interview histories.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the platform, feel free to fork the repository, create a feature branch, and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
