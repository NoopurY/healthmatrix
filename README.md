# 🏥 HealthMatrix AI — Healthcare Analytics & Guidance Platform

A production-grade, full-stack healthcare analytics platform built with **Next.js 15 (App Router)** and a **Python FastAPI ML microservice**.

## ✨ Features

| Feature | Technology |
|---------|-----------|
| CSV health data analysis | Next.js API Routes + csv-parse |
| ECG image/PDF upload & analysis | Custom ECG processor + feature extraction |
| Normal distribution curves | Custom statistics library |
| Pearson & Spearman correlation heatmap | lib/statistics.ts |
| Bayes theorem disease prediction | lib/statistics.ts |
| Linear regression trend analysis | lib/statistics.ts |
| Logistic Regression risk scoring | Python FastAPI ml-service |
| Feature importance visualization | Recharts horizontal bar |
| Risk gauge speedometer | HTML5 Canvas |
| PDF export | jsPDF + html2canvas |
| Historical report storage | MongoDB + Mongoose |
| Dark glassmorphism UI | Tailwind CSS + custom CSS |
| Smooth animations | Framer Motion |

---

## 📁 Project Structure

```
healthmatrix/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── dashboard/page.tsx      # Analytics dashboard
│   ├── upload/page.tsx         # File upload center
│   ├── reports/page.tsx        # Historical reports
│   └── api/
│       ├── upload/route.ts     # File upload handler
│       ├── analyze/route.ts    # Analysis orchestrator
│       ├── reports/route.ts    # Report listing
│       └── export/route.ts     # PDF export helper
├── components/
│   ├── layout/Navbar.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── RiskAlert.tsx
│   ├── charts/
│   │   ├── HeartRateTrend.tsx
│   │   ├── DistributionCurve.tsx
│   │   ├── CorrelationHeatmap.tsx
│   │   ├── RiskGauge.tsx
│   │   ├── FeatureImportance.tsx
│   │   └── ECGWaveform.tsx
│   └── upload/
│       ├── CSVDropzone.tsx
│       └── ECGDropzone.tsx
├── lib/
│   ├── statistics.ts           # All statistical implementations
│   ├── csvParser.ts            # CSV parsing and analysis
│   ├── ecgProcessor.ts         # ECG feature extraction
│   ├── mlClient.ts             # ML service HTTP client
│   └── mongodb.ts              # MongoDB singleton connection
├── models/
│   └── Report.ts               # Mongoose schema
├── ml-service/                 # Python FastAPI microservice
│   ├── main.py
│   ├── models/
│   │   ├── risk_model.py       # LR + ensemble risk predictor
│   │   └── ecg_analyzer.py     # ECG anomaly detection
│   ├── utils/
│   │   ├── preprocessing.py
│   │   └── feature_importance.py
│   └── requirements.txt
├── public/
│   ├── uploads/                # Uploaded files (gitignored)
│   └── samples/
│       ├── sample_heart_data.csv
│       └── sample_ecg.png
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17+ and npm
- **Python** 3.10+
- **MongoDB** (local or Atlas) — optional, app works without it

---

### 1. Clone & Install (Next.js)

```bash
# Install Node.js dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# MONGODB_URI=mongodb://localhost:27017/healthcare
# ML_SERVICE_URL=http://localhost:8000
```

### 3. Run Next.js App

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

---

### 4. Run ML Microservice (Optional but Recommended)

```bash
cd ml-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

ML service available at **http://localhost:8000**

> **Note:** If the ML service is not running, the app automatically falls back to a built-in heuristic risk model. All statistical features (distributions, Bayes, correlation) work without the ML service.

---

## 📊 Statistical Implementation Details

### 1. Normal Distribution (Heart Rate Analysis)
```
PDF(x) = (1 / σ√2π) × e^(-(x-μ)²/2σ²)
```
Visualized as an area chart with ±1σ and ±2σ reference lines.

### 2. Poisson Distribution
```
P(X=k) = (λᵏ × e^-λ) / k!
```
Used to model event-based cardiac irregularities.

