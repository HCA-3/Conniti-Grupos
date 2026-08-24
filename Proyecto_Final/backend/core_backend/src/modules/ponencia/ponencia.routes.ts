import { Router } from 'express'
import * as controller from './ponencia.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getSessions)
router.post('/', authMiddleware, controller.postSession)
router.put('/:id', authMiddleware, controller.putSession)
router.delete('/:id', authMiddleware, controller.deleteSessionController)

export default router