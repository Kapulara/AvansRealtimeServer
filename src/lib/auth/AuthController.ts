const AuthorizationType = [
  'user'
];

export class AuthController {

  /**
   * Parses the authorization type based on the authorization object.
   * @param authorization
   * @returns {any}
   */
  static parseAuthorizationType(authorization: any) {
    if ( authorization === undefined || authorization === null ) {
      return null;
    }

    for (let i = 0; i < AuthorizationType.length; i++) {
      const authorizationType = AuthorizationType[ i ];

      if ( authorization.type === authorizationType ) {
        return authorizationType;
      }
    }

    return null;
  }

  /**
   * Validates the request for a certain level of authorization.
   *
   * @param authorizationType
   * @param request
   * @returns {boolean}
   */
  static validateAuthorization(
    // authorizationType,
    request
  ): boolean {
    // switch (authorizationType) {
    //   case 'user':
    //     return request.user !== null && request.user !== undefined;
    //   default:
    //     return request.userSession !== null && request.userSession !== undefined;
    // }

    return request.user !== null && request.user !== undefined;
  }
}
