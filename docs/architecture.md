****
# QwizHub Architecture Overview

This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the QwizHub codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure

This section provides a high-level overview of QwizHub's directory and file structure, categorized by architectural layer and functional area.

```
[QwizHub Root]/
├── app/                     # Nuxt.js application source code
│   ├── components/         # Reusable Vue components
│   ├── pages/              # Application pages/routes
│   ├── layouts/            # Page layout templates
│   ├── middleware/         # Route middleware
│   ├── plugins/            # Nuxt plugins
│   ├── composables/        # Vue composables
│   ├── assets/             # Static assets (CSS, images, fonts)
│   └── utils/              # Frontend utility functions
├── server/                 # Server-side code and APIs
│   ├── api/                # API endpoints
│   │   └── auth/           # Authentication endpoints
│   ├── models/             # Database models (Sequelize)
│   ├── plugins/            # Server plugins (database connection)
│   ├── middleware/         # Server middleware
│   └── utils/              # Server utility functions
├── database/               # Database configuration and migrations
│   ├── migrations/         # Sequelize migrations
│   ├── seeders/            # Database seeders
│   └── config.cjs          # Database configuration
├── public/                 # Public static assets
│   ├── favicon.ico
│   └── robots.txt
├── docs/                   # Project documentation
├── .nuxt/                  # Generated Nuxt build files
├── node_modules/           # Dependencies
├── nuxt.config.ts          # Nuxt configuration
├── package.json            # Project dependencies and scripts
├── .sequelizerc            # Sequelize CLI configuration
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables
└── README.md               # Project setup guide
```

## 2. High-Level System Diagram

```
[Peneliti] <--> [Frontend (Nuxt.js)] <--> [Server API] <--> [PostgreSQL Database]
                       ↓                       ↓
                [AI Services]           [Payment Gateway]
                (Gemini/OpenAI)             (Midtrans)
                       ↑                       ↑
[Responden] <--> [Frontend (Nuxt.js)] <--> [Server API]
```

## 3. Core Components

### 3.1. Frontend Application

**Name:** QwizHub Web Application

**Description:** Full-stack Nuxt.js application providing user interface for both researchers and respondents. Handles survey creation, AI-powered questionnaire generation, marketplace interactions, and real-time dashboard analytics.

**Technologies:** 
- Nuxt.js 4.x (Vue.js 3.x framework)
- TypeScript
- Bootstrap 5.x for UI components
- @sidebase/nuxt-auth for authentication
- @nuxt/image for image optimization

**Deployment:** Cloud VPS (as per PRD)

### 3.2. Backend Services

#### 3.2.1. Authentication Service

**Name:** User Authentication & Authorization

**Description:** Handles user registration, login, session management for both researchers and respondents. Supports Google OAuth and credential-based authentication.

**Technologies:** NextAuth.js, bcryptjs, JWT

**Key Features:**
- Multi-provider authentication (Google OAuth + Credentials)
- Role-based access control (Peneliti vs Responden)
- Session management with JWT strategy
- Password hashing and validation

#### 3.2.2. Survey Management Service

**Name:** Survey & Questionnaire Management API

**Description:** Core service managing survey creation, questionnaire building, and project lifecycle management.

**Technologies:** Nuxt.js Server API, Sequelize ORM

**Key Features:**
- Survey project CRUD operations
- Questionnaire builder functionality
- Survey publishing and status management
- Response collection and aggregation

#### 3.2.3. AI Generator Service

**Name:** AI-Powered Questionnaire Generator

**Description:** Integrates with external AI APIs to generate survey questions based on research topics and objectives.

**Technologies:** Gemini API / OpenAI API integration

**Key Features:**
- Topic-based question generation
- Bias detection in questions
- Scale recommendation (Likert, Guttman, etc.)
- Question validation and editing

#### 3.2.4. Marketplace Matching Service

**Name:** Respondent Marketplace & Matching Engine

**Description:** Matches researchers with qualified respondents based on demographic criteria and project requirements.

**Technologies:** PostgreSQL with complex queries, Sequelize ORM

**Key Features:**
- Demographic-based matching algorithm
- Respondent pool management
- Qualification verification
- Quota management

#### 3.2.5. Payment & Incentive Service

**Name:** Payment Processing & Incentive Management

**Description:** Manages financial transactions, incentive distribution, and payment processing through integrated payment gateway.

**Technologies:** Midtrans Payment Gateway, Escrow system

**Key Features:**
- Escrow payment holding
- Manual withdrawal processing (batch)
- Service fee calculation (Rp. 5000 per project)
- Transaction logging and auditing

## 4. Data Stores

### 4.1. Primary Database

