import { supabase } from '../../config/supabase'

export const obtenerEventos = async () =>
  supabase.from('evento').select('*')

export const crearEvento = async (data: any) =>
  supabase.from('evento').insert(data)