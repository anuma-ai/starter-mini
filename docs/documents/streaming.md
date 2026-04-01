# Streaming

```tsx
import { Streamdown } from "streamdown";
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L19-L19)

The SDK streams response text through the `onData` callback. Each chunk is
appended to a ref (for the latest value) and mirrored to React state (to trigger
re-renders). The `Streamdown` component renders the streaming markdown with
syntax-highlighted code blocks.

When the response finishes, `onFinish` receives the full API response. The
assistant text is extracted from `response.output` and added to the messages
array. The streaming buffer is then cleared.

```tsx
  // SDK chat hook
  const { isLoading, sendMessage, stop } = useChat({
    getToken,
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    onData: (chunk) => {
      streamingRef.current += chunk;
      setStreamingText(streamingRef.current);
    },
    onFinish: (response) => {
      const text = extractResponseText(response);
      if (text) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: text,
          },
        ]);
      }
      setStreamingText("");
      streamingRef.current = "";
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L193-L219)
