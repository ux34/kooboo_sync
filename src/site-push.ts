import { pushSiteInfoTask } from './sync/SiteSync'

export async function sitePushTask(modules?: string) {
  await pushSiteInfoTask()
}