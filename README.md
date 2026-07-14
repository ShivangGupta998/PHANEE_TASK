# Team Tracker

A lightweight web app for replacing a spreadsheet-based daily work tracker with a shared dashboard.

## Recommended architecture

- Frontend: vanilla React-style UI in plain HTML, CSS, and JavaScript for a small team with minimal backend maintenance
- Data persistence: browser localStorage for a simple local-first demo
- Authentication: simple login with roles for Owner and Team Member
- Notifications: in-app notification bell and change log

This approach is ideal for 2–15 users when you want a fast prototype or low-maintenance internal tool without setting up a backend.

## Folder structure

- index.html — app shell
- styles.css — layout and styling
- app.js — authentication, dashboard CRUD, member management, notifications, and history

## Run locally

1. Open the workspace folder in VS Code.
2. Start a simple static server from the project root:
   - Python: `python -m http.server 3000`
3. Open http://localhost:3000 in your browser.

## Demo credentials

- Owner: `owner` / `password123`
- Team member: `jamie` / `password123`

## Notes

- The current implementation uses localStorage so it is easy to run without a database or cloud service.
- For a production version, the same UI can be adapted to Firebase Auth + Firestore + Cloud Messaging.
