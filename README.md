
# My AI Chatbot

A ChatGPT-style AI chatbot with real-time streaming responses, conversational memory, and PDF-based question answering using Retrieval-Augmented Generation (RAG).

Built with Node.js, Express.js, Groq API, and Hugging Face Transformers.

## Live Demo

[Click here to use My AI Chatbot](https://my-ai-chatbot-4xmx.onrender.com)

## Features

- Real-time AI streaming responses with typing effect.
- Retrieval-Augmented Generation (RAG) for PDF-based question answering.
- PDF upload, text extraction, and document chunking.
- Text embeddings and semantic search for relevant document retrieval.
- Context-aware AI responses using Groq API.
- Multiple conversations with saved chat history using localStorage.
- Browser-based demo login and user profile management.
- ChatGPT-style responsive user interface with sidebar navigation.
- Markdown rendering with syntax-highlighted code blocks and Copy button.
- Server-side input validation and per-IP rate limiting.
- Loading states and error handling.
- Sanitized Markdown rendering using DOMPurify.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Generative AI | Groq API, LLM Integration |
| RAG | Hugging Face Transformers, Text Embeddings, Semantic Search |
| Document Processing | Multer, pdf-parse |
| Rendering | marked, DOMPurify, highlight.js |
| Testing | Node.js Test Runner |
| Deployment | Render |
| Version Control | Git, GitHub |

## RAG Architecture

The application uses Retrieval-Augmented Generation (RAG) to generate context-aware answers from uploaded PDF documents.

```text
PDF Upload
     |
Text Extraction
     |
Document Chunking
     |
Text Embeddings
     |
Semantic Search
     |
Relevant Context Retrieval
     |
Groq LLM
     |
AI-Generated Response
```

## How It Works

1. The user uploads a PDF document.
2. The backend extracts text from the PDF.
3. The extracted text is divided into smaller chunks.
4. Text embeddings are generated using Hugging Face Transformers.
5. Semantic search retrieves relevant document chunks based on the user's question.
6. The retrieved context is provided to the Groq LLM.
7. The chatbot generates a context-aware response.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/VidushiSharma24/my-ai-chatbot.git
```

Navigate to the project directory:

```bash
cd my-ai-chatbot
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory and add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

Start the application:

```bash
npm start
```

Open the application in your browser:

http://localhost:3000

## Run Tests

```bash
npm test
```

The existing test suite uses a mocked Groq client to test input validation, API responses, rate limiting, and error handling.

## Deployment

The application is deployed on Render.

- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable: `GROQ_API_KEY`

## Future Enhancements

- Secure user authentication.
- Database-backed chat history.
- Multiple PDF document support.
- Vector database integration.
- Improved document retrieval and response evaluation.

## Author

**Vidushi Sharma**

- [GitHub](https://github.com/VidushiSharma24)
- [LinkedIn](https://www.linkedin.com/in/vidushi-sharma0204)
