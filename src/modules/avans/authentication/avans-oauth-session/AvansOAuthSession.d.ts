import { Document } from 'mongoose';

export interface IOAuth {
  consumer_key: string;
  consumer_secret: string;
  token: string;
  token_secret: string;
}

export interface IAvansOAuthSession {
  // Ids
  _id: any; // Mongoose ID

  // Properties
  oauth_token: string;
  oauth_token_secret: string;
  oauth_verifier: string;
  state: string;
  isAccessToken: boolean;

  // Methods
  getOAuth: (_id?: string) => Promise<IOAuth | null>;

  // Mongoose Dates
  updatedAt: Date;
  createdAt: Date;
}

export interface IAvansOAuthSession extends Document {
  // Properties
  oauth_token: string;
  oauth_token_secret: string;
  oauth_verifier: string;
  state: string;
  isAccessToken: boolean;

  // Methods
  getOAuth: (_id?: string) => Promise<IOAuth | null>;

  // Mongoose Dates
  updatedAt: Date;
  createdAt: Date;
}
