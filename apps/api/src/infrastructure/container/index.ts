import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { PrismaUserRepository } from '../persistence/prisma-user.repository.js'
import { PrismaRefreshTokenRepository } from '../persistence/prisma-refresh-token.repository.js'
import { PrismaSpaceRepository } from '../persistence/prisma-space.repository.js'
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
  const taskRepo = new PrismaTaskRepository(app.prisma)
  const folderRepo = new PrismaFolderRepository(app.prisma)
  const noteRepo = new PrismaNoteRepository(app.prisma)
  const linkCategoryRepo = new PrismaLinkCategoryRepository(app.prisma)
  const linkRepo = new PrismaLinkRepository(app.prisma)
  const credentialRepo = new PrismaCredentialRepository(app.prisma)
  const transactionRepo = new PrismaTransactionRepository(app.prisma)
  const subscriptionRepo = new PrismaSubscriptionRepository(app.prisma)

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
    task: {
      createTask: new CreateTaskUseCase(taskRepo, userRepo, spaceRepo),
      getTasks: new GetTasksUseCase(taskRepo),
      updateTask: new UpdateTaskUseCase(taskRepo, userRepo, spaceRepo),
      deleteTask: new DeleteTaskUseCase(taskRepo),
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
      createNote: new CreateNoteUseCase(noteRepo, folderRepo, spaceRepo),
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
      createLink: new CreateLinkUseCase(linkRepo, linkCategoryRepo, spaceRepo),
      getLinks: new GetLinksUseCase(linkRepo),
      updateLink: new UpdateLinkUseCase(linkRepo, linkCategoryRepo, spaceRepo),
      deleteLink: new DeleteLinkUseCase(linkRepo),
    },
    credential: {
      createCredential: new CreateCredentialUseCase(credentialRepo, spaceRepo),
      getCredentials: new GetCredentialsUseCase(credentialRepo),
      updateCredential: new UpdateCredentialUseCase(credentialRepo, spaceRepo),
      deleteCredential: new DeleteCredentialUseCase(credentialRepo),
    },
    transaction: {
      createTransaction: new CreateTransactionUseCase(transactionRepo, spaceRepo),
      getTransactions: new GetTransactionsUseCase(transactionRepo),
      updateTransaction: new UpdateTransactionUseCase(transactionRepo, spaceRepo),
      deleteTransaction: new DeleteTransactionUseCase(transactionRepo),
    },
    subscription: {
      createSubscription: new CreateSubscriptionUseCase(subscriptionRepo, spaceRepo),
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
