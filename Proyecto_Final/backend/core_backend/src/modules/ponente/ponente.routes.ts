import { Router } from 'express'
import * as controller from './ponente.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getSpeakersController)
router.post('/', authMiddleware, controller.postSpeaker)

export default router
