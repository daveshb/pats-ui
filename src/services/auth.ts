/**
 * Auth Service — Login, logout, token refresh, and session management.
 * Consolidates Cognito SRP authentication for both the new and legacy user pools.
 *
 * Environment variables required (prefix NEXT_PUBLIC_ for client-side access):
 *   NEXT_PUBLIC_AWS_REGION
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID_LEGACY
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID_LEGACY
 */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GetUserCommand,
  GetTokensFromRefreshTokenCommand,
  AuthFlowType,
  ChallengeNameType,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  createSrpSession,
  signSrpSession,
  wrapInitiateAuth,
  wrapAuthChallenge,
} from "cognito-srp-helper";
import { SessionExpiredError } from "@/interfaces/auth.interfaces";
import type {
  AuthTokens,
  SrpLoginParams,
  GetUserDetailsParams,
  RefreshTokensParams,
  UserAttributes,
  UserDetails,
  SessionUser,
  MigrationData,
} from "@/interfaces/auth.interfaces";
export type { AuthTokens, SrpLoginParams, GetUserDetailsParams, RefreshTokensParams, UserAttributes, UserDetails, SessionUser, MigrationData };
export { SessionExpiredError };

// ---------------------------------------------------------------------------
// Pool configuration
// ---------------------------------------------------------------------------

const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? "";

const newPool = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
};

const legacyPool = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID_LEGACY ?? "",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_LEGACY ?? "",
};

// ---------------------------------------------------------------------------
// Core SRP login
// ---------------------------------------------------------------------------

export async function srpLogin({
  region,
  userPoolId,
  clientId,
  username,
  password,
}: SrpLoginParams): Promise<AuthTokens> {
  const client = new CognitoIdentityProviderClient({ region });

  const srpSession = createSrpSession(username, password, userPoolId, false);

  const initiateReq = wrapInitiateAuth(srpSession, {
    ClientId: clientId,
    AuthFlow: AuthFlowType.USER_SRP_AUTH,
    AuthParameters: { USERNAME: username },
  });

  const initiateRes = await client.send(new InitiateAuthCommand(initiateReq));

  const signedSession = signSrpSession(srpSession, initiateRes);

  const challengeReq = wrapAuthChallenge(signedSession, {
    ClientId: clientId,
    ChallengeName: ChallengeNameType.PASSWORD_VERIFIER,
    ChallengeResponses: { USERNAME: username },
    Session: initiateRes.Session,
  });

  const challengeRes = await client.send(
    new RespondToAuthChallengeCommand(challengeReq)
  );

  const result = challengeRes.AuthenticationResult;
  if (!result) throw new Error("Authentication failed – no tokens returned");

  return {
    idToken: result.IdToken!,
    accessToken: result.AccessToken!,
    refreshToken: result.RefreshToken!,
    expiresIn: result.ExpiresIn ?? 3600,
    tokenType: result.TokenType ?? "Bearer",
  };
}

// ---------------------------------------------------------------------------
// Sign-in — new pool
// ---------------------------------------------------------------------------

