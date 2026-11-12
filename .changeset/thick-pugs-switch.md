---
'@atproto/lex-rpc': patch
---

Add XRPC subscription support with `xrpcSubscribe()`: an async generator of the subscription's messages, validated against its message schema, over a reconnecting `@atproto/ws-client` connection. Failures are reported as `XrpcSubscriptionError` subclasses. Agents provide the subscription's URL through a new optional `Agent` member, `resolveUrl(path)`, implemented by agents created by `buildAgent()` from a service URL.

The `params` option of `xrpc()`, `xrpcSafe()` and `xrpcSubscribe()` also accepts a (possibly async) function returning the params, invoked for every attempt (each retry, each subscription reconnection).
