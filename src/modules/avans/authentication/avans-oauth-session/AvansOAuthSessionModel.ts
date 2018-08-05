import { IAvansOAuthSession, IOAuth } from './AvansOAuthSession';

require('dotenv').config();

import * as mongoose from "mongoose";
import * as _ from 'lodash';

export const PROCEDURE_STARTED = 'PROCEDURE_STARTED';
export const PROCEDURE_FINISHED = 'PROCEDURE_FINISHED';
export const PROCEDURE_EXCHANGED = 'PROCEDURE_EXCHANGED';

const avansOAuthSession = new mongoose.Schema({
  oauth_token: {
    type: String,
    required: true,
    unique: true
  },
  oauth_token_secret: {
    type: String,
    required: true
  },
  oauth_verifier: {
    type: String,
    default: null
  },
  state: {
    type: String,
    enum: [
      PROCEDURE_STARTED,
      PROCEDURE_FINISHED,
      PROCEDURE_EXCHANGED
    ],
    default: PROCEDURE_STARTED
  },
  isAccessToken: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

avansOAuthSession.methods.getOAuth = async function(_id = null): Promise<IOAuth | null> {
  if(_.isNil(_id)) {
    _id = this._id;
  }

  const session = await this.model('AvansOAuthSession').findOne({_id});

  if (!_.isNil(session)) {
    if (session.isAccessToken === true && session.state === PROCEDURE_EXCHANGED) {
      return {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        token: session.oauth_token,
        token_secret: session.oauth_token_secret
      }
    } else {
      throw new Error('Session not exchanged to a Access Token. This could be due to an unfinished login procedure.')
    }
  } else {
    throw new Error('Session could not be found')
  }
};


export const AvansOAuthSession = mongoose.model<IAvansOAuthSession>('AvansOAuthSession', avansOAuthSession);