export async function signInNew(
  username: string,
  password: string
): Promise<AuthTokens> {
  try {
    return await srpLogin({
      region: AWS_REGION,
      userPoolId: newPool.userPoolId,
      clientId: newPool.clientId,
      username,
      password,
    });
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

// ---------------------------------------------------------------------------
// Sign-in — legacy pool (used for username migration flow)
// ---------------------------------------------------------------------------

export async function signInLegacy(
  username: string,
  password: string
): Promise<AuthTokens> {
  try {
    return await srpLogin({
      region: AWS_REGION,
      userPoolId: legacyPool.userPoolId,
      clientId: legacyPool.clientId,
      username,
      password,
    });
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

// ---------------------------------------------------------------------------
// Get user attributes from Cognito
// ---------------------------------------------------------------------------

export async function getUserDetails({
  region,
  accessToken,
}: GetUserDetailsParams): Promise<UserDetails> {
  const client = new CognitoIdentityProviderClient({ region });

  const res = await client.send(
    new GetUserCommand({ AccessToken: accessToken })
  );

  const attributes: UserAttributes =
    res.UserAttributes?.reduce<UserAttributes>((acc, { Name, Value }) => {
      if (Name) acc[Name] = Value;
      return acc;
    }, {}) ?? {};

  return { username: res.Username ?? "", attributes };
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

export async function refreshTokens({
  region,
  clientId,
  refreshToken,
}: RefreshTokensParams): Promise<AuthTokens> {
  const client = new CognitoIdentityProviderClient({ region });

  const res = await client.send(
    new GetTokensFromRefreshTokenCommand({
      ClientId: clientId,
      RefreshToken: refreshToken,
    })
  );

  const result = res.AuthenticationResult;
  if (!result) throw new Error("Token refresh failed – no tokens returned");

  return {
    idToken: result.IdToken!,
    accessToken: result.AccessToken!,
    refreshToken: result.RefreshToken ?? refreshToken,
    expiresIn: result.ExpiresIn ?? 3600,
    tokenType: result.TokenType ?? "Bearer",
  };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export function signOut(): void {
  clearSession();
}

// ---------------------------------------------------------------------------
// Session storage
//
//  keepLoggedIn = false  →  memory only (lost on F5 / tab close)
//  keepLoggedIn = true   →  small persistent cookie with refresh token only
//                           (JWT tokens are too large for a cookie — up to ~3 KB each)
//                           On F5, useAuth calls restoreFromPersistentSession() to
//                           exchange the stored refresh token for fresh tokens.
//
// localStorage is intentionally NOT used.
// ---------------------------------------------------------------------------

/** Only the data small enough to fit in a cookie (<4 KB). */
interface PersistentCookieData {
  refreshToken: string;
  username: string;
  firstName: string;
  lastName: string;
}

/** In-memory session — cleared whenever the page is refreshed. */
let _memorySession: SessionUser | null = null;

/** Cookie that stores minimal data for persistent logins. */
const PERSIST_COOKIE = "vantage_persist";
/** Presence flag read by the Next.js middleware (no token data). */
const AUTH_COOKIE = "vantage_auth";

function encodeCookie(data: PersistentCookieData): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decodeCookie(raw: string): PersistentCookieData | null {
  try {
    return JSON.parse(decodeURIComponent(atob(raw))) as PersistentCookieData;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === name) return v ?? null;
  }
  return null;
}

function setCookie(name: string, value: string, maxAge?: number): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const age = maxAge !== undefined ? `; max-age=${maxAge}` : "";
  document.cookie = `${name}=${value}; path=/; SameSite=Strict${secure}${age}`;
}

function deleteCookie(name: string): void {
  setCookie(name, "", 0);
}

/**
 * Stores the session.
 * Always writes to _memorySession so the current page can use tokens immediately.
 * With keepLoggedIn, additionally persists a small cookie with only the refresh
 * token + profile (well under 4 KB) so the session can be restored after F5.
 */
export function storeSession(user: SessionUser): void {
  _memorySession = user;

  if (user.keepLoggedIn) {
    const data: PersistentCookieData = {
      refreshToken: user.refreshToken,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    setCookie(PERSIST_COOKIE, encodeCookie(data), 60 * 60 * 24 * 30);
    setCookie(AUTH_COOKIE, "1", 60 * 60 * 24 * 30);
  } else {
    deleteCookie(PERSIST_COOKIE);
    // Session cookie (no max-age) → cleared when the browser closes.
    // After F5 in the same browser session the cookie survives but
    // _memorySession is gone; useAuth detects this and redirects to login.
    setCookie(AUTH_COOKIE, "1");
  }
}

/** Returns the in-memory session (null after F5). */
export function getSession(): SessionUser | null {
  return _memorySession;
}

/** True when a persistent login cookie exists (keepLoggedIn was used). */
export function hasPersistentSession(): boolean {
  return readCookie(PERSIST_COOKIE) !== null;
}

/**
 * Reads the persistent cookie, exchanges the stored refresh token for fresh
 * tokens, and restores _memorySession. Call this after F5 with keepLoggedIn.
 * Throws SessionExpiredError if the refresh token is invalid or expired.
 */
export async function restoreFromPersistentSession(): Promise<SessionUser> {
  const raw = readCookie(PERSIST_COOKIE);
  if (!raw) throw new SessionExpiredError("No persistent session found.");

  const persisted = decodeCookie(raw);
  if (!persisted) {
    clearSession();
    throw new SessionExpiredError("Corrupt session data.");
  }

  try {
    const tokens = await refreshTokens({
      region: AWS_REGION,
      clientId: newPool.clientId,
      refreshToken: persisted.refreshToken,
    });

    const session: SessionUser = {
      username: persisted.username,
      firstName: persisted.firstName,
      lastName: persisted.lastName,
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      keepLoggedIn: true,
      tokenRefreshedAt: Date.now(),
      tokenExpiresAt: Date.now() + tokens.expiresIn * 1_000,
    };

    storeSession(session);
    return session;
  } catch {
    clearSession();
    throw new SessionExpiredError();
  }
}

export function clearSession(): void {
  _memorySession = null;
  if (typeof document !== "undefined") {
    deleteCookie(PERSIST_COOKIE);
    deleteCookie(AUTH_COOKIE);
  }
}

// ---------------------------------------------------------------------------
// Token refresh & session guard
//
// Call ensureFreshSession() before any authenticated request.
// • Access token expired  → silent refresh via Cognito refresh token.
// • Refresh token expired → throws SessionExpiredError (caller redirects to /login).
// ---------------------------------------------------------------------------

/** 30-second buffer before declared expiry to avoid edge-race conditions. */
const EXPIRY_BUFFER_MS = 30_000;

export async function ensureFreshSession(): Promise<SessionUser> {
  const session = getSession();
  if (!session) throw new SessionExpiredError();

  const isAccessTokenExpired =
    Date.now() >= session.tokenExpiresAt - EXPIRY_BUFFER_MS;

  if (!isAccessTokenExpired) return session;

  // Access token is stale — try silent refresh
  try {
    const newTokens = await refreshTokens({
      region: AWS_REGION,
      clientId: newPool.clientId,
      refreshToken: session.refreshToken,
    });

    const updatedSession: SessionUser = {
      ...session,
      idToken: newTokens.idToken,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      tokenRefreshedAt: Date.now(),
      tokenExpiresAt: Date.now() + newTokens.expiresIn * 1_000,
    };

    storeSession(updatedSession);
    return updatedSession;
  } catch {
    clearSession();
    throw new SessionExpiredError();
  }
}

// ---------------------------------------------------------------------------
// Migration data helpers
// ---------------------------------------------------------------------------

const MIGRATION_KEY = "migrationData";

export function storeMigrationData(data: MigrationData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(data));
}

export function getMigrationData(): MigrationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MIGRATION_KEY);
    return raw ? (JSON.parse(raw) as MigrationData) : null;
  } catch {
    return null;
  }
}

export function clearMigrationData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MIGRATION_KEY);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error("Authentication failed. Please try again.");
  }
  const name = (error as { name?: string }).name ?? "";
  switch (name) {
    case "UserNotFoundException":
      return new Error("User not found. Please check your email and try again.");
    case "NotAuthorizedException":
      return new Error("Invalid email or password.");
    case "InvalidParameterException":
      return new Error("Invalid login parameters. Please try again.");
    case "TooManyRequestsException":
      return new Error(
        "Too many login attempts. Please wait and try again later."
      );
    case "UserNotConfirmedException":
      return new Error(
        "Account not confirmed. Please check your email for verification instructions."
      );
    default:
      return new Error(
        error.message ?? "Authentication failed. Please try again."
      );
  }
}
