// src/globals/Featured.ts
import { GlobalConfig } from 'payload/types'

export const Featured: GlobalConfig = {
  slug: 'featured',
  label: 'Propiedades Destacadas (Inicio)',
  access: {
    read: () => true, // Permitir que el frontend lo lea
  },
  fields: [
    {
      name: 'featuredProperties',
      label: 'Selección de Destacadas',
      type: 'relationship',
      relationTo: 'propiedades', // El slug de tu colección de propiedades
      hasMany: true, // Es una selección múltiple

      // --- Acá está el control que pediste ---
      maxRows: 6,

      admin: {
        description:
          'Seleccioná y ordená las 6 propiedades que aparecen en la página de inicio. Arrastrá para cambiar el orden.',
      },
    },
  ],
}
