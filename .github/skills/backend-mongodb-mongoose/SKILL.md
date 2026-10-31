---
name: backend-mongodb-mongoose
description: "Use when developing, reviewing, debugging, or testing the backend API of Hermanos Jota. Covers Node.js, Express 5, MongoDB with Mongoose, authentication, validation, middleware, routes, controllers, services, and the backend dependency stack."
argument-hint: "[backend task or endpoint]"
user-invocable: true
---

# Hermanos Jota Backend

## Scope

This skill applies only to the `backend/` directory and its `src/` tree. Keep changes focused on the backend unless the task explicitly requires a client change.

The persistence layer is **MongoDB accessed through Mongoose**. Do not introduce a second database, ORM, or persistence pattern without explicit approval.

## Technology stack

- Node.js with ES modules (`"type": "module"`).
- Express `^5.3.0`.
- MongoDB with Mongoose `^9.11.4`.
- Authentication and security: `bcrypt ^6.0.0`, `jsonwebtoken ^9.0.3`, `google-auth-library ^11.3.1`, `cookie-parser ^1.4.7`, and `express-rate-limit ^8.7.1`.
- Configuration and HTTP: `dotenv ^18.0.9`, `cors ^2.8.6`, and Express.
- Validation: `yup ^1.7.1`.

## Project conventions

- Follow the existing flow: routes -> controllers -> services/models.
- Put MongoDB schemas and models in `backend/src/models/`. Reuse the existing model pattern and avoid duplicate model registration.
- Put request validation in `backend/src/schemas/` and apply it through `backend/src/middlewares/validate.js`.
- Keep authentication checks in `backend/src/middlewares/` and authentication orchestration in controllers/services.
- Preserve the centralized error flow through `next(error)` and `backend/src/middlewares/errorHandler.js`.
- Use the existing response language and JSON error shape unless the endpoint contract requires otherwise.
- Use relative `.js` extensions in imports.
- Keep secrets and environment-specific values in environment variables; never commit them.

## Procedure

1. Inspect the relevant route, controller, service, model, schema, and middleware before editing.
2. Confirm the endpoint contract, authentication requirements, validation rules, and MongoDB fields.
3. Implement the smallest complete change using the existing layer boundaries.
4. Validate all external input with Yup or an equivalent existing schema before persistence or business logic.
5. Handle expected database failures explicitly, including duplicate-key and unavailable-database cases where relevant.
6. Never return password hashes, JWT secrets, OAuth credentials, or other sensitive fields.
7. Preserve async error propagation and avoid empty catches or silent fallbacks.
8. Run the smallest relevant validation command from `backend/`. Available scripts are `npm start` and `npm run dev`; add or use focused tests when the repository provides them.

## MongoDB and Mongoose rules

- Use Mongoose models for reads and writes; do not build ad-hoc database access.
- Respect schema options such as `select: false`, `timestamps`, required fields, enums, and unique indexes.
- Normalize values consistently with the schema before querying, especially email addresses.
- Treat `unique` as an index constraint, not as request validation; still handle MongoDB duplicate-key errors.
- Do not expose raw Mongoose errors to clients. Map them to the repository's error response conventions.
- Avoid unbounded queries and return only the fields needed by the API.

## Authentication and security rules

- Hash passwords with bcrypt and compare hashes with bcrypt; never compare or store plaintext passwords.
- Require configured secrets and OAuth identifiers explicitly; do not use insecure hardcoded defaults.
- Keep JWT creation and verification aligned with the existing claims and expiration configuration.
- Apply authentication, authorization, CORS, cookies, and rate limiting consistently with existing middleware.
- Validate and sanitize request bodies before using them in MongoDB queries or writes.
