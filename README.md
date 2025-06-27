# MoneyShield (JCSC Version) API

RESTful modular API for managing users, transactions, and personal finance.

**Interactive API documentation available at `/api-docs` via Swagger UI.**


## 🚀 Features

- Modular architecture (controllers, services, DAOs)
- MySQL database connection via connection pool
- Environment-based configuration
- Easy to extend with new entities (budgets, savings, categories, etc)
- Interactive, auto-generated API documentation (Swagger/OpenAPI)
- Users and transactions modules fully implemented with CRUD and Swagger doc
- Referential integrity and validation for catalog tables (profiles, transaction types, categories, etc.)
- Password hashes never exposed in API responses

## 📦 Installation
```
git clone https://github.com/JCSC79/Proyecto_MoneyShield_JCSC.git
cd moneyshield
npm install
```

## ⚙️ Configuration

Create a `.env` file in the project root with your database and server settings:

```
DB_HOST=localhost
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=moneyshield
PORT=3000
```
## 🗄️ Database Setup
The database schema, initial data, and triggers are located in the /db/moneyshield_schema.sql file.

To create the database and load all tables, initial data, and triggers, run:

```
mysql -u youruser -p < db/moneyshield_schema.sql
```

- Make sure your MySQL user has privileges to create databases and tables.

- The script will create the moneyshield database, all tables, insert initial data (profiles, categories, types, etc.), and set up triggers (e.g., to protect the "Others" category).

## 🏃‍♂️ Usage

Start the server:

```
npm start
```

The server will run at [http://localhost:3000](http://localhost:3000).

## 🧪 Running Tests

To run all automated tests (users, transactions, etc.):

```
npm test
```

To run only the users tests:

```
npm test -- tests/users.test.js
npm test -- tests/transactions.test.js
npm test -- tests/budgets.test.js
npm test -- tests/savings.test.js
npm test -- tests/categories.test.js
npm test -- tests/profiles.test.js
npm test -- tests/auth.test.js
```
## 👤 Usuarios de Prueba

**Administrador**
Email: `admin@money.com`
Contraseña: `3lManduc0.56`

**Usuario Normal**
Email: `user@money.com`
Contraseña: `3lManduc0.56`

Ambos usuarios tienen la misma contraseña para facilitar las pruebas.

## 📖 API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

Use this interface to explore, test, and understand all available endpoints in real time.

## 🧾 API Endpoints
**Users**
- `GET /users` - List all users (without password)
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create a new user (requires: first_name, last_name, email, password_hash, profile_id; optional: base_budget, base_saving)
- `PUT /users/{id}` -  Fully update a user (all fields required)
- `PATCH /users/{id}` - Partially update a user (any field)
- `DELETE /users/{id}` - Delete a user

**Transactions**
- `GET /transactions` - List all transactions (optionally filtered by user)
- `GET /transactions/{id}` - Get transaction by ID
- `POST /transactions` - Create a new transaction
- `PUT /transactions/{id}` - Update a transaction fully
- `PATCH /transactions/{id}` - Update a transaction partially
- `DELETE /transactions/{id}` - Delete a transaction

**Budgets**
- `GET /budgets` - List all budgets (optionally filtered by user)
- `GET /budgets/{id}` - Get budget by ID
- `POST /budgets` - Create a new budget
- `PUT /budgets/{id}` - Update a budget fully
- `PATCH /budgets/{id}` - Update a budget partially
- `DELETE /budgets/{id}` - Delete a budget

**Savings**
- `GET /savings/{id}` - Get saving by ID
- `POST /savings` - Create a new saving
- `PUT /savings/{id}` - Update a saving fully
- `PATCH /savings/{id}` - Update a saving partially
- `DELETE /savings/{id}` - Delete a saving

**Categories**
- `GET /categories` - List all categories (optionally filtered by user)
- `GET /categories/{id}` - Get categories by ID
- `POST /categories` - Create a new category
- `PUT /categories/{id}` - Update a category fully
- `DELETE /categories/{id}` - Delete a category

**Profiles**
- `GET /profiles` - List all profiles
- `GET /profiles/{id}` - Get profiles by ID
- `POST /profiles` - Create a new profile
- `DELETE /profiles/{id}` - Delete a profile

## 🟢 Default Category Assignment in Transactions / Asignación automática de categoría por defecto

- If you create a transaction without specifying the category_id field, the system will automatically assign the "Others" category (by searching for its real id in the database).

- IMPORTANT: The "Others" category must exist in the categories table for the backend to work correctly.

- If "Others" does not exist, creating transactions without a category will fail with a 500 error.

Español:

- Si creas una transacción sin especificar el campo category_id, el sistema asignará automáticamente la categoría "Others" (buscando su id real en la base de datos).

- IMPORTANTE: La categoría "Others" debe existir en la tabla categories para que el backend funcione correctamente.

- Si "Others" no existe, la creación de transacciones sin categoría fallará con error 500.

## 🗂️ Project Structure

```
db/
    moneyshield_schema.sql
    datos_prueba_actualizados.sql
docs/
    swagger.mjs
src/
    db/DBHelper.mjs
    modules/
        users/
            user.controller.mjs
            user.service.mjs
            user.dao.mjs
        transactions/
            transaction.controller.mjs
            transaction.service.mjs
            transaction.dao.mjs
        budgets/
            budget.controller.mjs
            budget.service.mjs
            budget.dao.mjs
        savings/
            saving.controller.mjs
            saving.service.mjs
            saving.dao.mjs
        categories/
            categories.controller.mjs
            categories.service.mjs
            categories.dao.mjs
        profiles/
            profile.controller.mjs
            profile.service.mjs
            profile.dao.mjs
        auth/
            auth.controller.mjs
            auth.service.mjs
            auth.middleware.mjs
            
    index.mjs
.env
package.json
README.md
tests/
  users.test.js
  transactions.test.js
  budgets.test.js
  categories.test.js
  savings.test.js
  profiles.test.js
  auth.test.js
```
## 🛡️ Security

- Password hashes are never returned by the API.
- Referential integrity is enforced at the database level.
- Input validation and error handling on all endpoints.


## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](LICENSE)
This project is licensed under the MIT License - see the LICENSE file for details.
---

## 📚 Español

**MoneyShield API** es una API modular para la gestión de usuarios, transacciones y finanzas personales.
Sigue las instrucciones anteriores para instalar, configurar y ejecutar el proyecto.
---

Created for MoneyShield by Juan Carlos Sandomingo version © 2025
Current date: Friday, June 27, 2025, 12:00 PM