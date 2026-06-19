import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { PrismaUserRepository } from '../persistence/prisma-user.repository.js'
import { PrismaRefreshTokenRepository } from '../persistence/prisma-refresh-token.repository.js'
import { PrismaSpaceRepository } from '../persistence/prisma-space.repository.js'
import { PrismaMilestoneRepository } from '../persistence/prisma-milestone.repository.js'
import { PrismaInboxItemRepository } from '../persistence/prisma-inbox-item.repository.js'
import { PrismaTimeSessionRepository } from '../persistence/prisma-time-session.repository.js'
import { PrismaResourceLinkRepository } from '../persistence/prisma-resource-link.repository.js'
import { PrismaResourceResolver } from '../relation/prisma-resource-resolver.js'
import { PrismaActivityEventRepository } from '../persistence/prisma-activity-event.repository.js'
import { ActivityRecorder } from '../activity/activity-recorder.js'
import { PrismaTaskRepository } from '../persistence/prisma-task.repository.js'
import { PrismaFolderRepository } from '../persistence/prisma-folder.repository.js'
import { PrismaNoteRepository } from '../persistence/prisma-note.repository.js'
import { PrismaLinkCategoryRepository } from '../persistence/prisma-link-category.repository.js'
import { PrismaLinkRepository } from '../persistence/prisma-link.repository.js'
import { JwtTokenService } from '../auth/jwt-token.service.js'
import { RegisterUseCase } from '../../application/auth/register.usecase.js'
import { LoginUseCase } from '../../application/auth/login.usecase.js'
import { RefreshUseCase } from '../../application/auth/refresh.usecase.js'
import { LogoutUseCase } from '../../application/auth/logout.usecase.js'
import { GoogleLoginUseCase } from '../../application/auth/google-login.usecase.js'
import { CreateSpaceUseCase } from '../../application/space/create-space.usecase.js'
import { GetSpacesUseCase } from '../../application/space/get-spaces.usecase.js'
import { UpdateSpaceUseCase } from '../../application/space/update-space.usecase.js'
import { DeleteSpaceUseCase } from '../../application/space/delete-space.usecase.js'
import { CreateMilestoneUseCase } from '../../application/milestone/create-milestone.usecase.js'
import { GetMilestonesUseCase } from '../../application/milestone/get-milestones.usecase.js'
import { UpdateMilestoneUseCase } from '../../application/milestone/update-milestone.usecase.js'
import { DeleteMilestoneUseCase } from '../../application/milestone/delete-milestone.usecase.js'
import { CreateInboxItemUseCase } from '../../application/inbox/create-inbox-item.usecase.js'
import { GetInboxItemsUseCase } from '../../application/inbox/get-inbox-items.usecase.js'
import { UpdateInboxItemUseCase } from '../../application/inbox/update-inbox-item.usecase.js'
import { DeleteInboxItemUseCase } from '../../application/inbox/delete-inbox-item.usecase.js'
import { StartFocusUseCase } from '../../application/time-session/start-focus.usecase.js'
import { StopFocusUseCase } from '../../application/time-session/stop-focus.usecase.js'
import { GetActiveFocusUseCase } from '../../application/time-session/get-active-focus.usecase.js'
import { GetTimeSummaryUseCase } from '../../application/time-session/get-time-summary.usecase.js'
import { CreateRelationUseCase } from '../../application/relation/create-relation.usecase.js'
import { GetRelationsUseCase } from '../../application/relation/get-relations.usecase.js'
import { DeleteRelationUseCase } from '../../application/relation/delete-relation.usecase.js'
import { GetActivityUseCase } from '../../application/activity/get-activity.usecase.js'
import { GetMeUseCase } from '../../application/user/get-me.usecase.js'
import { UpdateProfileUseCase } from '../../application/user/update-profile.usecase.js'
import { ChangePasswordUseCase } from '../../application/user/change-password.usecase.js'
import { CreateTaskUseCase } from '../../application/task/create-task.usecase.js'
import { GetTasksUseCase } from '../../application/task/get-tasks.usecase.js'
import { UpdateTaskUseCase } from '../../application/task/update-task.usecase.js'
import { DeleteTaskUseCase } from '../../application/task/delete-task.usecase.js'
import { GetStatusesUseCase } from '../../application/status/get-statuses.usecase.js'
import { CreateStatusUseCase } from '../../application/status/create-status.usecase.js'
import { UpdateStatusUseCase } from '../../application/status/update-status.usecase.js'
import { DeleteStatusUseCase } from '../../application/status/delete-status.usecase.js'
import { CreateFolderUseCase } from '../../application/folder/create-folder.usecase.js'
import { GetFoldersUseCase } from '../../application/folder/get-folders.usecase.js'
import { UpdateFolderUseCase } from '../../application/folder/update-folder.usecase.js'
import { DeleteFolderUseCase } from '../../application/folder/delete-folder.usecase.js'
import { CreateNoteUseCase } from '../../application/note/create-note.usecase.js'
import { GetNotesUseCase } from '../../application/note/get-notes.usecase.js'
import { GetNoteUseCase } from '../../application/note/get-note.usecase.js'
import { UpdateNoteUseCase } from '../../application/note/update-note.usecase.js'
import { DeleteNoteUseCase } from '../../application/note/delete-note.usecase.js'
import { CreateLinkCategoryUseCase } from '../../application/link-category/create-link-category.usecase.js'
import { GetLinkCategoriesUseCase } from '../../application/link-category/get-link-categories.usecase.js'
import { UpdateLinkCategoryUseCase } from '../../application/link-category/update-link-category.usecase.js'
import { DeleteLinkCategoryUseCase } from '../../application/link-category/delete-link-category.usecase.js'
import { CreateLinkUseCase } from '../../application/link/create-link.usecase.js'
import { GetLinksUseCase } from '../../application/link/get-links.usecase.js'
import { UpdateLinkUseCase } from '../../application/link/update-link.usecase.js'
import { DeleteLinkUseCase } from '../../application/link/delete-link.usecase.js'
import { ClassifyAndSaveUseCase } from '../../application/ai/classify-and-save.usecase.js'
import { OpenAIService } from '../ai/openai.service.js'
import { PrismaCredentialRepository } from '../persistence/prisma-credential.repository.js'
import { CreateCredentialUseCase } from '../../application/credential/create-credential.usecase.js'
import { GetCredentialsUseCase } from '../../application/credential/get-credentials.usecase.js'
import { UpdateCredentialUseCase } from '../../application/credential/update-credential.usecase.js'
import { DeleteCredentialUseCase } from '../../application/credential/delete-credential.usecase.js'
import { PrismaTransactionRepository } from '../persistence/prisma-transaction.repository.js'
import { PrismaSubscriptionRepository } from '../persistence/prisma-subscription.repository.js'
import { CreateTransactionUseCase } from '../../application/transaction/create-transaction.usecase.js'
import { GetTransactionsUseCase } from '../../application/transaction/get-transactions.usecase.js'
import { UpdateTransactionUseCase } from '../../application/transaction/update-transaction.usecase.js'
import { DeleteTransactionUseCase } from '../../application/transaction/delete-transaction.usecase.js'
import { CreateSubscriptionUseCase } from '../../application/subscription/create-subscription.usecase.js'
import { GetSubscriptionsUseCase } from '../../application/subscription/get-subscriptions.usecase.js'
import { UpdateSubscriptionUseCase } from '../../application/subscription/update-subscription.usecase.js'
import { DeleteSubscriptionUseCase } from '../../application/subscription/delete-subscription.usecase.js'

