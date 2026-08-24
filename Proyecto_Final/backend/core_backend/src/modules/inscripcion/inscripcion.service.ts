import { supabase } from '../../config/supabase'

export const crearInscripcion = async (
  usuario_id: string,
  ponencia_id: string
) =>
  supabase.from('inscripcion_ponencia').insert({
    usuario_id,
    ponencia_id
  })

export const obtenerMisInscripciones = async (usuario_id: string) =>
  supabase
    .from('inscripcion_ponencia')
    .select(`
      *,
      ponencia(*)
    `)
    .eq('usuario_id', usuario_id)