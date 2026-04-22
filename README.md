# CV Builder - Professional CV Creation Application

A modern, full-stack web application for creating professional CVs with Node.js, Express, and Next.js.

## 📋 Features

- ✅ User authentication (JWT-based)
- ✅ Create, edit, and manage multiple CVs
- ✅ Multiple CV templates
- ✅ Export to PDF
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Multi-language support
- ✅ Cloud storage integration (AWS S3)

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging

### Frontend
- **Next.js** - React framework
- **React** - UI library
- **Redux** - State management
- **Axios** - HTTP client
- **SASS** - Styling

### Testing & Quality
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 12

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd cv-builder-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
# Create PostgreSQL database
createdb cv_builder_db

# Run migrations (when available)
npm run migrate
```

5. **Start development servers**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend on `http://localhost:3000`

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start both servers
npm run dev:server      # Start backend only
npm run dev:client      # Start frontend only

# Production
npm run build           # Build frontend
npm start              # Start production server

# Testing
npm test               # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:e2e      # Run E2E tests
npm run test:watch    # Watch mode

# Code Quality
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run security:audit # Check dependencies

# Database
npm run migrate        # Run migrations
npm run seed          # Seed database
```

## 📁 Project Structure

```
cv-builder-app/
├── src/
│   ├── server/              # Backend (Express)
│   │   ├── index.js        # Server entry point
│   │   ├── app.js          # Express app setup
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utilities
│   ├── client/              # Frontend (Next.js)
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # React components
│   │   ├── redux/          # Redux store
│   │   └── styles/         # SASS styles
│   ├── models/             # Database models
│   └── middleware/         # Shared middleware
├── config/                  # Configuration files
├── public/                  # Static files
├── tests/                   # Test files
├── .env                     # Environment variables
└── package.json            # Dependencies
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Rate limiting
- XSS protection (Helmet)
- CSRF protection (when implemented)

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### CV Endpoints
- `GET /api/cvs` - Get all CVs
- `POST /api/cvs` - Create new CV
- `GET /api/cvs/:id` - Get CV details
- `PUT /api/cvs/:id` - Update CV
- `DELETE /api/cvs/:id` - Delete CV
- `POST /api/cvs/:id/export/pdf` - Export to PDF

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm test -- --coverage
```

## 🐛 Debugging

### Backend Debugging
Set `LOG_LEVEL=debug` in `.env` and check logs in `./logs/combined.log`

### Frontend Debugging
Use React Developer Tools browser extension

## 🚀 Deployment

### Heroku Deployment
```bash
heroku login
heroku create cv-builder-app
git push heroku main
```

### Docker Deployment
```bash
docker build -t cv-builder .
docker run -p 5000:5000 -p 3000:3000 cv-builder
```

## 📚 Documentation

- [API Documentation](./docs/API.md) (Coming Soon)
- [Development Guide](./docs/DEVELOPMENT.md) (Coming Soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) (Coming Soon)
- [Contributing Guide](./CONTRIBUTING.md) (Coming Soon)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details

## 📧 Support

For support, email support@cvbuilder.com or open an issue in the repository

## 🎯 Roadmap

- [ ] OAuth2 integration (Google, GitHub)
- [ ] Advanced CV templates
- [ ] CV versioning
- [ ] Collaboration features
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] AI-powered CV suggestions

---

**Created with ❤️ by CV Builder Team**
