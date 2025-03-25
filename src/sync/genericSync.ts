import fs from 'fs';
import path from 'path';
import { SYNC_CONFIG } from '../config/syncConfig';
import { readMetadata, updateMetadataWithHash, calculateFileHash, calculateDiff } from '../utils/syncUtils';
import * as api from '../api/code';
import * as layout from '../api/layout';
import * as page from '../api/page';
import * as script from '../api/script';
import * as style from '../api/style';
import * as view from '../api/view';
import { useEnv } from '../utils/useEnv';
import { Module, Metadata } from '../types';

const { KOOBOO_DIR } = useEnv();

const API_MAP = {
  getEdit: {
    Api: (id: string) => api.getEdit('Api', id),
    Code: (id: string) => api.getEdit('CodeBlock', id),
    Layout: layout.getLayout,
    Page: page.getEdit,
    Script: script.getEdit,
    Style: style.getEdit,
    View: view.getEdit
  },
  getList: {
    Api: () => api.getListByType('Api'),
    Code: () => api.getListByType('CodeBlock'),
    Layout: layout.getList,
    Page: page.getList,
    Script: script.getList,
    Style: style.getList,
    View: view.getList
  },
  create: {

  },
  update: {

  },
  delete: {

  },
  isUniqueName: {

  },
  isUniqueUrl: {

  }
};

export async function pull(moduleName: Module, force = false) {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath);
  }

  // 第一步：获取模块列表并对比差异
  const metadataPath = path.join(modulePath, '__metadata.json');
  const oldData = readMetadata<Metadata>(metadataPath);
  const newData = await API_MAP.getList[moduleName]();

  const diff = calculateDiff(oldData, newData);

  if (diff.added.length > 0 || diff.removed.length > 0 || diff.updated.length > 0) {
    console.log(`${moduleName} 模块差异:`);
    if (diff.added.length > 0) console.log(`新增: ${diff.added.map(item => item.name).join(', ')}`);
    if (diff.removed.length > 0) console.log(`删除: ${diff.removed.map(item => item.name).join(', ')}`);
    if (diff.updated.length > 0) console.log(`更新: ${diff.updated.map(item => item.name).join(', ')}`);
    if (force && diff.unchanged.length > 0) console.log(`覆盖: ${diff.unchanged.map(item => item.name).join(', ')}`);
  } else {
    console.log(`${moduleName} 模块无变化`);
  }

  // 第二步：同步代码文件

  // 根据差异同步文件
  for (const item of diff.added) {
    const code = await API_MAP.getEdit[moduleName](item.id);
    fs.writeFileSync(path.join(modulePath, `${item.name}${config.fileExtension}`), code.body);
  }
  for (const item of diff.removed) {
    fs.unlinkSync(path.join(modulePath, `${item.name}${config.fileExtension}`));
  }
  for (const item of diff.updated) {
    const code = await API_MAP.getEdit[moduleName](item.id);
    fs.writeFileSync(path.join(modulePath, `${item.name}${config.fileExtension}`), code.body);
  }

  // 强制同步未更改的文件
  if (force) {
    for (const item of diff.unchanged) {
      const code = await API_MAP.getEdit[moduleName](item.id);
      fs.writeFileSync(path.join(modulePath, `${item.name}${config.fileExtension}`), code.body);
    }
  }

  // 删除本地多余的文件
  const localFiles = fs.readdirSync(modulePath)
    .filter(file => file !== '__metadata.json' && (config.fileExtension ? file.endsWith(config.fileExtension) : true));
  const koobooFiles = new Set(newData.map(item => `${item.name}${config.fileExtension}`));

  for (const file of localFiles) {
    if (!koobooFiles.has(file)) {
      fs.unlinkSync(path.join(modulePath, file));
      console.log(`删除本地多余文件: ${file}`);
    }
  }

  // 更新元数据中的文件哈希值
  const updatedData = updateMetadataWithHash(newData, modulePath, config.fileExtension);

  // 写入新的 __metadata.json 文件
  fs.writeFileSync(metadataPath, JSON.stringify(updatedData, null, 2));

  console.log(`${moduleName} 模块拉取完成`);
}

