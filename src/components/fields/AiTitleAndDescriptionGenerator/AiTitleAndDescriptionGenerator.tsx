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

    // Campos básicos obligatorios
    if (!fields?.['classification.type']?.value) required.push('Tipo de propiedad')
    if (!fields?.['classification.condition']?.value) required.push('Condición (Venta/Alquiler)')
    if (!fields?.['caracteristics.price']?.value) required.push('Precio')

    // Ubicación básica
    if (!fields?.['ubication.department']?.value) required.push('Departamento')
    if (!fields?.['ubication.address']?.value) required.push('Dirección')

    // Área total es importante para la descripción
    if (!fields?.['caracteristics.totalArea']?.value) {
      // Solo requerir área total si no es un tipo que no la necesite
      const propertyType = fields?.['classification.type']?.value
      if (propertyType !== 'negocio') {
        required.push('Área total')
      }
    }

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
      // Preparar los datos para enviar a la API
      const propertyData = {
        // Clasificación
        tipo: fields?.['classification.type']?.value,
        condicion: fields?.['classification.condition']?.value,
        // Ubicación
        provincia: fields?.['ubication.province']?.value,
        departamento: fields?.['ubication.department']?.value,
        localidad: fields?.['ubication.locality']?.value,
        barrio: fields?.['ubication.neighborhood']?.value,
        direccion: fields?.['ubication.address']?.value,
        // Características
        precio: fields?.['caracteristics.price']?.value,
        moneda: fields?.['caracteristics.currency']?.value,
        tieneExpensas: fields?.['caracteristics.hasExpenses']?.value,
        expensas: fields?.['caracteristics.expenses']?.value,
        expensasMoneda: fields?.['caracteristics.expensesCurrency']?.value,
        areaCubierta: fields?.['caracteristics.coveredArea']?.value,
        areaTotal: fields?.['caracteristics.totalArea']?.value,
        metroFrente: fields?.['caracteristics.frontMeters']?.value,
        metrosProfundidad: fields?.['caracteristics.deepMeters']?.value,
        antiguedad: fields?.['caracteristics.antiquity']?.value,
        estadoConservacion: fields?.['caracteristics.conservationStatus']?.value,
        orientacion: fields?.['caracteristics.orientation']?.value,
        // Ambientes
        cantHabitaciones: fields?.['environments.bedrooms']?.value,
        cantBaños: fields?.['environments.bathrooms']?.value,
        tipoGaraje: fields?.['environments.garageType']?.value,
        cantAutos: fields?.['environments.garages']?.value,
        cantPlantas: fields?.['environments.plantas']?.value,
        cantAmbientes: fields?.['environments.ambientes']?.value,
        amueblado: fields?.['environments.funished']?.value,
        // Amenities y servicios
        mascotas: fields?.['amenities.mascotas']?.value,
        barrioPrivado: fields?.['amenities.barrioPrivado']?.value,
        agua: fields?.['amenities.agua']?.value,
        cloacas: fields?.['amenities.cloacas']?.value,
        gas: fields?.['amenities.gas']?.value,
        luz: fields?.['amenities.luz']?.value,
        estrellas: fields?.['amenities.estrellas']?.value,
        servicios: fields?.['amenities.servicios']?.value || [],
        ambientes: fields?.['amenities.ambientes']?.value || [],
        zonasCercanas: fields?.['amenities.zonasCercanas']?.value || [],
        // Contenido existente (si hay)
        titulo: fields?.['aiContent.title']?.value,
        descripcion: fields?.['aiContent.description']?.value,
      }

      // Llamar a la API (el token se maneja automáticamente desde las cookies)
      const response = await fetch('/api/ai/generate-title-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
