import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mapFormDataToInmoup, validateInmoupData } from '@/utils/inmoupMapper'

// Función para limpiar campos vacíos en el objeto de edición
function cleanEmptyFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => cleanEmptyFields(item))
      .filter((item) => item !== undefined)
    return cleanedArray.length > 0 ? cleanedArray : undefined
  }

  if (typeof obj === 'object') {
    const cleaned: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanEmptyFields(value)

      // Solo incluir si el valor no está vacío
      if (
        cleanedValue !== undefined &&
        cleanedValue !== '' &&
        cleanedValue !== 0 &&
        cleanedValue !== null &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
        !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
      ) {
        cleaned[key] = cleanedValue
      }
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }

  // Para valores primitivos, devolver undefined si están vacíos
  if (obj === '' || obj === 0) {
    return undefined
  }

  return obj
}

// Función para obtener el ID del usuario de Inmoup
async function getInmoupUserId(): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.INMOUP_API_URL}/panel/mis-datos`, {
      method: 'GET',
      headers: {
        apiKey: process.env.INMOUP_API_KEY || '',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Error al obtener datos del usuario de Inmoup:', response.status)
      return null
    }

    const userData = await response.json()
    const userId = userData?.data?.usr_id || userData?.usr_id

    if (!userId) {
      console.error('No se encontró usr_id en la respuesta:', userData)
      return null
    }

    console.log('✅ ID de usuario obtenido:', userId)
    return userId.toString()
  } catch (error) {
    console.error('Error al obtener ID de usuario de Inmoup:', error)
    return null
  }
}

// Función para limpiar valores null, undefined, strings vacíos y ceros del objeto
function removeEmptyValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined
  }

  if (typeof obj === 'string' && obj.trim() === '') {
    return undefined
  }

  if (typeof obj === 'number' && obj === 0) {
    return undefined
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => removeEmptyValues(item))
      .filter((item) => item !== undefined)
    return cleanedArray.length > 0 ? cleanedArray : undefined
  }

  if (typeof obj === 'object') {
    const cleanedObj: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeEmptyValues(value)
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue
      }
    }
    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined
  }

  return obj
}

// Función para crear el objeto inmoupData reutilizable
function createInmoupData(
  mappedPropertyData: any,
  ownerData: any,
  images: any[],
  propertyId: string,
) {
  const inmoupDataRaw = {
    propiedades: [
      {
        id: propertyId, // ID de la propiedad, 0 para nuevas propiedades
        tipo: mappedPropertyData.propertyType || undefined,
        condicion: mappedPropertyData.condition || undefined,

        // Ubicación
        ubicacion: {
          provincia: mappedPropertyData.province || undefined,
          localidad: mappedPropertyData.locality || undefined,
          latitud: mappedPropertyData.lat || undefined,
          longitud: mappedPropertyData.lng || undefined,
          domicilio: mappedPropertyData.address || undefined,
          barrio: mappedPropertyData.neighborhood || undefined,
          zona_id: mappedPropertyData.zona_id || undefined,
        },

        descripcion: mappedPropertyData.description || undefined,

        // Fotos - usar las imágenes recibidas del PropertyDetailsView
        fotos: images && images.length > 0 ? images : undefined,

        // Precio
        precio: mappedPropertyData.price
          ? [
              {
                valor: mappedPropertyData.price,
                moneda: mappedPropertyData.currency || undefined,
              },
            ]
          : undefined,

        // Tasación
        tasacion: mappedPropertyData.appraisal
          ? [
              {
                valor: mappedPropertyData.appraisal,
                moneda:
                  mappedPropertyData.appraisalCurrency || mappedPropertyData.currency || undefined,
              },
            ]
          : undefined,

        nota: undefined, // Notas adicionales

        // Propietario
        propietario: ownerData
          ? {
              nombre: ownerData.fullname || undefined,
              email: ownerData.email || undefined,
              domicilio: ownerData.address || undefined,
              telefono: ownerData.phone || undefined,
              provincia: ownerData.province || 'Mendoza',
              localidad: ownerData.locality || undefined,
              nota: undefined,
            }
          : undefined,

        // Video (opcional)
        video: {
          descripcion: undefined,
          url: undefined,
        },

        // Vendedor
        vendedor: {
          id: undefined, // ID del vendedor, se puede configurar
        },

        // Servicios y características
        servicios: {
          superficie_cubierta: mappedPropertyData.coveredArea || undefined,
          superficie_total: mappedPropertyData.totalArea || undefined,
          precio_peso_m2: undefined, // Se puede calcular
          precio_dolar_m2: undefined, // Se puede calcular
          expensas: mappedPropertyData.expenses || undefined,
          tiene_expensas: mappedPropertyData.hasExpenses || undefined,
          dormitorios: mappedPropertyData.bedrooms || undefined,
          banos: mappedPropertyData.bathrooms || undefined,
          plantas: mappedPropertyData.plantas || undefined,
          ambientes: mappedPropertyData.ambientes || mappedPropertyData.totalRooms || undefined,
          estrellas: mappedPropertyData.estrellas || undefined,
          cochera: mappedPropertyData.garageType || undefined,
          antiguedad: {
            valor: mappedPropertyData.antiquity || undefined,
            tiempo: mappedPropertyData.antiquity ? 'años' : undefined,
          },
          estado_conservacion: mappedPropertyData.conservationStatus || undefined,

          // Servicios básicos - priorizar campos directos sobre amenityServices
          agua:
            mappedPropertyData.agua === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('agua-corriente') ||
            undefined,
          luz:
            mappedPropertyData.luz === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('luz') ||
            (mappedPropertyData.amenityServices || []).includes('electricidad') ||
            undefined,
          gas:
            mappedPropertyData.gas === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('gas-natural') ||
            undefined,
          cloacas:
            mappedPropertyData.cloacas === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('desague-cloacal') ||
            undefined,
          telefono: (mappedPropertyData.amenityServices || []).includes('telefono') || undefined,
          internet: (mappedPropertyData.amenityServices || []).includes('internet') || undefined,

          // Características de la propiedad
          amoblado: mappedPropertyData.furnished === 'si' || undefined,
          piscina:
            (mappedPropertyData.amenityServices || []).includes('piscina') ||
            (mappedPropertyData.amenityEnvironments || []).includes('pileta') ||
            undefined,
          zona_escolar:
            (mappedPropertyData.amenityNearbyZones || []).includes('colegios') || undefined,
          mascota:
            mappedPropertyData.mascotas === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('permite-mascotas') ||
            undefined,
          aire_acondicionado:
            (mappedPropertyData.amenityServices || []).includes('aire-acondicionado') || undefined,
          calefaccion_central:
            (mappedPropertyData.amenityServices || []).includes('calefaccion-central') || undefined,
          cable_tv: (mappedPropertyData.amenityServices || []).includes('cable-tv') || undefined,
          hipotecario:
            (mappedPropertyData.amenityServices || []).includes('apto-credito-hipotecario') ||
            undefined,
          financiacion:
            (mappedPropertyData.amenityServices || []).includes('financiacion') ||
            (mappedPropertyData.amenityServices || []).includes('ofrece-financiacion') ||
            undefined,
          permuta:
            (mappedPropertyData.amenityServices || []).includes('recibe_permuta') || undefined,
          barrio_privado:
            mappedPropertyData.barrioPrivado === 'Si' ||
            (mappedPropertyData.amenityServices || []).includes('barrio-privado') ||
            undefined,
          barrio_semi_privado: mappedPropertyData.barrioPrivado === 'Semi Privado' || undefined,

          // Ambientes y espacios
          patio: (mappedPropertyData.amenityEnvironments || []).includes('patio') || undefined,
          parrilla:
            (mappedPropertyData.amenityEnvironments || []).includes('parrilla') || undefined,
          gimnasio:
            (mappedPropertyData.amenityEnvironments || []).includes('gimnasio') || undefined,
          solarium: undefined, // Se puede agregar si está en amenities
          ascensor:
            (mappedPropertyData.amenityEnvironments || []).includes('ascensor') || undefined,
          vigilancia:
            (mappedPropertyData.amenityEnvironments || []).includes('seguridad') || undefined,
        },
      },
    ],
  }

  // Limpiar valores undefined, null, strings vacíos y ceros del objeto
  const cleanedData = removeEmptyValues(inmoupDataRaw)

  return cleanedData
}

// Función para restaurar estado inicial con solo actualizar el error
async function restoreStateWithError(propertyId: string, initialState: any, errorMessage: string) {
  try {
    const payload = await getPayload({ config })

    // Restaurar el estado inicial pero con el nuevo error
    const updateData = {
      inmoup: {
        uploaded: initialState.uploaded,
        externalId: initialState.externalId,
        externalUrl: initialState.externalUrl,
        status: initialState.status,
        lastSyncAt: new Date().toISOString(),
        lastError: errorMessage,
      },
    }

    await payload.update({
      collection: 'propiedades',
      id: propertyId,
      data: updateData,
    })

    return true
  } catch (error) {
    console.error('Error restaurando estado inicial:', error)
    return false
  }
}

// Función para limpiar el lastError sin cambiar otros campos
async function clearPortalError(propertyId: string) {
  try {
    const payload = await getPayload({ config })
    // Obtener los datos actuales
    const currentProperty = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
    })

    if (!currentProperty?.inmoup) {
      return false
    }

    // Limpiar solo lastError y actualizar lastSyncAt, preservando todo lo demás
    const updateData = {
      inmoup: {
        ...currentProperty.inmoup,
        lastError: null,
        lastSyncAt: new Date().toISOString(),
      },
    }

    await payload.update({
      collection: 'propiedades',
      id: propertyId,
      data: updateData,
    })

    console.log('Error del portal limpiado exitosamente')
    return true
  } catch (error) {
    console.error('Error limpiando error del portal:', error)
    return false
  }
}

// Función para actualizar solo el lastError sin cambiar otros campos
async function updatePortalError(propertyId: string, lastError: string) {
  try {
    const payload = await getPayload({ config })

    // Obtener los datos actuales
    const currentProperty = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
    })

    if (!currentProperty?.inmoup) {
      console.error('No se encontraron datos de inmoup para actualizar error')
      return false
    }

    // Actualizar solo lastError y lastSyncAt, preservando todo lo demás
    const updateData = {
      inmoup: {
        ...currentProperty.inmoup,
        lastError: lastError,
        lastSyncAt: new Date().toISOString(),
      },
    }

    await payload.update({
      collection: 'propiedades',
      id: propertyId,
      data: updateData,
    })

    console.log('Error del portal actualizado exitosamente')
    return true
  } catch (error) {
    console.error('Error actualizando error del portal:', error)
    return false
  }
}

// Función para actualizar el portalStatuses en la base de datos
async function updatePortalStatus(
  propertyId: string,
  status: 'queued' | 'ok' | 'error',
  externalId?: string,
  externalUrl?: string,
  lastError?: string,
  preserveUploaded?: boolean, // Nuevo parámetro para preservar el estado uploaded
) {
  try {
    const payload = await getPayload({ config })

    // Si preserveUploaded es true, obtener el estado actual
    let uploaded = status === 'ok'
    if (preserveUploaded && status === 'error') {
      const currentProperty = await payload.findByID({
        collection: 'propiedades',
        id: propertyId,
      })
      uploaded = currentProperty?.inmoup?.uploaded || false
    }

    // Actualizar directamente el campo inmoup
    const updateData = {
      inmoup: {
        uploaded: uploaded,
        externalId: externalId || null,
        externalUrl: externalUrl || null,
        status: status,
        lastSyncAt: new Date().toISOString(),
        lastError: lastError || null,
      },
    }

    // Actualizar la propiedad en la base de datos
    await payload.update({
      collection: 'propiedades',
      id: propertyId,
      data: updateData,
    })

    return true
  } catch (error) {
    console.error('Error actualizando portal status:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  let propertyId: string | undefined

  try {
    const { propertyData, ownerData, images, propertyId: requestPropertyId } = await request.json()
    propertyId = requestPropertyId

    // Validar que existan datos de propertyData
    if (!propertyData) {
      // Actualizar estado a error si no hay propertyData
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se encontraron datos válidos de propertyData',
        )
      }
      return NextResponse.json(
        { error: 'No se encontraron datos válidos de propertyData' },
        { status: 400 },
      )
    }

    // Marcar como en cola al inicio del proceso
    if (propertyId) {
      await updatePortalStatus(propertyId, 'queued')
    }

    // Mapear propertyData al formato de Inmoup
    const mappedPropertyData = mapFormDataToInmoup(propertyData)
    console.log('Datos mapeados para Inmoup:', mappedPropertyData)
    // Validar los datos mapeados
    const validation = validateInmoupData(mappedPropertyData)
    if (!validation.isValid) {
      // Actualizar estado a error si la validación falla
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Datos inválidos para Inmoup: ${validation.errors.join(', ')}`,
        )
      }
      return NextResponse.json(
        {
          error: 'Datos inválidos para Inmoup',
          validationErrors: validation.errors,
        },
        { status: 400 },
      )
    }

    // Crear objeto inmoupData usando la función reutilizable
    const inmoupData = createInmoupData(mappedPropertyData, ownerData, images, propertyId || '0')

    // console.log('Datos finales enviados a Inmoup:', inmoupData)
    // console.log('Datos mapeados para Inmoup ubicacion:', inmoupData.propiedades[0].ubicacion)
    // console.log('Datos mapeados para Inmoup propietario:', inmoupData.propiedades[0].propietario)
    console.log('Datos mapeados para Inmoup servicios:', inmoupData.propiedades[0].servicios)
    // console.log('Datos mapeados para Inmoup vendedor:', inmoupData.propiedades[0].vendedor)
    // Llamada real a API de Inmoup
    try {
      // Para creación, enviar el objeto completo con array de propiedades
      const inmoupResponse: Response = await fetch(`${process.env.INMOUP_API_URL}/propiedades`, {
        method: 'POST',
        headers: {
          apiKey: process.env.INMOUP_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inmoupData), // Array completo: { propiedades: [...] }
      })

      if (!inmoupResponse.ok) {
        const errorData = await inmoupResponse.json().catch(() => ({}))
        console.error('Error de Inmoup API (HTTP):', errorData)
        throw new Error(`${errorData.error[0] || 'Error desconocido'}`)
      }

      const inmoupResult: any = await inmoupResponse.json()

      // Verificar si hay errores en la respuesta de Inmoup
      const responseData = inmoupResult.data || inmoupResult
      const errors = responseData.error || []
      const errores = responseData.errores || []
      const allErrors = [...errors, ...errores]

      if (allErrors.length > 0) {
        console.error('Errores reportados por Inmoup:', allErrors, 'de la propiedad:', propertyId)

        // Formatear errores para mostrar al usuario
        const errorMessages = allErrors.map((err: any) => {
          if (typeof err === 'string') return err
          return err.message || err.error || 'Error desconocido'
        })

        // Actualizar estado a error con detalles de Inmoup
        if (propertyId) {
          await updatePortalStatus(
            propertyId,
            'error',
            undefined,
            undefined,
            `Error en la validación de Inmoup: ${errorMessages.join(', ')}`,
          )
        }

        // Crear el objeto de datos actualizados de Inmoup para devolver al frontend
        const updatedInmoupData = {
          name: 'Inmoup',
          uploaded: false,
          externalId: null,
          externalUrl: null,
          status: 'error' as const,
          lastSyncAt: new Date().toISOString(),
          lastError: `Error en la validación de Inmoup: ${errorMessages.join(', ')}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la validación de Inmoup',
            inmoupErrors: errorMessages,
            details: allErrors,
            updatedInmoupData, // Datos actualizados para el frontend
          },
          { status: 400 },
        )
      }

      // Verificar si se publicaron propiedades exitosamente
      const propiedades = responseData.propiedades || []
      if (propiedades.length === 0) {
        console.warn('No se publicaron propiedades en Inmoup')

        // Actualizar estado a error cuando no se publican propiedades
        if (propertyId) {
          await updatePortalStatus(
            propertyId,
            'error',
            undefined,
            undefined,
            'No se pudo publicar la propiedad en Inmoup - La respuesta no contiene propiedades publicadas',
          )
        }

        // Crear el objeto de datos actualizados de Inmoup para devolver al frontend
        const updatedInmoupData = {
          name: 'Inmoup',
          uploaded: false,
          externalId: null,
          externalUrl: null,
          status: 'error' as const,
          lastSyncAt: new Date().toISOString(),
          lastError:
            'No se pudo publicar la propiedad en Inmoup - La respuesta no contiene propiedades publicadas',
        }

        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo publicar la propiedad en Inmoup',
            details: 'La respuesta no contiene propiedades publicadas',
            inmoupResponse: inmoupResult,
            updatedInmoupData, // Datos actualizados para el frontend
          },
          { status: 422 },
        )
      }
      // Actualizar estado a exitoso con información de Inmoup
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'ok',
          responseData.propiedades[0]?.prp_id,
          `https://inmoup.com.ar/panel/mis-avisos/${responseData.propiedades[0]?.prp_id}/editar`,
        )
      }

      // Crear el objeto de datos actualizados de Inmoup para devolver al frontend
      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: true,
        externalId: responseData.propiedades[0]?.prp_id?.toString() || null,
        externalUrl: `https://inmoup.com.ar/panel/mis-avisos/${responseData.propiedades[0]?.prp_id}/editar`,
        status: 'ok' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        success: true,
        message: 'Propiedad publicada exitosamente en Inmoup',
        inmoupResponse: inmoupResult,
        updatedInmoupData, // Nuevos datos para el frontend
        propiedadesPublicadas: propiedades.length,
        ownerIncluded: !!ownerData?.fullname,
        mappedData: mappedPropertyData, // Para debugging
      })
    } catch (inmoupError: unknown) {
      console.error('Error llamando a Inmoup API:', inmoupError)

      // Actualizar estado a error cuando falla la API
      const errorMessage = inmoupError instanceof Error ? inmoupError.message : 'Error desconocido'
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Error al conectar con Inmoup API: ${errorMessage}`,
        )
      }

      // Crear el objeto de datos actualizados de Inmoup para devolver al frontend
      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con Inmoup API: ${errorMessage}`,
      }

      // Si falla la API real, devolver error específico
      return NextResponse.json(
        {
          error: 'Error al conectar con Inmoup API',
          details: inmoupError instanceof Error ? inmoupError.message : 'Error desconocido',
          mappedData: mappedPropertyData, // Para debugging
          updatedInmoupData, // Datos actualizados para el frontend
        },
        { status: 502 },
      )
    }

    // SIMULACIÓN COMENTADA - Descomentar si falla la API real

    // await new Promise((resolve) => setTimeout(resolve, 2000))

    // const mockResponse = {
    //   success: true,
    //   id: Math.floor(Math.random() * 10000),
    //   message: 'Propiedad publicada exitosamente en Inmoup',
    //   url: `https://inmoup.com/propiedad/${Math.floor(Math.random() * 10000)}`,
    //   publishedAt: new Date().toISOString(),
    //   mappedData: mappedPropertyData, // Para debugging
    //   // ownerIncluded: !!?.fullname, // Verificar si hay datos del propietario
    // }

    // console.log('Respuesta de Inmoup:', mockResponse)

    // return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('Error en API de Inmoup:', error)

    // Actualizar estado a error para errores generales
    if (propertyId) {
      const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
      await updatePortalStatus(
        propertyId,
        'error',
        undefined,
        undefined,
        `Error interno del servidor: ${errorMessage}`,
      )
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Función PUT para sincronizar/actualizar propiedades ya publicadas
export async function PUT(request: NextRequest) {
  let propertyId: string | undefined
  let initialInmoupState: any = null

  try {
    const {
      propertyData,
      ownerData,
      images,
      propertyId: requestPropertyId,
      action,
    } = await request.json()
    propertyId = requestPropertyId

    console.log('🔄 Solicitud de sincronización recibida para propiedad:', propertyId)

    // Validar que sea una acción de sincronización
    if (action !== 'sync') {
      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'Acción no válida para sincronización',
      }

      return NextResponse.json(
        {
          error: 'Acción no válida',
          details: 'La ruta PUT solo acepta action: "sync"',
          updatedInmoupData,
        },
        { status: 400 },
      )
    }

    // Validar que existan datos de propertyData
    if (!propertyData) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          'No se encontraron datos válidos de propertyData para sincronización',
        )
      }

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se encontraron datos válidos de propertyData',
      }

      return NextResponse.json(
        {
          error: 'No se encontraron datos válidos de propertyData',
          updatedInmoupData,
        },
        { status: 400 },
      )
    }

    // Obtener los datos actuales de la propiedad ANTES de hacer cambios para preservar estado
    if (propertyId) {
      const payload = await getPayload({ config })
      const currentProperty = await payload.findByID({
        collection: 'propiedades',
        id: propertyId,
      })

      // Capturar el estado inicial para restaurar en caso de error
      if (currentProperty?.inmoup) {
        initialInmoupState = {
          uploaded: currentProperty.inmoup.uploaded,
          externalId: currentProperty.inmoup.externalId,
          externalUrl: currentProperty.inmoup.externalUrl,
          status: currentProperty.inmoup.status,
          lastSyncAt: currentProperty.inmoup.lastSyncAt,
          lastError: currentProperty.inmoup.lastError,
        }
      }
    }

    // Marcar como en cola al inicio del proceso
    if (propertyId) {
      await updatePortalStatus(propertyId, 'queued')
    }

    // Mapear propertyData al formato de Inmoup
    const mappedPropertyData = mapFormDataToInmoup(propertyData)

    // Validar los datos mapeados
    const validation = validateInmoupData(mappedPropertyData)
    if (!validation.isValid) {
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'error',
          undefined,
          undefined,
          `Datos inválidos para sincronización en Inmoup: ${validation.errors.join(', ')}`,
        )
      }

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: propertyData?.inmoup?.externalId || null,
        externalUrl: propertyData?.inmoup?.externalUrl || null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: `Datos inválidos para Inmoup: ${validation.errors.join(', ')}`,
      }

      return NextResponse.json(
        {
          error: 'Datos inválidos para sincronización en Inmoup',
          validationErrors: validation.errors,
          updatedInmoupData,
        },
        { status: 400 },
      )
    }

    // Crear objeto inmoupData usando la función reutilizable
    // Para sincronización, usar el externalId existente como ID
    const inmoupData = createInmoupData(
      mappedPropertyData,
      ownerData,
      images,
      propertyData?.inmoup?.externalId || propertyId || '0',
    )

    console.log('🔄 Datos preparados para sincronización en Inmoup:', inmoupData.propiedades[0].id)

    // Obtener el ID de usuario dinámicamente
    const userId = await getInmoupUserId()

    if (!userId) {
      if (propertyId && initialInmoupState) {
        await restoreStateWithError(
          propertyId,
          initialInmoupState,
          'No se pudo obtener el ID de usuario de Inmoup',
        )
      }

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: initialInmoupState?.uploaded || false,
        externalId: initialInmoupState?.externalId || null,
        externalUrl: initialInmoupState?.externalUrl || null,
        status: (initialInmoupState?.status as any) || 'error',
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se pudo obtener el ID de usuario de Inmoup',
      }

      return NextResponse.json(
        {
          error: 'No se pudo obtener el ID de usuario de Inmoup',
          details: 'La API de mis-datos no devolvió un usr_id válido',
          updatedInmoupData,
        },
        { status: 500 },
      )
    }

    // Llamada real a API de Inmoup para sincronización (endpoint diferente)
    try {
      // Para edición/sincronización, enviar solo el objeto propiedad (no array)
      const propiedadOriginal = inmoupData.propiedades[0]

      // Limpiar campos vacíos para la edición
      const propiedadLimpia = cleanEmptyFields(propiedadOriginal)
      const propiedadParaEdicion = { propiedad: propiedadLimpia }

      const inmoupResponse: Response = await fetch(
        `${process.env.INMOUP_API_URL}/propiedades/${inmoupData.propiedades[0].id}/usuario/${userId}/editar`,
        {
          method: 'POST', // O POST según la API de Inmoup
          headers: {
            apiKey: process.env.INMOUP_API_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propiedadParaEdicion), // Enviar solo el objeto propiedad
        },
      )

      if (!inmoupResponse.ok) {
        const errorData = await inmoupResponse.json().catch(() => ({}))
        console.error('Error de Inmoup API (HTTP) en sincronización:', errorData)
        throw new Error(`${inmoupResponse.status} - ${errorData.message || 'Error desconocido'}`)
      }

      const inmoupResult: any = await inmoupResponse.json()
      console.log('✅ Respuesta de Inmoup en sincronización:', inmoupResult)

      // Verificar si hay errores en la respuesta de Inmoup
      const responseData = inmoupResult.data || inmoupResult
      const errors = responseData.error || []
      const errores = responseData.errores || []
      const allErrors = [...errors, ...errores]

      if (allErrors.length > 0) {
        console.error(
          'Errores reportados por Inmoup en sincronización:',
          allErrors,
          'de la propiedad:',
          propertyId,
        )

        const errorMessages = allErrors.map((err: any) => {
          if (typeof err === 'string') return err
          return err.message || err.error || 'Error desconocido'
        })

        if (propertyId && initialInmoupState) {
          await restoreStateWithError(
            propertyId,
            initialInmoupState,
            `Error en la sincronización de Inmoup: ${errorMessages.join(', ')}`,
          )
        }

        const updatedInmoupData = {
          name: 'Inmoup',
          uploaded: initialInmoupState?.uploaded || false,
          externalId: initialInmoupState?.externalId || null,
          externalUrl: initialInmoupState?.externalUrl || null,
          status: (initialInmoupState?.status as any) || 'error',
          lastSyncAt: new Date().toISOString(),
          lastError: `Error en la sincronización de Inmoup: ${errorMessages.join(', ')}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la sincronización de Inmoup',
            inmoupErrors: errorMessages,
            details: allErrors,
            updatedInmoupData,
          },
          { status: 400 },
        )
      }

      // Actualizar estado a exitoso
      if (propertyId) {
        await updatePortalStatus(
          propertyId,
          'ok',
          propertyData?.inmoup?.externalId,
          propertyData?.inmoup?.externalUrl,
        )
        // Limpiar cualquier error previo
        await clearPortalError(propertyId)
      }

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: true,
        externalId: propertyData?.inmoup?.externalId || null,
        externalUrl: propertyData?.inmoup?.externalUrl || null,
        status: 'ok' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        message: 'Propiedad actualizada en Inmoup',
        success: true,
        inmoupResponse: inmoupResult,
        updatedInmoupData,
        sync: true,
      })
    } catch (inmoupError: unknown) {
      console.error('Error llamando a Inmoup API para sincronización:', inmoupError)

      const errorMessage = inmoupError instanceof Error ? inmoupError.message : 'Error desconocido'
      if (propertyId && initialInmoupState) {
        await restoreStateWithError(
          propertyId,
          initialInmoupState,
          `Error al conectar con Inmoup API en sincronización: ${errorMessage}`,
        )
      }

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: initialInmoupState?.uploaded || false,
        externalId: initialInmoupState?.externalId || null,
        externalUrl: initialInmoupState?.externalUrl || null,
        status: (initialInmoupState?.status as any) || 'error',
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con Inmoup API: ${errorMessage}`,
      }

      return NextResponse.json(
        {
          error: 'Error al conectar con Inmoup API en sincronización',
          details: errorMessage,
          mappedData: mappedPropertyData,
          updatedInmoupData,
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('Error en sincronización de Inmoup:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (propertyId) {
      // En el catch general, puede que no tengamos initialInmoupState,
      // pero debemos intentar preservar lo que podamos
      try {
        await restoreStateWithError(
          propertyId,
          initialInmoupState || { uploaded: false, status: 'error' }, // fallback
          `Error interno en sincronización: ${errorMessage}`,
        )
      } catch {
        // Si falla, usar el método básico
        await updatePortalError(propertyId, `Error interno en sincronización: ${errorMessage}`)
      }
    }

    const updatedInmoupData = {
      name: 'Inmoup',
      uploaded: initialInmoupState?.uploaded || false,
      externalId: initialInmoupState?.externalId || null,
      externalUrl: initialInmoupState?.externalUrl || null,
      status: (initialInmoupState?.status as any) || 'error',
      lastSyncAt: new Date().toISOString(),
      lastError: `Error en sincronización: ${errorMessage}`,
    }

    return NextResponse.json(
      {
        error: 'Error en sincronización',
        details: errorMessage,
        updatedInmoupData,
      },
      { status: 500 },
    )
  }
}

// Función DELETE para eliminar propiedades del portal
export async function DELETE(request: NextRequest) {
  let propertyId: string | undefined
  let initialInmoupState: any = null

  try {
    const { propertyId: requestPropertyId, action } = await request.json()
    propertyId = requestPropertyId

    console.log('🗑️ Solicitud de eliminación recibida para propiedad:', propertyId)

    // Validar que sea una acción de eliminación
    if (action !== 'delete') {
      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'Acción no válida para eliminación',
      }

      return NextResponse.json(
        {
          error: 'Acción no válida',
          details: 'La ruta DELETE solo acepta action: "delete"',
          updatedInmoupData,
        },
        { status: 400 },
      )
    }

    // Validar que existe propertyId
    if (!propertyId) {
      return NextResponse.json(
        {
          error: 'ID de propiedad requerido',
          details: 'Se requiere propertyId para eliminar la propiedad del portal',
        },
        { status: 400 },
      )
    }

    // Obtener los datos actuales de la propiedad ANTES de hacer cambios
    const payload = await getPayload({ config })
    const property = await payload.findByID({
      collection: 'propiedades',
      id: propertyId,
    })

    if (!property || !property.inmoup?.externalId) {
      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'not_published' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'La propiedad no está publicada en Inmoup o no tiene ID externo',
      }

      return NextResponse.json(
        {
          error: 'La propiedad no está publicada en Inmoup',
          details: 'No se encontró ID externo de Inmoup para esta propiedad',
          updatedInmoupData,
        },
        { status: 400 },
      )
    }

    // Asignar el estado inicial para restaurar en caso de error
    initialInmoupState = {
      uploaded: property.inmoup.uploaded,
      externalId: property.inmoup.externalId,
      externalUrl: property.inmoup.externalUrl,
      status: property.inmoup.status,
      lastSyncAt: property.inmoup.lastSyncAt,
      lastError: property.inmoup.lastError,
    }

    // Marcar como en cola al inicio del proceso
    await updatePortalStatus(propertyId, 'queued')

    // Obtener el ID de usuario dinámicamente
    const userId = await getInmoupUserId()

    if (!userId) {
      await updatePortalStatus(
        propertyId,
        'error',
        property.inmoup.externalId,
        property.inmoup.externalUrl || undefined,
        'No se pudo obtener el ID de usuario de Inmoup',
      )

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: property.inmoup.externalId,
        externalUrl: property.inmoup.externalUrl,
        status: 'error' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: 'No se pudo obtener el ID de usuario de Inmoup',
      }

      return NextResponse.json(
        {
          error: 'No se pudo obtener el ID de usuario de Inmoup',
          details: 'La API de mis-datos no devolvió un usr_id válido',
          updatedInmoupData,
        },
        { status: 500 },
      )
    }

    // Llamada real a API de Inmoup para eliminar la propiedad
    try {
      const inmoupResponse: Response = await fetch(
        `${process.env.INMOUP_API_URL}/propiedades/${property.inmoup.externalId}/usuario/${userId}/estados/4`,
        {
          method: 'POST', // La API de Inmoup puede usar POST para eliminar
          headers: {
            apiKey: process.env.INMOUP_API_KEY || '',
            'Content-Type': 'application/json',
          },
        },
      )

      if (!inmoupResponse.ok) {
        const errorData = await inmoupResponse.json().catch(() => ({}))
        throw new Error(`${inmoupResponse.status} - ${errorData.message || 'Error desconocido'}`)
      }

      const inmoupResult: any = await inmoupResponse.json()

      // Verificar si hay errores en la respuesta de Inmoup
      const responseData = inmoupResult.data || inmoupResult
      const errors = responseData.error || []
      const errores = responseData.errores || []
      const allErrors = [...errors, ...errores]

      if (allErrors.length > 0) {
        console.error(
          'Errores reportados por Inmoup en eliminación:',
          allErrors,
          'de la propiedad:',
          propertyId,
        )

        const errorMessages = allErrors.map((err: any) => {
          if (typeof err === 'string') return err
          return err.message || err.error || 'Error desconocido'
        })

        await restoreStateWithError(
          propertyId,
          initialInmoupState,
          `Error en la eliminación de Inmoup: ${errorMessages.join(', ')}`,
        )

        const updatedInmoupData = {
          name: 'Inmoup',
          uploaded: initialInmoupState.uploaded,
          externalId: initialInmoupState.externalId,
          externalUrl: initialInmoupState.externalUrl,
          status: initialInmoupState.status,
          lastSyncAt: new Date().toISOString(),
          lastError: `Error en la eliminación de Inmoup: ${errorMessages.join(', ')}`,
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Error en la eliminación de Inmoup',
            inmoupErrors: errorMessages,
            details: allErrors,
            updatedInmoupData,
          },
          { status: 400 },
        )
      }

      // Actualizar estado a no publicado (limpiar datos de portal)
      await updatePortalStatus(propertyId, 'ok', undefined, undefined, undefined)

      // Luego actualizar con el estado correcto
      await payload.update({
        collection: 'propiedades',
        id: propertyId,
        data: {
          inmoup: {
            uploaded: false,
            externalId: null,
            externalUrl: null,
            status: 'not_sent',
            lastSyncAt: new Date().toISOString(),
            lastError: null,
          },
        },
      })

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: false,
        externalId: null,
        externalUrl: null,
        status: 'not_sent' as const,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
      }

      return NextResponse.json({
        message: 'Propiedad eliminada exitosamente de Inmoup',
        success: true,
        inmoupResponse: inmoupResult,
        updatedInmoupData,
        deleted: true,
      })
    } catch (inmoupError: unknown) {
      console.error('Error llamando a Inmoup API para eliminación:', inmoupError)

      const errorMessage = inmoupError instanceof Error ? inmoupError.message : 'Error desconocido'
      await restoreStateWithError(
        propertyId,
        initialInmoupState,
        `Error al conectar con Inmoup API en eliminación: ${errorMessage}`,
      )

      const updatedInmoupData = {
        name: 'Inmoup',
        uploaded: initialInmoupState.uploaded,
        externalId: initialInmoupState.externalId,
        externalUrl: initialInmoupState.externalUrl,
        status: initialInmoupState.status,
        lastSyncAt: new Date().toISOString(),
        lastError: `Error al conectar con Inmoup API: ${errorMessage}`,
      }

      return NextResponse.json(
        {
          error: 'Error al conectar con Inmoup API en eliminación',
          details: errorMessage,
          updatedInmoupData,
        },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('Error en eliminación de Inmoup:', error)

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    if (propertyId) {
      // En el catch general, puede que no tengamos initialInmoupState,
      // pero debemos intentar preservar lo que podamos
      try {
        await restoreStateWithError(
          propertyId,
          initialInmoupState || { uploaded: true, status: 'ok' }, // fallback
          `Error interno en eliminación: ${errorMessage}`,
        )
      } catch {
        // Si falla, usar el método básico
        await updatePortalError(propertyId, `Error interno en eliminación: ${errorMessage}`)
      }
    }

    const updatedInmoupData = {
      name: 'Inmoup',
      uploaded: initialInmoupState?.uploaded || true,
      externalId: initialInmoupState?.externalId || null,
      externalUrl: initialInmoupState?.externalUrl || null,
      status: (initialInmoupState?.status as any) || 'ok',
      lastSyncAt: new Date().toISOString(),
      lastError: `Error en eliminación: ${errorMessage}`,
    }

    return NextResponse.json(
      {
        error: 'Error en eliminación',
        details: errorMessage,
        updatedInmoupData,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Inmoup - usar POST para publicar, PUT para sincronizar, DELETE para eliminar',
    endpoints: {
      POST: '/api/portals/inmoup - Publicar nueva propiedad',
      PUT: '/api/portals/inmoup - Sincronizar propiedad existente',
      DELETE: '/api/portals/inmoup - Eliminar propiedad del portal',
    },
    requiredFields: ['propertyData', 'ownerData (optional)', 'propertyId'],
    expectedFormat: {
      propertyData: 'Objeto FormData de Payload CMS (POST/PUT)',
      ownerData: 'Datos del propietario (opcional - POST/PUT)',
      propertyId: 'ID de la propiedad',
      action: 'Para PUT: "sync", Para DELETE: "delete"',
    },
    note: 'El mapeo a formato Inmoup se hace automáticamente en el servidor',
  })
}
