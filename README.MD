# CampusConnect Deployment Guide (Render)

This repo contains two apps:

- `backend/`: Node/Express API + Socket.IO
- `frontend/`: Vite React app

## Backend (Render Web Service)

**Root directory:** `backend`

**Build command:** `npm install`

**Start command:** `npm run start`

**Environment variables:**

- `NODE_ENV=production`
- `PORT` (Render sets this automatically)
- `MONGO_URI`
- `CLIENT_URL` (your frontend Render URL, e.g. `https://campusconnect.onrender.com`)
- `REDIS_URL` (use `rediss://` for managed Redis over TLS)
- `REDIS_KEY_PREFIX` (optional, defaults to `campusconnect`)
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_PUBLISHABLE_KEY`
- `RESEND_API_KEY` (if email is enabled)
- `EMAIL_FROM` (if email is enabled)
- `EMAIL_FROM_NAME` (if email is enabled)
- `CLOUDINARY_CLOUD_NAME` (if uploads are enabled)
- `CLOUDINARY_API_KEY` (if uploads are enabled)
- `CLOUDINARY_API_SECRET` (if uploads are enabled)
- `ARCJET_KEY` (if Arcjet is enabled)
- `ARCJET_ENV` (if Arcjet is enabled)
- `AZURE_SPEECH_KEY` (if speech features are enabled)
- `AZURE_SPEECH_REGION` (if speech features are enabled)
- `AZURE_TRANSLATOR_KEY` (if translation is enabled)
- `AZURE_TRANSLATOR_ENDPOINT` (if translation is enabled)
- `AZURE_TRANSLATOR_REGION` (if translation is enabled)
- `TEACHER_INVITE_CODE` (optional, default is `CAMPUS2026`)
- `SERVE_STATIC=false` (set to `true` only for single-service deployments)

BullMQ reuses the same Redis instance as the cache layer, so one `REDIS_URL` is enough.

If you want a dedicated BullMQ worker process, run `npm run worker` from `backend/` after setting the Redis variables.

## Frontend (Render Static Site)

**Root directory:** `frontend`

**Build command:** `npm install && npm run build`

**Publish directory:** `dist`

**Environment variables:**

- `VITE_API_BASE_URL` (your backend Render URL, e.g. `https://campusconnect-api.onrender.com`)
- `VITE_CLERK_PUBLISHABLE_KEY`

## Local development

**Backend:**

```
cd backend
npm install
npm run dev

# optional, in a second terminal for queue processing
npm run worker
```

**Frontend:**

```
cd frontend
npm install
npm run dev
```

## Single-service deployment (optional)

If you want the backend to serve the frontend build from the same service:

1. Use a single Render Web Service with the **root directory** set to the repo root.
2. Use **build command**: `npm run build` (this builds the frontend and copies it into `backend/frontend/dist`).
3. Use **start command**: `npm run start`.
4. Set `SERVE_STATIC=true` and `NODE_ENV=production`.
5. Set `CLIENT_URL` to the same Render URL as the backend.
6. Set `VITE_CLERK_PUBLISHABLE_KEY` for the frontend build. You can omit `VITE_API_BASE_URL` so the app uses same-origin `/api`.

## Database ER Diagram


### Database ER Diagram (visual)

The exported Eraser diagram is embedded below. If you prefer the editable Mermaid version, see the repository history.

![CampusConnect Database ER Diagram](./docs/diagram-export-04-06-2026-12_05_35.png)

This diagram shows the MongoDB data model behind CampusConnect. `User` is the central collection, with direct chat handled by `Message` and `Conversation`. Group-based features branch from `Group` into `GroupMessage`, `GroupResource`, `GroupEvent`, `GroupTask`, `GroupProject`, `GroupDoubt`, and `GroupDoubtComment`.

The main relationships are:

- `User` sends and receives many `Message` documents.
- `Conversation` represents a 1:1 chat thread between exactly two users.
- `Group` is created by a user and has many teachers and members.
- `GroupMessage`, `GroupResource`, `GroupEvent`, `GroupTask`, `GroupProject`, `GroupDoubt`, and `GroupDoubtComment` all belong to a `Group` through `groupId`.
- `GroupDoubt` can be resolved by a user and keeps an embedded audit log of status changes.
- `Message` supports reply references through `replyTo.messageId` and includes translation metadata for text and voice translations.

Key indexed or unique fields are also highlighted in the diagram:

- `User.email` and `User.clerkId` are unique.
- `Conversation.participantsKey` is unique.
- `Message` is indexed for direct chat history and unread lookups.
- Several group collections are indexed by `groupId` for fast per-group queries.
