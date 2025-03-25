import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface Layout {
  body: string;
  creationDate: string;
  extension: string;
  id: string;
  lastModified: string;
  name: string;
  online: boolean;
  version: number;
  enableDiffChecker: boolean;
}

export interface PostLayout {
  id: string;
  name: string;
  body: string;
  version: number;
  enableDiffChecker: boolean;
}

export interface ListItem {
  id: string;
  keyHash: string;
  lastModified: string;
  name: string;
  relations: Record<string, number>;
  page: number;
  storeNameHash: number;
}

export const getLayout = (id: string, args?: Record<string, any>):Promise<Layout> =>
  apiClient.get(useUrlSiteId("Layout/get"), { params: { id, ...args } });

export const getList = (): Promise<ListItem[]> =>
  apiClient.get(useUrlSiteId("Layout/list"));

export const post = (body: PostLayout): Promise<string> =>
  apiClient.post(useUrlSiteId("Layout/post"), body);

export const deletes = (ids: string[]): Promise<void> =>
  apiClient.post(useUrlSiteId("Layout/Deletes"), { ids });

export const isUniqueName = (name: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("Layout/isUniqueName"), { params: { name } });