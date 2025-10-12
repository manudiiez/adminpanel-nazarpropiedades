import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'

export const MercadoLibreTokens: CollectionConfig = {
  slug: 'mercadolibre-tokens',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'accountName',
    defaultColumns: ['accountName', 'isActive', 'expiresAt', 'createdAt'],
    description: 'Gestión de tokens de acceso para MercadoLibre OAuth2',
    hidden: ({ user }) => {
      return user?.role !== 'admin'
    },
  },
  fields: [
    {
      name: 'accountName',
      type: 'text',
      label: 'Nombre de la Cuenta',
      required: true,
      admin: {
        description: 'Nombre identificativo para esta cuenta de MercadoLibre',
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access Token',
      required: true,
      admin: {
        description: 'Token de acceso actual (expira en 6 horas)',
        readOnly: false,
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      label: 'Refresh Token',
      required: true,
      admin: {
        description: 'Token para renovar el access token (uso único)',
        readOnly: false,
      },
    },
    {
      name: 'tokenType',
      type: 'text',
      label: 'Tipo de Token',
      defaultValue: 'Bearer',
      admin: {
        description: 'Tipo de token (normalmente Bearer)',
      },
    },
    {
      name: 'expiresIn',
      type: 'number',
      label: 'Expira en (segundos)',
      defaultValue: 21600, // 6 horas
      admin: {
        description: 'Tiempo de vida del token en segundos (6 horas = 21600)',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Fecha de Expiración',
      admin: {
        description: 'Fecha y hora exacta cuando expira el token',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'scope',
      type: 'text',
      label: 'Scope',
      admin: {
        description: 'Permisos otorgados por el token',
      },
    },
    {
      name: 'userId',
      type: 'text',
      label: 'ID de Usuario ML',
      admin: {
        description: 'ID del usuario en MercadoLibre',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Token Activo',
      defaultValue: true,
      admin: {
        description: 'Indica si este token está activo y debe usarse',
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      label: 'Último Uso',
      admin: {
        description: 'Última vez que se utilizó este token',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'errorCount',
      type: 'number',
      label: 'Contador de Errores',
      defaultValue: 0,
      admin: {
        description: 'Número de errores consecutivos con este token',
      },
    },
    {
      name: 'lastError',
      type: 'textarea',
      label: 'Último Error',
      admin: {
        description: 'Detalles del último error ocurrido',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notas',
      admin: {
        description: 'Notas adicionales sobre esta cuenta',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Calcular la fecha de expiración basada en expiresIn
        if (data.expiresIn && !data.expiresAt) {
          const now = new Date()
          const expiresAt = new Date(now.getTime() + data.expiresIn * 1000)
          data.expiresAt = expiresAt
        }
        return data
      },
    ],
  },
  timestamps: true,
}
