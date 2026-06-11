# AI Photobooth

A full-stack web application that allows users to capture a photo of themselves and seamlessly transform into various personas (e.g., Business Professional, Bride, Police Officer) while preserving their facial identity.

## Features
- **Identity Preservation**: Uses advanced AI models (Replicate InstantID) to perfectly preserve the user's face while changing outfits and backgrounds.
- **Template Selection**: Choose from multiple built-in styles for both men and women.
- **Real-time Camera**: Integrated webcam support for taking photos instantly.
- **QR Code Generation**: Users can scan a QR code to download their generated portrait directly to their phones.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI Integration**: Hugging Face Spaces (`tonyassi/face-swap`) - 100% Free!
- **Image Storage**: Cloudinary

## Setup & Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)
- Accounts for Hugging Face and Cloudinary.

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development

# AI API Tokens
HUGGING_FACE_API_TOKEN=hf_your_huggingface_token_here

# Cloudinary - Image storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-photobooth

# App
SESSION_SECRET=your_secret_key
```

### 3. Running the App locally
To install dependencies and start both the frontend and backend servers concurrently:

```bash
# In the root directory:
npm run build
npm start
```

*(Alternatively, run `npm run dev` in both the `frontend` and `backend` directories).*

## Production Deployment (Render)
This project is configured to be deployed as a **Unified Web Service** on Render.
1. Create a Blueprint on Render.com.
2. Connect this GitHub repository.
3. Fill in the environment variables when prompted.
4. Render will automatically build the React frontend and serve it via the Node.js backend using the configurations in `render.yaml` and `package.json`.
