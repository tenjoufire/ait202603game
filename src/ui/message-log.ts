import { MESSAGE_LOG_MAX } from '../constants';

export const pushMessages = (log: string[], entries: string[]): string[] => {
  log.push(...entries);
  return log.slice(-MESSAGE_LOG_MAX);
};