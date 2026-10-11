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

## Implemented features and why they help

| Feature | Purpose |
| --- | --- |
| Password sign-in enforced by the backend | Restricts analysis to the configured reviewer; tokens expire after eight hours and logout revokes them. |
| Up to 30 PDFs, 10 MB each, 60 MB total | Reviews a larger business document pack. Add files in multiple selections or drag and drop; remove unwanted files. |
| Automatic document labels with banker corrections | Organizes the inventory without asking the banker to select a form before uploading. |
| Banker-selected expected categories | Highlights categories not detected for the meeting; these are illustrative and must be adapted to institutional policy. |
| Business-detail extraction | Summarizes business name, address, registration, incorporation date, jurisdiction, and stated owner names per document. |
| Cross-document comparison | Flags conflicting extracted values, including owner names, while ignoring absent fields on unrelated forms. |
| Supporting evidence | Shows document names and conflicting values. Quotes are shown only if found verbatim in locally extracted text. Scanned PDFs can be analyzed by Gemini, but their quotes are not locally verified or displayed. |
| Human review checkboxes and notes | Records what the banker has checked and questions to bring to the business. |
| Downloadable text report | Carries the inventory, checklist, conflicts, review markers, and notes into the appointment. |
| Bounded in-memory cache | Reuses identical analyses while the server runs. |

## Scope and limitations

No account type is needed for this document-comparison workflow. Required documents depend on the service and institution; select the checklist explicitly rather than allowing AI to invent bank policy.

Use fictional documents for the hackathon. The app sends document content to Gemini. This is a local prototype with a shared reviewer password, not enterprise identity or bank-grade access control. Production use needs institutional SSO, role-based permissions, audit records, agreed data processing, encryption and retention controls. No BNY integration or BNY policy validation is implemented.

Files and review state are held in memory; the page loses its state on reload. Reports are downloaded manually. Comparisons use simple case/whitespace normalization and may flag harmless formatting differences, historical changes, or documents for different entities. Always review source scope and dates. For long PDFs, only the first 100,000 extracted characters are analyzed. Unknown or ambiguous types should be labeled Other. A missing category means not detected, not proven absent. No signatures, dates of expiry, document authenticity, or complete content requirements are validated.

## Checks

Backend: `npm.cmd test` runs comparison checks. Frontend: `npm.cmd run build` and `npm.cmd run lint`. Live AI analysis requires your own working API key and access to the configured model.