### 3. Bayes Theorem
```
P(Disease | Positive) = P(Positive | Disease) × P(Disease) / P(Positive)
```
Computes posterior disease probability from sensitivity, specificity, and prevalence.

### 4. Pearson Correlation Coefficient
```
r = Σ(xᵢ-x̄)(yᵢ-ȳ) / √[Σ(xᵢ-x̄)² × Σ(yᵢ-ȳ)²]
```
Full 8×8 correlation matrix shown as color-coded heatmap.

### 5. Linear Regression
```
ŷ = β₀ + β₁x
```
Used to trend age vs. heart rate, age vs. systolic BP, age vs. cholesterol.

---

## 🤖 ML Risk Prediction

| Risk Level | Score Range | Description |
|------------|-------------|-------------|
| 🟢 Low | 0–34 | Minimal cardiovascular risk |
| 🟡 Medium | 35–64 | Moderate risk, lifestyle changes advised |
| 🔴 High | 65–100 | High risk, medical attention required |

**Model factors (by importance):**
1. Systolic Blood Pressure (25%)
2. Cholesterol (20%)
3. Smoking (18%)
4. Age (15%)
5. Blood Sugar (12%)
6. BMI, Exercise Hours, Heart Rate (10%)

---

## 📋 Sample CSV Format

```csv
patient_id,age,heart_rate,systolic_bp,diastolic_bp,cholesterol,blood_sugar,bmi,smoking,exercise_hours
P001,55,82,145,92,235,115,29.5,1,1.5
P002,42,71,118,76,188,95,24.1,0,4.0
```

A 100-row sample is available at `public/samples/sample_heart_data.csv`.

---

## 🫀 ECG Analysis

Upload any ECG image (PNG/JPG/BMP) or PDF. The system will:
1. Extract metadata for feature simulation
2. Generate realistic ECG waveform visualization
3. Detect cardiac anomalies:
   - Tachycardia / Bradycardia
   - First/Second Degree AV Block
   - Wide QRS (Bundle Branch Block)
   - Prolonged QT Interval
   - Irregular RR intervals (Atrial Fibrillation risk)
4. Provide clinical recommendations

---

## 📦 Dependencies

### Next.js
```
next, react, react-dom, mongoose, recharts, framer-motion,
axios, csv-parse, jspdf, html2canvas, lucide-react, d3, uuid, date-fns
```

### Python ML Service
```
fastapi, uvicorn, pydantic, numpy, scikit-learn, pandas
```

---

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/healthcare   # MongoDB connection string
ML_SERVICE_URL=http://localhost:8000              # Python ML service URL
NEXT_PUBLIC_APP_URL=http://localhost:3000          # App base URL
UPLOAD_DIR=./public/uploads                        # Upload directory
MAX_FILE_SIZE_MB=10                               # Max upload size
NODE_ENV=development
```

---

## 🏗️ Production Deployment

### Next.js on Vercel
```bash
npm run build
# Deploy to Vercel / Railway / Render
```

### ML Service on Railway / Heroku / Fly.io
```bash
cd ml-service
# Add Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### MongoDB Atlas
Replace `MONGODB_URI` with your Atlas connection string.

---

## 📸 Screenshots

The platform features:
- 🌑 **Dark glassmorphism UI** with neon cyan/blue accents
- 📈 **Live trend charts** for heart rate, BP, cholesterol
- 🌡️ **Risk gauge speedometer** with animated needle
- 🔥 **Correlation heatmap** with color-coded coefficients  
- 📉 **Normal distribution curves** with sigma bands
- 🤖 **Feature importance bars** from ML model
- 💓 **ECG waveform** with anomaly highlighting

---

## 📄 License

MIT License — Built for production-grade healthcare analytics demonstration.

> ⚠️ **Medical Disclaimer:** This platform is for educational and analytical demonstration purposes only. It does not constitute medical advice. Always consult qualified healthcare professionals for medical decisions.
#   h e a l t h m a t r i x  
 