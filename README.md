# My AI Chatbot

A ChatGPT-style web chatbot with **streaming responses** and **saved chat history**, built with Node.js, Express and the Groq API.

> Live demo: _add your Render link here after deploying_
> Screenshot: _add a screenshot here (e.g. `docs/screenshot.png`)_

## Features

- Real-time streaming replies (typing effect)
- ChatGPT-style rendering: colorful markdown (headings, bold, lists, tables), syntax-highlighted code blocks with a Copy button
- Multiple chats saved in the browser (`localStorage`), with a sidebar to switch and delete chats
- Conversation context: the last 20 messages are sent with each request, so the bot remembers the conversation
- Server-side validation (roles, empty/oversized messages, last message must be from user)
- Per-IP rate limiting to protect the API key
- Loading state and error handling on the UI
- XSS-safe rendering (user text is inserted as plain text; AI markdown is sanitized with DOMPurify)
- 15 automated tests (unit + API) using Node's built-in test runner, with a mocked AI client

## Tech stack

HTML, CSS, JavaScript (frontend) | Node.js, Express 5 (backend) | Groq API | marked + DOMPurify + highlight.js (self-hosted) | `node:test` (testing)

## Run locally

```bash
git clone <your-repo-url>
cd my-ai-chatbot
npm install
cp .env.example .env      # then put your Groq API key in .env
npm start
```

Open http://localhost:3000

## Run tests

```bash
npm test
```

Tests mock the Groq client, so they run offline and need no API key.

| Area | What is covered |
|------|-----------------|
| Input validation | empty array, non-array, invalid role, blank content, content > 4000 chars, last message not from user, 20-message limit |
| API | `/health`, serving the page, streamed reply, 400 on bad input, 500 on provider failure, 429 on rate limit |

## Deploy (Render)

1. Push this repo to GitHub (`.env` is git-ignored).
2. On https://render.com create a **New Web Service** from the repo.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add the environment variable `GROQ_API_KEY` in the Render dashboard.
5. Open the generated URL.

## Project structure

```
server.js         Express server, validation, rate limiter, streaming endpoint
public/           Frontend (index.html, script.js, markdown.js, style.css, vendor/)
test/api.test.js  Automated tests
```