# Chat

## useChat Hook

The `useChat` hook from `@anuma/sdk/react` handles the connection to the Anuma
backend. Pass it a `getToken` function and streaming callbacks.

`onData` fires for each text chunk during streaming. `onFinish` fires when the
response is complete and receives the full API response object, which is used to
extract the final assistant message. `onError` handles any errors.

```tsx
  // SDK chat hook
  const { isLoading, sendMessage, stop } = useChat({
    getToken,
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

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L204-L229)

## Message Type

Messages are stored in local state as a simple array. Each message has an `id`,
a `role` (user or assistant), and a `content` string.

```tsx
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type OutputTextPart = {
  type: "output_text";
  text?: string;
};

type ContentPart = OutputTextPart | { type: string };

type OutputMessage = {
  type: "message";
  role: "assistant";
  content?: ContentPart[];
};

type OutputItem = OutputMessage | { type: string };

type ChatResponse = {
  output?: OutputItem[];
};
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L27-L50)
