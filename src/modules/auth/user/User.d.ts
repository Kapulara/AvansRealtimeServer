import { Document } from "mongoose";

export interface IUser {

  // Fields
  email: string;
  password: string;
  fromEmail: string;
  token: string;
  activated: boolean;

  // Dates
  updatedAt: Date;
  createdAt: Date;

  // Password Types
  verifyPassword(value: string, callback?: (err, valid: boolean) => void): () => Promise<boolean>;
  verifyPasswordSync(value: string): () => boolean;
  encryptPassword(value: string, callback?: (err, encryptedValue: string) => void): () => Promise<string>;
}

export interface IUser extends Document {
  _id: any;

  // Fields
  email: string;
  password: string;
  fromEmail: string;
  token: string;
  activated: boolean;

  // Dates
  updatedAt: Date;
  createdAt: Date;

  // Password Types
  verifyPassword(value: string, callback?: (err, valid: boolean) => void): () => Promise<boolean>;
  verifyPasswordSync(value: string): () => boolean;
  encryptPassword(value: string, callback?: (err, encryptedValue: string) => void): () => Promise<string>;
}
