import fs from 'fs';
import { useEnv } from './utils/useEnv';
import { push as pushPage } from './sync/pageSync';
import { push as pushView } from './sync/viewSync';
import { push as pushLayout } from './sync/layoutSync';
import { push as pushCode } from './sync/codeSync';
import { push as pushApi } from './sync/apiSync';
import { push as pushStyle } from './sync/styleSync';
import { push as pushScript } from './sync/scriptSync';

const { SYNC_MODULES, KOOBOO_DIR } = useEnv();

export async function pushTask(force = false) {
  // 确保Kooboo目录存在
  if (!fs.existsSync(KOBOOO_DIR)) {
    fs.mkdirSync(KOBOOO_DIR, { recursive: true });
  }

  const pushFunctions = {
    Api: pushApi,
    Page: pushPage,
    View: pushView,
    Layout: pushLayout,
    Code: pushCode,
    Style: pushStyle,
    Script: pushScript
  };

  const totalModules = SYNC_MODULES.length;
  let completedModules = 0;

  console.log(`开始推送任务，共 ${totalModules} 个模块需要处理...`);

  for (const module of SYNC_MODULES) {
    try {
      if (pushFunctions[module]) {
        console.log(`正在推送模块: ${module}...`);
        await pushFunctions[module](force);
        completedModules++;
        console.log(`模块 ${module} 推送完成 (${completedModules}/${totalModules})`);
      } else {
        console.warn(`未知模块: ${module}，跳过推送`);
      }
    } catch (error) {
      console.error(`推送模块 ${module} 时发生错误:`, error);
    }
  }

  if (completedModules === totalModules) {
    console.log('所有模块推送完成！');
  } else {
    console.warn(`部分模块推送失败，成功推送 ${completedModules}/${totalModules} 个模块`);
  }
}