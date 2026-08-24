import { Request, Response, NextFunction } from 'express'
import { admin_supabase } from '../config/supabase'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.split(' ')[1]

    const { data, error } = await admin_supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Adjuntamos el usuario al request
    ; (req as any).user = data.user

    next()
  } catch {
    res.status(401).json({ error: 'No autorizado' })
  }
}