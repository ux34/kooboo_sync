import fs from 'fs';
import { useEnv } from './utils/useEnv';
import { push as pushFunctions } from './sync/genericSync';
import { checkLocalRoutes, checkLocalCode, fixLocalCode } from './sync/genericSync';
import { Module } from './types';

const { SYNC_MODULES, KOOBOO_DIR } = useEnv();

export async function pushTask(force = false) {
  // 确保Kooboo目录存在
  if (!fs.existsSync(KOOBOO_DIR)) {
    fs.mkdirSync(KOOBOO_DIR, { recursive: true });
  }

  // 本地代码修复
  for (const module of SYNC_MODULES) {
    fixLocalCode(module);
  }

  // 如果Module.Api & Module.Page 存在，则检查本地路由
  if (SYNC_MODULES.includes(Module.Api) && SYNC_MODULES.includes(Module.Page)) {
    const { valid, errors } = checkLocalRoutes();
    if (!valid) {
      console.error('本地路由检查失败:', errors);
      process.exit(1);
    }
  }

  // 本地模块代码检查
  for (const module of SYNC_MODULES) {
    const { valid, errors } = checkLocalCode(module);
    if (!valid) {
      console.error(`模块${module}检查失败:`, errors);
      process.exit(1);
    }
  }

  const totalModules = SYNC_MODULES.length;
  let completedModules = 0;

  console.log(`开始推送任务，共 ${totalModules} 个模块需要处理...`);

  for (const module of SYNC_MODULES) {
    try {
      if (Object.keys(Module).includes(module)) {
        console.log(`正在推送模块: ${module}...`);
        await pushFunctions(module, force);
        completedModules++;
        console.log(`模块 ${module} 推送完成 (${completedModules}/${totalModules})`);
      } else {
        console.warn(`未知模块: ${module}，跳过处理`);
      }
    } catch (error) {
      console.error(`推送模块 ${module} 时发生错误:`, error.toString());
    }
  }

  if (completedModules === totalModules) {
    console.log('所有模块推送完成！');
  } else {
    console.warn(`部分模块推送失败，成功处理 ${completedModules}/${totalModules} 个模块`);
    process.exit(1);
  }
}