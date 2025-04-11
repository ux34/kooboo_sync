import { fixTask } from './fix';
import { pullTask } from './pull';
import { pushTask } from './push';

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
  default:
    console.log('请使用以下命令之一：');
    console.log('  init [url]    - 初始化项目');
    console.log('  fix   - 修复本地代码');
    console.log('  pull [-f]   - 从远程拉取代码');
    console.log('  push [-f]   - 推送代码到远程');
    process.exit(1);
}


