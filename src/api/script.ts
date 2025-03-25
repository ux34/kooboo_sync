

import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface ScriptItem {
  fullUrl: string;
  id: string;
  keyHash: string;
  lastModified: string;
  name: string;
  references: { resourceGroup: number; page: number };
  routeId: string;
  routeName: string;
  size: number;
  ownerObjectId: string;
}


export interface Script {
  body: string;
  extension: string;
  id: string;
  name: string;
  isEmbedded: boolean;
  version?: number;
  enableDiffChecker?: boolean;
  ownerObjectId: string;
}

export const getList = (): Promise<ScriptItem[]> =>
  apiClient.get(useUrlSiteId("Script/External"));

export const getEdit = (id: string): Promise<Script> =>
  apiClient.get(useUrlSiteId("Script/Get"), { params: { id } });

export const post = (body: Script): Promise<string> =>
  apiClient.post(useUrlSiteId("Script/Update"), body);

export const deletes = (ids: string[]): Promise<void> =>
  apiClient.post(useUrlSiteId("Script/Deletes"), { ids });

export const isUniqueName = (name: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("Script/isUniqueName"), { params: { name } });
