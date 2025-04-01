import fs from 'fs';
import path from 'path';
import { Metadata } from '../types';

// 计算文件哈希值（仅基于文件内容）
export const calculateFileHash = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const hash = require('crypto').createHash('sha256');
  hash.update(fileContent);
  return hash.digest('hex');
};

// 读取元数据文件
export const readMetadata = <T>(metadataPath: string): T[] => {
  if (fs.existsSync(metadataPath)) {
    try {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    } catch (error) {
      console.warn('读取 __metadata.json 文件失败，将使用空数组作为初始数据');
    }
  }
  return [];
};

// 更新元数据中的文件哈希值
export const updateMetadataWithHash = (data: Metadata[], modulePath: string, fileExtension = '') => {
  return data.map(item => {
    const filePath = path.join(modulePath, `${item.name}${fileExtension}`);
    if (fs.existsSync(filePath)) {
      return {
        ...item,
        fileHash: calculateFileHash(filePath)
      };
    }
    return item;
  });
};

// 计算文件差异
export const calculateDiff = (
  oldData: Metadata[], 
  newData: Metadata[],
  config?: { modulePath: string, fileExtension: string }
) => {
  const oldMap = new Map(oldData.map(item => [item.id, item]));
  const newMap = new Map(newData.map(item => [item.id, item]));

  // 处理name变化的情况，Kooboo中name是无法直接更新的
  const nameChanged = newData.filter(newItem => {
    const oldItem = oldMap.get(newItem.id);
    return oldItem && oldItem.name !== newItem.name;
  });

  const added = newData.filter(newItem => !oldMap.has(newItem.id));
  const removed = oldData.filter(oldItem => !newMap.has(oldItem.id));

  const updated = newData.filter(newItem => {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem || nameChanged.includes(newItem)) return false;

    // 检查基本属性是否变化
    const isModified = (
      oldItem.lastModified !== newItem.lastModified ||
      (newItem.url && oldItem.url !== newItem.url) ||
      (newItem.path && oldItem.path !== newItem.path)
    );

    if (isModified) return true;

    // 如果有config参数，则检查文件哈希
    if (config?.modulePath) {
      const oldFileHash = oldItem.fileHash || newItem.fileHash;
      const fileName = oldItem.name || newItem.name;
      const filePath = path.join(config.modulePath, `${fileName}${config.fileExtension || ''}`);
      const fileHash = fs.existsSync(filePath) ? calculateFileHash(filePath) : '';
      return oldFileHash !== fileHash;
    }

    return false;
  });

  // unchanged = newData - added - updated - nameChanged
  const unchanged = newData.filter(newItem => 
    !added.includes(newItem) && 
    !updated.includes(newItem) && 
    !nameChanged.includes(newItem)
  );

  return {
    added: [...added, ...nameChanged],
    removed: [...removed, ...nameChanged.map(item => oldMap.get(item.id)!)],
    updated,
    unchanged
  };
};


// 生成随机GUID
export const generateRandomGuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const emptyGuid = '00000000-0000-0000-0000-000000000000';