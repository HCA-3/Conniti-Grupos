import { Request, Response } from 'express'
import * as service from './ponente.service'

export const getSpeakersController = async (_: Request, res: Response) => {
    const { data, error } = await service.getSpeakers()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
}

export const postSpeaker = async (req: Request, res: Response) => {
    const { data, error } = await service.createSpeaker(req.body)
    if (error) return res.status(403).json({ error: error.message })
    res.status(201).json(data)
}
