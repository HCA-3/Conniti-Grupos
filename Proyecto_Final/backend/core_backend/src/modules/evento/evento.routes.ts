import { Router } from 'express'
import * as controller from './evento.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getEventos)
router.post('/', authMiddleware, controller.postEvento)

export default router