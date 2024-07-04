# Library Management System

This is a Library Management System built using NestJS. The application allows users to manage books, authors, reviews, and borrowing activities. The system uses PostgreSQL as the database, Redis for caching, and employs JWT for authentication and role-based access control.

## Features

- User authentication and authorization
- CRUD operations for books, authors, and reviews
- Borrow and return books
- Role-based access control
- Caching with Redis
- Logging with Winston

## Technologies

- NestJS
- TypeORM
- PostgreSQL
- Redis
- JWT
- Class Validator
- Winston

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/YehorCherevko/library-app.git
   cd library-app
   ```

Install dependencies:

npm install

Set up the environment variables. Create a .env file in the root directory and add the following:

DB_HOST=your_postgresql_host
DB_PORT=your_postgresql_port
DB_USERNAME=your_postgresql_username
DB_PASSWORD=your_postgresql_password
DB_DATABASE=your_postgresql_database
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
PORT=3000

Running the Application
To start the application, run:

npm run start

Running in Development Mode
For development mode with hot-reloading, run:

npm run start:dev

API Endpoints
The application exposes several API endpoints for managing users, books, authors, reviews, and borrowing activities. Here are some key endpoints:

Auth

POST /auth/login - Login a user
POST /auth/register - Register a new user
POST /auth/register-admin - Register a new admin

Users

GET /users - Get all users (Admin only)
GET /users/:id - Get a single user by ID
PUT /users/:id - Update a user by ID (Admin only)
DELETE /users/:id - Delete a user by ID (Admin only)

Books

POST /books - Add a new book (Admin only)
GET /books - Get all books
GET /books/:id - Get a single book by ID
PUT /books/:id - Update a book by ID (Admin only)
DELETE /books/:id - Delete a book by ID (Admin only)

Authors

POST /authors - Add a new author (Admin only)
GET /authors - Get all authors
GET /authors/:id - Get a single author by ID
PUT /authors/:id - Update an author by ID (Admin only)
DELETE /authors/:id - Delete an author by ID (Admin only)

Reviews

POST /reviews - Add a new review
GET /reviews/:bookId - Get reviews for a specific book

Borrow

POST /borrow - Borrow a book
DELETE /borrow/:id - Return a borrowed book
