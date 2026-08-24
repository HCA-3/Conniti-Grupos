import express from 'express'
import cors from 'cors'

import usuarioRoutes from './modules/usuario/usuario.routes'
import eventoRoutes from './modules/evento/evento.routes'
import ponencias from './modules/ponencia/ponencia.routes'
import inscripciones from './modules/inscripcion/inscripcion.routes'
import ponentes from './modules/ponente/ponente.routes'


const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/eventos', eventoRoutes)
app.use('/api/ponencias', ponencias)
app.use('/api/inscripciones', inscripciones)
app.use('/api/ponentes', ponentes)

export default app