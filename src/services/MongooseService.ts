require('dotenv').config();

import * as _ from 'lodash';
import * as Mongoose from 'mongoose';
import { Service } from 'ts-express-decorators';
import { Value } from 'ts-json-properties';
import { $log } from 'ts-log-debug/lib';

(<any>Mongoose).Promise = global.Promise;

let env = 'mongoose.production';
if ( !_.isNil(process.env.MONGOOSE_ENV) ) {
  env = `mongoose.${process.env.MONGOOSE_ENV}`;
}

export class MongooseUrl {
  @Value(env)
  dbInfo: { host: string, name: string };

  getHost = () => this.dbInfo.host;
  getName = () => this.dbInfo.name;

  toString() {
    let auth = '';
    if ( !_.isNil(process.env.MONGOOSE_AUTH) ) {
      auth = `${process.env.MONGOOSE_AUTH}@`;
    }

    return 'mongodb://' + auth + this.getHost() + '/' + this.getName();
  }
}

@Service()
export class MongooseService {

  static resource: Mongoose.Connection = null;

  getResource = (): Mongoose.Connection => MongooseService.resource;

  static connect(): Promise<Mongoose.Connection> {
    return new Promise<Mongoose.Connection>((
      resolve,
      reject
    ) => {
      if ( MongooseService.resource ) {
        resolve(MongooseService.resource);
      }

      (<any>Mongoose).Promise = global.Promise;


      try {

        const callbackMongoose: any = (
          error: any,
          connection: Mongoose.Connection
        ) => {
          if ( error !== null ) {
            console.error(error);
            reject(error);
          }

          MongooseService.resource = connection;
          resolve(connection);
        };

        const mongooseUrl = new MongooseUrl().toString();

        $log.info(mongooseUrl);

        Mongoose.connect(mongooseUrl, {
          useMongoClient: true
        } as any, callbackMongoose);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
}
