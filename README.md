# Where2Meet

It's like when2meet but where...

Full stack app to find optimal meeting locations based on description and locations of people.

## Built with:
- **Backend**: Flask (Python 3.9+) with lazy-loaded AI (sentence-transformers)
- **Frontend**: React 18 (Create React App)

## Quick Start

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./start.sh
```
Backend runs at **http://localhost:5001**

### 2. Frontend Setup
```bash
cd frontend
npm install
./start.sh
```
Frontend runs at **http://localhost:3000**


## API Endpoints
- `POST /api/events` → `{title}` → returns `{id, title, participants, final}`
- `POST /api/events/:id/locations` → `{name, lat, lng}` → adds participant
- `POST /api/events/:id/finalize` → returns `{event, center, venues}`
- `GET /health` → health check


Built with Flask + React
