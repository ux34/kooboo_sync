import fs from 'fs';
import path from 'path';
import { SYNC_CONFIG } from '../config/syncConfig';
import { readMetadata, updateMetadataWithHash, calculateDiff, emptyGuid } from '../utils/syncUtils';
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
    Api: ({name, body, url}) => api.post({
      id: emptyGuid,
      codeType: 'Api',
      name,
      body,
      url,
      version: 0,
      scriptType: 'Module',
      enableDiffChecker: false
    }),
    Code: ({name, body}) => api.post({
      id: emptyGuid,
      codeType: 'CodeBlock',
      name,
      body,
      url: '',
      version: 0,
      scriptType: 'Module',
      enableDiffChecker: false
    }),
    Layout: ({name, body}) => layout.post({
      id: emptyGuid,
      name,
      body,
      version: 0,
      enableDiffChecker: false
    }),
    Page: ({name, body, path}) => page.post({
      id: emptyGuid,
      name,
      body,
      urlPath: path,
      version: 0,
      enableDiffChecker: false
    } as any),
    Script: ({name, body}) => script.post({
      id: emptyGuid,
      name,
      body,
      extension: 'js',
      isEmbedded: false,
      ownerObjectId: undefined,
      enableDiffChecker: false
    }),
    Style: ({name, body}) => style.post({
      id: emptyGuid,
      name,
      body,
      extension: 'css',
      isEmbedded: false,
      ownerObjectId: undefined,
      enableDiffChecker: false
    }),
    View: ({name, body}) => view.post({
      id: emptyGuid,
      name,
      body,
      enableDiffChecker: false,
      version: 0
    } as any)
  },
  update: {
    // 会导致config变成null，但这个config能做什么未知，先不做处理
    Api: ({id, name, body, url, version}) => api.post({
      id,
      codeType: 'Api',
      name,
      body,
      url,
      version,
      scriptType: 'Module',
      enableDiffChecker: false
    }),
    Code: ({id, name, body, version}) => api.post({
      id,
      codeType: 'CodeBlock',
      name,
      body,
      url: '',
      version,
      scriptType: 'Module',
      enableDiffChecker: false
    }),
    Layout: ({id, name, body, version}) => layout.post({
      id,
      name,
      body,
      version,
      enableDiffChecker: false
    }),
    Page: ({id, name, body, path, version}) => page.post({
      id,
      name,
      body,
      urlPath: path,
      version,
      enableDiffChecker: false,
    } as any),
    Script: ({id, name, body, version}) => script.post({
      id,
      name,
      body,
      version,
      extension: 'js',
      isEmbedded: false,
      ownerObjectId: undefined,
      enableDiffChecker: false
    }),
    Style: ({id, name, body, version}) => style.post({
      id,
      name,
      body,
      version,
      extension: 'css',
      isEmbedded: false,
      ownerObjectId: undefined,
      enableDiffChecker: false
    }),
    View: ({id, name, body, version}) => view.post({
      id,
      name,
      body,
      version,
      enableDiffChecker: false,
    } as any)
  },
  deletes: {
    Api: api.deletes,
    Code: api.deletes,
    Layout: layout.deletes,
    Page: page.deletes,
    Script: script.deletes,
    Style: style.deletes,
    View: view.deletes
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
  const localMetadata = readMetadata<Metadata>(metadataPath);
  const remoteData = await API_MAP.getList[moduleName]();

  const diff = calculateDiff(localMetadata, remoteData, { modulePath, fileExtension: config.fileExtension});

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
  for (const item of diff.removed) {
    fs.unlinkSync(path.join(modulePath, `${item.name}${config.fileExtension}`));
  }
  
  for (const item of diff.updated) {
    const code = await API_MAP.getEdit[moduleName](item.id);
    fs.writeFileSync(path.join(modulePath, `${item.name}${config.fileExtension}`), code.body);
  }

  for (const item of diff.added) {
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
  const koobooFiles = new Set(remoteData.map(item => `${item.name}${config.fileExtension}`));

  for (const file of localFiles) {
    if (!koobooFiles.has(file)) {
      fs.unlinkSync(path.join(modulePath, file));
      console.log(`删除本地多余文件: ${file}`);
    }
  }

  // 更新元数据中的文件哈希值
  const updatedData = updateMetadataWithHash(remoteData, modulePath, config.fileExtension);

  // 写入新的 __metadata.json 文件
  fs.writeFileSync(metadataPath, JSON.stringify(updatedData, null, 2));

  console.log(`${moduleName} 模块拉取完成`);
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
  const diff = calculateDiff(remoteData, localMetadata, { modulePath, fileExtension: config.fileExtension});

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
  for (const item of diff.removed) {
    await API_MAP.deletes[moduleName]([item.id]);
    console.log(`删除远程文件 ${moduleName}/${item.name}${config.fileExtension}`);
  }

  for (const item of diff.updated) {
    const filePath = path.join(modulePath, `${item.name}${config.fileExtension}`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      await API_MAP.update[moduleName]({
        ...item,
        body: content
      } as any);
      console.log(`更新远程文件 ${moduleName}/${item.name}${config.fileExtension}`);
    }
  }

  for (const item of diff.added) {
    const filePath = path.join(modulePath, `${item.name}${config.fileExtension}`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      await API_MAP.create[moduleName]({
       name: item.name,
       body: content,
       url: item.url,
       path: item.path
      });
      console.log(`新增文件 ${moduleName}/${item.name}${config.fileExtension} 到远程`);
    }
  }

  // 强制同步未更改的文件
  if (force) {
    for (const item of diff.unchanged) {
      const filePath = path.join(modulePath, `${item.name}${config.fileExtension}`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        await API_MAP.update[moduleName]({
          ...item,
          body: content
        } as any);
        console.log(`覆盖远程文件 ${moduleName}/${item.name}${config.fileExtension}`);
      }
    }
  }

  // 6. 更新远程元数据
  const updatedRemoteData = await API_MAP.getList[moduleName]();
  const updatedMetadata = updateMetadataWithHash(updatedRemoteData, modulePath, config.fileExtension);
  fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));
  console.log(`${moduleName} 模块推送完成`);
}

