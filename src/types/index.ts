export enum Module {
  Api = 'Api',
  Page = 'Page',
  View = 'View',
  Layout = 'Layout',
  Code = 'Code',
  Style = 'Style',
  Script = 'Script'
}

export interface Metadata {
  id: string;
  name: string;
  lastModified?: string;
  fileHash?: string;
  [key: string]: any;
}