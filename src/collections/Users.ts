import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: ({ req: { user }, id }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === id
    },
    delete: ({ req: { user }, id }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === id
    },
    read: ({ req: { user }, id }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === id
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === id
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
    },
    {
      name: 'phone',
      type: 'number',
      label: 'Teléfono',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      access: {
        // Solo admins pueden ver/editar el campo role
        // O si el usuario no tiene role asignado (undefined)
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          return user.role === 'admin' || !doc?.role
        },
        update: ({ req: { user }, doc }) => {
          if (!user) return false
          return user.role === 'admin' || !doc?.role
        },
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
  timestamps: true,
}
