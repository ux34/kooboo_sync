import { pullSettingTask } from './sync/SiteSync'

export async function sitePullTask(modules?: string) {
  await pullSettingTask()
}