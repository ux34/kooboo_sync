import { apiClient, useUrlSiteId } from '../utils/apiClient';

export interface Meta {
  charset?: string;
  property?: string;
  content?: Record<string, string>;
  httpequiv?: string;
  name?: string;
  el?: Element;
}

export interface Page {
  id: string;
  inlineUrl: string;
  lastModified: string;
  layoutId: string;
  linked: number;
  name: string;
  online: boolean;
  path: string;
  previewUrl: string;
  type: string;
  startPage: boolean;
  relations: { htmlBlock: number; layout: number; menu: null; view: number };
  hasParameter?: boolean;
  title: string;
}


export interface PostPage {
  previewUrl?: string;
  contentTitle: Record<string, string>;
  urlPath: string;
  metas: Meta[];
  parameters: Record<string, string>;
  body: string;
  designConfig: string;
  name: string;
  id: string;
  enableCache: boolean;
  disableUnocss: boolean;
  cacheVersionType: number;
  cacheByVersion: boolean;
  cacheByDevice: boolean;
  cacheByCulture: boolean;
  cacheMinutes: number;
  cacheQueryKeys: string;
  title?: string;
  baseUrl?: string;
  scripts?: string[];
  styles?: string[];
  version: number;
  enableDiffChecker: boolean;
  layoutName?: string;
  published?: boolean;
  placeholderContents?: string;
  metaBindings?: string[];
  urlParamsBindings?: string[];
  type?: "Normal" | "Layout" | "RichText" | "Designer";
  layoutId?: string;
}

export const getList = (): Promise<Page[]> =>
  apiClient.get(useUrlSiteId("Page/all"));

export const deletes = (ids: string[]): Promise<void> =>
  apiClient.post(useUrlSiteId("Page/Deletes"), { ids });

export const getEdit = (id: string, args?: Record<string, string>): Promise<PostPage> =>
  apiClient.get(useUrlSiteId("Page/GetEdit"), { params: { id, ...args } });

export const isUniqueName = (name: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("Page/isUniqueName"), { params: { name } });

export const pageUrlIsUniqueName = (name: string, oldName?: string): Promise<boolean> =>
  apiClient.get(useUrlSiteId("Page/isUniqueRoute"), { params: { name, oldName } });

export const post = (body: PostPage): Promise<string> =>
  apiClient.post(useUrlSiteId("Page/post"), body);
    