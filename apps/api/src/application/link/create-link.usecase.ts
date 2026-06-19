import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { LinkDTO } from '../../domain/link/link.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  title: string
  url: string
  description?: string | null
  username?: string | null
  password?: string | null
  categoryId?: string | null
  spaceId?: string | null
}

export class CreateLinkUseCase {
  constructor(
    private readonly linkRepo: ILinkRepository,
    private readonly linkCategoryRepo: ILinkCategoryRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly activity: IActivityRecorder,
  ) {}

  async execute(input: Input): Promise<LinkDTO> {
    if (input.categoryId) {
      const category = await this.linkCategoryRepo.findById(input.categoryId)
      if (!category || category.userId !== input.userId) throw new InvalidRelationError('Link category')
    }
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const link = await this.linkRepo.create(input.userId, {
      title: input.title,
      url: input.url,
      description: input.description ?? null,
      username: input.username ?? null,
      password: input.password ?? null,
      categoryId: input.categoryId ?? null,
      spaceId: input.spaceId ?? null,
    })
    await this.activity.record({ userId: input.userId, spaceId: link.spaceId, action: 'CREATED', resourceType: 'LINK', resourceId: link.id, title: link.title })
    return link.toDTO()
  }
}
