declare module 'node-schedule' {
  export type JobCallback = (fireDate: Date) => void

  export type RecurrenceSpecTimezone = {
    rule: string
    tz: string
  }

  export function scheduleJob(
    rule: RecurrenceSpecTimezone,
    callback: JobCallback,
  ): void
}
