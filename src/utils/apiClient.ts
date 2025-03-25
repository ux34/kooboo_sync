import axios from 'axios';
import { useEnv } from './useEnv';

const { API_BASE_URL, BASIC_AUTH_USER_NAME, BASIC_AUTH_PASSWORD, SITE_ID } = useEnv();
const API_FULL_URL = API_BASE_URL + '/_api/v2';

export const apiClient = axios.create({
  baseURL: API_FULL_URL,
  auth: {
    username: BASIC_AUTH_USER_NAME,
    password: BASIC_AUTH_PASSWORD
  }
});

apiClient.interceptors.response.use(response => {
  if (response.data && response.data.model) {
    return response.data.model;
  }
  return response.data;
});

export function useUrlSiteId(url: string) {
  const urlObj = new URL(url, API_BASE_URL);
  urlObj.searchParams.set('SiteId', SITE_ID);
  return urlObj.toString().replace(API_BASE_URL, '');
}