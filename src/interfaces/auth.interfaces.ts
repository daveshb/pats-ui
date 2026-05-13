// ---------------------------------------------------------------------------
// Auth interfaces & errors
// ---------------------------------------------------------------------------

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SrpLoginParams {
  region: string;
  userPoolId: string;
  clientId: string;
  username: string;
  password: string;
}

export interface GetUserDetailsParams {
  region: string;
  accessToken: string;
}

export interface RefreshTokensParams {
  region: string;
  clientId: string;
  refreshToken: string;
}

export interface UserAttributes {
  email?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
  email_verified?: string;
  [key: string]: string | undefined;
}

export interface UserDetails {
  username: string;
  attributes: UserAttributes;
}

export interface SessionUser {
  username: string;
  idToken: string;
  accessToken: string;
  refreshToken: string;
  keepLoggedIn: boolean;
  tokenRefreshedAt: number;
  /** Unix ms timestamp when the access token expires */
  tokenExpiresAt: number;
  firstName: string;
  lastName: string;
}

export interface MigrationData {
  username: string;
  password: string;
  keepLoggedIn: boolean;
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export class SessionExpiredError extends Error {
  constructor(message = "Session expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
