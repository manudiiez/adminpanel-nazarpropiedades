'use client'

import React, { useEffect } from 'react'
import { useAllFormFields, useField } from '@payloadcms/ui'

const PropertyAutoFill: React.FC = () => {
  // Leer todos los campos del formulario
  const [fields] = useAllFormFields()

  // Usar useField para escribir en los campos
  const { setValue: setOwner } = useField<string>({ path: 'owner' })
  const { setValue: setListingPrice } = useField<number>({ path: 'listingPrice' })
  const { setValue: setListingCurrency } = useField<string>({ path: 'currency' })

  // Campo oculto para el título
  const { setValue: setPropertyTitle } = useField<string>({ path: 'propertyTitle' })

  // Campo oculto para la fecha de publicación
  const { setValue: setPropertyPublishedDate } = useField<string>({ path: 'propertyPublishedDate' })

  // Obtener valores actuales
  const propertyId = fields?.['property']?.value
  const currentOwnerId = fields?.['owner']?.value
  const currentListingPrice = fields?.['listingPrice']?.value
  const currentListingCurrency = fields?.['currency']?.value
  const currentPropertyTitle = fields?.['propertyTitle']?.value
  const currentPropertyPublishedDate = fields?.['propertyPublishedDate']?.value

  useEffect(() => {
    const autoFillFields = async () => {
      // Solo si hay propiedad seleccionada y no se han completado los campos ocultos
      if (propertyId && !currentPropertyTitle) {
        try {
          // Buscar la propiedad para obtener su información
          const response = await fetch(`/api/propiedades/${propertyId}`)
          if (response.ok) {
            const property = await response.json()
            console.log('Propiedad obtenida:', property)

            // Autocompletar owner si no hay uno seleccionado
            if (property?.owner && !currentOwnerId) {
              setOwner(property.owner.id)
              console.log('Owner autocompletado:', property.owner)
            }

            // Autocompletar listingPrice si no hay uno y la propiedad tiene price
            if (property?.caracteristics?.price && !currentListingPrice) {
              setListingPrice(property.caracteristics.price)
              console.log('Precio autocompletado:', property.caracteristics.price)
            }

            // Autocompletar currency si no hay una y la propiedad tiene currency
            if (property?.caracteristics?.currency && !currentListingCurrency) {
              setListingCurrency(property.caracteristics.currency)
              console.log('Moneda autocompletada:', property.caracteristics.currency)
            }

            // Autocompletar título de la propiedad
            if (property?.title || property?.displayTitle) {
              const propertyTitle = property.title || property.displayTitle
              setPropertyTitle(propertyTitle)
              console.log('Título de propiedad autocompletado:', propertyTitle)
            }

            // Autocompletar fecha de publicación de la propiedad
            if (property?.createdAt && !currentPropertyPublishedDate) {
              setPropertyPublishedDate(property.createdAt)
              console.log('Fecha de publicación autocompletada:', property.createdAt)
            }
          }
        } catch (error) {
          console.log('Error obteniendo datos de la propiedad:', error)
        }
      }
    }

    autoFillFields()
  }, [
    propertyId,
    currentOwnerId,
    currentListingPrice,
    currentListingCurrency,
    currentPropertyTitle,
    currentPropertyPublishedDate,
    setOwner,
    setListingPrice,
    setListingCurrency,
    setPropertyTitle,
    setPropertyPublishedDate,
  ])

  // Este componente no renderiza nada visible
  return null
}

export default PropertyAutoFill
