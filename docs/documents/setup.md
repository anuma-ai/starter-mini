# Setup

## Next.js Config

Wrap your Next.js config with `withAnuma` from `@anuma/sdk/next`. This sets up
the API proxy that the SDK's `useChat` hook needs to communicate with the Anuma
backend.

```ts
import { withAnuma } from "@anuma/sdk/next";

export default withAnuma({
  reactStrictMode: false,
  turbopack: {},
});
```

[next.config.ts](https://github.com/anuma-ai/starter-mini/blob/main/next.config.ts#L2-L7)

## Environment Variables

Create a `.env.local` file with your Privy app ID:

```
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```
