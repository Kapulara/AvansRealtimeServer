import * as _ from 'lodash';
import { Service } from 'ts-express-decorators';
import { BadRequest, Unauthorized } from 'ts-httpexceptions';
import { User } from './UserModel';
import * as uuidv4 from 'uuid/v4';

@Service()
export class UserService {

  public async create(
    userObject
  ) {
    if ( _.isNil(userObject[ 'email' ]) ) {
      throw new BadRequest('Email is required.');
    }
    if ( _.isNil(userObject[ 'password' ]) ) {
      throw new BadRequest('Password is required.');
    }

    if ( await this.exists(userObject[ 'email' ]) ) {
      throw new BadRequest('Email already exists.');
    }

    const newUser = await new User({
      email: userObject[ 'email' ],
      password: userObject[ 'password' ]
    })
      .save();

    return `User created with ${newUser.email}, it has to be activated by an Admin first.`;
  }

  public async exists(email: string) {
    return _.isNil(await User.findOne({ email })) === false;
  }

  public async validate(
    email,
    password
  ) {
    if ( await this.exists(email) ) {
      const user = await User.findOne({ email });

      if ( user.verifyPasswordSync(password) ) {
        if ( user.activated === false ) {
          throw new Unauthorized('User is not activated.');
        }

        // Update token
        user.token = uuidv4();
        await user.save();

        return {
          _id: user._id,
          email: user.email,
          token: user.token
        };
      }
    }

    throw new Unauthorized('Failed to authorize with given credentials.');
  }
}
