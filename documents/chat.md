# Chat

## useChat Hook

The `useChat` hook from `@anuma/sdk/react` handles the connection to the Anuma
backend. Pass it a `getToken` function and streaming callbacks.

`onData` fires for each text chunk during streaming. `onFinish` fires when the
response is complete and receives the full API response object, which is used to
extract the final assistant message. `onError` handles any errors.

{@includeCode ../app/page.tsx#useChatHook}

## Message Type

Messages are stored in local state as a simple array. Each message has an `id`,
a `role` (user or assistant), and a `content` string.

{@includeCode ../app/page.tsx#messageType}
