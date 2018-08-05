require('dotenv')
  .config();

import { Controller, Get, QueryParams, Res } from 'ts-express-decorators';
import * as queryString from 'querystring';
import * as assert from 'assert';
import { AvansApiClient } from '../AvansApiClient';
import {
  AvansOAuthSession,
  PROCEDURE_EXCHANGED,
  PROCEDURE_FINISHED
} from './avans-oauth-session/AvansOAuthSessionModel';
import * as _ from 'lodash';

@Controller('/avans/authentication')
export class AuthenticationController {

  @Get('/start')
  public async onAvansAuthorizationStart(
    @Res() res
  ) {
    const response = await AvansApiClient.getRequestToken();
    const { oauth_problem, authentification_url, oauth_token, oauth_token_secret } = response;

    if ( !_.isNil(oauth_problem) ) {
      return res.status(500)
        .json({ err: true, data: oauth_problem });
    }

    const redirectUrl = `${authentification_url}?${queryString.stringify({ oauth_token })}`;

    await new AvansOAuthSession({ oauth_token, oauth_token_secret }).save();

    res.status(302)
      .redirect(redirectUrl);
  }

  @Get('/callback')
  public async onAvansAuthorizationCallback(
    @Res() res,
    @QueryParams() queryParams
  ) {
    const { oauth_token: query_oauth_token, oauth_verifier: query_oauth_verifier } = queryParams;
    console.log(
      query_oauth_token,
      query_oauth_verifier
    );

    assert(
      _.isString(query_oauth_token),
      'query param \'oauth_token\' should be a string'
    );
    assert(
      _.isString(query_oauth_verifier),
      'query param \'oauth_verifier\' should be a string'
    );
    const session = await AvansOAuthSession.findOne({ oauth_token: query_oauth_token });

    if ( _.isNil(session) ) {
      return res.status(404)
        .json({ err: true, message: 'Did not find session by oauth_token.' });
    }

    await session.update({
      query_oauth_verifier,
      state: PROCEDURE_FINISHED
    });

    const accessCodeBody = await AvansApiClient.getAccessToken({
      token: session.oauth_token,
      token_secret: session.oauth_token_secret,
      verifier: query_oauth_verifier
    });
    console.log(accessCodeBody);
    const { oauth_problem, oauth_token, oauth_token_secret } = accessCodeBody;

    if ( !_.isNil(oauth_problem) ) {
      return res.status(500)
        .json({ err: true, data: oauth_problem });
    }

    await session.update({
      oauth_token,
      oauth_token_secret,
      oauth_verifier: null,
      state: PROCEDURE_EXCHANGED,
      isAccessToken: true
    });

    const api = AvansApiClient.create(await session.getOAuth());
    const user = await AvansApiClient.responseWrapper(
      api.getUser(),
      res
    );
    const studentNumber = await AvansApiClient.responseWrapper(
      api.getStudentNumber(),
      res
    );
    const departmentStudy = await AvansApiClient.responseWrapper(
      api.getDepartmentStudy(),
      res
    );

    if ( !_.isNil(user) && !_.isNil(studentNumber) && !_.isNil(departmentStudy) ) {
      return res.status(200)
        .json({
          err: false,
          message: 'Exchanged the temporary token to a access token!',
          data: {
            user,
            studentNumber,
            departmentStudy
          }
        });
    } else {
      return res.status(500)
        .json({
          err: true,
          message: 'Something wen\'t wrong while receiving data.',
          data: {
            user,
            studentNumber,
            departmentStudy
          }
        });
    }
  }
}
