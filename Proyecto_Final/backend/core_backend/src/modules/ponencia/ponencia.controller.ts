import { Request, Response } from 'express'
import * as service from './ponencia.service'

export const getSessions = async (_: Request, res: Response) => {
  const { data, error } = await service.getSessions()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

export const postSession = async (req: Request, res: Response) => {
  const { data, error } = await service.createSession(req.body)
  if (error) return res.status(403).json({ error: error.message })
  res.status(201).json(data)
}

export const deleteSessionController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { error } = await service.deleteSession(id as string)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
}

export const putSession = async (req: Request, res: Response) => {
  const { id } = req.params
  const { data, error } = await service.updateSession(id as string, req.body)
  if (error) return res.status(403).json({ error: error.message })
  res.status(200).json(data)
}