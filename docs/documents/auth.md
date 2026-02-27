# Authentication

The app uses [Privy](https://privy.io) for authentication. The entire auth flow
lives in `app/page.tsx`.

```tsx
import { PrivyProvider, usePrivy, useIdentityToken } from "@privy-io/react-auth";
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L12-L12)

## Privy Provider

The root component wraps the app in a `PrivyProvider` with the app ID from
environment variables. A mount guard prevents SSR hydration mismatches.

```tsx
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard, runs once on mount
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <AuthGate />
    </PrivyProvider>
  );
}
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L47-L70)

## Auth Gate

`AuthGate` reads Privy's `ready` and `authenticated` state to decide what to
render: a loading indicator, the login screen, or the chat interface.

```tsx
function AuthGate() {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="animate-pulse-dot inline-block size-2 rounded-full bg-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  return <Chat />;
}
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L78-L94)

## Getting an Identity Token

Inside the chat component, `useIdentityToken` provides a JWT that the SDK sends
to the Anuma backend. The token is kept in a ref so the `getToken` callback
always returns the latest value without causing re-renders.

```tsx
  // Keep token in a ref so getToken always returns the latest value
  const tokenRef = useRef(identityToken);
  useEffect(() => {
    tokenRef.current = identityToken;
  }, [identityToken]);
  const getToken = useCallback(async () => tokenRef.current, []);
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L161-L166)
