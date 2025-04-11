import axios from 'axios';
import fs from 'fs';
import path from 'path';


const KOOBOO_ENV_CONFIG = `
# =========================================================
# kooboo-sync config
# =========================================================
# Kooboo Account
BASIC_AUTH_USER_NAME=your_username
BASIC_AUTH_PASSWORD=your_password
# Kooboo Site 
API_BASE_URL=your_api_base_url
SITE_ID=your_site_id
# Sync Module
SYNC_MODULES=Page,View,Layout,Api,Code,Style,Script
# Customize the folder name(Set to ./ to sync to project root.)
FOLDER_NAME=Kooboo
`.trim();

const GITIGNORE_CONTENT = `
/.DS_Store
/.env
/node_modules
/dist
/build
*.log
*.tmp
*.swp
*.bak
*.cache
.idea
.vscode
`.trim();

export async function initTask(url?: string) {
  // 1. 初始化环境变量文件
  if (url) await autoFillEnv(url);
  else initEnvFile();
  
  // 2. 初始化.gitignore
  initGitignore();
}

export async function autoFillEnv(url: string) {
  // 解析URL格式：https://user1:pass123@sitename.example.com
  const urlPattern = /^(https?):\/\/([^:]+):([^@]+)@([^\/]+)/;
  const matches = url.match(urlPattern);

  if (!matches) {
    throw new Error('无效的URL格式，请使用 https://username:password@sitename.domain.com 格式');
  }

  const [_, protocol, username, password, fullDomain] = matches;
  const [subdomain, ...domainParts] = fullDomain.split('.');
  const baseDomain = domainParts.join('.');
  const apiBaseUrl = `${protocol}://${baseDomain}`;
  // 判断解析是否正确
  if (!username || !password || !subdomain || !baseDomain) {
    throw new Error('无法解析URL，请检查格式');
  }

  const apiClient = axios.create({
    baseURL: apiBaseUrl + '/_api/v2',
    auth: {
      username: username,
      password: password
    }
  });

  apiClient.interceptors.response.use(response => {
    if (response.data && response.data.model) {
      return response.data.model;
    }
    return response.data;
  });


  // 获取SITE_ID
  let siteId = '';
  const site = await apiClient.get(`/Site/pagedlist?pageNr=1&pageSize=20&keyword=${subdomain.toLowerCase()}`)
    .then((res: any) => {
      const sites = res.list;
      const site = sites.find(s => s.siteName.toLowerCase() === subdomain.toLowerCase());
      return site
    });

  if (!site) {
    // 尝试创建
    console.log(`站点${subdomain}不存在，尝试创建站点`);
    const newSite: any = await apiClient.post(`/Site/Create`, {
      subDomain: subdomain,
      rootDomain: baseDomain,
      siteName: subdomain
    }).catch((err: any) => {
      console.error('尝试创建站点失败:', err.response?.data?.message || err.message);
      process.exit(1);
    })
    console.log(`站点${subdomain}已创建`);
    siteId = newSite.id;
  } else {
    siteId = site.siteId;
  }

  if (!siteId) {
    throw new Error('无法获取SITE_ID，请检查url是否有效');
  }

  // 生成配置内容
  const config = KOOBOO_ENV_CONFIG
    .replace('your_username', username)
    .replace('your_password', password)
    .replace('your_api_base_url', apiBaseUrl)
    .replace('your_site_id', siteId + `# ${subdomain}.${baseDomain}`);

  // 写入.env文件
  initEnvFile(config);
}


export function initEnvFile(customConfig?: string) {
  const envPath = path.join(process.cwd(), '.env');
  const configToUse = customConfig || KOOBOO_ENV_CONFIG;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, configToUse);
    return;
  }

  const currentContent = fs.readFileSync(envPath, 'utf-8');

  if (customConfig || !currentContent.includes(' # kooboo-sync config')) {
    fs.appendFileSync(envPath, `\n\n${configToUse}`);
  }
}


export function initGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, GITIGNORE_CONTENT);
  }
}