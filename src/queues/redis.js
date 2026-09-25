import IORedis from "ioredis";
import { env } from "../config/env.js";

export const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});
