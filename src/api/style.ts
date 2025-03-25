
import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface Style {
  body: string;
  extension: string;
  id: string;
  name: string;
  isEmbedded: boolean;
  version?: number;
  enableDiffChecker?: boolean;
  ownerObjectId: string;
}

export interface StyleItem {
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

export const getList = (): Promise<StyleItem[]> =>
  apiClient.get(useUrlSiteId("Style/External"));

export const getEdit = (id: string): Promise<Style> =>
  apiClient.get(useUrlSiteId("Style/Get"), { params: { id } });

export const post = (body: Style): Promise<string> =>
  apiClient.post(useUrlSiteId("Style/Update"), body);

export const deletes = (ids: string[]): Promise<void> =>
  apiClient.post(useUrlSiteId("Style/Deletes"), { ids });

export const isUniqueName = (name: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("Style/isUniqueName"), { params: { name } });
