import { supabase } from '../../config/supabase'

export const crearPerfil = async (
  id: string,
  data: any
) => {
  return await supabase.from('perfil_usuario').insert({
    id,
    ...data
  })
}

export const obtenerMiPerfil = async (id: string) => {
  return await supabase
    .from('perfil_usuario')
    .select('*')
    .eq('id', id)
    .single()
}