export interface Container {
  auth: {
    register: RegisterUseCase
    login: LoginUseCase
    refresh: RefreshUseCase
    logout: LogoutUseCase
    googleLogin: GoogleLoginUseCase
  }
  user: {
    getMe: GetMeUseCase
    updateProfile: UpdateProfileUseCase
    changePassword: ChangePasswordUseCase
  }
  space: {
    createSpace: CreateSpaceUseCase
    getSpaces: GetSpacesUseCase
    updateSpace: UpdateSpaceUseCase
    deleteSpace: DeleteSpaceUseCase
  }
  milestone: {
    createMilestone: CreateMilestoneUseCase
    getMilestones: GetMilestonesUseCase
    updateMilestone: UpdateMilestoneUseCase
    deleteMilestone: DeleteMilestoneUseCase
  }
  inbox: {
    createItem: CreateInboxItemUseCase
    getItems: GetInboxItemsUseCase
    updateItem: UpdateInboxItemUseCase
    deleteItem: DeleteInboxItemUseCase
  }
  timeSession: {
    start: StartFocusUseCase
    stop: StopFocusUseCase
    getActive: GetActiveFocusUseCase
    getSummary: GetTimeSummaryUseCase
  }
  relation: {
    createRelation: CreateRelationUseCase
    getRelations: GetRelationsUseCase
    deleteRelation: DeleteRelationUseCase
  }
  activity: {
    getActivity: GetActivityUseCase
  }
  task: {
    createTask: CreateTaskUseCase
    getTasks: GetTasksUseCase
    updateTask: UpdateTaskUseCase
    deleteTask: DeleteTaskUseCase
  }
  status: {
    getStatuses: GetStatusesUseCase
    createStatus: CreateStatusUseCase
    updateStatus: UpdateStatusUseCase
    deleteStatus: DeleteStatusUseCase
  }
  folder: {
    createFolder: CreateFolderUseCase
    getFolders: GetFoldersUseCase
    updateFolder: UpdateFolderUseCase
    deleteFolder: DeleteFolderUseCase
  }
  note: {
    createNote: CreateNoteUseCase
    getNotes: GetNotesUseCase
    getNote: GetNoteUseCase
    updateNote: UpdateNoteUseCase
    deleteNote: DeleteNoteUseCase
  }
  linkCategory: {
    createLinkCategory: CreateLinkCategoryUseCase
    getLinkCategories: GetLinkCategoriesUseCase
    updateLinkCategory: UpdateLinkCategoryUseCase
    deleteLinkCategory: DeleteLinkCategoryUseCase
  }
  link: {
    createLink: CreateLinkUseCase
    getLinks: GetLinksUseCase
    updateLink: UpdateLinkUseCase
    deleteLink: DeleteLinkUseCase
  }
  credential: {
    createCredential: CreateCredentialUseCase
    getCredentials: GetCredentialsUseCase
    updateCredential: UpdateCredentialUseCase
    deleteCredential: DeleteCredentialUseCase
  }
  transaction: {
    createTransaction: CreateTransactionUseCase
    getTransactions: GetTransactionsUseCase
    updateTransaction: UpdateTransactionUseCase
    deleteTransaction: DeleteTransactionUseCase
  }
  subscription: {
    createSubscription: CreateSubscriptionUseCase
    getSubscriptions: GetSubscriptionsUseCase
    updateSubscription: UpdateSubscriptionUseCase
    deleteSubscription: DeleteSubscriptionUseCase
  }
  ai: {
    classify: ClassifyAndSaveUseCase
  }
}

