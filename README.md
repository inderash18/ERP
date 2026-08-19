# Mini-ERP: SaaS Manufacturing Platform

A full-stack SaaS Manufacturing ERP built with React, Vite, Node.js, Express, and MongoDB.

## Features
- **Multi-Tenant Architecture**: Strict data isolation per organization.
- **Inventory Engine**: Atomic transactions, stock ledgers, and reservations.
- **Order Management**: Sales, Purchase, and Manufacturing Orders.
- **Master Data**: Products, Categories, Customers, Vendors, Work Centers, Bills of Materials.

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on default port 27017, or update the connection string)

## How to Run Locally

You will need to run both the backend server and the frontend development server simultaneously.

### 1. Start the Backend
Open a terminal and run the following commands:
```bash
cd backend
npm install
npm start
```
*The backend server will start on http://localhost:5000*

### 2. Start the Frontend
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite server will start (usually on http://localhost:5173).*

## Authentication for Testing
To quickly get an access token for testing, you can hit the demo registration endpoint which automatically seeds a demo tenant and an Admin user:
```bash
POST http://localhost:5000/api/v1/auth/register-demo
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "password123",
  "companyName": "Demo Corp"
}
```
This will set an HTTP-Only cookie and return a JWT token you can use for subsequent requests.