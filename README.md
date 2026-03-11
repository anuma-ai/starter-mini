# Anuma Starter Mini

A minimal AI chat application built with the
[Anuma SDK](https://github.com/anuma-ai/sdk), [Privy](https://privy.io) for
authentication, and [Next.js](https://nextjs.org). The entire app fits in a
single file — `app/page.tsx` — making it a good starting point for understanding
how the pieces connect.

<video src="https://github.com/anuma-ai/starter-mini/raw/refs/heads/main/public/demo.webm" autoplay loop playsinline style="border-radius: 8px;"></video>

## Getting Started

### Create an Anuma app

Sign in at [dashboard.anuma.ai](https://dashboard.anuma.ai/) and create an app.
This provisions the API account that powers AI responses.

### Clone and install

```bash
git clone https://github.com/anuma-ai/starter-mini.git
cd starter-mini
pnpm install
```

### Configure environment variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

### Run the development server

```bash
pnpm dev
```

Open http://localhost:3000 to see the app. After signing in through Privy
you'll get a chat interface where you can talk to an AI model.

## What's in the Tutorial

**Setup** covers the Next.js configuration — wrapping your config with
`withAnuma` to set up the API proxy the SDK needs.

**Authentication** explains the Privy integration: the provider, the auth gate
that switches between login and chat, and how identity tokens are passed to the
SDK.

**Chat** introduces the `useChat` hook from `@anuma/sdk/react`, which manages
the connection to the Anuma backend, and the message state model.

**Streaming** describes how response text arrives in chunks through the `onData`
callback and gets rendered as markdown in real time.

**Sending Messages** walks through the submit handler that formats messages for
the API and sends the full conversation history with each request.
