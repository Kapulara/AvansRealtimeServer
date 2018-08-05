import * as crypto from 'crypto';

export function generateToken(
  length = 48,
  encoding = 'hex'
) {
  return crypto.randomBytes(length).toString(encoding);
}
