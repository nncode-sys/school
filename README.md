# School Management System Backend

A Node.js backend application for managing multiple schools with role-based access control.

## Features

- User authentication with JWT
- Role-based access control (Admin and Client roles)
- School-specific data isolation
- PostgreSQL database integration
- Secure password hashing
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```bash
createdb sfms_db
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sfms_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=24h

# Bcrypt Configuration
SALT_ROUNDS=10
```