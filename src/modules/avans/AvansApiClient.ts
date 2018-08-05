// require('dotenv')
//   .config();

import * as request from 'request-promise';
import * as assert from 'assert';
import * as queryString from 'querystring';
import * as isJSON from 'is-json';
import * as isXML from 'is-xml';
import xml2js from 'xml2js-es6-promise';
import * as _ from 'lodash';
import { IOAuth } from './authentication/avans-oauth-session/AvansOAuthSession';

export const API_URL = process.env.API_URL || 'https://publicapi.avans.nl',
  CALLBACK_HOST = process.env.CALLBACK_HOST || 'http://localhost:3333',
  CALLBACK_URL = process.env.CALLBACK_URL || '/callback/';

export class AvansApiClient {

  public oauth;

  constructor( oauth ) {
    this.oauth = oauth;
  }

  static create( oauth: IOAuth ) {
    assert(
      !_.isNil(oauth),
      `'oauth' should be defined`
    );
    assert(
      !_.isNil(oauth.consumer_key),
      `'oauth.consumer_key' should be defined`
    );
    assert(
      _.isString(oauth.consumer_key),
      `'oauth.consumer_key' should be a string`
    );
    assert(
      !_.isNil(oauth.consumer_secret),
      `'oauth.consumer_secret' should be defined`
    );
    assert(
      _.isString(oauth.consumer_secret),
      `'oauth.consumer_secret' should be a string`
    );
    assert(
      !_.isNil(oauth.token),
      `'oauth.token' should be defined`
    );
    assert(
      _.isString(oauth.token),
      `'oauth.token' should be a string`
    );
    assert(
      !_.isNil(oauth.token_secret),
      `'oauth.token_secret' should be defined`
    );
    assert(
      _.isString(oauth.token_secret),
      `'oauth.token_secret' should be a string`
    );



    return new AvansApiClient(oauth);
  }

  static async getRequestToken() {
    const oauth = {
      callback: `${CALLBACK_HOST}${CALLBACK_URL}`,
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET
    };

    assert(
      !_.isNil(oauth.callback),
      `'oauth.callback' should be defined`
    );
    assert(
      _.isString(oauth.callback),
      `'oauth.callback' should be a string`
    );
    assert(
      !_.isNil(oauth.consumer_key),
      `'oauth.consumer_key' should be defined`
    );
    assert(
      _.isString(oauth.consumer_key),
      `'oauth.consumer_key' should be a string`
    );
    assert(
      !_.isNil(oauth.consumer_secret),
      `'oauth.consumer_secret' should be defined`
    );
    assert(
      _.isString(oauth.consumer_secret),
      `'oauth.consumer_secret' should be a string`
    );

    return AvansApiClient.requestWrapper(
      request.post({
        url: `${API_URL}/oauth/request_token`,
        oauth
      })
    );
  }

  static async getAccessToken( oauth ) {
    oauth = Object.assign(
      {},
      {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
      },
      oauth
    );

    assert(
      !_.isNil(oauth),
      `'oauth' should be defined`
    );
    assert(
      !_.isNil(oauth.consumer_key),
      `'oauth.consumer_key' should be defined`
    );
    assert(
      _.isString(oauth.consumer_key),
      `'oauth.consumer_key' should be a string`
    );
    assert(
      !_.isNil(oauth.consumer_secret),
      `'oauth.consumer_secret' should be defined`
    );
    assert(
      _.isString(oauth.consumer_secret),
      `'oauth.consumer_secret' should be a string`
    );
    assert(
      !_.isNil(oauth.token),
      `'oauth.token' should be defined`
    );
    assert(
      _.isString(oauth.token),
      `'oauth.token' should be a string`
    );
    assert(
      !_.isNil(oauth.token_secret),
      `'oauth.token_secret' should be defined`
    );
    assert(
      _.isString(oauth.token_secret),
      `'oauth.token_secret' should be a string`
    );
    assert(
      !_.isNil(oauth.verifier),
      `'oauth.verifier' should be defined`
    );
    assert(
      _.isString(oauth.verifier),
      `'oauth.verifier' should be a string`
    );

    return AvansApiClient.requestWrapper(
      request.post({
        url: `${API_URL}/oauth/access_token`,
        oauth
      })
    );
  }

  /**
   * Request Wrapper
   *
   * @param req
   * @returns {Promise<*>}
   */
  static async requestWrapper( req ) {
    const body = await req;

    if ( _.isString(body) ) {
      if ( isJSON.strict(body) ) {
        return JSON.parse(body);
      } else {
        if ( isXML(body) ) {
          return await xml2js(body);
        } else {
          return queryString.parse(body);
        }
      }
    }
    return body;
  }

  /**
   * Request Wrapper
   *
   * @param req
   * @returns {Promise<*>}
   */
  static async responseWrapper(
    req,
    res
  ) {
    const body = await req;
    const { oauth_problem } = body;

    if ( !_.isNil(oauth_problem) ) {
      res.status(500)
        .json({ err: true, data: oauth_problem });
      return null;
    }

    return body;
  }

  async getUser() {
    return AvansApiClient.requestWrapper(
      request.post({
        url: `${API_URL}/oauth/api/user`,
        oauth: this.oauth
      })
    );
  }

  async getStudentNumber() {
    return AvansApiClient.requestWrapper(
      request.post({
        url: `${API_URL}/oauth/studentnummer/`,
        oauth: this.oauth
      })
    );
  }

  async getDepartmentStudy() {
    return AvansApiClient.requestWrapper(
      request.post({
        url: `${API_URL}/oauth/afdelingopleding/`,
        oauth: this.oauth
      })
    );
  }
}