**Name:** QwizHub PostgreSQL Database

**Type:** PostgreSQL 

**Purpose:** Stores all application data including users, surveys, responses, transactions, and system metadata.

**Key Schemas/Tables:**
- users (researchers and respondents)
- accounts (OAuth account linking)
- sessions (authentication sessions)
- verification_tokens (email verification)
- surveys/projects (survey metadata)
- questions (individual questions)
- responses (survey responses)
- transactions (payment records)
- demographics (respondent profiles)

### 4.2. Session Storage

**Name:** JWT Session Management

**Type:** JWT tokens with database session fallback

**Purpose:** Manages user authentication state and session persistence.

## 5. External Integrations / APIs

**Gemini API / OpenAI API**
- Purpose: AI-powered questionnaire generation and bias detection
- Integration Method: REST API calls from server-side

**Midtrans Payment Gateway**
- Purpose: Payment processing for service fees and incentive management
- Integration Method: SDK integration with manual payout processing

**Google OAuth Provider**
- Purpose: Social authentication for users
- Integration Method: NextAuth.js provider integration

## 6. Deployment & Infrastructure

**Cloud Provider:** Cloud VPS (as specified in PRD)

**Key Services Used:** 
- VPS hosting for application server
- PostgreSQL database server
- Static file serving

**CI/CD Pipeline:** Git-based deployment workflow

**Monitoring & Logging:** Application-level logging, transaction audit trails

## 7. Security Considerations

**Authentication:** 
- NextAuth.js with JWT strategy
- Google OAuth2 integration
- Credential-based authentication with bcrypt hashing

**Authorization:** 
- Role-based access control (Researcher vs Respondent)
- Session validation middleware
- Protected API routes

**Data Encryption:** 
- HTTPS/TLS in transit
- Password hashing with bcrypt
- JWT token encryption

**Key Security Tools/Practices:**
- Input validation on all endpoints
- SQL injection prevention through Sequelize ORM
- XSS protection through Vue.js template sanitization
- Environment variable protection for secrets

## 8. Development & Testing Environment

**Local Setup Instructions:** See README.md for complete setup

**Key Commands:**
```bash
npm install                    # Install dependencies
npm run db:migrate            # Run database migrations
npm run dev                   # Start development server
npm run build                 # Build for production
```

**Testing Frameworks:** To be implemented (Jest recommended)

**Code Quality Tools:** TypeScript compiler, ESLint (to be configured)

## 9. Business Logic Implementation

### 9.1. Pay-Per-Use Model
- Service fee: Rp. 5000 per published survey
- Pre-payment required before survey publication
- Escrow system for respondent incentives

### 9.2. AI Integration Workflow
1. Researcher inputs topic and research objectives
2. System calls AI API (Gemini/OpenAI)
3. AI generates structured questionnaire draft
4. Researcher reviews and edits questions
5. System validates and saves final questionnaire

### 9.3. Matching Algorithm
1. Researcher defines respondent criteria (age, profession, location, education)
2. System queries respondent database with matching criteria
3. Qualified respondents see available surveys
4. First-come-first-serve basis until quota filled

## 10. Future Considerations / Roadmap

**Phase 1 (MVP - Current):**
- Basic survey creation and AI generation
- Simple matching and payment system
- Web-responsive interface

**Phase 2 (Planned):**
- Advanced analytics and reporting
- Mobile native applications
- Enhanced AI features (bias detection, advanced analysis)
- Multi-language support

**Phase 3 (Future):**
- White-label enterprise solutions
- Advanced statistical analysis automation
- Real-time collaboration features
- API marketplace for third-party integrations

## 11. Project Identification

**Project Name:** QwizHub - Platform Marketplace Penelitian Berbasis Web Terintegrasi AI Generatif

**Repository URL:** [To be updated with actual repository URL]

**Primary Contact/Team:** [To be updated with team information]

**Date of Last Update:** 2026-09-10

**Version:** 1.0 (MVP Development Phase)

## 12. Glossary / Acronyms

**QwizHub:** Platform name - combination of "Quiz" and "Hub"
**PRD:** Product Requirement Document
**MVP:** Minimum Viable Product  
**AI:** Artificial Intelligence (Gemini/OpenAI integration)
**Peneliti:** Researcher (Indonesian term)
**Responden:** Survey Respondent (Indonesian term)
**Sequelize:** PostgreSQL ORM for Node.js
**NextAuth:** Authentication library for Next.js/Nuxt.js
**Midtrans:** Indonesian payment gateway service
**JWT:** JSON Web Token for session management
**OAuth:** Open Authorization protocol
**API:** Application Programming Interface
**CRUD:** Create, Read, Update, Delete operations
