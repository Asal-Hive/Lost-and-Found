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

3. **Configure environment variables:**
   
   Create `.env.development` for local development:
   ```bash
   echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env.development
   ```
   
   Create `.env.production` for production builds:
   ```bash
   echo "VITE_API_BASE_URL=https://yourdomain.com" > .env.production
   ```
   
   > **Note:** Replace `https://yourdomain.com` with your actual production domain.
   > You can also copy from `.env.example` and modify as needed.

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
   The production build will use the URL from `.env.production` automatically.

## Development URLs

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Django Admin: http://localhost:8000/admin

## Docker Deployment

### First-time Setup on Server

1. Install Docker and Docker Compose on your server:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

2. Update nginx config on server:
```bash
sudo cp nginx-server.conf /etc/nginx/sites-enabled/beehive
sudo nginx -t
sudo systemctl reload nginx
```

3. Stop old systemd service:
```bash
sudo systemctl stop beehive
sudo systemctl disable beehive
```

4. Start Docker containers:
```bash
docker-compose up -d --build
```

### Regular Usage

```bash
# Start both frontend and backend
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Application will be available at:
- Frontend: http://localhost
- Backend: http://localhost:8000

GitHub Actions will automatically deploy when you push to main.

## Environment Variables

### Backend
Configuration is managed through `local.conf` (see Backend Setup step 4).

### Frontend
Environment variables are set in `.env.development` and `.env.production`:

- **`.env.development`** - Used by `npm run dev`
  - `VITE_API_BASE_URL`: Backend URL for development (default: `http://127.0.0.1:8000`)

- **`.env.production`** - Used by `npm run build`
  - `VITE_API_BASE_URL`: Backend URL for production (e.g., `https://yourdomain.com`)

> **Important:** These files are gitignored. Make sure to create them after cloning the repository.

For more detailed setup instructions, see the README files in each subdirectory.