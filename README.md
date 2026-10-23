# DUO AI - Your Personal AI Travel Companion

## Shared glasses preview — development branch

The `shared-glasses-preview` branch pairs with the same branch in
[DUO Tour](https://github.com/lborunda/duo-tour/tree/shared-glasses-preview).
Run `npm install`, `npm test`, and `npm run build`, then point DUO Tour's
`DUO_WEB_DIR` at this checkout's `dist` directory before starting its server.

Open the companion from the Android DUO Tour app with Ray-Ban Meta selected.
The embedded screen uses the existing Toolkit session for live preview and
still capture; it does not open a second glasses session or fall back to the
phone camera. A standalone browser still uses its own camera and requires a
secure context. The native adapter is available only inside DUO Tour.

This is work in progress: builds and adapter tests pass, but real-glasses
streaming remains blocked by `SERVICE_NOT_FOUND` during DWA bootstrap on the
current test setup. The companion's description and speech pipeline is
unchanged; this update does not add DUO Tour's grounding rules to those requests.

Validation notes: the existing full TypeScript check is not clean (including
missing React type declarations and preference-type errors). The new camera
transport has a separate passing strict type check. No credentials, recordings
or compiled build are included in this branch.

<p align="center">
  <img src="https://storage.googleapis.com/gemini-prod-us-west1-assets/v1/f7c162625291b8d8f079f29125345607b3164991c1b1819828464f1d4f293b68" alt="DUO AI Logo" width="150">
</p>

<p align="center">
  <strong>Sentient AI travel guide that brings the world around you to life.</strong><br />
  This project builds on architectural research into spatial intelligence, AI-assisted accessibility, and human-computation frameworks to augment place-based exploration. DUO applies techniques from egocentric computer vision, contextual NLP, and interactive design systems to enhance the experiential understanding of real-world environments.
  DUO uses your camera to see what you see, engaging you with rich descriptions and interactive dialogue. Explore the world like never before.
</p>

---

## ✨ Features

- 📸 **Visual Recognition**: Uses the device camera and Google Gemini to identify landmarks, art, and objects.
- 🗣️ **Conversational AI**: Generates detailed, engaging descriptions based on your customizable personality and interest preferences.
- 🔊 **Voice Interaction**: Features Text-to-Speech (powered by ElevenLabs) and Speech-to-Text for hands-free follow-up questions.
- 👆 **Interactive Image Exploration**: Tap or long-press on any part of a captured image to ask specific questions about that area.
- 📓 **Trip Journals**: Save your discoveries as "highlights" (image + conversation) organized into trips you can revisit later.
- 🔧 **Personalized Experience**: Fine-tune the AI's personality (factual vs. creative), interests (art, history, nature, etc.), and voice speed.
- 📱 **PWA Ready**: Designed as a Progressive Web App for a native app-like experience on mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **AI & ML**:
  - Google Gemini 2.5 Flash (for vision and conversational chat)
  - ElevenLabs API (for realistic Text-to-Speech)
  - Web Speech API (for Speech-to-Text)
- **Backend**: Node.js & Express (acting as a secure proxy for API keys)
- **Deployment**: Docker, Google Cloud Run, Google Cloud Build, Google Secret Manager

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Google Cloud SDK (`gcloud` CLI)](https://cloud.google.com/sdk/docs/install) authenticated with your Google account

---

## 👨‍🏫 How to Clone and Share this App for Teaching and Continued Development

This project is fully functional on **Google Cloud Run** and can be cloned from this GitHub repo for local development or further collaboration with students.

---

### ✅ Step-by-Step Instructions

#### 1. 📦 Clone the GitHub Repository

```bash
git clone https://github.com/lborunda/duo.git
cd duo
```

#### 2. 📁 Install Dependencies

```bash
# Install frontend (React, Vite, Tailwind)
npm install

# Install backend (Node.js proxy server)
cd server
npm install
cd ..
```

#### 3. 🔑 Configure Environment Variables

Create two `.env` files based on the examples below.

**A. Root-level `.env` (for Vite frontend):**

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

**B. Backend `.env` (`./server/.env`):**

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

✅ You can use `.env.example` to share with students without exposing keys.

#### 4. ▶️ Run in Development Mode

```bash
npm run dev
```

This will start both:
- The **Vite frontend** on [http://localhost:5173](http://localhost:5173)
- The **Node backend proxy** on a local port for API calls

---

## ☁️ Deploying Back to Google Cloud Run

To allow students or collaborators to deploy their changes:

### Step 1: Secure API Keys

```bash
echo -n "your_key" | gcloud secrets create gemini_api_key --
echo -n "your_key" | gcloud secrets create elevenlabs_api_key --
```

### Step 2: Connect GitHub to Google Cloud Build

Set up a trigger:

- **Event**: Push to branch  
- **Branch Regex**: `^main$`  
- **Dockerfile location**: `./Dockerfile`

### Step 3: First Deploy Manually

```bash
gcloud run deploy my-app   --source=.   --update-secrets=GEMINI_API_KEY=gemini_api_key:latest,ELEVENLABS_API_KEY=elevenlabs_api_key:latest
```

After that, every `git push` to the `main` branch will trigger a deployment automatically.

---

## 🧰 Project Structure

```bash
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
```

---

## 👥 Sharing and Collaboration Tips

- Fork or clone the repo from: [github.com/lborunda/duo](https://github.com/lborunda/duo)
- Use GitHub Issues or Projects for assigning parts
- Students can open in **Codespaces**, **Replit**, or **VS Code Dev Containers**

---

## Author

**Luis Borunda**  
📧 [lborunda@vt.edu](mailto:lborunda@vt.edu)

Licensed under the [Apache License, Version 2.0](LICENSE).  
© 2025 Luis Borunda
