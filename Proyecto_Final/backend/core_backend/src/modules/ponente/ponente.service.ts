import { supabase } from '../../config/supabase'

export const getSpeakers = async () =>
    supabase.from('ponente').select('*')

export const createSpeaker = async (data: any) =>
    supabase.from('ponente').insert(data).select().single()
