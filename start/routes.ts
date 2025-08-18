/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import Pack from '#models/pack'
import PackPolicy from '#policies/pack_policy'

import Role from '#models/role'
import RolePolicy from '#policies/role_policy'
import Tag from '#models/tag'
import TagPolicy from '#policies/tag_policy'
import GameVersion from '#models/game_version'
import GameVersionPolicy from '#policies/game_version_policy'
import PackRelease from '#models/pack_release'
import PackReleasePolicy from '#policies/pack_release_policy'
import PackItemType from '#models/pack_item_type'
import PackItemTypePolicy from '#policies/pack_item_type_policy'
import PackItemSafeStatus from '#models/pack_item_safe_status'
import PackItemSafeStatusPolicy from '#policies/pack_item_safe_status_policy'
import PackModCore from '#models/pack_mod_core'
import PackModCorePolicy from '#policies/pack_mod_core_policy'
import PackStatus from '#models/pack_status'
import PackStatusPolicy from '#policies/pack_status_policy'
import PackVisibleLevel from '#models/pack_visible_level'
import PackVisibleLevelPolicy from '#policies/pack_visible_level_policy'
import PackItem from '#models/pack_item'
import PackItemPolicy from '#policies/pack_item_policy'
import PackPreDownloadQuestion from '#models/pack_pre_download_question'
import PackPreDownloadQuestionPolicy from '#policies/pack_pre_download_question_policy'

const UserStatusesController = () => import('#controllers/user_statuses_controller')
const PackReleasesController = () => import('#controllers/pack_releases_controller')
const PackPreDownloadQuestionsController = () =>
  import('#controllers/pack_pre_download_questions_controller')
const TagsController = () => import('#controllers/tags_controller')
const PackVisibleLevelsController = () => import('#controllers/pack_visible_levels_controller')
const RolesController = () => import('#controllers/roles_controller')
const PackStatusesController = () => import('#controllers/pack_statuses_controller')
const PackModCoresController = () => import('#controllers/pack_mod_cores_controller')
const PackItemTypesController = () => import('#controllers/pack_item_types_controller')
const PackItemsController = () => import('#controllers/pack_items_controller')
const PacksController = () => import('#controllers/packs_controller')
const GameVersionsController = () => import('#controllers/game_versions_controller')
const UsersController = () => import('#controllers/users_controller')
const PackItemSafeStatusesController = () =>
  import('#controllers/pack_item_safe_statuses_controller')

const providers: RegExp = /discord|github/

router.get('/', async () => {
  return { ping: 'pong' }
})

router
  .group(() => {
    router
      .post('auth/logout/self', '#controllers/auth_controller.logoutSelf')
      .use(middleware.auth({ guards: ['api'] }))

    router
      .post('auth/logout/everywhere', '#controllers/auth_controller.logoutEverywhere')
      .use(middleware.auth({ guards: ['api'] }))

    router
      .get('auth/:provider/redirect', '#controllers/auth_controller.loginProviderRedirect')
      .where('provider', providers)

    router
      .get('auth/:provider/callback', '#controllers/auth_controller.loginProviderHandleCallback')
      .where('provider', providers)
  })
  .prefix('api')

