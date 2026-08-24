import { Request, Response } from 'express'
import * as service from './inscripcion.service'

export const inscribirse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { ponencia_id } = req.body

  const { data, error } =
    await service.crearInscripcion(userId, ponencia_id)

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
}

export const misInscripciones = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } =
    await service.obtenerMisInscripciones(userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}