// 本地代码检查
export async function checkLocalCode(moduleName: Module): Promise<{ valid: boolean; errors: string[] }> {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  const metadataPath = path.join(modulePath, '__metadata.json');

  if (!fs.existsSync(metadataPath)) {
    return { valid: false, errors: ['__metadata.json 文件不存在'] };
  }

  const metadata = readMetadata<Metadata>(metadataPath);
  const errors: string[] = [];

  // 检查每个文件是否存在
  for (const item of metadata) {
    const filePath = path.join(modulePath, `${item.name}${config.fileExtension}`);
    if (!fs.existsSync(filePath)) {
      errors.push(`文件 ${item.name}${config.fileExtension} 不存在`);
    }
  }

  // 检查是否有未记录在metadata中的文件
  const localFiles = fs.readdirSync(modulePath)
    .filter(file => file !== '__metadata.json' && (config.fileExtension ? file.endsWith(config.fileExtension) : true));
  const metadataFiles = new Set(metadata.map(item => `${item.name}${config.fileExtension}`));

  for (const file of localFiles) {
    if (!metadataFiles.has(file)) {
      errors.push(`文件 ${file} 未记录在 __metadata.json 中`);
    }
  }

  // 检查Module.Api是否有url字段和Module.Page是否有path字段
  if (moduleName === Module.Api) {
    for (const item of metadata) {
      if (!item.url) {
        errors.push(`Api ${item.name} 缺少 url 字段`);
      }
    }
  } else if (moduleName === Module.Page) {
    for (const item of metadata) {
      if (!item.path) {
        errors.push(`Page ${item.name} 缺少 path 字段`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 修复本地代码
export async function fixLocalCode(moduleName: Module) {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  const metadataPath = path.join(modulePath, '__metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    console.error('__metadata.json 文件不存在');
    return;
  }

  const metadata = readMetadata<Metadata>(metadataPath);
  const localFiles = fs.readdirSync(modulePath)
    .filter(file => file !== '__metadata.json' && (config.fileExtension ? file.endsWith(config.fileExtension) : true));

  // 获取现有metadata中的文件名集合
  const metadataFiles = new Set(metadata.map(item => `${item.name}${config.fileExtension}`));

  // 处理每个本地文件
  for (const file of localFiles) {
    if (!metadataFiles.has(file)) {
      // 提取name（去掉扩展名）
      const name = file.replace(config.fileExtension, '');
      
      // 创建新的metadata项
      const newItem: Metadata = {
        id: '',
        name,
        url: moduleName === Module.Api ? `/${name}` : undefined,
        path: moduleName === Module.Page ? `/${name}` : undefined
      };

      // 添加到metadata
      metadata.push(newItem);
      console.log(`新增文件 ${file} 到 metadata`);
    }
  }

  // 写入更新后的metadata
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('metadata 更新完成');
}


export async function push(moduleName: Module, force = false) {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  const metadataPath = path.join(modulePath, '__metadata.json');

  // 1. 获取本地元数据
  const localMetadata = readMetadata<Metadata>(metadataPath);

  // 2. 获取远程数据
  const remoteData = await API_MAP.getList[moduleName]();

  // 3. 计算差异
  const diff = calculateDiff(remoteData, localMetadata);

  // 4. 处理差异
  if (diff.added.length > 0 || diff.removed.length > 0 || diff.updated.length > 0) {
    console.log(`${moduleName} 模块差异:`);
    if (diff.added.length > 0) console.log(`新增: ${diff.added.map(item => item.name).join(', ')}`);
    if (diff.removed.length > 0) console.log(`删除: ${diff.removed.map(item => item.name).join(', ')}`);
    if (diff.updated.length > 0) console.log(`更新: ${diff.updated.map(item => item.name).join(', ')}`);
    if (force && diff.unchanged.length > 0) console.log(`覆盖: ${diff.unchanged.map(item => item.name).join(', ')}`);
  } else {
    console.log(`${moduleName} 模块无变化`);
  }

  // 5. 推送代码文件
  // 根据差异同步文件
  for (const item of diff.added) {
    
  }
  for (const item of diff.removed) {
    
  }
  for (const item of diff.updated) {
    
  }

  // 强制同步未更改的文件
  if (force) {
    for (const item of diff.unchanged) {
      
    }
  }

  
}

