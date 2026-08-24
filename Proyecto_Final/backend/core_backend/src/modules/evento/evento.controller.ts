import { Request, Response } from 'express'
import * as service from './evento.service'

export const getEventos = async (_: Request, res: Response) => {
  const { data, error } = await service.obtenerEventos()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

export const postEvento = async (req: Request, res: Response) => {
  const { data, error } = await service.crearEvento(req.body)
  if (error) return res.status(403).json({ error: error.message })
  res.status(201).json(data)
}