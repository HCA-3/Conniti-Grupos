import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import * as controller from './inscripcion.controller'

const router = Router()

router.post('/', authMiddleware, controller.inscribirse)
router.get('/mis-inscripciones', authMiddleware, controller.misInscripciones)

export default router