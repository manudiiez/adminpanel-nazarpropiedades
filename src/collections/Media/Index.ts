// src/collections/Media.ts

import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'
import { afterChangeHook } from './hooks/afterChangeHook'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: authenticated,
    delete: authenticated,
    update: authenticated,
  },
  hooks: {
    afterChange: [afterChangeHook],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    disableLocalStorage: true, // ✅ Deshabilitar almacenamiento local del original
    focalPoint: true,
    mimeTypes: ['image/*'],

    imageSizes: [
      {
        name: 'thumbnail',
        width: 250,
        height: undefined, // Mantiene proporción
        withoutEnlargement: false, // Permitir agrandar
      },
      {
        name: 'watermark',
        width: 768,
        height: undefined, // Mantiene proporción
        withoutEnlargement: false, // Permitir agrandar
      },
      {
        name: 'og',
        width: 1200,
        height: undefined, // Mantiene proporción
        withoutEnlargement: false, // Permitir agrandar
      },
    ],
    // ✅ Comprimir y redimensionar el original antes de guardarlo
    resizeOptions: {
      width: 1200, // Tamaño máximo del "original"
      height: undefined, // Mantiene proporción
      fit: 'inside', // Mantener proporción
    },

    formatOptions: {
      format: 'jpeg', // Convertir todo a JPEG
      options: {
        quality: 85, // Comprimir al 85%
      },
    },
  },
}
