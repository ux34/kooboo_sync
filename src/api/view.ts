
import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface PostView {
  body: string;
  dummyLayout: string;
  layouts: Record<string, string>;
  name: string;
  id: string;
  version: number;
  enableDiffChecker: boolean;
  propDefines: any[];
}

export interface View {
  dataSourceCount: number;
  id: string;
  keyHash: string;
  lastModified: string;
  name: string;
  preview: string;
  relations: Record<string, number>;
  storeNameHash: number;
  version: number;
}


export const getList = (): Promise<View[]> =>
  apiClient.get(useUrlSiteId("View/list"));

export const deletes = (ids: string[]): Promise<void> =>
  apiClient.post(useUrlSiteId("View/Deletes"), { ids });

export const isUniqueName = (name: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("View/isUniqueName"), { params: { name } });

export const post = (body: PostView): Promise<string> =>
  apiClient.post(useUrlSiteId("View/post"), body);

export const getEdit = (id: string): Promise<PostView> =>
  apiClient.get(useUrlSiteId("View/get"), { params: { id } });
