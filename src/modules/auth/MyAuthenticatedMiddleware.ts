import { AuthenticatedMiddleware, OverrideMiddleware } from 'ts-express-decorators';

import { Unauthorized } from 'ts-httpexceptions';
import { User } from './user/UserModel';
import * as core from 'express-serve-static-core';
import { IUser } from './user/User';

export interface UserRequest extends core.Request {
  user: IUser;
}

@OverrideMiddleware(AuthenticatedMiddleware)
export default class MyAuthenticatedMiddleware extends AuthenticatedMiddleware {

  public static async parseUserTokenHeader(
    req: UserRequest
  ) {
    const userTokenHeader = req.headers['x-user-token'];

    // If the userTokenHeader isn't provided we can't parse it.
    if ( userTokenHeader === undefined ) {
      throw new Unauthorized('User not authorized.');
    }

    // Getting the user from database
    let user = await User.findOne({
      token: userTokenHeader
    });

    // console.log(userTokenHeader, user);

    // Checking if there's a user with the specified token and validating if they are the same.
    if ( user !== null && user.token === userTokenHeader ) {
      req.user = user;
    } else {
      throw new Unauthorized('Unauthorized');
    }

    return req;
  }

  public async use(
    endpoint,
    request,
    next
  ) {
    await MyAuthenticatedMiddleware.parseUserTokenHeader(
      request
    );

    return next();
  }
}
