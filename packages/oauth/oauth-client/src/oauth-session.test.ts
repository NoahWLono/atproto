import { describe, expect, it, vi } from 'vitest'
import type { Key } from '@atproto/jwk'
import type { OAuthServerAgent, TokenSet } from './oauth-server-agent.js'
import { OAuthSession } from './oauth-session.js'
import type { SessionGetter } from './session-getter.js'

const SUB = 'did:plc:example'

function makeTokenSet(aud: string): TokenSet {
  return {
    iss: 'https://as.example.com',
    sub: SUB,
    aud,
    scope: 'atproto',
    access_token: 'access-tok',
    token_type: 'DPoP',
  }
}

// Only the members the OAuthSession constructor reads to set up DPoP.
const server = {
  dpopKey: { algorithms: ['ES256'] } as unknown as Key,
  serverMetadata: { dpop_signing_alg_values_supported: ['ES256'] },
  runtime: { sha256: async () => '' },
  dpopNonces: new Map(),
} as unknown as OAuthServerAgent

describe(OAuthSession, () => {
  describe(OAuthSession.prototype.resolveUrl, () => {
    it('resolves against the audience of the current tokens', async () => {
      const getSession = vi.fn(async () => ({
        tokenSet: makeTokenSet('https://pds.example.com'),
      }))
      const session = new OAuthSession(server, SUB, {
        getSession,
      } as unknown as SessionGetter)

      const url = await session.resolveUrl('/xrpc/io.example.sub?cursor=1')
      expect(String(url)).toBe(
        'https://pds.example.com/xrpc/io.example.sub?cursor=1',
      )
      // Same freshness policy as fetchHandler: refresh only if expired.
      expect(getSession).toHaveBeenCalledWith(SUB, 'auto')
    })

    it('follows the audience when a refresh moves the session', async () => {
      const getSession = vi
        .fn()
        .mockResolvedValueOnce({ tokenSet: makeTokenSet('https://old.pds') })
        .mockResolvedValueOnce({ tokenSet: makeTokenSet('https://new.pds') })
      const session = new OAuthSession(server, SUB, {
        getSession,
      } as unknown as SessionGetter)

      expect(String(await session.resolveUrl('/xrpc/x'))).toBe(
        'https://old.pds/xrpc/x',
      )
      expect(String(await session.resolveUrl('/xrpc/x'))).toBe(
        'https://new.pds/xrpc/x',
      )
    })
  })
})
