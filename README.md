# 🧠 TalentLens - AI-Powered Interview Platform

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://talent-lens-fst1.vercel.app/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-blue)](https://reactjs.org/)
[![Powered by Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-orange)](https://ai.google.dev/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

> **An intelligent interview platform that revolutionizes technical assessments through AI-powered question generation and real-time candidate evaluation.**

## 🚀 Live Demo

Experience TalentLens in action: **[https://talent-lens-fst1.vercel.app/](https://talent-lens-fst1.vercel.app/)**

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Resume Analysis**: Automatic extraction of candidate information using advanced text parsing
- **Dynamic Question Generation**: Personalized interview questions based on candidate skills and experience
- **Real-time Answer Evaluation**: Comprehensive AI assessment of technical accuracy, communication clarity, and depth of understanding
- **Adaptive Follow-up Questions**: Context-aware follow-up questions based on candidate responses

### 👤 Dual Interface
- **Interviewee View**: Streamlined experience for candidates taking interviews
- **Interviewer Dashboard**: Comprehensive management and analysis tools for recruiters

### 🎯 Smart Assessment Features
- **Progressive Difficulty**: Questions automatically scale from easy to hard
- **Time Management**: Intelligent time allocation based on question complexity
- **Multi-dimensional Scoring**: Evaluates technical skills, communication, and confidence
- **Detailed Analytics**: Performance breakdowns with actionable insights

### 📊 Advanced Analytics
- **Performance Metrics**: Comprehensive scoring across multiple dimensions
- **Skill Assessment**: Automatic identification and evaluation of technical competencies
- **Confidence Analysis**: AI-powered sentiment analysis of candidate responses
- **Recommendation Engine**: Experience level recommendations based on performance

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern component architecture
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Responsive design system
- **Lucide React** - Beautiful icon library
- **Redux Toolkit** - State management
- **Vite** - Lightning-fast build tool

### AI & ML
- **Google Gemini AI** - Advanced language model integration
- **Custom AI Prompts** - Specialized prompts for interview scenarios
- **Intelligent Text Processing** - Resume parsing and analysis

### File Processing
- **react-pdftotext** - PDF resume extraction
- **mammoth** - DOCX document processing
- **Advanced Text Parsing** - Multi-strategy information extraction

### Development & Deployment
- **Vercel** - Seamless deployment platform
- **ESLint** - Code quality assurance
- **Git** - Version control

## 🏗️ Architecture

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Candidate │ │ TalentLens │ │ Interviewer │
│ Interface │◄──►│ AI Engine │◄──►│ Dashboard │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│ │ │
▼ ▼ ▼
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Resume Upload │ │ Gemini AI API │ │ Analytics View │
│ & Profile Setup │ │ Question Gen. │ │ & Candidate │
│ │ │ Answer Analysis │ │ Management │
└─────────────────┘ └──────────────────┘ └─────────────────┘


## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini AI API key


### API Setup

1. Get your Gemini AI API key from [Google AI Studio](https://ai.google.dev/)
2. Add the key to your environment variables
3. The application will automatically initialize the AI service

## 📱 Usage Guide

### For Candidates (Interviewee Experience)

1. **📄 Upload Resume**
- Upload PDF or DOCX resume
- AI automatically extracts personal information and skills
- System analyzes experience level and technical background

2. **👤 Complete Profile**
- Verify auto-extracted information
- Fill in any missing details
- Review identified technical skills

3. **🎯 Take Interview**
- Answer 6 AI-generated questions
- Progressive difficulty (Easy → Medium → Hard)
- Real-time timer management
- Instant AI feedback on each response

4. **📊 View Results**
- Comprehensive performance analysis
- Skill-based recommendations
- Detailed scoring breakdown

### For Interviewers (Dashboard Experience)

1. **📈 Monitor Live Interviews**
- Real-time candidate progress tracking
- Active interview statistics

2. **👥 Manage Candidates**
- View all completed interviews
- Sort by performance metrics
- Filter by completion status

3. **🔍 Detailed Analysis**
- Individual candidate deep-dives
- Performance comparison tools
- Export capabilities



