import * as fs from 'fs';
import * as path from 'path';
import { GlobalAcceptMimesMiddleware, Inject, ServerLoader, ServerSettings } from 'ts-express-decorators';
import 'ts-express-decorators/lib/socketio';
import 'ts-express-decorators/lib/swagger';
import { $log } from 'ts-log-debug';

import GlobalErrorHandlerMiddleware from './modules/GlobalErrorHandlerMiddleware';
import { MongooseService } from './services/MongooseService';
import Path = require('path');

const rootDir = Path.resolve(__dirname);

const enableHttps = JSON.parse(process.env.ENABLE_HTTPS || 'false') as boolean;

@ServerSettings({
  rootDir,
  swagger: {
    path: '/docs'
  },
  mount: {
    '/api/v1': `${rootDir}/modules/**/**.js`
  },
  httpPort: 3333,
  httpsOptions: !enableHttps ?
    undefined :
    {
      key: fs.readFileSync(
        path.join(
          __dirname,
          '../keys/key.pem'
        ),
        'utf-8'
      ),
      cert: fs.readFileSync(
        path.join(
          __dirname,
          '../keys/cert.pem'
        ),
        'utf-8'
      ),
      passphrase: '1234'
    },
  logger: {
    logRequest: false,
  },
  socketIO: {
    // ... see configuration
  },
  acceptMimes: [ 'application/json' ]
})
export class Server extends ServerLoader {

  private handleError = ( e, service ) => {
    $log.error(`!!! Error while connecting to ${service}. Exiting.`);
    $log.error(e);
    process.exit(1);
  };

  constructor() {
    super();
  }

  $onInit(): Promise<any> {
    return Promise.all([
      MongooseService
        .connect()
        .then(() => $log.info('Connected to MongoDB!'))
        .catch(( e ) => this.handleError(e, 'MongoDB'))
    ]);
  }

  $afterRoutesInit() {
    this
      .use(GlobalErrorHandlerMiddleware)
      .use((req, res) => {
        res.status(404).json({ err: true, message: 'NOT_FOUND' })
      })
  }

  /**
   * This method let you configure the middleware required by your application to works.
   * @returns {Server}
   */
  @Inject()
  $onMountingMiddlewares(): void | Promise<any> {

    const morgan = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      compress = require('compression'),
      methodOverride = require('method-override'),
      tempSession = require('express-session')(
        {
          secret: 'mysecretkey',
          resave: true,
          saveUninitialized: true,
          maxAge: 36000,
          cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: null
          }
        });

    global[ 'session' ] = tempSession;

    this
      .use(GlobalAcceptMimesMiddleware)
      .use(morgan('dev'))
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json({ limit: '50mb' }))
      .use((
        req,
        res,
        next
      ) => {
        res.set(
          'Access-Control-Allow-Origin',
          req.headers.origin
        );
        res.set(
          'Access-Control-Allow-Credentials',
          'true'
        );
        res.set(
          'Access-Control-Allow-Headers',
          'X-User-Token, Content-Type'
        );
        res.set(
          'Access-Control-Allow-Methods',
          'POST, GET, DELETE, PUT, OPTIONS'
        );
        next();
      })
      .use(bodyParser.urlencoded({
        extended: true,
        limit: '50mb'
      }))

      // Configure session used by Passport
      .use(global[ 'session' ]);

    return null;
  }

  $onServerInitError( error ): any {
    $log.error(
      'Server encounter an error =>',
      error
    );
  }
}