export const containerPlugin = fp(async (app: FastifyInstance) => {
  const tokenService = new JwtTokenService(app)
  const userRepo = new PrismaUserRepository(app.prisma)
  const refreshTokenRepo = new PrismaRefreshTokenRepository(app.prisma)
  const spaceRepo = new PrismaSpaceRepository(app.prisma)
  const milestoneRepo = new PrismaMilestoneRepository(app.prisma)
  const inboxRepo = new PrismaInboxItemRepository(app.prisma)
  const timeSessionRepo = new PrismaTimeSessionRepository(app.prisma)
  const taskRepo = new PrismaTaskRepository(app.prisma)
  const folderRepo = new PrismaFolderRepository(app.prisma)
  const noteRepo = new PrismaNoteRepository(app.prisma)
  const linkCategoryRepo = new PrismaLinkCategoryRepository(app.prisma)
  const linkRepo = new PrismaLinkRepository(app.prisma)
  const credentialRepo = new PrismaCredentialRepository(app.prisma)
  const transactionRepo = new PrismaTransactionRepository(app.prisma)
  const subscriptionRepo = new PrismaSubscriptionRepository(app.prisma)
  const resourceLinkRepo = new PrismaResourceLinkRepository(app.prisma)
  const resourceResolver = new PrismaResourceResolver(taskRepo, noteRepo, linkRepo, credentialRepo, transactionRepo, subscriptionRepo, milestoneRepo)
  const activityRepo = new PrismaActivityEventRepository(app.prisma)
  const activityRecorder = new ActivityRecorder(activityRepo, app.log)

  const container: Container = {
    auth: {
      register: new RegisterUseCase(userRepo, tokenService, refreshTokenRepo, spaceRepo),
      login: new LoginUseCase(userRepo, tokenService, refreshTokenRepo),
      refresh: new RefreshUseCase(tokenService, refreshTokenRepo),
      logout: new LogoutUseCase(refreshTokenRepo),
      googleLogin: new GoogleLoginUseCase(userRepo, tokenService, refreshTokenRepo, spaceRepo),
    },
    user: {
      getMe: new GetMeUseCase(userRepo),
      updateProfile: new UpdateProfileUseCase(userRepo),
      changePassword: new ChangePasswordUseCase(userRepo),
    },
    space: {
      createSpace: new CreateSpaceUseCase(spaceRepo),
      getSpaces: new GetSpacesUseCase(spaceRepo),
      updateSpace: new UpdateSpaceUseCase(spaceRepo),
      deleteSpace: new DeleteSpaceUseCase(spaceRepo),
    },
    milestone: {
      createMilestone: new CreateMilestoneUseCase(milestoneRepo, spaceRepo, activityRecorder),
      getMilestones: new GetMilestonesUseCase(milestoneRepo),
      updateMilestone: new UpdateMilestoneUseCase(milestoneRepo, spaceRepo, activityRecorder),
      deleteMilestone: new DeleteMilestoneUseCase(milestoneRepo),
    },
    inbox: {
      createItem: new CreateInboxItemUseCase(inboxRepo),
      getItems: new GetInboxItemsUseCase(inboxRepo),
      updateItem: new UpdateInboxItemUseCase(inboxRepo),
      deleteItem: new DeleteInboxItemUseCase(inboxRepo),
    },
    timeSession: {
      start: new StartFocusUseCase(timeSessionRepo, spaceRepo, taskRepo),
      stop: new StopFocusUseCase(timeSessionRepo),
      getActive: new GetActiveFocusUseCase(timeSessionRepo),
      getSummary: new GetTimeSummaryUseCase(timeSessionRepo),
    },
    relation: {
      createRelation: new CreateRelationUseCase(resourceLinkRepo, resourceResolver),
      getRelations: new GetRelationsUseCase(resourceLinkRepo, resourceResolver),
      deleteRelation: new DeleteRelationUseCase(resourceLinkRepo),
    },
    activity: {
      getActivity: new GetActivityUseCase(activityRepo),
    },
    task: {
      createTask: new CreateTaskUseCase(taskRepo, userRepo, spaceRepo, milestoneRepo, activityRecorder),
      getTasks: new GetTasksUseCase(taskRepo),
      updateTask: new UpdateTaskUseCase(taskRepo, userRepo, spaceRepo, milestoneRepo, activityRecorder),
      deleteTask: new DeleteTaskUseCase(taskRepo, activityRecorder),
    },
    status: {
      getStatuses: new GetStatusesUseCase(userRepo),
      createStatus: new CreateStatusUseCase(userRepo),
      updateStatus: new UpdateStatusUseCase(userRepo),
      deleteStatus: new DeleteStatusUseCase(userRepo),
    },
    folder: {
      createFolder: new CreateFolderUseCase(folderRepo, spaceRepo),
      getFolders: new GetFoldersUseCase(folderRepo),
      updateFolder: new UpdateFolderUseCase(folderRepo, spaceRepo),
      deleteFolder: new DeleteFolderUseCase(folderRepo),
    },
    note: {
      createNote: new CreateNoteUseCase(noteRepo, folderRepo, spaceRepo, activityRecorder),
      getNotes: new GetNotesUseCase(noteRepo),
      getNote: new GetNoteUseCase(noteRepo),
      updateNote: new UpdateNoteUseCase(noteRepo, folderRepo, spaceRepo),
      deleteNote: new DeleteNoteUseCase(noteRepo),
    },
    linkCategory: {
      createLinkCategory: new CreateLinkCategoryUseCase(linkCategoryRepo, spaceRepo),
      getLinkCategories: new GetLinkCategoriesUseCase(linkCategoryRepo),
      updateLinkCategory: new UpdateLinkCategoryUseCase(linkCategoryRepo, spaceRepo),
      deleteLinkCategory: new DeleteLinkCategoryUseCase(linkCategoryRepo),
    },
    link: {
      createLink: new CreateLinkUseCase(linkRepo, linkCategoryRepo, spaceRepo, activityRecorder),
      getLinks: new GetLinksUseCase(linkRepo),
      updateLink: new UpdateLinkUseCase(linkRepo, linkCategoryRepo, spaceRepo),
      deleteLink: new DeleteLinkUseCase(linkRepo),
    },
    credential: {
      createCredential: new CreateCredentialUseCase(credentialRepo, spaceRepo, activityRecorder),
      getCredentials: new GetCredentialsUseCase(credentialRepo),
      updateCredential: new UpdateCredentialUseCase(credentialRepo, spaceRepo),
      deleteCredential: new DeleteCredentialUseCase(credentialRepo),
    },
    transaction: {
      createTransaction: new CreateTransactionUseCase(transactionRepo, spaceRepo, activityRecorder),
      getTransactions: new GetTransactionsUseCase(transactionRepo),
      updateTransaction: new UpdateTransactionUseCase(transactionRepo, spaceRepo),
      deleteTransaction: new DeleteTransactionUseCase(transactionRepo),
    },
    subscription: {
      createSubscription: new CreateSubscriptionUseCase(subscriptionRepo, spaceRepo, activityRecorder),
      getSubscriptions: new GetSubscriptionsUseCase(subscriptionRepo),
      updateSubscription: new UpdateSubscriptionUseCase(subscriptionRepo, spaceRepo),
      deleteSubscription: new DeleteSubscriptionUseCase(subscriptionRepo),
    },
    ai: {
      classify: new ClassifyAndSaveUseCase(
        new OpenAIService(),
        noteRepo,
        taskRepo,
        linkRepo,
        folderRepo,
        linkCategoryRepo,
        credentialRepo,
      ),
    },
  }

  app.decorate('container', container)
})

declare module 'fastify' {
  interface FastifyInstance {
    container: Container
  }
}
