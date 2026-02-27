# Authentication

The app uses [Privy](https://privy.io) for authentication. The entire auth flow
lives in `app/page.tsx`.

{@includeCode ../app/page.tsx#importPrivy}

## Privy Provider

The root component wraps the app in a `PrivyProvider` with the app ID from
environment variables. A mount guard prevents SSR hydration mismatches.

{@includeCode ../app/page.tsx#privyProvider}

## Auth Gate

`AuthGate` reads Privy's `ready` and `authenticated` state to decide what to
render: a loading indicator, the login screen, or the chat interface.

{@includeCode ../app/page.tsx#authGate}

## Getting an Identity Token

Inside the chat component, `useIdentityToken` provides a JWT that the SDK sends
to the Anuma backend. The token is kept in a ref so the `getToken` callback
always returns the latest value without causing re-renders.

{@includeCode ../app/page.tsx#getToken}
