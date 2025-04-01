import path from 'path';
import { Module } from '../types';
import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  API_BASE_URL: string;
  BASIC_AUTH_USER_NAME: string;
  BASIC_AUTH_PASSWORD: string;
  SITE_ID: string;
  SYNC_MODULES: Module[];
  KOOBOO_DIR: string;
}

export const useEnv = (): EnvConfig => {
  const {
    API_BASE_URL,
    BASIC_AUTH_USER_NAME,
    BASIC_AUTH_PASSWORD,
    SITE_ID,
    SYNC_MODULES,
    FOLDER_NAME
  } = process.env;

  if (!API_BASE_URL || !BASIC_AUTH_USER_NAME || !BASIC_AUTH_PASSWORD || !SITE_ID) {
    throw new Error('Missing required environment variables');
  }

  const defaultModules = Object.values(Module);
  const modules = SYNC_MODULES ? SYNC_MODULES.split(',') as Module[] : defaultModules;
  
  // modules同步顺序排序 script,style,code,api,view,layout,page
  const modulesSort = [
    Module.Script,
    Module.Style,
    Module.Code,
    Module.Api,
    Module.View,
    Module.Layout,
    Module.Page
  ]
  modules.sort((a, b) => modulesSort.indexOf(a) - modulesSort.indexOf(b));

  return {
    API_BASE_URL,
    BASIC_AUTH_USER_NAME,
    BASIC_AUTH_PASSWORD,
    SITE_ID,
    SYNC_MODULES: modules,
    KOOBOO_DIR: path.join(__dirname, '../..', FOLDER_NAME || 'Kooboo')
  };
};
