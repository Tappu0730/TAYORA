# TAYORA production deployment

The frontend is deployed on GitHub Pages and the FastAPI service is deployed on Render.

## Make accounts persistent

The account routes need a persistent PostgreSQL database. The repository includes a
`render.yaml` Blueprint that wires a Render Postgres database to the web service,
generates a JWT secret, and allows requests from:

```text
https://tappu0730.github.io
```

In Render:

1. Open **New → Blueprint** and select this repository, or sync the existing Blueprint.
2. Review the `tayora` web service and `tayora-db` Postgres instance.
3. Apply the Blueprint and wait for the `/api/health` check to pass.
4. Confirm the web service environment contains `DATABASE_URL`, `JWT_SECRET_KEY`, and
   `CORS_ORIGINS=https://tappu0730.github.io`.

Do not paste passwords, database URLs, or JWT secrets into Git. The Blueprint generates
the JWT secret and injects the Postgres connection string through `fromDatabase`.

## Verify after deployment

Open these URLs:

```text
https://tayora.onrender.com/api/health
https://tayora.onrender.com/docs
https://tappu0730.github.io/TAYORA/
```

Create a test account on the deployed frontend, sign out, and sign in again. The account
should still work after a Render restart because data is now stored in Postgres rather
than the ephemeral local SQLite fallback.

## Local development

Local development can continue using SQLite from `backend/.env.example`. Set a separate
`DATABASE_URL` and `JWT_SECRET_KEY` for any shared or public deployment.
