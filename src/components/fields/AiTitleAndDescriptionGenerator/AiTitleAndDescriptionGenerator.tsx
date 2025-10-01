'use client'

import React, { useState } from 'react'
import { useAllFormFields, useField } from '@payloadcms/ui'
import './styles.scss'

const AIContentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Leer TODO el formulario usando useAllFormFields como en AITest
  const [fields] = useAllFormFields()

  // Usar useField para escribir directamente en los campos de aiContent
  const { setValue: setAITitle } = useField<string>({ path: 'aiContent.title' })
  const { setValue: setAIDescription } = useField<string>({ path: 'aiContent.description' })

  // Función para obtener los campos requeridos
  const getRequiredFields = () => {
    const required = []

    if (!fields?.['classification.type']?.value) required.push('Tipo de propiedad')
    if (!fields?.['classification.condition']?.value) required.push('Condición (Venta/Alquiler)')
    if (!fields?.['caracteristics.price']?.value) required.push('Precio')
    if (!fields?.['caracteristics.totalArea']?.value) required.push('Área total')

    return required
  }

  // Verificar si todos los campos obligatorios están completos
  const requiredFields = getRequiredFields()
  const canGenerate = requiredFields.length === 0

  const handleGenerateContent = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir comportamiento por defecto del formulario
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!canGenerate) return

    setIsGenerating(true)
    setError(null)

    try {
      // Obtener el token _verificationToken específico de Payload CMS
      let token = null

      const cookies = document.cookie.split('; ')
      console.log('Todas las cookies:', cookies)

      // Buscar específicamente _verificationToken y otros nombres posibles
      const possibleTokenNames = [
        '_verificationToken',
        'payload-token',
        'payload',
        'token',
        'jwt',
        'auth-token',
        'payload_jwt',
        'payload-jwt',
      ]

      for (const cookieName of possibleTokenNames) {
        const cookieValue = cookies.find((row) => row.startsWith(`${cookieName}=`))?.split('=')[1]
        if (cookieValue) {
          token = cookieValue
          console.log(`Token encontrado en cookie '${cookieName}':`, token)
          break
        }
      }

      // Si no hay token en cookies, intentar desde localStorage
      if (!token) {
        console.log('No se encontró token en cookies, intentando localStorage...')

        for (const storageKey of possibleTokenNames) {
          try {
            const storageValue = localStorage.getItem(storageKey)
            if (storageValue) {
              token = storageValue
              console.log(`Token encontrado en localStorage '${storageKey}':`, token)
              break
            }
          } catch (e) {
            console.log('localStorage no disponible')
          }
        }
      }

      // Si no hay token en localStorage, intentar desde sessionStorage
      if (!token) {
        console.log('No se encontró token en localStorage, intentando sessionStorage...')

        for (const storageKey of possibleTokenNames) {
          try {
            const storageValue = sessionStorage.getItem(storageKey)
            if (storageValue) {
              token = storageValue
              console.log(`Token encontrado en sessionStorage '${storageKey}':`, token)
              break
            }
          } catch (e) {
            console.log('sessionStorage no disponible')
          }
        }
      }

      if (!token) {
        console.log('No se encontró token en ningún lado, continuando sin token...')
      } else {
        console.log('Token final a usar:', token)
      }

      // Preparar los datos para enviar a la API
      const propertyData = {
        type: fields?.['classification.type']?.value,
        condition: fields?.['classification.condition']?.value,
        location: {
          province: fields?.['ubication.province']?.value,
          department: fields?.['ubication.department']?.value,
          locality: fields?.['ubication.locality']?.value,
          neighborhood: fields?.['ubication.neighborhood']?.value,
        },
        characteristics: {
          price: fields?.['caracteristics.price']?.value,
          currency: fields?.['caracteristics.currency']?.value,
          expenses: fields?.['caracteristics.expenses']?.value,
          expensesCurrency: fields?.['caracteristics.expensesCurrency']?.value,
          coveredArea: fields?.['caracteristics.coveredArea']?.value,
          totalArea: fields?.['caracteristics.totalArea']?.value,
          antiquity: fields?.['caracteristics.antiquity']?.value,
          orientation: fields?.['caracteristics.orientation']?.value,
        },
        environments: {
          bedrooms: fields?.['environments.bedrooms']?.value,
          bathrooms: fields?.['environments.bathrooms']?.value,
          garages: fields?.['environments.garages']?.value,
          garageType: fields?.['environments.garageType']?.value,
          furnished: fields?.['environments.funished']?.value,
        },
        amenities: {
          servicios: fields?.['amenities.servicios']?.value || [],
          ambientes: fields?.['amenities.ambientes']?.value || [],
          zonasCercanas: fields?.['amenities.zonasCercanas']?.value || [],
        },
      }

      // Preparar headers para la petición
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Solo agregar Authorization si tenemos token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Llamar a tu API
      const response = await fetch('/api/ai/generate-title-description', {
        method: 'POST',
        headers,
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Error de la API: ${response.status} - ${errorData.error || 'Error desconocido'}`,
        )
      }

      const result = await response.json()

      // Actualizar los campos usando useField (como en AITest)
      if (result.title) {
        setAITitle(result.title)
      }

      if (result.description) {
        setAIDescription(result.description)
      }

      // Mostrar mensaje de éxito
      console.log('✅ Contenido generado exitosamente:', {
        title: result.title,
        description: result.description,
      })
    } catch (err) {
      console.error('Error generando contenido:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="aiGeneratorContainer">
      {!canGenerate && (
        <div className="warningContainer">
          <p className="warningTitle">⚠️ Faltan campos obligatorios:</p>
          <ul className="warningList">
            {requiredFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="errorContainer">❌ Error: {error}</div>}

      <button
        type="button"
        onClick={handleGenerateContent}
        onMouseDown={(e) => e.preventDefault()} // Prevenir cualquier comportamiento no deseado
        onFocus={(e) => e.preventDefault()} // Prevenir focus
        disabled={!canGenerate || isGenerating}
        className={`generateButton ${isGenerating ? 'generating' : ''}`}
        // Prevenir que el botón interfiera con otros elementos del formulario
        tabIndex={-1}
      >
        {isGenerating ? (
          <>
            <span className="buttonIcon">⏳</span>
            Generando contenido...
          </>
        ) : (
          <>Generar Título y Descripción</>
        )}
      </button>

      {((fields?.['aiContent.title']?.value as string) ||
        (fields?.['aiContent.description']?.value as string)) && (
        <div className="tipContainer">
          <p className="tipText">
            💡 Tip: Una vez generado el contenido, puedes editarlo manualmente en los campos de
            abajo.
          </p>
        </div>
      )}
    </div>
  )
}

export default AIContentGenerator
