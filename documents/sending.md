# Sending Messages

The submit handler validates input, adds the user message to local state, builds
the message array in the format the API expects, and calls `sendMessage`.

Each message is converted to `LlmapiMessage` format with a `role` and `content`
array containing a text part. The full conversation history is sent with every
request so the model has context.

{@includeCode ../app/page.tsx#handleSubmit}
