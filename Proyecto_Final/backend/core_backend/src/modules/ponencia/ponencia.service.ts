import { supabase } from '../../config/supabase'

export const getSessions = async () =>
  supabase.from('ponencia').select(`
    *,
    sala(*),
    dia_evento(*),
    ponencia_ponente(
      ponente(*)
    )
  `)

export const createSession = async (data: any) =>
  supabase.from('ponencia').insert(data)

export const deleteSession = async (id: string) =>
  supabase.from('ponencia').delete().eq('id', id)

export const updateSession = async (id: string, data: any) =>
  supabase.from('ponencia').update(data).eq('id', id)