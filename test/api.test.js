import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createApp, validateMessages } from "../server.js";

// Fake Groq client: asli API call nahi hoti, tests fast aur free rehte hain
function fakeGroq(chunks, { fail = false } = {}) {
  return {
    chat: {
      completions: {
        create: async () => {
          if (fail) {
            const err = new Error("boom");
            err.status = 500;
            throw err;
          }
          return (async function* () {
            for (const text of chunks) {
              yield { choices: [{ delta: { content: text } }] };
            }
          })();
        }
      }
    }
  };
}

let server, base;

async function start(groq, opts) {
  const app = createApp(groq, opts);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
}

const post = (body) =>
  fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

after(() => server?.close());

/* ---------- Unit tests: validateMessages ---------- */

test("TC01 validateMessages: empty array is rejected", () => {
  assert.equal(validateMessages([]).error, "Please send a message.");
});

test("TC02 validateMessages: non-array is rejected", () => {
  assert.ok(validateMessages("hello").error);
  assert.ok(validateMessages(undefined).error);
});

test("TC03 validateMessages: invalid role is rejected", () => {
  assert.equal(
    validateMessages([{ role: "system", content: "hack" }]).error,
    "Invalid message format."
  );
});

test("TC04 validateMessages: blank content is rejected", () => {
  assert.ok(validateMessages([{ role: "user", content: "   " }]).error);
});

test("TC05 validateMessages: content over 4000 chars is rejected", () => {
  assert.ok(validateMessages([{ role: "user", content: "a".repeat(4001) }]).error);
});

test("TC06 validateMessages: last message must be from user", () => {
  const result = validateMessages([
    { role: "user", content: "hi" },
    { role: "assistant", content: "hello" }
  ]);
  assert.equal(result.error, "The last message must be from the user.");
});

test("TC07 validateMessages: only last 20 messages are kept", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `m${i}`
  }));
  many.push({ role: "user", content: "last" });
  const result = validateMessages(many);
  assert.equal(result.messages.length, 20);
  assert.equal(result.messages.at(-1).content, "last");
});

/* ---------- API tests ---------- */

test("TC08 GET /health returns ok", async () => {
  await start(fakeGroq(["Hel", "lo!"]));
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("TC09 GET / serves the chat page", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /My AI Chatbot/);
});

test("TC10 POST /api/chat streams the full reply", async () => {
  const res = await post({ messages: [{ role: "user", content: "hi" }] });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "Hello!");
});

test("TC11 POST /api/chat with empty body returns 400", async () => {
  const res = await post({});
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test("TC12 POST /api/chat with invalid message returns 400", async () => {
  const res = await post({ messages: [{ role: "user", content: 123 }] });
  assert.equal(res.status, 400);
});

test("TC13 POST /api/chat returns 500 when AI provider fails", async () => {
  server.close();
  await start(fakeGroq([], { fail: true }));
  const res = await post({ messages: [{ role: "user", content: "hi" }] });
  assert.equal(res.status, 500);
  assert.equal((await res.json()).error, "AI response failed. Please try again.");
});

test("TC14 rate limiter returns 429 after too many requests", async () => {
  server.close();
  await start(fakeGroq(["ok"]), { rateLimit: { windowMs: 60_000, max: 2 } });
  const msg = { messages: [{ role: "user", content: "hi" }] };
  assert.equal((await post(msg)).status, 200);
  assert.equal((await post(msg)).status, 200);
  assert.equal((await post(msg)).status, 429);
});

test("TC15 frontend markdown libraries are served locally", async () => {
  for (const file of ["marked.min.js", "purify.min.js", "highlight.min.js", "highlight-theme.css"]) {
    const res = await fetch(`${base}/vendor/${file}`);
    assert.equal(res.status, 200, `${file} should be served`);
  }
  assert.equal((await fetch(`${base}/markdown.js`)).status, 200);
});