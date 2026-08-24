import { Request, Response } from 'express'
import * as service from './usuario.service'
import { admin_supabase } from '../../config/supabase'


// Registrar un usuario(CREATE)

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, rol, career, gender, documentNumber, institutionalCode } = req.body

  try {
    console.log("Intentando registrar usuario:", email)

    // Validar en la BD que no exista ya el documento de identidad
    if (documentNumber) {
      const { data: docExists } = await admin_supabase
        .from('perfil_usuario')
        .select('id')
        .eq('documento', documentNumber)
        .maybeSingle()

      if (docExists) {
        return res.status(400).json({ error: "El número de documento ya se encuentra registrado." })
      }
    }

    // Validar en la BD que no exista ya el código institucional
    if (rol === 'ESTUDIANTE' && institutionalCode) {
      const { data: codeExists } = await admin_supabase
        .from('perfil_usuario')
        .select('id')
        .eq('codigo_institucional', institutionalCode)
        .maybeSingle()

      if (codeExists) {
        return res.status(400).json({ error: "El código institucional ya se encuentra registrado por otro estudiante." })
      }
    }

    // 1. Crear usuario en auth supabase
    const { data, error } = await admin_supabase.auth.signUp({
      email,
      password,
    })

    if (error || !data.user) {
      console.error("Error de Supabase Auth:", error)
      return res.status(400).json({ error: error?.message || "No se pudo crear el usuario en Auth" })
    }
    console.log("Usuario creado en Auth:", data.user.id)

    let profileData: any = {
      id: data.user.id,
      nombre_completo: fullName,
      email: email,
      rol: rol || 'USER', // Ahora viene del frontend o por defecto USER
      carrera: career,
      genero: gender,
      documento: documentNumber,
      codigo_institucional: institutionalCode
    }

    let { error: profileError } = await admin_supabase
      .from('perfil_usuario')
      .insert(profileData)

    if (profileError && profileError.message.includes("Could not find")) {
      console.warn("Columnas faltantes en Supabase, reintentando con formato básico", profileError.message);
      profileData = {
        id: data.user.id,
        nombre_completo: fullName,
        email: email,
        rol: rol || 'USER'
      };
      const retryResult = await admin_supabase.from('perfil_usuario').insert(profileData);
      profileError = retryResult.error;
    }

    if (profileError) {
      // Si falla el perfil, eliminamos el usuario de auth para permitir re-intento
      await admin_supabase.auth.admin.deleteUser(data.user.id)
      console.error("Error al crear perfil:", profileError)
      return res.status(400).json({ error: "Error al crear el perfil: " + profileError.message })
    }

    return res.status(201).json({
      message: "Usuario y perfil creados correctamente",
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName
      }
    })
  } catch (err: any) {
    console.error("Error en registro server-side:", err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}


export const obtenerPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.obtenerMiPerfil(userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

export const crearPerfil = async (req: any, res: any) => {
  try {
    const userId = req.user.id
    const { nombre_completo, rol } = req.body

    const { error } = await admin_supabase
      .from('perfil_usuario')
      .insert({
        id: userId,
        nombre_completo,
        rol: rol || 'USER'
      })

    if (error) throw error

    res.status(201).json({ message: 'Perfil creado correctamente' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const actualizarPerfil = async (req: any, res: any) => {
  try {
    const userId = req.user.id
    const { nombre_completo, carrera } = req.body

    let { error } = await admin_supabase
      .from('perfil_usuario')
      .update({
        nombre_completo,
        carrera
      })
      .eq('id', userId)

    if (error && error.message.includes("Could not find")) {
      console.warn("Columna no encontrada al actualizar, usando campos base");
      const retryResult = await admin_supabase.from('perfil_usuario').update({ nombre_completo }).eq('id', userId);
      error = retryResult.error;
    }

    if (error) throw error

    res.json({ message: 'Perfil actualizado correctamente' })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const obtenerUsuarios = async (req: any, res: any) => {
  try {
    const { data, error } = await admin_supabase
      .from('perfil_usuario')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
