import { fixTask } from './fix';
import { pullTask } from './pull';
import { pushTask } from './push';
import { sitePullTask } from './site-pull'
import { sitePushTask } from './site-push'

const command = process.argv[2];
const isForce = process.argv.includes('-f') || process.argv.includes('--force');

switch (command) {
  case 'fix':
    fixTask();
    break;
  case 'pull':
    pullTask(isForce);
    break;
  case 'push':
    pushTask(isForce);
    break;
  case 'site-pull':
    sitePullTask(process.argv[3]);
    break;
  case 'site-push':
    sitePushTask(process.argv[3]);
    break;
  default:
    console.log('无效命令');
    process.exit(1);
}


