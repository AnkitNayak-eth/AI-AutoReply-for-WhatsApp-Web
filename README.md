<div align="center">
  <img width="128" height="128" alt="robot" src="https://github.com/user-attachments/assets/e9906b7f-887c-497d-b766-093e4c99aa35" />
</div>


# AI AutoReply for WhatsApp Web Chrome Extension 

A Chrome extension that adds context-aware, AI-powered auto replies to WhatsApp Web, designed to behave like a real human.

---

## Overview

AI-AutoReply-for-WhatsApp-Web consists of two main parts:

1. A **Chrome extension** that runs on WhatsApp Web and interacts with the UI
2. A **backend service** that processes conversation context and generates AI replies

The extension handles message detection and UI automation, while the backend is responsible for AI logic and response generation.

---

## Chrome Extension Architecture

The Chrome extension runs as a **content script** injected into WhatsApp Web.

### Responsibilities

- Observes WhatsApp Web DOM for new messages
- Extracts message text from the chat
- Identifies message roles (sender vs you)
- Batches multiple incoming messages into a single logical input
- Sends conversation context to the backend
- Injects AI-generated replies into the message input
- Sends messages with human-like delays

### Key Behaviors

- **Per-chat activation**: AI replies can be enabled or disabled for individual chats
- **Message batching**: Multiple messages sent within a short time window are grouped together
- **Loop prevention**: Prevents replying to its own messages
- **Human-like timing**: Replies are delayed to avoid instant, bot-like responses

---

## Backend Architecture

The backend is a lightweight HTTP service responsible for generating AI replies.

### Responsibilities

- Receives conversation context from the extension
- Validates and limits message history (last 20 messages)
- Maintains correct role order (user vs assistant)
- Calls the AI model API to generate a reply
- Returns a clean, text-only response to the extension

The backend is intentionally kept independent from the extension to allow:
- Easy model replacement
- Safer prompt control
- Better scalability and maintainability

---

## Data Flow

1. A new message is detected in WhatsApp Web
2. The extension waits until the sender stops sending messages
3. The last 20 messages are collected with role information
4. Context is sent to the backend as a JSON payload
5. The backend generates an AI reply
6. The reply is returned to the extension
7. The extension inserts and sends the reply after a delay

---

## Message Batching Example

If a sender sends multiple messages:

- Hi  
- Are you free?  
- Can we talk later?

The extension:
- Waits for a silence window
- Treats them as a single input
- Sends one combined context to the backend
- Sends one natural reply

---

## Tech Stack

**Chrome Extension**
- Manifest V3
- JavaScript
- Content scripts
- DOM querying and event handling

**Backend**
- Node.js
- HTTP API
- Groq SDK (LLM inference)

---

## Installation

1. Clone the repository
2. Load the Chrome extension using `chrome://extensions`
3. Start the backend server
4. Open WhatsApp Web

---

## Usage

1. Open a chat on WhatsApp Web
2. Click the 🤖 button to enable AI replies
3. The AI replies automatically when new messages arrive
4. Disable the AI anytime from the same button

---

## Limitations

- Depends on WhatsApp Web DOM structure
- Only one active chat at a time
- Intended for personal and educational use

---

## Disclaimer

This project is not affiliated with, endorsed by, or associated with WhatsApp or Meta.

Use responsibly and at your own risk.

---

## Author

Ankit Kumar Nayak  
Full-Stack Developer | AI & Web Enthusiast

