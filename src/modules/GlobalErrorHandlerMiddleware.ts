import { NextFunction as ExpressNext, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Err, IMiddlewareError, MiddlewareError, Next, Request, Response } from 'ts-express-decorators';
import { Exception } from 'ts-httpexceptions';
import { $log } from 'ts-log-debug';

@MiddlewareError()
export default class GlobalErrorHandlerMiddleware implements IMiddlewareError {

  use(
    @Err() error: any,
    @Request() request: ExpressRequest,
    @Response() response: ExpressResponse,
    @Next() next: ExpressNext
  ): any {
    if ( response.headersSent ) {
      return next(error);
    }

    // console.log(request.headers);

    response.set('Access-Control-Allow-Origin', '' + request.headers.origin);
    response.set('Access-Control-Allow-Headers', 'X-User-Token, Content-Type');
    response.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');

    $log.error('' + error);

    const toHTML = (message = '') => message.replace(/\n/gi, '<br />');

    if ( error instanceof Exception ) {
      response.status(error.status).json({
        err: true,
        message: error.message
      });
      return next();
    }

    if ( typeof error === 'string' ) {
      response.status(404).json({
        err: true,
        message: error
      });
      return next();
    }

    // Mongoose Error handler
    if (
      error.code !== undefined &&
      error.index !== undefined &&
      error.errmsg !== undefined
    ) {
      // TODO: Only allow this for Development.

      response.status(500).json({
        err: true,
        message: error.errmsg
      });
      return next();
    }

    // Error has message:
    if ( typeof error.message === 'string' ) {
      response.status(error.status || 500).json({
        err: true,
        message: error.message
      });
      return next();
    }
    response.status(error.status || 500).json({
      err: true,
      message: 'Internal Error'
    });

    return next();
  }
}
