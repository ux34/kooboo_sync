import fs from 'fs';
import path from 'path';
import { Metadata } from '../types';

// 计算文件哈希值
export const calculateFileHash = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = require('crypto').createHash('sha256');
  hash.update(fileBuffer);
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
export const calculateDiff = (oldData: Metadata[], newData: Metadata[]) => {
  const oldMap = new Map(oldData.map(item => [item.id, item]));
  const newMap = new Map(newData.map(item => [item.id, item]));

  const added = newData.filter(newItem => !oldMap.has(newItem.id));
  const removed = oldData.filter(oldItem => !newMap.has(oldItem.id));

  const updated = newData.filter(newItem => {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem) return false;

    return (
      oldItem.lastModified !== newItem.lastModified ||
      (newItem.url && oldItem.url !== newItem.url) ||
      (newItem.path && oldItem.path !== newItem.path)
    );
  });

  const unchanged = newData.filter(newItem => {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem) return false;

    return (
      oldItem.lastModified === newItem.lastModified &&
      (!newItem.url || oldItem.url === newItem.url) &&
      (!newItem.path || oldItem.path === newItem.path)
    );
  });

  return {
    added,
    removed,
    updated,
    unchanged
  };
};