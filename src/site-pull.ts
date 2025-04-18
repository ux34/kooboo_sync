import { pullSiteInfoTask } from './sync/SiteSync'

export async function sitePullTask(modules?: string) {
  await pullSiteInfoTask()
}