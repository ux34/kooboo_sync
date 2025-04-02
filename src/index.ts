import { fixTask } from './fix';
import { pullTask } from './pull';
import { pushTask } from './push';

const command = process.argv[2];

switch (command) {
  case 'fix':
    fixTask();
    break;
  case 'pull':
    pullTask();
    break;
  case 'push':
    pushTask();
    break;
  default:
    console.log('请使用以下命令之一：');
    console.log('  fix    - 修复本地代码');
    console.log('  pull   - 从远程拉取代码');
    console.log('  push   - 推送代码到远程');
    process.exit(1);
}


