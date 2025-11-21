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
  admin: {
    hidden: ({ user }) => {
      return user?.role !== 'admin'
    },
    components: {
      views: {
        list: {
          Component: '@/views/MediaListView#default', // tu vista
        },
      },
    },
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
        width: 400,
        height: undefined, // Mantiene proporción
        withoutEnlargement: false, // Permitir agrandar
      },
      {
        name: 'watermark',
        width: 900,
        height: undefined, // Mantiene proporción
        withoutEnlargement: false, // Permitir agrandar
      },
    ],
    // ✅ Comprimir y redimensionar el original antes de guardarlo
    resizeOptions: {
      width: 850, // Tamaño máximo del "original"
      height: undefined, // Mantiene proporción
      fit: 'inside', // Mantener proporción
    },

    // formatOptions: {
    //   format: 'jpeg', // Convertir todo a JPEG
    //   options: {
    //     quality: 95, // Comprimir al 85%
    //   },
    // },
  },
}
