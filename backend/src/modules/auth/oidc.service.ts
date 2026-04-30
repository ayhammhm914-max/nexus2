import type { Request } from "express";
import { generators, Issuer, type Client, type TokenSet } from "openid-client";
import { env } from "../../config/env";

type OAuthProviderProfile = {
  provider: "google";
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
};

let googleClientPromise: Promise<Client> | null = null;

const getGoogleClient = async () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new Error("Google OAuth is not configured.");
  }

  googleClientPromise ??= Issuer.discover("https://accounts.google.com").then((issuer) =>
    new issuer.Client({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uris: [env.GOOGLE_CALLBACK_URL],
      response_types: ["code"]
    })
  );

  return googleClientPromise;
};

export const oidcService = {
  async createGoogleAuthorizationUrl() {
    const client = await getGoogleClient();
    const state = generators.state();
    const nonce = generators.nonce();
    const authorizationUrl = client.authorizationUrl({
      scope: "openid email profile",
      prompt: "select_account",
      state,
      nonce
    });

    return {
      authorizationUrl,
      state,
      nonce
    };
  },

  async verifyGoogleCallback(req: Request, expected: { state: string; nonce: string }) {
    const client = await getGoogleClient();
    const params = client.callbackParams(req);
    const tokenSet: TokenSet = await client.callback(env.GOOGLE_CALLBACK_URL, params, expected);
    const claims = tokenSet.claims();

    if (!claims.sub || !claims.email) {
      throw new Error("Google account did not return a usable profile.");
    }

    return {
      provider: "google",
      providerUserId: claims.sub,
      email: String(claims.email).toLowerCase(),
      emailVerified: claims.email_verified === true,
      displayName: typeof claims.name === "string" ? claims.name : undefined,
      avatarUrl: typeof claims.picture === "string" ? claims.picture : undefined
    } satisfies OAuthProviderProfile;
  }
};

