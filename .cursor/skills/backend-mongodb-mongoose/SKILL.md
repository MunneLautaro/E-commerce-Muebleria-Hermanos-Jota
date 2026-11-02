---
name: backend-mongodb-mongoose
description: "Use when developing, reviewing, debugging, or testing the Hermanos Jota backend. Applies to Node.js and Express 5 APIs using MongoDB with Mongoose, JWT/Google authentication, Yup validation, and the configured security middleware."
argument-hint: "[backend task or endpoint]"
---

# Hermanos Jota Backend Skill

## Scope and stack

Apply this skill only to the `backend/` folder and its `src/` tree. The database is **MongoDB accessed through Mongoose**; do not add another database or ORM without explicit approval.

The backend uses:

- Node.js ES modules (`"type": "module"`)
- Express `^5.3.0`
- MongoDB and Mongoose `^9.11.4`
- `bcrypt ^6.0.0`
- `cookie-parser ^1.4.7`
- `cors ^2.8.6`
- `dotenv ^18.0.9`
- `express-rate-limit ^8.7.1`
- `google-auth-library ^11.3.1`
- `jsonwebtoken ^9.0.3`
- `yup ^1.7.1`

## How to work in this backend

1. Read the relevant route, controller, service/model, schema, and middleware before making a change.
2. Keep the existing architecture: routes -> controllers -> services/models.
3. Use `.js` extensions in relative imports and preserve the existing formatting and Spanish API responses.
4. Put Mongoose schemas/models in `backend/src/models/`, Yup request schemas in `backend/src/schemas/`, and reusable request logic in `backend/src/middlewares/`.
5. Send controller failures through `next(error)` so `backend/src/middlewares/errorHandler.js` remains the central error boundary.
6. Validate and strip unknown request fields before using input in MongoDB operations.
7. Handle duplicate-key and database-unavailable errors explicitly; never hide errors with broad catches or silent defaults.
8. Keep secrets in environment variables. Never commit credentials or return password hashes, tokens' signing secrets, or OAuth credentials.
9. Preserve existing authentication behavior: bcrypt for passwords, JWT for sessions, Google token verification through `google-auth-library`, and the current active-user checks.
10. Run the smallest relevant validation command from `backend/`. The backend scripts are `npm start` and `npm run dev`.

## Mongoose requirements

- Reuse existing models and avoid duplicate model registration.
- Respect schema constraints, `select: false`, timestamps, enums, required fields, and unique indexes.
- Normalize values such as emails consistently before lookups.
- Remember that `unique` is a database index constraint, so duplicate-key errors still need API-level handling.
- Query only the fields needed by the endpoint and avoid unbounded result sets.
- Map raw Mongoose errors to the existing public error response instead of exposing implementation details.
