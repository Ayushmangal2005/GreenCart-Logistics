# GreenCart Logistics - Delivery Simulation & KPI Dashboard

A comprehensive full-stack logistics management system that simulates delivery operations and provides real-time KPI analytics. Built with Node.js, Express, MongoDB, and React.

## 🚀 Project Overview

GreenCart Logistics is a production-ready application that helps logistics companies optimize their delivery operations through intelligent simulation and data-driven insights. The system implements complex business rules for delivery optimization, driver fatigue management, and profit maximization.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

### Infrastructure
- **Frontend Deployment**: Vercel/Netlify
- **Backend Deployment**: Render/Railway
- **Database**: MongoDB Atlas
- **Version Control**: Git

## 🏗️ Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app configuration
│   │   ├── server.js               # Server entry point
│   │   ├── routes/                 # API route definitions
│   │   │   ├── authRoutes.js       # Authentication endpoints
│   │   │   ├── driversRoutes.js    # Driver CRUD operations
│   │   │   ├── routesRoutes.js     # Route CRUD operations
│   │   │   ├── ordersRoutes.js     # Order CRUD operations
│   │   │   └── simulationRoutes.js # Simulation endpoints
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── Driver.js           # Driver data model
│   │   │   ├── Route.js            # Route data model
│   │   │   ├── Order.js            # Order data model
│   │   │   └── SimulationResult.js # Simulation results model
│   │   ├── services/               # Business logic
│   │   │   └── simulationService.js # Core simulation engine
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── errorHandler.js     # Global error handling
│   │   │   └── validateRequest.js  # Request validation
│   │   ├── loaders/                # Data loading utilities
│   │   │   └── seedData.js         # Sample data generator
│   │   └── tests/                  # Test suites
│   │       ├── simulation.test.js  # Simulation logic tests
│   │       ├── auth.test.js        # Authentication tests
│   │       └── crud.test.js        # CRUD operation tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main application component
│   │   ├── contexts/               # React contexts
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx           # Authentication page
│   │   │   ├── Dashboard.jsx       # KPI dashboard
│   │   │   ├── Simulation.jsx      # Simulation interface
│   │   │   ├── Drivers.jsx         # Driver management
│   │   │   ├── Routes.jsx          # Route management
│   │   │   └── Orders.jsx          # Order management
│   │   ├── components/             # Reusable components
│   │   │   ├── Layout.jsx          # App layout wrapper
│   │   │   └── Charts/             # Chart components
│   │   │       ├── KPICards.jsx    # KPI metric cards
│   │   │       ├── DeliveryChart.jsx # Delivery performance charts
│   │   │       ├── FuelCostChart.jsx # Fuel cost breakdown
│   │   │       └── SimulationHistory.jsx # Historical data
│   │   └── api/                    # API client services
│   │       ├── apiClient.js        # Axios configuration
│   │       ├── authAPI.js          # Authentication API calls
│   │       ├── simulationAPI.js    # Simulation API calls
│   │       └── crudAPI.js          # CRUD API calls
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB instance
- Git

### Environment Variables

Create `.env` files in the backend directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/greencart-logistics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd greencart-logistics
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Seed Sample Data**
```bash
cd backend
npm run seed
```

The application will be available at:
- Frontend: https://green-cart-logistics-pearl.vercel.app/
- Backend API: https://greencart-logistics-vdss.onrender.com/

## 🎯 Core Features

### 1. Authentication System
- Manager registration and login
- JWT-based authentication
- Protected routes and API endpoints
- Password hashing with bcrypt

### 2. Delivery Simulation Engine
The simulation implements sophisticated business rules:

#### **Company Rules Implementation**
- **Late Delivery Penalty**: ₹50 penalty if delivery time > (base route time + 10 minutes)
- **Driver Fatigue Rule**: 30% slower delivery speed if driver worked >8 hours yesterday
- **High-Value Bonus**: 10% bonus for orders >₹1000 delivered on time
- **Fuel Cost Calculation**: 
  - Base: ₹5/km per route
  - High traffic surcharge: +₹2/km
- **Efficiency Score**: (On-time Deliveries / Total Deliveries) × 100

#### **Simulation Parameters**
- Available drivers (1-50)
- Route start time (HH:MM format)
- Maximum hours per driver per day (1-16)

#### **Simulation Output**
- Total profit and efficiency metrics
- Fuel cost breakdown by traffic level
- Per-order results with penalties and bonuses
- Historical simulation tracking

### 3. CRUD Management
- **Drivers**: Name, shift hours, 7-day work history, fatigue tracking
- **Routes**: Route ID, distance, traffic level, base time, description
- **Orders**: Order ID, value, assigned route, delivery timestamp, customer info

### 4. KPI Dashboard
- Real-time metrics visualization
- Interactive charts (delivery performance, fuel costs)
- Simulation history tracking
- Responsive design for all devices

## 🧪 Testing

### Running Tests
```bash
cd backend
npm test
```

### Test Coverage
- **Simulation Logic**: Business rules validation, fatigue calculation, profit computation
- **Authentication**: Login/register flows, token validation
- **CRUD Operations**: Data validation, error handling
- **API Endpoints**: Request/response validation, error scenarios

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=your-backend-url`

### Backend Deployment (Render)
1. Connect your repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables from `.env.example`

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Create database user with read/write permissions
3. Whitelist your deployment IP addresses
4. Use connection string in your environment variables

## 📊 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new manager account.

**Request:**
```json
{
  "name": "John Manager",
  "email": "john@company.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Manager registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "manager": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@company.com",
      "name": "John Manager",
      "role": "manager"
    }
  }
}
```

#### POST `/api/auth/login`
Authenticate manager and receive JWT token.

**Request:**
```json
{
  "email": "john@company.com",
  "password": "securepassword123"
}
```

### Simulation Endpoint

#### POST `/api/simulate`
Run delivery simulation with specified parameters.

**Request:**
```json
{
  "availableDrivers": 5,
  "routeStartTime": "09:00",
  "maxHoursPerDriverPerDay": 8
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Simulation completed successfully",
  "data": {
    "timestamp": "2025-01-12T10:00:00.000Z",
    "totalProfit": 12345.50,
    "totalOrders": 50,
    "onTimeDeliveries": 42,
    "lateDeliveries": 8,
    "efficiencyScore": 84,
    "fuelCostBreakdown": {
      "totalFuelCost": 2345,
      "byTrafficLevel": {
        "Low": 500,
        "Medium": 800,
        "High": 1045
      }
    },
    "perOrderResults": [
      {
        "orderId": "ORD001",
        "assignedDriverId": "507f1f77bcf86cd799439011",
        "isLate": false,
        "deliveryTimeMinutes": 35,
        "profit": 145.5,
        "penalties": 0,
        "bonus": 10,
        "fuelCost": 45
      }
    ]
  }
}
```

### CRUD Endpoints

All CRUD endpoints follow RESTful conventions:
- GET `/api/{resource}` - List all items
- GET `/api/{resource}/:id` - Get specific item
- POST `/api/{resource}` - Create new item
- PUT `/api/{resource}/:id` - Update existing item
- DELETE `/api/{resource}/:id` - Delete item

**Available Resources:**
- `/api/drivers` - Driver management
- `/api/routes` - Route management  
- `/api/orders` - Order management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🎉 Acknowledgments

- Built with modern web technologies and best practices
- Implements real-world logistics business rules
- Designed for scalability and maintainability
- Production-ready with comprehensive testing