router
  .group(() => {
    router
      .resource('users', UsersController)
      .apiOnly()
      .except(['store'])
      .use(['index', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router
      .resource('userstatuses', UserStatusesController)
      .apiOnly()
      .use('*', middleware.auth({ guards: ['api'] }))

    router.get('user/:id/roles', '#controllers/roles_controller.index').use(
      middleware.nestedResource([
        {
          parent: User,
          policy: UserPolicy,
          relation: 'users',
        },
      ])
    )

    router.get('user/:id/packs', '#controllers/packs_controller.index').use(
      middleware.nestedResource([
        {
          parent: User,
          policy: UserPolicy,
          relation: 'user',
        },
      ])
    )

    router.get('role/:id/users', '#controllers/users_controller.index').use(
      middleware.nestedResource([
        {
          parent: Role,
          policy: RolePolicy,
          relation: 'roles',
        },
      ])
    )

    router
      .resource('roles', RolesController)
      .apiOnly()
      .use('*', middleware.auth({ guards: ['api'] }))

    router
      .resource('gameversions', GameVersionsController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('gameversions/:id/packreleases', '#controllers/pack_releases_controller.index').use(
      middleware.nestedResource([
        {
          parent: GameVersion,
          policy: GameVersionPolicy,
          relation: 'gameVersion',
        },
      ])
    )

    router
      .get(
        'gameversions/:gameVersionId/packreleases/:packReleaseId/packitems',
        '#controllers/pack_items_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
            paramKey: 'packReleaseId',
          },
          {
            parent: GameVersion,
            policy: GameVersionPolicy,
            relation: 'gameVersion',
            paramKey: 'gameVersionId',
          },
        ])
      )

    router
      .get(
        'gameversions/:gameVersionId/packreleases/:packReleaseId/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
            paramKey: 'packReleaseId',
          },
          {
            parent: GameVersion,
            policy: GameVersionPolicy,
            relation: 'gameVersion',
            paramKey: 'gameVersionId',
          },
        ])
      )

    router
      .resource('packitemsafestatuses', PackItemSafeStatusesController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router
      .get('packitemsafestatuses/:id/packitems', '#controllers/pack_items_controller.index')
      .use(
        middleware.nestedResource([
          {
            parent: PackItemSafeStatus,
            policy: PackItemSafeStatusPolicy,
            relation: 'packItemSafeStatus',
          },
        ])
      )

    router
      .get(
        'packitemsafestatuses/:statusId/packitems/:itemId/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackItem,
            policy: PackItemPolicy,
            relation: 'packItems',
            paramKey: 'itemId',
          },
          {
            parent: PackItemSafeStatus,
            policy: PackItemSafeStatusPolicy,
            relation: 'packItemSafeStatus',
            paramKey: 'statusId',
          },
        ])
      )

    router
      .resource('packitemtypes', PackItemTypesController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('packitemtypes/:id/packitems', '#controllers/pack_items_controller.index').use(
      middleware.nestedResource([
        {
          parent: PackItemType,
          policy: PackItemTypePolicy,
          relation: 'packItemType',
        },
      ])
    )

    router
      .get(
        'packitemtypes/:typeId/packitems/:itemId/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackItem,
            policy: PackItemPolicy,
            relation: 'packItems',
            paramKey: 'itemId',
          },
          {
            parent: PackItemType,
            policy: PackItemTypePolicy,
            relation: 'packItemType',
            paramKey: 'typeId',
          },
        ])
      )

    router
      .resource('packmodcores', PackModCoresController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('packmodcores/:id/packs', '#controllers/packs_controller.index').use(
      middleware.nestedResource([
        {
          parent: PackModCore,
          policy: PackModCorePolicy,
          relation: 'packModCore',
        },
      ])
    )

    router
      .resource('packstatuses', PackStatusesController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('packstatuses/:id/packs', '#controllers/packs_controller.index').use(
      middleware.nestedResource([
        {
          parent: PackStatus,
          policy: PackStatusPolicy,
          relation: 'packStatus',
        },
      ])
    )

    router
      .resource('packvisiblelevels', PackVisibleLevelsController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('packvisiblelevels/:id/packs', '#controllers/packs_controller.index').use(
      middleware.nestedResource([
        {
          parent: PackVisibleLevel,
          policy: PackVisibleLevelPolicy,
          relation: 'packVisibleLevel',
        },
      ])
    )

    router
      .resource('tags', TagsController)
      .apiOnly()
      .use(['store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('packs/:id/packreleases', '#controllers/pack_releases_controller.index').use(
      middleware.nestedResource([
        {
          parent: Pack,
          policy: PackPolicy,
          relation: 'pack',
        },
      ])
    )

    router.get('pack/:id/tags', '#controllers/tags_controller.index').use(
      middleware.nestedResource([
        {
          parent: Pack,
          policy: PackPolicy,
          relation: 'packs',
        },
      ])
    )
  })
  .prefix('api')
  .use(middleware.verify())

router
  .group(() => {
    router
      .resource('packs', PacksController)
      .apiOnly()
      .use(['store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router.get('tags/:id/packs', '#controllers/packs_controller.indexByTag').use(
      middleware.nestedResource([
        {
          parent: Tag,
          policy: TagPolicy,
          relation: 'tags',
        },
      ])
    )

    router.get('users/:id/packs', '#controllers/packs_controller.indexByUser').use(
      middleware.nestedResource([
        {
          parent: User,
          policy: UserPolicy,
          relation: 'user',
        },
      ])
    )

    router
      .get(
        'packs/:packId/packreleases/:packReleaseId/packitems',
        '#controllers/pack_items_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
            paramKey: 'packReleaseId',
          },
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
        ])
      )

    router
      .get(
        'packs/:packId/packreleases/:packReleaseId/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
            paramKey: 'packReleaseId',
          },
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
        ])
      )

    router
      .get(
        'users/:userId/packs/:packId/packreleases',
        '#controllers/pack_releases_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
          {
            parent: User,
            policy: UserPolicy,
            relation: 'user',
            paramKey: 'userId',
          },
        ])
      )

    router
      .get('tags/:tagId/packs/:packId/packreleases', '#controllers/pack_releases_controller.index')
      .use(
        middleware.nestedResource([
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
          {
            parent: Tag,
            policy: TagPolicy,
            relation: 'tags',
            paramKey: 'tagId',
          },
        ])
      )

    router
      .get(
        'packmodcores/:modCoreId/packs/:packId/packreleases',
        '#controllers/pack_releases_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
          {
            parent: PackModCore,
            policy: PackModCorePolicy,
            relation: 'packModCore',
            paramKey: 'modCoreId',
          },
        ])
      )

    router
      .get(
        'packstatuses/:statusId/packs/:packId/packreleases',
        '#controllers/pack_releases_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
          {
            parent: PackStatus,
            policy: PackStatusPolicy,
            relation: 'packStatus',
            paramKey: 'statusId',
          },
        ])
      )

    router
      .get(
        'packvisiblelevels/:levelId/packs/:packId/packreleases',
        '#controllers/pack_releases_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: Pack,
            policy: PackPolicy,
            relation: 'pack',
            paramKey: 'packId',
          },
          {
            parent: PackVisibleLevel,
            policy: PackVisibleLevelPolicy,
            relation: 'packVisibleLevel',
            paramKey: 'levelId',
          },
        ])
      )

    router.get('roles/:roleId/users/:userId/packs', '#controllers/packs_controller.index').use(
      middleware.nestedResource([
        {
          parent: User,
          policy: UserPolicy,
          relation: 'user',
          paramKey: 'userId',
        },
        {
          parent: Role,
          policy: RolePolicy,
          relation: 'roles',
          paramKey: 'roleId',
        },
      ])
    )
  })
  .prefix('api')
  .use(middleware.verify())

