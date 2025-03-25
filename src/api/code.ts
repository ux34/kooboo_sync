import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface Code {
  id: string;
  name: string;
  codeType: string;
  url: string;
  previewUrl: string;
  lastModified: string;
  isEmbedded: boolean;
  references: Record<string, number>;
  scriptType: string;
}

export interface PostCode {
  body: string;
  codeType: string;
  scriptType: string;
  config: string;
  eventType: string;
  id: string;
  name: string;
  url: string;
  version: number;
  enableDiffChecker: boolean;
  isEmbedded?: boolean;
  isDecrypted?: boolean;
}

export const getListByType = (codeType: string):Promise<Code[]> =>
  apiClient.get(useUrlSiteId("Code/ListByType"), { params: { codeType } });

export const getTypes = ():Promise<Record<string, string>> =>
  apiClient.get(useUrlSiteId("Code/CodeType"));

export const getEdit = (codeType: string, id: string):Promise<PostCode> =>
  apiClient.get(useUrlSiteId("Code/GetEdit"), { params: { codeType, id } });

export const getByName = (name: string):Promise<PostCode> =>
  apiClient.get(
    useUrlSiteId("Code/GetByName"), 
    { 
      params: { name }
    }
  );

export const post = (body: unknown):Promise<string> =>
  apiClient.post(useUrlSiteId("Code/post"), body);

export const deletes = (ids: string[]) =>
  apiClient.post(useUrlSiteId("Code/Deletes"), { ids });

export const isUniqueName = (name: string) =>
  apiClient.get(
    useUrlSiteId("Code/isUniqueName"),
    { 
      params: { name }
    }
  );