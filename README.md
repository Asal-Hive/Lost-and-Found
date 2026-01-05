# System Design Project

This project consists of a Django backend and React/TypeScript frontend.

## Project Structure

```
.
├── Backend/          # Django REST API
├── Frontend/         # React + TypeScript + Vite
├── Figma/           # Figma components/prototypes
└── README.md
```

## Quick Start for Developers

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (IMPORTANT):**
   ```bash
   cp server/default.conf local.conf
   ```
   
   Then edit `local.conf` and fill in the sensitive values

5. Run migrations and start server:
   ```bash
   python manage.py migrate
   python manage.py runserver 8000
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Development URLs

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Django Admin: http://localhost:8000/admin

For more detailed setup instructions, see the README files in each subdirectory.