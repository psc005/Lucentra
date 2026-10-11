# Lucentra — Business Document Review

Lucentra helps a banker prepare for a business appointment by comparing client documents, surfacing conflicting details, and organizing follow-up questions. It supports the reviewer; it does not verify identity, approve clients, establish beneficial ownership, or decide compliance.

## Run in VS Code on Windows

Open the Lucentra-main folder containing both backend and frontend.

1. Open a terminal (Terminal > New Terminal).
2. Run `cd backend` then `npm.cmd install`.
3. Copy `.env.example` to `.env`. Set your Gemini API key and a private reviewer password. Keep this file private.
4. Run `npm.cmd start`. Leave this terminal open.
5. Open a second terminal from the project root. Run `cd frontend`, `npm.cmd install`, then `npm.cmd run dev`.
6. Open the localhost URL printed by Vite. Sign in with the password from backend/.env.

On macOS/Linux use npm instead of npm.cmd. Node 22.13+ is recommended for the included dependencies. If Vite starts on another port, set FRONTEND_ORIGIN to that exact origin and restart the backend.

## Checks

Backend: `npm.cmd test` runs comparison checks. Frontend: `npm.cmd run build` and `npm.cmd run lint`. Live AI analysis requires your own working API key and access to the configured model.
