"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { PrivyProvider, usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { useChat } from "@anuma/sdk/react";
import { Streamdown } from "streamdown";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SourceCodeSquareIcon,
  Book03Icon,
  ArrowTurnBackwardIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

//#region messageType
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
//#endregion messageType

// ---------------------------------------------------------------------------
// Entry point — wraps in PrivyProvider
// ---------------------------------------------------------------------------

//#region privyProvider
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
//#endregion privyProvider

// ---------------------------------------------------------------------------
// Auth gate — shows login or chat based on auth state
// ---------------------------------------------------------------------------

//#region authGate
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
//#endregion authGate

// ---------------------------------------------------------------------------
// Login screen
// ---------------------------------------------------------------------------

function LoginScreen() {
  const { login } = usePrivy();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <svg className="h-8 mb-1" viewBox="46 436 931 151" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46.5459 586.827L122.875 436.18L199.203 586.827H164.858L122.875 504.335L80.8916 586.827H46.5459Z" fill="currentColor"/>
            <path d="M260.055 486.382V586.799H229.528V443.352H260.055L351.637 543.769V443.352H382.164V586.82H351.637L260.055 486.403V486.382Z" fill="currentColor"/>
            <path d="M420.772 515.075V443.352H451.3V515.096C451.3 527.054 455.74 537.216 464.665 545.585C473.568 553.953 484.38 558.147 497.101 558.147C509.823 558.147 520.635 553.974 529.538 545.585C538.44 537.196 542.903 527.054 542.903 515.096V443.352H573.43V515.096C573.43 534.984 565.993 551.908 551.14 565.868C536.287 579.829 518.259 586.82 497.123 586.82C475.988 586.82 457.982 579.829 443.107 565.868C428.232 551.887 420.817 534.963 420.817 515.096L420.772 515.075Z" fill="currentColor"/>
            <path d="M644.033 500.739V586.82H613.506V443.352H644.033L705.087 550.948L766.141 443.352H796.668V586.82H766.141V500.739L720.362 586.82H689.835L644.055 500.739H644.033Z" fill="currentColor"/>
            <path d="M824.818 586.827L901.125 436.18L977.453 586.827H943.108L901.125 504.335L859.142 586.827H824.796H824.818Z" fill="currentColor"/>
          </svg>
          <span className="text-sm font-medium tracking-widest" style={{ fontFamily: "var(--font-jost)" }}>STARTER MINI</span>
        </div>
        <button
          onClick={() => login()}
          className="h-10 cursor-pointer rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign In
        </button>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          A minimal AI chat app built with the Anuma SDK, Privy auth, and
          Next.js.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/anuma-ai/starter-mini"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={SourceCodeSquareIcon} size={16} />
            Source
          </a>
          <a
            href="https://ai-docs.zetachain.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={Book03Icon} size={16} />
            Docs
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat interface
// ---------------------------------------------------------------------------

function Chat() {
  const { logout } = usePrivy();
  const { identityToken } = useIdentityToken();

  //#region getToken
  // Keep token in a ref so getToken always returns the latest value
  const tokenRef = useRef(identityToken);
  useEffect(() => {
    tokenRef.current = identityToken;
  }, [identityToken]);
  const getToken = useCallback(async () => tokenRef.current, []);
  //#endregion getToken

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const streamingRef = useRef("");

  // Auto-scroll sentinel
  const bottomRef = useRef<HTMLDivElement>(null);

  // Helper: extract assistant text from Responses API output
  const extractResponseText = useCallback((response: ChatResponse): string => {
    const output = response?.output;
    if (!Array.isArray(output)) return streamingRef.current;
    return (
      output
        .filter((item: OutputItem): item is OutputMessage => item.type === "message" && (item as OutputMessage).role === "assistant")
        .flatMap((item) => item.content || [])
        .filter((part): part is OutputTextPart => part.type === "output_text")
        .map((part) => part.text || "")
        .join("") || streamingRef.current
    );
  }, []);

  //#region useChatHook
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
  //#endregion useChatHook

  // Auto-scroll when messages or streaming text change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  //#region handleSubmit
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
  //#endregion handleSubmit

  // Keyboard: Enter to send, Shift+Enter for newline
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
    },
    []
  );

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-end px-4 py-3">
        <button
          onClick={() => logout()}
          className="cursor-pointer rounded-full border border-input px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign Out
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-auto flex max-w-[80%] justify-end"
                  : "w-full"
              }
            >
              {msg.role === "user" ? (
                <div
                  className="w-fit rounded-[50px] bg-secondary px-4 py-3 text-base text-foreground"
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                >
                  {msg.content}
                </div>
              ) : (
                <div className="w-full text-base text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-4">
                  <Streamdown shikiTheme={["github-light", "github-dark"]}>
                    {msg.content}
                  </Streamdown>
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isLoading && (
            <div className="w-full">
              {streamingText ? (
                <div className="w-full text-base text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-4">
                  <Streamdown shikiTheme={["github-light", "github-dark"]}>
                    {streamingText}
                  </Streamdown>
                </div>
              ) : (
                <span className="animate-pulse-dot inline-block size-2 rounded-full bg-current opacity-50" />
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <div
            className="flex flex-1 items-end rounded-[30px] border border-input bg-background"
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-5 py-3 text-base outline-none field-sizing-content max-h-48"
            />
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? stop : undefined}
              disabled={!isLoading && !input.trim()}
              className="m-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {isLoading ? (
                <HugeiconsIcon icon={SquareIcon} size={14} fill="currentColor" />
              ) : (
                <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={16} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

