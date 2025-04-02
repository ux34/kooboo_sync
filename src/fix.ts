import fs from 'fs';
import { useEnv } from './utils/useEnv';
import { fixLocalCode } from './sync/genericSync';

const { SYNC_MODULES, KOOBOO_DIR } = useEnv();

export async function fixTask() {
  // 确保Kooboo目录存在
  if (!fs.existsSync(KOOBOO_DIR)) {
    fs.mkdirSync(KOOBOO_DIR, { recursive: true });
  }
  for (const module of SYNC_MODULES) {
    // 确保文件夹存在
    const folderPath = `${KOOBOO_DIR}/${module}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    // 本地代码修复
    fixLocalCode(module);
  }
}