import { HEADERS_SUPPORTED, createTransport } from '#transport'
import type { DataMode, MessageOf } from './message-channel.js'
import {
  type Awaitable,
  type WebSocketIterable,
  type WebSocketOptions,
  websocketFactory,
} from './websocket.js'

export type {
  CloseEventDetail,
  DataMode,
  MessageOf,
} from './message-channel.js'
// `Sender` is public because `onConnect` hands one to the caller. The rest of
// the transport contract (`Transport`, `TransportOptions`, `TransportFactory`,
// `createWebSocket`) stays internal: platform selection happens through the
// `#transport` imports condition, so a third-party transport has no supported
// way in anyway, and exporting the interface would commit us to its shape for no
// consumer that exists. Widening a public API later is easy; narrowing it isn't.
export type { HeadersInit, Sender } from './transport/transport.js'
export type {
  Awaitable,
  WebSocketIterable,
  WebSocketOptions,
} from './websocket.js'

export { CloseCode } from './lib/close-codes.js'
export {
  BufferOverflowError,
  CloseError,
  DataModeError,
  HeartbeatTimeoutError,
  IdleTimeoutError,
  SocketError,
  UnexpectedResponseError,
  WebSocketClientError,
} from './lib/errors.js'
export {
  FATAL_CLOSE_CODES,
  defaultShouldReconnect,
  isReconnectableClose,
} from './lib/reconnect-policy.js'

/**
 * Whether the platform WebSocket implementation supports creating WebSockets
 * with a {@link WebSocketOptions.headers} option. Node does, the browser
 * doesn't. Creating a WebSocket with headers on a platform that doesn't support
 * them throws an error.
 */
// @NOTE Must be explicitly typed a boolean
export const HEADERS_SUPPORTED_PLATFORM: boolean = HEADERS_SUPPORTED

export type NodeWebSocketOptions<
  M extends DataMode = 'auto',
  T = MessageOf<M>,
> = WebSocketOptions<M, T>
export type BrowserWebSocketOptions<
  M extends DataMode = 'auto',
  T = MessageOf<M>,
> = Omit<WebSocketOptions<M, T>, 'headers'>

/**
 * A function allows building an isomorphic {@link WebSocketIterable}.
 */
export function websocket(
  url: string | URL | (() => Awaitable<string | URL>),
  options?: WebSocketOptions<'auto'>,
): WebSocketIterable<'auto'>
export function websocket<M extends DataMode, T = MessageOf<M>>(
  url: string | URL | (() => Awaitable<string | URL>),
  options: M extends 'auto'
    ? WebSocketOptions<'auto', T>
    : WebSocketOptions<M, T> & { dataMode: M },
): WebSocketIterable<M, T>
export function websocket<M extends DataMode, T = MessageOf<M>>(
  url: string | URL | (() => Awaitable<string | URL>),
  options: WebSocketOptions<M, T> = {},
): WebSocketIterable<M, T> {
  return websocketFactory(url, createTransport, options)
}
