# Glammy Salon Website

A complete salon booking website with modern React frontend and Django backend.

## Project Structure

```
salon-website/
├── backend/                 # Django Backend
│   ├── salon_backend/       # Django project
│   ├── salon/              # Main app
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/               # React Frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

Backend will be available at `http://localhost:8000/`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:5173/`

## Features

### Backend Features
- ✅ Django REST Framework API
- ✅ User authentication & authorization
- ✅ Service management
- ✅ Booking system with time slots
- ✅ Address management
- ✅ Payment integration
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Blog system
- ✅ Coupon system

### Frontend Features
- ✅ Modern React 18 application
- ✅ Responsive design with Tailwind CSS
- ✅ Service booking flow
- ✅ User authentication
- ✅ Shopping cart functionality
- ✅ Profile management
- ✅ Blog system
- ✅ Contact forms
- ✅ Arabic RTL support
- ✅ Mobile optimization

## Technology Stack

### Backend
- **Django 4.2+**: Web framework
- **Django REST Framework**: API framework
- **SQLite/PostgreSQL**: Database
- **Celery**: Task queue (optional)
- **Redis**: Caching (optional)

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Routing
- **Axios**: HTTP client
- **Context API**: State management

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Services
- `GET /api/services/` - List services
- `GET /api/categories/` - List categories

### Bookings
- `GET /api/bookings/` - User bookings
- `POST /api/bookings/` - Create booking
- `PUT /api/bookings/{id}/` - Update booking

### Addresses
- `GET /api/addresses/` - User addresses
- `POST /api/addresses/` - Add address
- `PUT /api/addresses/{id}/` - Update address

## Development

### Backend Development
```bash
cd backend
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

#### Backend
```bash
cd backend
python manage.py collectstatic
python manage.py migrate
```

#### Frontend
```bash
cd frontend
npm run build
```

## Deployment

### Backend Deployment
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Set up static file serving
4. Configure email settings
5. Deploy to your hosting service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API endpoints for production

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:pass@localhost/db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_TABBY_PUBLIC_KEY=your-tabby-key
VITE_TABBY_MERCHANT_CODE=your-merchant-code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in each folder

## Changelog

### Version 1.0.0
- Initial release
- Complete booking system
- User authentication
- Admin dashboard
- Mobile responsive design
- Arabic RTL support"# Salon-website-django-and-React" 
