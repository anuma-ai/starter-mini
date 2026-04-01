# Sending Messages

The submit handler validates input, adds the user message to local state, builds
the message array in the format the API expects, and calls `sendMessage`.

Each message is converted to `LlmapiMessage` format with a `role` and `content`
array containing a text part. The full conversation history is sent with every
request so the model has context.

```tsx
  // Submit handler
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      setInput("");
      streamingRef.current = "";
      setStreamingText("");

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const updated = [...messages, userMessage];
      setMessages(updated);

      const llmapiMessages = updated.map((m) => ({
        role: m.role,
        content: [{ type: "text", text: m.content }],
      }));

      await sendMessage({
        messages: llmapiMessages,
        model: "openai/gpt-4.1-mini",
      });
    },
    [input, isLoading, messages, sendMessage]
  );
```

[app/page.tsx](https://github.com/anuma-ai/starter-mini/blob/main/app/page.tsx#L228-L258)
