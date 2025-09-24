import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'
import { beforeValidateClient } from './hooks/beforeValidateClient'

export const Clientes: CollectionConfig = {
  slug: 'clientes',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'fullname',
    defaultColumns: ['fullname', 'phone'],
    components: {
      // views: {
      //   edit: {
      //     detalles: {
      //       Component: '@/views/ClientDetailsView#default', // tu vista
      //       path: '/detalles', // ruta dentro del doc
      //       tab: {
      //         label: 'Detalles', // texto del tab
      //         href: '/detalles', // ruta dentro del doc
      //         order: 100,
      //       },
      //     },
      //   },
      // },
    },
  },
  fields: [
    { name: 'firstname', label: 'Nombre', type: 'text', required: true },
    { name: 'lastname', label: 'Apellido', type: 'text', required: true },
    { name: 'phone', label: 'Teléfono', type: 'text', required: true, unique: true, index: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'dni', label: 'DNI', type: 'text', unique: true, index: true },
    { name: 'notes', label: 'Notas', type: 'textarea' },
    {
      name: 'fullname',
      label: 'Nombre completo',
      type: 'text',
      admin: { readOnly: true },
      index: true,
    },
  ],
  timestamps: true,

  hooks: {
    beforeValidate: [beforeValidateClient],
  },
}
