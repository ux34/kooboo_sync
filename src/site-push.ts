import { pushSettingsTask } from './sync/SiteSync'

export async function sitePushTask(modules?: string) {
  await pushSettingsTask()
}