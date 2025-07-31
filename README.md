# MoneyShield – Personal Finance Management
**Complete solution for expense tracking, budget planning and personal financial KPIs. Monorepo project developed for my end-of-year FP practices at Landra Sistemas (2025).**

**Full Stack Monorepo • Node.js + Express • MySQL • React + Vite**

---

## 📦 Project Structure
```
Proyecto_MoneyShield_JCSC/
    backend/
        db/
            moneyshield_schema.sql
        docs/
            swagger.mjs
        logs/
        node_modules/
        scripts/
            encrypt-password.mjs
        src/
            constants/
                errorMessages.mjs
                financial.mjs
            db/    
                db/DBHelper.mjs
            middlewares
                accessControl.middleware.mjs
                validateParams.middleware.mjs
            modules/
                auth/
                    auth.controller.mjs
                    auth.service.mjs
                    auth.middleware.mjs
                budgets/
                    budget.controller.mjs
                    budget.service.mjs
                    budget.dao.mjs
                categories/
                    categories.controller.mjs
                    categories.service.mjs
                    categories.dao.mjs
                profiles/
                    profile.controller.mjs
                    profile.service.mjs
                    profile.dao.mjs
                savings/
                    saving.controller.mjs
                    saving.service.mjs
                    saving.dao.mjs
                transactions/
                    transaction.controller.mjs
                    transaction.service.mjs
                    transaction.dao.mjs
                users/
                    user.controller.mjs
                    user.service.mjs
                    user.dao.mjs
            utils/ 
                encryption.mjs
                logger.mjs
                omitFields.mjs
                result.mjs
                validation.mjs   
            app.js         
            index.mjs
        tests/
            auth.test.mjs
            budgets.test.js
            categories.test.js
            profiles.test.js
            savings.test.js
            transactions.test.js
            users.test.js
        .env
        jest.config.js
        package.json
        package-lock.json
        README.md
        sonar-project.properties
    frontend/
        node_modules/
        public/
            favicon.ico
        src/
            components/
                AdminLayout.jsx
                AdminModal.jsx
                AdminPagination.jsx
                Alert.jsx
                BudgetPieChart.jsx
                Button.jsx
                Input.jsx
                Navbar.jsx
            contexts/
                AuthContext.jsx
            pages/
                AdminDashboard.jsx
                Dashboard.jsx
                Login.jsx
                Movimientos.jsx
                Perfil.jsx
                Registro.jsx
                TransactionsList.jsx
                UserDetailModal.jsx
                UserList.jsx
            services/
                auth.api.js
                axios.js
                categories.api.js
                movimientos.api.js
                users.api.js
            styles/
                admin.css
                Dashboard.css
                Form.css
                Navbar.css
            App.jsx
            index.css
            main.jsx
        eslint.config.js
        index.html
        package.json
        package-lock.json
        README.md
        vite.config.js
    doc/
        demo_comprimido.mp4
        captura_dashboard.png
    .gitignore
    LICENSE
    README.md
```
---

## 🚀 What is MoneyShield?

**MoneyShield** is a modern full-stack web app designed for managing personal finances.  
It allows users to:
- Register incomes and expenses, by category and description.
- Set and visualize monthly budgets.
- Track real-time financial KPIs (balance, expenses, savings, budget usage %).
- See visual alerts and a responsive dashboard.
- (Admin users) manage all users and transactions.

**Demo and full documentation** are available in `/doc`.

---

## 🗂️ Folder overview

- `backend/` &nbsp;&nbsp;&nbsp;&nbsp;→ RESTful API (Node.js, Express, MySQL) [→ see backend/README.md](./backend/README.md)
- `frontend/` &nbsp;&nbsp;&nbsp;→ React + Vite web client [→ see frontend/README.md](./frontend/README.md)
- `doc/` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ PDF memory, demo video, screenshots and other docs

---

## ⚙️ Installation (dev environment)

**1. Clone this repo:**
```
git clone https://github.com/JCSC79/Proyecto_MoneyShield_JCSC.git
cd Proyecto_MoneyShield_JCSC
```
**2. Initialize the backend**
```
cd backend
npm install
```
**Before starting the backend, follow the instructions in [`backend/README.md`](./backend/README.md) to set up the database schema and `.env` configuration.**

**3. Launch the frontend**
```
cd ../frontend
npm install
npm run dev
```

- Default dev URLs:  
    - Backend: [http://localhost:3000](http://localhost:3000)  
    - Frontend: [http://localhost:5173](http://localhost:5173)

---

## 🧑‍💻 For Developers

- See [backend/README.md](./backend/README.md) for full API, testing, and users info.
- See [frontend/README.md](./frontend/README.md) for web client details and configuration.
- All business logic and KPIs are calculated server-side.

---

## 🎦 Demo & Documentation

- **Memory PDF, Demo Video and Screenshots:**  
  Check the `/doc` folder:
    - `memoria_PracticasJC.pdf` – Final report PDF (Spanish)
    - `demo_comprimido.mp4` – Video walkthrough
    - `captura_dashboard.png` – Main dashboard screenshot

---

## 📚 Español

Repositorio monorepo de MoneyShield.  
App web para gestión de finanzas personales desarrollada durante mi estancia en prácticas (Landra Sistemas, 2025).

- Manual, vídeo y documentación en `/doc`.
- API en `/backend`, cliente React en `/frontend`.

---

Created by Juan Carlos Sandomingo · Landra Sistemas · 2025  
[MIT License](./LICENSE)






