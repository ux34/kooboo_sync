import fs from 'fs';
import { useEnv } from './utils/useEnv';
import { pull as pullFunctions } from './sync/genericSync';
import { Module } from './types';

export async function pullTask(force = false) {
  const { SYNC_MODULES, KOOBOO_DIR } = useEnv();
  // 确保Kooboo目录存在
  if (!fs.existsSync(KOOBOO_DIR)) {
    fs.mkdirSync(KOOBOO_DIR, { recursive: true });
  }

  const totalModules = SYNC_MODULES.length;
  let completedModules = 0;

  console.log(`开始拉取任务，共 ${totalModules} 个模块需要处理...`);

  for (const module of SYNC_MODULES) {
    try {
      if (Object.keys(Module).includes(module)) {
        console.log(`正在拉取模块: ${module}...`);
        await pullFunctions(module, force);
        completedModules++;
        console.log(`模块 ${module} 拉取完成 (${completedModules}/${totalModules})`);
      } else {
        console.warn(`未知模块: ${module}，跳过处理`);
      }
    } catch (error) {
      console.error(`拉取模块 ${module} 时发生错误:`, error.toString());
    }
  }

  if (completedModules === totalModules) {
    console.log('所有模块拉取完成！');
  } else {
    console.warn(`部分模块拉取失败，成功处理 ${completedModules}/${totalModules} 个模块`);
  }
}