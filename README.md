# Mini-ERP: SaaS Manufacturing Platform (Shiv Furniture Works)

A full-stack, enterprise-grade SaaS Manufacturing ERP built with React 18, Vite 5, Tailwind CSS, Node.js, Express, and MongoDB.

---

## 1. System Architecture

```text
                     React Frontend (Vite + Tailwind)
                                     │
                                     ▼
                                api.js Client
                                     │
                              HTTP REST API (/api/v1)
                                     │
                              Express Backend
             ┌───────────────────────┼───────────────────────┐
           Auth                    RBAC                  Validation
      (cookie-parser)       (wildcard support)             (Zod)
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                             Business Services
             ┌───────────────────────┼───────────────────────┐
       Sales Service         Purchase Service      Manufacturing Service
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                             Procurement Engine
                          (MTS / MTO Decision Rule)
                                     │
                              Inventory Engine
                        (MongoDB Session Transactions)
                        ┌────────────┴────────────┐
                        │                         │
                  Stock Ledger                Audit Logs
                        │                         │
                        └────────────┬────────────┘
                                     │
                                  MongoDB
```

---

## 2. Key Business Workflows

### **A. Connected ERP Business Flow**
```text
Products ──► Sales Order ──► Inventory Check ──► MTS / MTO Decision
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
           Make To Stock (MTS)                                                 Make To Order (MTO)
      (Available Stock >= Requested)                                      (Shortage = Requested - Avail)
                      │                                                                   │
           Reserve Stock on Hand                                      ┌───────────────────┴───────────────────┐
                      │                                               ▼                                       ▼
             Deliver to Customer                                Purchase Shortage                       Manufacturing Shortage
                      │                                       (Auto Purchase Order)                     (Auto Mfg Order + BoM)
         Stock Ledger (SALES_DELIVERY)                                │                                       │
                      │                                         Receive Goods                           Execute Work Orders
                  Audit Log                                   (PURCHASE_RECEIPT)                              │
                                                                      │                                 Consume Components
                                                              Deliver to Customer                             │
                                                                                                        Produce Finished Goods
                                                                                                      (MANUFACTURING_PRODUCTION)
                                                                                                              │
                                                                                                         Deliver Order
```

### **B. Make To Stock (MTS)**
- When ordered quantity is available in free-to-use stock (`onHand - reserved`), the system immediately reserves stock without creating extraneous procurement orders.

### **C. Make To Order (MTO)**
- When shortage exists (`shortage > 0`):
  - If `procurementType === 'PURCHASE'`: Automatically creates a Purchase Order for the shortage amount.
  - If `procurementType === 'MANUFACTURING'`: Automatically creates a Manufacturing Order for the shortage amount, calculates BoM component requirements, and reserves raw materials.
  - When production is completed, components are atomically deducted (`MANUFACTURING_CONSUMPTION`) and finished goods are restocked (`MANUFACTURING_PRODUCTION`).

---

## 3. Seeded Accounts & Credentials

| Role | Employee ID | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Business Owner** | `OWNER01` | `arjun@shivfurniture.in` | `password123` | Full Administrative Access |
| **System Admin** | `ADMIN01` | `admin@shivfurniture.in` | `password123` | Full Administrative Access |
| **IT Support** | `ADMIN02` | `support@shivfurniture.in` | `password123` | Full Administrative Access |
| **Sales Reps** | `SALE01` - `SALE10` | `sale1@shivfurniture.in` | `password123` | Sales Orders, Customers, Products |
| **Procurement** | `PUR01` - `PUR10` | `pur1@shivfurniture.in` | `password123` | Purchase Orders, Suppliers, Products |
| **Manufacturing** | `MFG01` - `MFG10` | `mfg1@shivfurniture.in` | `password123` | Work Orders, BoMs, Production |
| **Inventory** | `INV01` - `INV05` | `inv1@shivfurniture.in` | `password123` | Stock Balances, Stock Adjustments |

---

## 4. How to Run Locally

### **1. Backend**
```bash
cd backend
npm install
npm run seed     # Seeds Shiv Furniture Works master data into MongoDB
npm start        # Starts Express on http://localhost:5000
```

### **2. Frontend**
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 5. Automated Test Suite

Run the full automated test suite covering Auth, RBAC wildcard matching, atomic inventory transactions, Make-To-Stock, Make-To-Order (Manufacturing & Purchase), and Multi-tenancy:

```bash
cd backend
npm test
```

Test results:
```text
✔ Authentication & User Resolution Tests
✔ Inventory Engine & Atomic Transaction Tests
✔ Multi-Tenancy & Data Isolation Tests
✔ RBAC Wildcard & Permission Matcher Tests
✔ End-to-End MTS and MTO Business Flow Tests
ℹ tests 14 | pass 14 | fail 0
```

---

## 6. API Reference (`/api/v1`)

- `POST /api/v1/auth/login`: Authenticate via Employee ID or Email.
- `POST /api/v1/auth/register`: Create a new user account.
- `GET /api/v1/auth/me`: Get current authenticated user context.
- `GET /api/v1/products`: List all products with real-time stock balances and free-to-use availability.
- `POST /api/v1/sales-orders`: Create Sales Order.
- `POST /api/v1/sales-orders/:id/confirm`: Confirm order, reserve stock, and auto-trigger MTO procurement.
- `POST /api/v1/sales-orders/:id/deliver`: Fulfill order, deduct inventory, and create Stock Ledger entry.
- `GET /api/v1/purchase-orders`: List Purchase Orders.
- `POST /api/v1/purchase-orders/:id/receive`: Receive goods and atomically restock inventory.
- `GET /api/v1/manufacturing-orders`: List Manufacturing Orders.
- `POST /api/v1/manufacturing-orders/:id/complete`: Atomically consume components and produce finished goods.
- `POST /api/v1/boms/calculate-requirements`: Calculate BoM component requirements for target batch quantity.
- `GET /api/v1/inventory/movements`: View full Stock Ledger movement audit history.
- `POST /api/v1/inventory/adjust`: Perform cycle count stock adjustment.
- `GET /api/v1/dashboard/metrics`: Real-time aggregations for KPIs and low stock alerts.
- `GET /api/v1/audit-logs`: Query audit trail of business operations.