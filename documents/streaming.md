# Streaming

The SDK streams response text through the `onData` callback. Each chunk is
appended to a ref (for the latest value) and mirrored to React state (to trigger
re-renders). The `Streamdown` component renders the streaming markdown with
syntax-highlighted code blocks.

When the response finishes, `onFinish` receives the full API response. The
assistant text is extracted from `response.output` and added to the messages
array. The streaming buffer is then cleared.

{@includeCode ../app/page.tsx#useChatHook}
