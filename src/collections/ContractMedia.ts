import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'

export const ContractMedia: CollectionConfig = {
  slug: 'contractmedia',
  admin: {
    hidden: ({ user }) => {
      return user?.role !== 'admin'
    },
  },
  access: {
    read: authenticated,
    create: authenticated,
    delete: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'description',
      type: 'text',
      label: 'Descripción',
      // required: true,
    },
  ],
}
