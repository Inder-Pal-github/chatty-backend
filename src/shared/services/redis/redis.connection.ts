import Logger from 'bunyan';
import {config} from '@root/config';
import { BaseClass } from '@service/redis/base.cache';

const log: Logger = config.createLogger('redisconnection');


class RedisConnection extends BaseClass {
  constructor(){
    super('redisconnection');
  }
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      const res = await this.client.ping();
      console.log(res);
    }catch(err){
      log.error(err);
    }
  }
}

export const redisConnection:RedisConnection =  new RedisConnection();
