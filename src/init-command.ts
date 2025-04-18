/**
 * @description Because index.ts reads .env during the import phase, and the init command is used to generate .env, so it's in a separate file.
 */

import { initTask } from './init';
const command = process.argv[2];

switch (command) {
  case 'init':
    initTask(process.argv[3]);
    break;
  default:
    console.log('无效命令');
    process.exit(1);
}


