# Expense Tracker

A full-stack web application tracking my expenses.

## Tech Stack

-   **Architecture:** Clean / Hexagonal Architecture
-   **Frontend:** TypeScript, Vite, React, Redux Toolkit
-   **Backend:** Node.js, TypeScript, Fastify, PostgreSQL
-   **Hosting** Netlify, Fly.io (to be decided)

## Use Cases

Eventually, the application fulfils the following use cases:

-   **User Management**
    -   [ ] sign up – `PUT /api/users/signup => HTTP 201`
    -   [ ] sign in – `POST /api/users/authenticate => HTTP 200`
    -   [ ] update user account details – `POST /api/users/update => HTTP 200`
    -   [ ] delete user account – `DELETE /api/users/delete => HTTP 204`
-   **Expense Tracking**
    -   [x] add expenses – `PUT /api/expenses/add => HTTP 201`
    -   [x] list expenses – `GET /api/expenses => HTTP 200`
    -   [x] search expenses – `POST /api/expenses/search => HTTP 200`
    -   [x] update expense details – `POST /api/expenses/update => HTTP 200`
    -   [x] remove expenses – `DELETE /api/expenses/delete => HTTP 204`
-   **Expense Reporting**
    -   [ ] fetch and cache report – `POST /api/reports/fetch => HTTP 200`
    -   [ ] delete report – `DELETE /api/reports/delete => HTTP 204`

## Database

The database has following entities / tables.

-   `users` -> `User`
-   `expenses` -> `Expense`
-   `reports` -> `ExpenseReport`

**TODO:** add ER diagram
