import type { FastifyBaseLogger } from 'fastify'
import type { IActivityRecorder, ActivityInput } from '../../domain/activity/activity-recorder.js'
import type { IActivityEventRepository } from '../../domain/activity/activity-event.repository.js'

/** Persists activity events, swallowing errors so logging never breaks a mutation. */
export class ActivityRecorder implements IActivityRecorder {
  constructor(
    private readonly repo: IActivityEventRepository,
    private readonly logger: FastifyBaseLogger,
  ) {}

  async record(input: ActivityInput): Promise<void> {
    try {
      await this.repo.create(input)
    } catch (err) {
      this.logger.error({ err }, 'failed to record activity event')
    }
  }
}
