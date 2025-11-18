# 🍽️ SmartMenu AI - Intelligent Restaurant Management System

[![CI/CD Pipeline](https://github.com/samiiraqi/SmartMenu-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/samiiraqi/SmartMenu-AI/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade microservices architecture for restaurant management, featuring AI-powered chatbot assistance, secure authentication, payment processing, and real-time analytics.

---

## 🌟 **Features**

### **Core Capabilities**
- 🤖 **AI Chatbot** - Natural language assistant for menu inquiries and order assistance
- 🔐 **JWT Authentication** - Secure user management with role-based access control
- 💳 **Payment Processing** - Transaction handling with multiple payment methods
- 📧 **Smart Notifications** - Email and SMS notifications for order updates
- 📊 **Business Analytics** - Real-time insights into sales and popular items
- 🍕 **Menu Management** - Complete CRUD operations for restaurant menu
- 🛒 **Order Management** - End-to-end order lifecycle tracking

### **Technical Highlights**
- ✅ **7 Microservices** - Fully independent, scalable services
- ✅ **6 Separate Databases** - Database per service pattern
- ✅ **Docker Orchestration** - One-command deployment
- ✅ **90%+ Test Coverage** - Comprehensive testing suite
- ✅ **CI/CD Pipeline** - Automated testing and security scanning
- ✅ **RESTful APIs** - 40+ documented endpoints

---

## 🏗️ **Architecture**
```
┌─────────────────────────────────────────────────────┐
│              SmartMenu AI System                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │   AI Chatbot Service (Port 8003) 🤖         │ │
│  │   - Natural language processing              │ │
│  │   - Context-aware conversations              │ │
│  │   - Menu recommendations                     │ │
│  └────────────┬─────────────────────────────────┘ │
│               │ Communicates with ↓               │
│  ┌────────────┴─────────────────────────────────┐ │
│  │   Menu Service (Port 8001) 🍕               │ │
│  │   - CRUD operations                          │ │
│  │   - Category management                      │ │
│  │   - 93% test coverage                        │ │
│  └────────────┬─────────────────────────────────┘ │
│               │ Provides data to ↓                │
│  ┌────────────┴─────────────────────────────────┐ │
│  │   Order Service (Port 8002) 🛒              │ │
│  │   - Order creation & tracking                │ │
│  │   - Status management                        │ │
│  │   - Order history                            │ │
│  └────────────┬─────────────────────────────────┘ │
│               │ Triggers ↓                        │
│  ┌────────────┴─────────────────────────────────┐ │
│  │   Payment Service (Port 8005) 💳            │ │
│  │   - Transaction processing                   │ │
│  │   - Payment validation                       │ │
│  │   - Refund handling                          │ │
│  └────────────┬─────────────────────────────────┘ │
│               │ Notifies via ↓                    │
│  ┌────────────┴─────────────────────────────────┐ │
│  │   Notification Service (Port 8006) 📧       │ │
│  │   - Email notifications                      │ │
│  │   - SMS alerts                               │ │
│  │   - Order confirmations                      │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │   User Service (Port 8004) 🔐               │ │
│  │   - JWT authentication                       │ │
│  │   - User management                          │ │
│  │   - Role-based access                        │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │   Analytics Service (Port 8007) 📊          │ │
│  │   - Sales reports                            │ │
│  │   - Popular items tracking                   │ │
│  │   - Business intelligence                    │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │        PostgreSQL (6 Databases)              │ │
│  │  - Separate database per service             │ │
│  │  - Persistent volumes                        │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Docker & Docker Compose
- Git

### **One-Command Deployment**
```bash
# Clone the repository
git clone https://github.com/samiiraqi/SmartMenu-AI.git
cd SmartMenu-AI

# Start all services
docker compose up -d

# Initialize databases
docker compose exec menu-service python -m app.config.init_db
docker compose exec order-service python -m app.config.init_db
docker compose exec chatbot-service python -m app.config.init_db
docker compose exec user-service python -m app.config.init_db
docker compose exec payment-service python -m app.config.init_db
docker compose exec notification-service python -m app.config.init_db

# Verify all services are healthy
curl http://localhost:8001/health  # Menu Service
curl http://localhost:8002/health  # Order Service
curl http://localhost:8003/health  # Chatbot Service
curl http://localhost:8004/health  # User Service
curl http://localhost:8005/health  # Payment Service
curl http://localhost:8006/health  # Notification Service
curl http://localhost:8007/health  # Analytics Service
```

**That's it! 🎉 All services are now running!**

---

## 📡 **API Documentation**

Each service provides interactive API documentation via Swagger UI:

- **Menu Service**: http://localhost:8001/docs
- **Order Service**: http://localhost:8002/docs
- **Chatbot Service**: http://localhost:8003/docs
- **User Service**: http://localhost:8004/docs
- **Payment Service**: http://localhost:8005/docs
- **Notification Service**: http://localhost:8006/docs
- **Analytics Service**: http://localhost:8007/docs

---

## 🧪 **Testing**

### **Run Tests**
```bash
# Menu Service
cd services/menu-service
source venv/bin/activate
pytest

# Order Service
cd services/order-service
source venv/bin/activate
pytest
```

### **Test Coverage**
- Menu Service: **93% coverage** (10 tests)
- Order Service: **90% coverage** (9 tests)

---

## 💡 **Usage Examples**

### **1. Register a User**
```bash
curl -X POST http://localhost:8004/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "username": "customer123",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

### **2. Login & Get Token**
```bash
curl -X POST http://localhost:8004/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer123",
    "password": "SecurePass123"
  }'
```

### **3. Chat with AI Assistant**
```bash
curl -X POST http://localhost:8003/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What pizzas do you have?",
    "customer_name": "John"
  }'
```

### **4. Create an Order**
```bash
curl -X POST http://localhost:8002/api/v1/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "table_number": 5,
    "items": [
      {
        "menu_item_id": 1,
        "quantity": 2
      }
    ]
  }'
```

### **5. Process Payment**
```bash
curl -X POST http://localhost:8005/api/v1/payments/ \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "user_id": 1,
    "amount": 29.99,
    "payment_method": "credit_card"
  }'
```

### **6. Get Analytics**
```bash
curl http://localhost:8007/api/v1/analytics/summary
```

---

## 🛠️ **Technology Stack**

### **Backend**
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Pydantic** - Data validation
- **Python-Jose** - JWT tokens
- **Passlib** - Password hashing

### **AI/ML**
- **Natural Language Processing** - Rule-based chatbot
- **Context Management** - Conversation tracking

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

### **Testing**
- **pytest** - Testing framework
- **pytest-cov** - Coverage reporting
- **pytest-asyncio** - Async testing

### **Code Quality**
- **Black** - Code formatting
- **Flake8** - Linting
- **isort** - Import sorting
- **Bandit** - Security scanning

---

## 📊 **Project Statistics**
```
📦 Services: 7
🐳 Docker Containers: 8
💾 Databases: 6
🧪 Tests: 19
📝 Lines of Code: 5,000+
📡 API Endpoints: 40+
✅ Test Coverage: 90%+
🔒 Security Scans: Automated
```

---

## 🔐 **Security Features**

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Automated security scanning (Bandit)
- ✅ Non-root Docker users
- ✅ Environment variable secrets

---

## 🗂️ **Project Structure**
```
SmartMenu-AI/
├── services/
│   ├── menu-service/          # Menu management
│   ├── order-service/         # Order processing
│   ├── chatbot-service/       # AI chatbot
│   ├── user-service/          # Authentication
│   ├── payment-service/       # Payment processing
│   ├── notification-service/  # Notifications
│   └── analytics-service/     # Business analytics
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── docker-compose.yml        # Orchestration
└── README.md                 # Documentation
```

---

## 🚦 **CI/CD Pipeline**

Automated workflows on every commit:
- ✅ Unit tests execution
- ✅ Code quality checks (Flake8, Black)
- ✅ Security scanning (Bandit)
- ✅ Code coverage reporting
- ✅ Docker image builds

---

## 🌐 **Deployment**

### **Local Development**
```bash
docker compose up -d
```

### **Production Deployment**
Ready for deployment to:
- AWS ECS/EKS
- Google Cloud Run
- Azure Container Instances
- Kubernetes clusters

---

## 📈 **Future Enhancements**

- [ ] Frontend (React/Vue.js)
- [ ] Kubernetes deployment manifests
- [ ] Redis caching layer
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Real-time WebSocket notifications
- [ ] Advanced AI with OpenAI GPT integration
- [ ] Mobile app integration
- [ ] Grafana monitoring dashboards

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 **Author**

**Sami Iraqi**

- GitHub: [@samiiraqi](https://github.com/samiiraqi)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/your-profile)

---

## 🙏 **Acknowledgments**

- FastAPI for the amazing framework
- Docker for containerization
- PostgreSQL for reliable database
- The open-source community

---

## ⭐ **Show Your Support**

Give a ⭐️ if this project helped you learn microservices architecture!

---

<div align="center">

**Built with ❤️ using Python, FastAPI, and Docker**

[Report Bug](https://github.com/samiiraqi/SmartMenu-AI/issues) · [Request Feature](https://github.com/samiiraqi/SmartMenu-AI/issues)

</div>
