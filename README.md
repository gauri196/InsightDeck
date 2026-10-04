# InsightDeck

**Excel-to-Insights & Presentation Generator**

InsightDeck is an enterprise-grade platform that transforms raw spreadsheets into executive-level analytics, data-driven audit reports, and editable PowerPoint presentations.

---

## 🔄 Core Workflow

```
Excel Upload ──► Data Processing ──► Automated Analysis ──► Dashboard ──► Reports ──► Data-Aware Chatbot ──► Editable Presentation ──► PowerPoint (.pptx) Export
```

1. **Excel Upload**: Safe ingestion of `.xlsx` workbooks with user data strictly isolated.
2. **Data Processing**: Deterministic extraction of worksheets, column definitions, data types, missing value percentages, and duplicate detection.
3. **Automated Analysis**: Numerical aggregations, distributions, categorical frequencies, and data quality scoring.
4. **Dashboard**: Interactive executive summary cards, visual charts, category breakdowns, and audit status.
5. **Reports**: Quantitative KPI metrics and factual finding generation.
6. **Data-Aware Chatbot**: Conversational "Ask Your Data" assistant answering natural language questions based on active spreadsheet context.
7. **Editable Presentation**: Interactive 8-slide structured deck editor allowing real-time slide title, subtitle, and bullet editing.
8. **PowerPoint Export**: Genuine binary `.pptx` generation and direct browser download (`InsightDeck_Presentation.pptx`).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS Design System with warm nude/peach palette, glassmorphism, and responsive layout
- **State & Context**: React Context API for state and session management
- **Build Tool**: Vite

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn ASGI
- **Data Engine**: Pandas, OpenPyXL, NumPy
- **Presentation Engine**: python-pptx
- **Testing**: Pytest & HTTPX

### Authentication & Security
- **Client Auth**: Firebase Authentication (Email/Password REST API)
- **Server Verification**: Firebase Admin SDK (Cryptographic ID Token verification)
- **Data Isolation**: Per-user directory scoping using authenticated Firebase UID (`uploads/{uid}/`, `outputs/{uid}/`)

---

## ✨ Features

- **Excel File Upload**: Drag-and-drop or file selector supporting `.xlsx` workbooks with validation.
- **Automated Dataset Analysis**: Automatic summary of rows, columns, data types, and quality scoring.
- **KPI Generation**: Computed metrics (sums, averages, min/max values) for every numeric column.
- **Data Quality & Missing-Value Analysis**: Detection of null counts, empty fields, and duplicate rows.
- **Charts & Visualizations**: Interactive visual representations of distributions and category metrics.
- **Data-Aware Chatbot**: Contextual responses grounded strictly in the uploaded spreadsheet's factual data.
- **Presentation Editor**: Full in-browser deck editor supporting slide re-ordering, text edits, and bullet point customization.
- **PowerPoint Generation**: Automated layout mapping creating real 8-slide widescreen decks with native shapes and tables.
- **Real `.pptx` Download**: Direct download yielding `InsightDeck_Presentation.pptx`, fully compatible with Microsoft PowerPoint and LibreOffice.
- **User Authentication**: Secure signup, login, and session persistence backed by Firebase.

---

## 🚀 Getting Started

Follow these step-by-step instructions to run InsightDeck locally.

### Prerequisites
- **Node.js** (v18+ recommended) and **npm**
- **Python** (v3.10+ recommended) and **pip**
- A **Firebase Project** with Email/Password authentication enabled in the Firebase Console

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/InsightDeck.git
cd InsightDeck
```

### 2. Configure Environment Variables
Copy the example environment files:

```bash
# In the repository root
cp .env.example .env

# Or configure frontend and backend individually
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in your Firebase credentials in `frontend/.env`:
```ini
VITE_BACKEND_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Configure backend Firebase Admin in `backend/.env`:
```ini
PORT=8000
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/firebase-service-account.json
# or
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 3. Install & Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- The backend API will be available at: `http://localhost:8000`
- Interactive OpenAPI / Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 4. Install & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- The frontend web application will be available at: `http://localhost:5173`

---

## 🔒 Security Note

- **Firebase Authentication**: User accounts, passwords, and tokens are managed exclusively by Firebase.
- **No Password Storage**: User passwords are never stored, logged, or cached by this application.
- **Cryptographic Token Verification**: All protected backend endpoints verify the incoming Firebase ID token using the Firebase Admin SDK.
- **Strict Data Isolation**: User datasets and generated outputs are strictly scoped to the authenticated Firebase UID (`backend/uploads/{firebase_uid}/` and `backend/outputs/{firebase_uid}/`). One user cannot access or view another user's uploads or presentations.
- **Secret Protection**: All sensitive keys, tokens, and credentials reside in environment variables and are excluded from version control via `.gitignore`.