router
  .group(() => {
    router
      .resource('packreleases', PackReleasesController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))
  })
  .prefix('api')
  .use(middleware.verify())

router
  .group(() => {
    router
      .resource('packitems', PackItemsController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router
      .get('packreleases/:id/packitems', '#controllers/pack_items_controller.indexByPackRelease')
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
          },
        ])
      )

    router
      .get(
        'packitems/:id/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.index'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackItem,
            policy: PackItemPolicy,
            relation: 'packItems',
          },
        ])
      )
  })
  .prefix('api')
  .use(middleware.verify())

router
  .group(() => {
    router
      .resource('packpredownloadquestions', PackPreDownloadQuestionsController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.auth({ guards: ['api'] }))

    router
      .get(
        'packreleases/:id/packpredownloadquestions',
        '#controllers/pack_pre_download_questions_controller.indexByPackRelease'
      )
      .use(
        middleware.nestedResource([
          {
            parent: PackRelease,
            policy: PackReleasePolicy,
            relation: 'packRelease',
          },
        ])
      )

    router
      .get('packpredownloadquestions/:id/packitems', '#controllers/pack_items_controller.index')
      .use(
        middleware.nestedResource([
          {
            parent: PackPreDownloadQuestion,
            policy: PackPreDownloadQuestionPolicy,
            relation: 'packPreDownloadQuestions',
          },
        ])
      )
  })
  .prefix('api')
  .use(middleware.verify())
