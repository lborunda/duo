# DUO AI - Your Personal AI Travel Companion

<p align="center">
  <img src="https://storage.googleapis.com/gemini-prod-us-west1-assets/v1/f7c162625291b8d8f079f29125345607b3164991c1b1819828464f1d4f293b68" alt="DUO AI Logo" width="150">
</p>

<p align="center">
  <strong>A futuristic, sentient AI travel guide that brings the world around you to life.</strong>
  <br />
  DUO uses your camera to see what you see, engaging you with rich descriptions and interactive dialogue. Explore the world like never before.
</p>

---

## ✨ Features

-   **📸 Visual Recognition**: Uses the device camera and Google Gemini to identify landmarks, art, and objects.
-   **🗣️ Conversational AI**: Generates detailed, engaging descriptions based on your customizable personality and interest preferences.
-   **🔊 Voice Interaction**: Features Text-to-Speech (powered by ElevenLabs) and Speech-to-Text for hands-free follow-up questions.
-   **👆 Interactive Image Exploration**: Tap or long-press on any part of a captured image to ask specific questions about that area.
-   **📓 Trip Journals**: Save your discoveries as "highlights" (image + conversation) organized into trips you can revisit later.
-   **🔧 Personalized Experience**: Fine-tune the AI's personality (factual vs. creative), interests (art, history, nature, etc.), and voice speed.
-   **📱 PWA Ready**: Designed as a Progressive Web App for a native app-like experience on mobile devices.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **AI & ML**:
    -   Google Gemini 2.5 Flash (for vision and conversational chat)
    -   ElevenLabs API (for realistic Text-to-Speech)
    -   Web Speech API (for Speech-to-Text)
-   **Backend**: Node.js & Express (acting as a secure proxy for API keys)
-   **Deployment**: Docker, Google Cloud Run, Google Cloud Build, Google Secret Manager

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [Google Cloud SDK (`gcloud` CLI)](https://cloud.google.com/sdk/docs/install) authenticated with your Google account.


🧑‍🏫 How to Clone and Share this App for Teaching and Continued Development

This project is fully functional on Google Cloud Run
 and can be cloned from this GitHub repo for local development or further collaboration with students.

✅ Step-by-Step Instructions
1. 📦 Clone the GitHub Repository
git clone https://github.com/lborunda/duo.git
cd duo

2. 📁 Install Dependencies
# Frontend (React, Vite, Tailwind)
npm install

# Backend (Node.js proxy server)
cd server
npm install
cd ..

3. 🔑 Configure Environment Variables

Create two .env files based on the examples below.

A. Root-level .env (for Vite frontend):

GEMINI_API_KEY=your_google_gemini_api_key


B. Backend .env (./server/.env):

ELEVENLABS_API_KEY=your_elevenlabs_api_key
GEMINI_API_KEY=your_google_gemini_api_key


✅ You can use .env.example to share with students without exposing keys.

4. ▶️ Run in Development Mode
npm run dev


This will start both:

The Vite frontend on http://localhost:5173

The Node backend proxy on a local port for API calls

☁️ Deploying Back to Google Cloud Run

To allow students or collaborators to deploy their changes:

Step 1: Secure API Keys
echo -n "your_key" | gcloud secrets create gemini_api_key --
echo -n "your_key" | gcloud secrets create elevenlabs_api_key --

Step 2: Connect GitHub to Google Cloud Build

Set up a trigger:

Event: Push to branch

Branch Regex: ^main$

Dockerfile location: ./Dockerfile

Step 3: First Deploy Manually
gcloud run deploy my-app \
  --source=. \
  --update-secrets=GEMINI_API_KEY=gemini_api_key:latest,ELEVENLABS_API_KEY=elevenlabs_api_key:latest


After that, every git push to the main branch will trigger a deployment automatically.

🧰 Tech Stack

Frontend: React, TypeScript, Tailwind, Vite

AI: Google Gemini, ElevenLabs, Web Speech API

Backend: Node.js + Express

Deployment: Docker, Cloud Run, Cloud Build

🗂 Project Structure
/
├── server/            # Node.js backend proxy
├── src/               # Frontend app (React)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types.ts
├── Dockerfile
├── package.json
└── vite.config.ts

👨‍🏫 Sharing and Collaboration Tips

Fork or clone the repo from: github.com/lborunda/duo

Use GitHub Issues or Projects for assigning parts

Students can open in Codespaces or VS Code directly

Author
Luis Borunda - lborunda@vt.edu
