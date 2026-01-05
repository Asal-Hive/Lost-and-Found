# Backend Setup

## Prerequisites

- Python 3.12+
- pip

## Installation

1. **Create and activate a virtual environment:**

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment settings:**

   Copy the default configuration to create your local configuration file:

   ```bash
   cp server/default.conf local.conf
   ```

   Edit `local.conf` and fill in the sensitive values

4. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (optional):**

   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**

   ```bash
   python manage.py runserver 8000
   ```

   The API will be available at `http://localhost:8000`

## Development

- Admin panel: `http://localhost:8000/admin`
- API endpoints: `http://localhost:8000/api/`