// 本地全局路由冲突检查(Module.Api & Module.Page 同时存在才检查)
export function checkLocalRoutes(): { valid: boolean; errors: string[] } {
  const modules = [Module.Api, Module.Page];
  for (const moduleName of modules) {
    const metadataPath = path.join(KOOBOO_DIR, moduleName, '__metadata.json');
    if (!fs.existsSync(metadataPath)) {
      return { valid: false, errors: [`${moduleName} 模块的 __metadata.json 文件不存在`] };
    }
  }

  // 提取Api和Page的元数据的所有url和path为Set
  const apiMetadata = readMetadata<Metadata>(path.join(KOOBOO_DIR, Module.Api, '__metadata.json'));
  const pageMetadata = readMetadata<Metadata>(path.join(KOOBOO_DIR, Module.Page, '__metadata.json'));
  const errors: string[] = [];
  // 检查Module.Api和Module.Page的路由是否重复
  const routeSet = new Set<string>();
  
  // Api url检查
  for (const item of apiMetadata) {
    const route = item.url;
    if (!route) {
      errors.push(`Api ${item.name} 缺少 url 字段`);
    } else if (routeSet.has(route)) {
      errors.push(`Api ${item.name} 的路由 "${route}" 与其他路由重复`);
    } else {
      routeSet.add(route);
    }
  }

  // Page path检查
  for (const item of pageMetadata) {
    const route = item.path;
    if (!route) {
      errors.push(`Page ${item.name} 缺少 path 字段`);
    } else if (routeSet.has(route)) {
      errors.push(`Page ${item.name} 的路由 "${route}" 与其他路由重复`);
    } else {
      routeSet.add(route);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };

}

// 本地代码检查
export function checkLocalCode(moduleName: Module): { valid: boolean; errors: string[] } {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  const metadataPath = path.join(modulePath, '__metadata.json');

  if (!fs.existsSync(metadataPath)) {
    return { valid: false, errors: ['__metadata.json 文件不存在'] };
  }

  const metadata = readMetadata<Metadata>(metadataPath);
  const errors: string[] = [];

  // 检查名称是否冲突
  const nameSet = new Set<string>();
  for (const item of metadata) {
    if (nameSet.has(item.name)) {
      errors.push(`名称 ${item.name} 冲突`);
    } else {
      nameSet.add(item.name);
    }
  }

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

  // 检查Module.Api是否有url字段和Module.Page是否有path字段以及路由是否重复
  if (moduleName === Module.Api) {
    const routeSet = new Set<string>();
    for (const item of metadata) {
      if (!item.url) {
        errors.push(`Api ${item.name} 缺少 url 字段`);
      } else if (routeSet.has(item.url)) {
        errors.push(`Api ${item.name} 的路由 "${item.url}" 与其他路由重复`);
      } else {
        routeSet.add(item.url);
      }
    }
  }
  
  if (moduleName === Module.Page) {
    const routeSet = new Set<string>();
    for (const item of metadata) {
      if (!item.path) {
        errors.push(`Page ${item.name} 缺少 path 字段`);
      } else if (routeSet.has(item.path)) {
        errors.push(`Page ${item.name} 的路由 "${item.path}" 与其他路由重复`);
      } else {
        routeSet.add(item.path);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 修复本地代码
export function fixLocalCode(moduleName: Module) {
  const config = SYNC_CONFIG[moduleName];
  const modulePath = path.join(KOOBOO_DIR, moduleName);
  const metadataPath = path.join(modulePath, '__metadata.json');
  
  // 如果模块目录不存在则创建
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath);
  }

  // 获取本地文件列表
  const localFiles = fs.readdirSync(modulePath)
    .filter(file => file !== '__metadata.json' && (config.fileExtension ? file.endsWith(config.fileExtension) : true));

  // 初始化metadata
  let metadata: Metadata[] = [];
  if (fs.existsSync(metadataPath)) {
    metadata = readMetadata<Metadata>(metadataPath);
  }

  // 获取现有metadata中的文件名集合
  const metadataFiles = new Set(metadata.map(item => `${item.name}${config.fileExtension}`));

  // 1. 删除metadata中不存在的本地文件记录
  metadata = metadata.filter(item => {
    const filePath = path.join(modulePath, `${item.name}${config.fileExtension}`);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      console.log(`移除metadata记录: ${moduleName}/${item.name}${config.fileExtension}`);
    }
    return exists;
  });

  // 2. 添加本地文件到metadata
  for (const file of localFiles) {
    if (!metadataFiles.has(file)) {
      // 提取name（去掉扩展名）
      const name = file.endsWith(config.fileExtension) 
        ? file.slice(0, -config.fileExtension.length) 
        : file;
      
      // 创建新的metadata项
      const newItem: Metadata = {
        id: emptyGuid,
        name,
        version: 0,
        lastModified: new Date().toISOString()
      };
      if (moduleName === Module.Api) {
        newItem.url = `/${name}`;
      } else if (moduleName === Module.Page) {
        newItem.path = `/${name}`;
      }

      // 添加到metadata
      metadata.push(newItem);
      console.log(`新增文件 ${moduleName}/${file} 到 metadata`);
    }
  }

  // 写入更新后的metadata
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}