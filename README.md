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
git clone https://github.com/Thesharingan312/Sql_CA.git
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
```

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
            
    index.mjs
.env
package.json
README.md
/tests
  users.test.js
  transactions.test.js
  budget.test.js
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
Current date: Monday, May 20, 2025, 1:00 PM