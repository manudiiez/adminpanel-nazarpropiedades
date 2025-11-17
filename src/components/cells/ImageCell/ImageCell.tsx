'use client' // ¡Fundamental en Payload v3!

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { DefaultCellComponentProps } from 'payload'
import './styles.scss'

interface ImageData {
  id: string
  url?: string
  alt?: string
  filename?: string
  sizes?: {
    thumbnail?: {
      url?: string
      width?: number
      height?: number
    }
  }
}

interface PropertyData {
  id: string
  images?: {
    coverImage?: ImageData | string
    gallery?: Array<ImageData | string>
    imagenesExtra?: Array<{ url: string }>
  }
}

// Función helper para obtener datos de imagen dinámicamente
async function fetchImageData(imageId: string): Promise<ImageData | null> {
  try {
    const response = await fetch(`/api/media/${imageId}`)
    if (!response.ok) {
      throw new Error(`Error al cargar imagen: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error fetching image:', err)
    return null
  }
}

export default function ImageCell(props: DefaultCellComponentProps) {
  const { rowData, collectionSlug } = props
  const propertyData = rowData as PropertyData

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [alt, setAlt] = useState('Imagen de portada')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true)

      // Obtener los datos de la propiedad
      const coverImage = propertyData?.images?.coverImage
      const galleryImage = propertyData?.images?.gallery?.[0]
      const imagenesExtra = propertyData?.images?.imagenesExtra

      let fetchedImageUrl: string | null = null
      let fetchedAlt = 'Imagen de portada'

      // Prioridad 1: coverImage
      if (coverImage) {
        if (typeof coverImage === 'string') {
          // Es un ID, hacer fetch
          const imageData = await fetchImageData(coverImage)
          if (imageData) {
            fetchedImageUrl = imageData?.sizes?.thumbnail?.url || imageData?.url || null
            fetchedAlt = imageData?.alt || imageData?.filename || 'Imagen de portada'
          }
        } else if (typeof coverImage === 'object') {
          // Ya es un objeto completo
          const coverImageData = coverImage as ImageData
          fetchedImageUrl = coverImageData?.sizes?.thumbnail?.url || coverImageData?.url || null
          fetchedAlt = coverImageData?.alt || coverImageData?.filename || 'Imagen de portada'
        }
      }

      // Prioridad 2: gallery
      if (!fetchedImageUrl && galleryImage) {
        if (typeof galleryImage === 'string') {
          // Es un ID, hacer fetch
          const imageData = await fetchImageData(galleryImage)
          if (imageData) {
            fetchedImageUrl = imageData?.sizes?.thumbnail?.url || imageData?.url || null
            fetchedAlt = imageData?.alt || imageData?.filename || 'Imagen de galería'
          }
        } else if (typeof galleryImage === 'object') {
          // Ya es un objeto completo
          const galleryImageData = galleryImage as ImageData
          fetchedImageUrl =
            galleryImageData?.sizes?.thumbnail?.url || galleryImageData?.url || null
          fetchedAlt = galleryImageData?.alt || galleryImageData?.filename || 'Imagen de galería'
        }
      }

      // Prioridad 3: imagenesExtra (URLs externas)
      if (
        !fetchedImageUrl &&
        imagenesExtra &&
        Array.isArray(imagenesExtra) &&
        imagenesExtra.length > 0
      ) {
        fetchedImageUrl = imagenesExtra[0]?.url || null
        fetchedAlt = 'Imagen extra'
      }

      setImageUrl(fetchedImageUrl)
      setAlt(fetchedAlt)
      setLoading(false)
    }

    loadImage()
  }, [propertyData?.id])

  // Construir el link a la propiedad
  const href = `/admin/collections/${collectionSlug}/${propertyData.id}`

  return (
    <Link href={href} className="cell-portada__link">
      <div className="cell-portada">
        <div className="cell-portada__image-wrapper">
          {loading ? (
            <span className="cell-portada__text">Cargando...</span>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              width={180}
              height={150}
              className="cell-portada__img"
              unoptimized
            />
          ) : (
            // Placeholder si no hay imagen
            <div className="cell-portada__error-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5-4 4-3-3-4 4" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
