# TeoSCRIBE 🎙️

**TeoSCRIBE** is a mobile-friendly web application that transcribes **Teochew speech** into **Chinese** or **English text**.  
It is designed to preserve the Teochew dialect, a largely oral language without a standardized writing system by making it easier for younger generations to learn and practice.



- **Teochew is an endangered dialect** with no formal writing system.  
- Younger generations often struggle to learn, putting its cultural preservation at risk.  
- TeoSCRIBE bridges the **oral–written gap** by providing **speech-to-text transcription** and **translation**, enabling structured learning and everyday communication:contentReference[oaicite:0]{index=0}.

---

## Features

- **Speech-to-Text (ASR)**: Transcribe Teochew audio into Chinese or English text.  
- **Bilingual Support**: Chinese and English outputs using Google Cloud Translate.  
- **Mobile Web App**: Simple, accessible UI for older and younger generations alike.  
- **User-Friendly Design**: Large buttons, clean layout, and minimal steps for recording.  

---

## 🛠Technical Overview

### 1. Data Preparation
- **Sources**: Subtitled Teochew videos.  
- **Pipeline**:  
  - Voice Activity Detection (VAD) → Segmented audio clips  
  - OCR (Optical Character Recognition) → Extract subtitles  
  - Noise reduction + image enhancement for better alignment:contentReference[oaicite:2]{index=2}.

### 2. Model Training
- **Teacher Model**  
  - Fine-tuned Whisper-Small with **LoRA (Low-Rank Adaptation)**  
  - Augmented with semantic-aware loss (Sentence-BERT cosine distance)  
  - Achieved significant improvement in contextual transcription:contentReference[oaicite:3]{index=3}.  

- **Student Model**  
  - **Self-training** with unlabelled data + confidence filtering  
  - Improved stability and captured underrepresented words (e.g., “大城市”, “定居”):contentReference[oaicite:4]{index=4}.

### 3. Web Application
- **Frontend**: React + Vite, styled with TailwindCSS + DaisyUI  
- **Audio Recording**: RecordRTC, ffmpeg  
- **Backend**: FastAPI + Uvicorn, hosting fine-tuned models  
- **Translation**: Google Cloud Translate:contentReference[oaicite:5]{index=5}.  


---

## 📦 Installation & Usage

### Prerequisites
- Node.js (v18+ recommended)  
- Python 3.10+  
- Google Cloud API key (for translation service)  

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
