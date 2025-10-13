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
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 250,
      },
      {
        name: 'watermark',
        width: 768,
      },
      {
        name: 'og',
        width: 900,
      },
    ],
  },
}
