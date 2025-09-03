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

### 1. Clone the Repository

```bash
git clone https://github.com/lborunda/duo.git
cd duo



2. Install Dependencies
The project has separate dependencies for the frontend and the backend server.
code
Bash
# Install root/frontend dependencies
npm install

# Install backend server dependencies
cd server
npm install
cd ..
3. Configure Environment Variables
You will need API keys for Google Gemini and ElevenLabs. Create two .env files:
A. Root Directory (./.env)
This file is for the Vite development server.
code
Code
# ./.env
GEMINI_API_KEY=your_google_gemini_api_key
B. Server Directory (./server/.env)
This file is for the backend proxy server.
code
Code
# ./server/.env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GEMINI_API_KEY=your_google_gemini_api_key
4. Run the Development Server
This command will start both the frontend Vite server and the backend Express server concurrently.
code
Bash
npm run dev
Open your browser to the local address provided by Vite (usually http://localhost:5173).

☁️ Deployment to Google Cloud Run
This application is designed for easy, continuous deployment to Google Cloud Run via Cloud Build.
1. Secure Your API Keys
Never commit API keys to your repository. Use Google Secret Manager.
code
Bash
# Replace [...] with your actual keys
echo -n "[YOUR_GEMINI_API_KEY]" | gcloud secrets create gemini_api_key --data-file=-
echo -n "[YOUR_ELEVENLABS_API_KEY]" | gcloud secrets create elevenlabs_api_key --data-file=-
2. Set up Cloud Build Trigger
Navigate to the Cloud Build > Triggers page in the Google Cloud Console.
Connect your GitHub repository (lborunda/duo).
Create a new trigger:
Event: Push to a branch
Branch: ^main$
Configuration: Dockerfile
Dockerfile location: ./Dockerfile
3. First Manual Deploy
Deploy the service for the first time manually. This command links the secrets and sets up the service. Replace my-app with your desired service name.
code
Bash
gcloud run deploy my-app \
  --source=. \
  --update-secrets=GEMINI_API_KEY=gemini_api_key:latest,ELEVENLABS_API_KEY=elevenlabs_api_key:latest
After this initial deployment, every push to the main branch will automatically trigger a new build and deployment via the Cloud Build trigger.
📂 Project Structure
A brief overview of the key directories in this project.
code
Code
/
├── server/               # Backend Express proxy server
├── src/
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks (camera, speech, etc.)
│   ├── services/         # API clients (Gemini, ElevenLabs)
│   └── types.ts          # Core TypeScript types and interfaces
├── Dockerfile            # Instructions for building the production container
├── package.json          # Project scripts and dependencies
└── vite.config.ts        # Vite configuration

👨‍💻 Author
Luis Borunda - lborunda@vt.edu
