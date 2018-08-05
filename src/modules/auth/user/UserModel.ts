import * as mongoose from 'mongoose';
import * as uuidv4 from 'uuid/v4';
import { IUser } from './User';

const validateEmail = function ( email ) {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const user = new mongoose.Schema(
  {

    firstName: String,
    lastName: String,
    fromEmail: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
      validate: [ validateEmail, 'Please fill a valid email address' ],
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address' ]
    },

    token: {
      unique: true,
      type: String,
      default: () => {
        return uuidv4();
      }
    },

    activated: {
      type: Boolean,
      default: false
    },

    streamerMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

user.plugin(require('mongoose-unique-validator'));
user.plugin(require('mongoose-bcrypt'));

export const User = mongoose.model<IUser>(
  'User',
  user
);
