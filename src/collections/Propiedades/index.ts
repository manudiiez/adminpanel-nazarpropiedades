import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'
import { propertySelectOptions, getLocalitiesByDepartment } from '@/data/propertyOptions'
import {
  validateHasExpenses,
  validateCoveredArea,
  validateTotalArea,
  validateAntiquity,
  validateConservationStatus,
  validateBedrooms,
  validateBathrooms,
  validateGarageType,
  validateMascotas,
} from '@/utils/validateFields'

type ExtendedOption = {
  label: string
  value: string
  type?: string[] // <- tus metadatos
  condition?: string[] // <- tus metadatos
}

export const Propiedades: CollectionConfig = {
  slug: 'propiedades',
  // versions: { drafts: true }, // Eliminamos versiones/drafts
  labels: {
    singular: 'Inmueble',
    plural: 'Propiedades',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['images.coverImage', 'title', 'ubication.address', 'status', 'owner'],
    // Configuración de campos de búsqueda global
    listSearchableFields: [
      'title',
      'aiContent.title',
      'aiContent.description',
      'ubication.department',
      'ubication.locality',
      'ubication.neighborhood',
      'ubication.address',
      'classification.type',
    ],
    components: {
      views: {
        edit: {
          detalles: {
            Component: '@/views/PropertyDetailsView#default', // tu vista
            path: '/detalles', // ruta dentro del doc
            tab: {
              label: 'Detalles', // texto del tab
              href: '/detalles', // ruta dentro del doc
              order: 100,
            },
          },
        },
      },
    },
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Sincronizar aiContent.title con title solo al momento de enviar/guardar
        if (data?.aiContent?.title) {
          data.title = data.aiContent.title
        }
        return data
      },
      ({ data, originalDoc, operation }) => {
        // Solo para actualizaciones (no creaciones)
        if (operation === 'update' && originalDoc) {
          // Campos a ignorar para no marcar como desactualizado
          const fieldsToIgnore = [
            'inmoup.lastSyncAt',
            'inmoup.lastError',
            'inmoup.status',
            'inmoup.uploaded',
            'inmoup.externalId',
            'inmoup.externalUrl',
            'mercadolibre.lastSyncAt',
            'mercadolibre.lastError',
            'mercadolibre.status',
            'mercadolibre.uploaded',
            'mercadolibre.externalId',
            'mercadolibre.externalUrl',
            'notes',
            'updatedAt',
            'createdAt',
            'status', // Agregar status a los campos a ignorar para cambios automáticos
          ]

          // Verificar si hay cambios significativos comparando data vs originalDoc
          const hasSignificantChanges = Object.keys(data).some((key) => {
            if (fieldsToIgnore.some((field) => field.startsWith(key))) {
              return false
            }

            // Comparación profunda simplificada para detectar cambios
            return JSON.stringify(data[key]) !== JSON.stringify(originalDoc[key])
          })

          if (hasSignificantChanges) {
            console.log('Cambios significativos detectados, marcando como desactualizado...')
            // Verificar si Inmoup está publicado (status: 'ok') y marcarlo como desactualizado
            if (originalDoc.inmoup?.status === 'ok') {
              if (!data.inmoup) {
                data.inmoup = { ...originalDoc.inmoup }
              }
              data.inmoup.status = 'desactualizado'
              data.inmoup.lastSyncAt = new Date().toISOString()
            }

            // Verificar si MercadoLibre está publicado (status: 'ok') y marcarlo como desactualizado
            if (originalDoc.mercadolibre?.status === 'ok') {
              if (!data.mercadolibre) {
                data.mercadolibre = { ...originalDoc.mercadolibre }
              }
              data.mercadolibre.status = 'desactualizado'
              data.mercadolibre.lastSyncAt = new Date().toISOString()
            }
          }
        }

        return data
      },
    ],
  },
  fields: [
    // Campo título oculto para useAsTitle (se sincroniza con aiContent.title)
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      admin: {
        hidden: true,
      },
      // Eliminamos el hook beforeChange problemático
      // La sincronización la haremos desde el componente AIContentGenerator
    },
    // Campo de estado de la propiedad
    {
      name: 'status',
      type: 'select',
      label: 'Estado de la Propiedad',
      defaultValue: 'activa',
      required: true,
      options: [
        { label: 'Borrador', value: 'borrador' },
        { label: 'Activa', value: 'activa' },
        { label: 'Reservada', value: 'reservada' },
        { label: 'Vendido / Alquilado', value: 'terminada' },
      ],
      admin: {
        description:
          'Estado actual de la propiedad. "Terminada" se establece automáticamente al crear un contrato.',
      },
      index: true, // Para filtros en listado
    },
    {
      name: 'classification',
      label: 'Tipo y operación',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              label: 'Tipo de propiedad',
              type: 'select',
              options: propertySelectOptions.type,
              admin: {
                placeholder: 'Selecciona el tipo de propiedad',
              },
              required: true,
              index: true, // Hace que aparezca automáticamente en los filtros
            },
            {
              name: 'condition',
              label: 'Condición',
              type: 'select',
              options: propertySelectOptions.condition,
              admin: {
                placeholder: 'Selecciona la condición de la propiedad',
              },
              required: true,
              index: true, // Hace que aparezca automáticamente en los filtros
            },
          ],
        },
      ],
    },
    {
      name: 'ubication',
      label: 'Ubicación de la propiedad',
      type: 'group',
      fields: [
        // 2) Provincia (primero y fijo)
        {
          type: 'row',
          fields: [
            {
              name: 'province',
              type: 'text',
              label: 'Provincia',
              defaultValue: 'Mendoza',
              admin: {
                readOnly: true,
                width: '50%',
                description: 'Provincia fija: Mendoza',
              },
            },

            // 3) Departamento
            {
              name: 'department',
              type: 'select',
              label: 'Departamento',
              required: true,
              options: propertySelectOptions.department,
              admin: {
                placeholder: 'Selecciona el departamento de Mendoza',
                width: '50%',
              },
              index: true, // Hace que aparezca automáticamente en los filtros
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'locality',
              type: 'select',
              label: 'Localidad / Zona',
              options: propertySelectOptions.locality,
              filterOptions: ({ options, data }) => {
                const dep = data?.ubication.department
                if (!dep) return options
                return getLocalitiesByDepartment(dep)
              },
              admin: {
                description: 'Selecciona la localidad según el departamento elegido',
                width: '50%',
                placeholder: 'Selecciona el departamento primero',
                components: {
                  Field: '@/components/fields/LocalitySelect/LocalitySelect',
                },
              },
              index: true, // Hace que aparezca automáticamente en los filtros
            },

            // 5) Barrio/Complejo
            {
              name: 'neighborhood',
              type: 'text',
              label: 'Barrio / Edificio / Complejo / Calle',
              admin: {
                description: 'Nombre específico del barrio, edificio o complejo',
                placeholder: 'ej: Barrio Palmares o Edificio Gutierrez, etc.',
                width: '50%',
              },
            },
          ],
        },
        // 4) Localidad/Zona (filtra por departamento)
        {
          name: 'address',
          label: 'Domicilio',
          type: 'text',
          required: true,
          admin: {
            description: 'Dirección completa de la propiedad',
            placeholder: 'ej: Calle Falsa, Godoy Cruz, Mendoza',
          },
        },
        // 6) Mapa interactivo de Google Maps personalizado
        {
          name: 'mapLocation',
          type: 'json',
          label: 'Ubicación en el Mapa',
          admin: {
            components: {
              Field: '@/components/fields/GoogleMapField/GoogleMapField',
            },
            description:
              'Busca la dirección específica en el mapa o haz clic para marcar la ubicación exacta.',
          },
        },

        // 7) Configuración de privacidad de ubicación
        {
          name: 'locationPrivacy',
          type: 'radio',
          label: 'Mostrar ubicación en el sitio web',
          options: propertySelectOptions.locationPrivacy,
          defaultValue: 'exact',
          admin: {
            description: 'Controla qué tan precisa será la ubicación mostrada en el sitio web',
            layout: 'horizontal',
          },
        },

        // 8) Radio de aproximación (solo si es aproximada)
        {
          name: 'approximateRadius',
          type: 'number',
          label: 'Radio de aproximación (metros)',
          min: 100,
          max: 1500,
          defaultValue: 300,
          admin: {
            description: 'Distancia en metros para el área aproximada de la ubicación',
            step: 100,
            condition: (data, siblingData) => {
              return siblingData?.locationPrivacy === 'approximate'
            },
          },
        },
      ],
    },
    {
      name: 'caracteristics',
      type: 'group',
      label: 'Características de la propiedad',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              type: 'number',
              label: 'Precio',
              admin: {
                description: 'Precio de la propiedad',
                placeholder: 'Ingresa el valor del precio',
                width: '50%',
              },
              required: true,
              index: true, // Hace que aparezca automáticamente en los filtros
            },
            {
              name: 'currency',
              type: 'select',
              label: 'Moneda',
              options: propertySelectOptions.currency,
              defaultValue: 'usd',
              required: true,
              admin: {
                placeholder: 'Selecciona la moneda del precio',
                width: '50%',
              },
              index: true, // Hace que aparezca automáticamente en los filtros
            },
            {
              name: 'hasExpenses',
              type: 'radio',
              label: '¿Tiene expensas?',
              options: ['Si', 'No'],
              admin: {
                width: '100%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'bodega' &&
                    data?.classification.type !== 'cabaña' &&
                    data?.classification.type !== 'chalet' &&
                    data?.classification.type !== 'deposito' &&
                    data?.classification.type !== 'estacion_de_servicio' &&
                    data?.classification.type !== 'edificio' &&
                    data?.classification.type !== 'fábrica' &&
                    data?.classification.type !== 'finca' &&
                    data?.classification.type !== 'hotel' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'playa_de_estacionamiento' &&
                    data?.classification.type !== 'vinedo'
                  )
                },
              },
              validate: validateHasExpenses,
            },
            {
              name: 'expenses',
              type: 'number',
              label: 'Valor de Expensas',
              required: true,
              admin: {
                placeholder: 'Ingresa el valor de las expensas',
                width: '50%',
                condition: (data, siblingData) => {
                  return siblingData.hasExpenses === 'Si'
                },
              },
            },
            {
              name: 'expensesCurrency',
              type: 'select',
              label: 'Moneda de expensas',
              options: propertySelectOptions.expensesCurrency,
              required: true,
              admin: {
                placeholder: 'Selecciona la moneda de las expensas',
                width: '50%',
                condition: (data, siblingData) => {
                  return siblingData.hasExpenses === 'Si'
                },
              },
            },
            {
              type: 'group',
              label: 'Tasación',
              admin: {
                description: 'Este campo es de uso interno y no se mostrará en el sitio web',
                width: '100%',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'appraisal',
                      type: 'number',
                      label: 'Valor de la Tasación',
                      admin: {
                        placeholder: 'Ingresa el valor de la tasación',
                        width: '50%',
                      },
                    },
                    {
                      name: 'appraisalCurrency',
                      type: 'select',
                      label: 'Moneda de tasación',
                      options: propertySelectOptions.appraisalCurrency,
                      admin: {
                        placeholder: 'Selecciona la moneda de la tasación',
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'coveredArea',
              type: 'number',
              label: 'Área cubierta en m²',
              admin: {
                placeholder: 'Selecciona el área cubierta',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'lote' &&
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'terreno'
                  )
                },
              },
              validate: validateCoveredArea,
            },
            {
              name: 'totalArea',
              type: 'number',
              label: 'Área total en m²',
              admin: {
                placeholder: 'Selecciona el área total',
                width: '50%',
                condition: (data, siblingData) => {
                  return data?.classification.type !== 'negocio'
                },
              },
              validate: validateTotalArea,
            },
            {
              name: 'frontMeters',
              type: 'number',
              label: 'Metros de frente',
              admin: {
                placeholder: 'Ingresa los metros de frente',
                width: '50%',
                condition: (data, siblingData) => {
                  return data?.classification.type !== 'negocio'
                },
              },
            },
            {
              name: 'deepMeters',
              type: 'number',
              label: 'Metros de largo/fondo',
              admin: {
                placeholder: 'Ingresa los metros de largo/fondo',
                width: '50%',
                condition: (data, siblingData) => {
                  return data?.classification.type !== 'negocio'
                },
              },
            },
            {
              name: 'antiquity',
              type: 'select',
              label: 'Antigüedad',
              options: propertySelectOptions.antiquity,
              admin: {
                placeholder: 'Selecciona la antigüedad',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'terreno' &&
                    data?.classification.type !== 'lote'
                  )
                },
              },
              validate: validateAntiquity,
            },
            {
              name: 'conservationStatus',
              type: 'select',
              label: 'Estado de Conservación',
              options: propertySelectOptions.conservationStatus,
              admin: {
                placeholder: 'Selecciona el estado',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'lote' &&
                    data?.classification.type !== 'loteo' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'terreno'
                  )
                },
              },
              validate: validateConservationStatus,
            },
            {
              name: 'orientation',
              type: 'select',
              label: 'Orientación',
              options: propertySelectOptions.orientation,
              admin: {
                placeholder: 'Selecciona la orientación',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'playa_de_estacionamiento'
                  )
                },
              },
            },
            {
              name: 'guests',
              label: 'Cantidad de Huéspedes',
              type: 'number',
              required: true,
              admin: {
                placeholder: 'Ingresa la cantidad máxima de huéspedes',
                description: 'Este campo solo sera visible para mercado libre',
                width: '50%',
                condition: (data, siblingData) => {
                  return data?.classification.condition === 'alquiler_temporario'
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'environments',
      type: 'group',
      label: 'Ambientes',
      admin: {
        condition: (data, siblingData) => {
          return (
            data?.classification.type !== 'lote' &&
            data?.classification.type !== 'fraccionamiento' &&
            data?.classification.type !== 'terreno'
          )
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'bedrooms',
              label: 'Habitaciones',
              type: 'number',
              admin: {
                placeholder: 'Cantidad de habitaciones',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'deposito' &&
                    data?.classification.type !== 'fondo_de_comercio' &&
                    data?.classification.type !== 'galpon' &&
                    data?.classification.type !== 'industria' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'oficina' &&
                    data?.classification.type !== 'playa_de_estacionamiento'
                  )
                },
              },
              validate: validateBedrooms,
              index: true,
            },
            {
              name: 'bathrooms',
              label: 'Baños',
              type: 'number',
              // Campo aparece en más tipos (menos exclusiones)
              admin: {
                placeholder: 'Cantidad de baños',
                width: '50%',
                condition: (data, siblingData) => {
                  return data?.classification.type !== 'negocio'
                },
              },
              validate: validateBathrooms,
              index: true, // Hace que aparezca automáticamente en los filtros
            },
            {
              name: 'garageType',
              label: 'Tipo de cochera',
              admin: {
                placeholder: 'Selecciona el tipo de cochera',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'bodega' &&
                    data?.classification.type !== 'bodega_con_vinedo' &&
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'fábrica' &&
                    data?.classification.type !== 'estacion_de_servicio' &&
                    data?.classification.type !== 'finca' &&
                    data?.classification.type !== 'hotel' &&
                    data?.classification.type !== 'industria' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'ph' &&
                    data?.classification.type !== 'playa_de_estacionamiento' &&
                    data?.classification.type !== 'semipiso' &&
                    data?.classification.type !== 'vinedo'
                  )
                },
              },
              type: 'select',
              options: propertySelectOptions.garageType,
              validate: validateGarageType,
            },
            {
              name: 'garages',
              label: '¿Cuantos autos entran?',
              required: true,
              admin: {
                placeholder: 'Cantidad de espacios de cochera',
                description: 'Este campo es importanten para mercado libre',
                width: '50%',
                condition: (data, siblingData) => {
                  return siblingData?.garageType && siblingData?.garageType !== 'sin_cochera'
                },
              },
              type: 'number',
            },
            {
              name: 'plantas',
              type: 'number',
              label: 'Cantidad de Plantas',
              admin: {
                width: '50%',
                placeholder: 'Ingresa la cantidad de plantas',
              },
            },
            {
              name: 'ambientes',
              type: 'number',
              label: 'Cantidad de Ambientes',
              admin: {
                width: '50%',
                placeholder: 'Ingresa la cantidad de ambientes',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'playa_de_estacionamiento'
                  )
                },
              },
            },
            {
              name: 'furnished',
              label: 'Amueblado',
              type: 'radio',
              options: propertySelectOptions.furnished,
              admin: {
                layout: 'horizontal',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'finca' &&
                    data?.classification.type !== 'galpon' &&
                    data?.classification.type !== 'hotel' &&
                    data?.classification.type !== 'industria' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'playa_de_estacionamiento' &&
                    data?.classification.type !== 'vinedo'
                  )
                },
              },
            },
            {
              name: 'monoambiente',
              label: '¿Monoambiente?',
              type: 'radio',
              options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
              ],
              admin: {
                layout: 'horizontal',
                width: '50%',
                condition: (data, siblingData) => {
                  return (
                    (data?.classification.type !== 'cochera' &&
                      data?.classification.type !== 'playa_de_estacionamiento' &&
                      siblingData?.ambientes === 0) ||
                    !siblingData?.ambientes
                  )
                },
              },
            },
          ],
        },
      ],
    },
    // Amenities con select múltiple nativo de Payload
    {
      name: 'amenities',
      type: 'group',
      label: 'servicios y Amenities',
      fields: [
        // Servicios
        {
          type: 'row',
          fields: [
            {
              name: 'mascotas',
              type: 'select',
              label: '¿Aceptan Mascotas?',
              options: ['Si', 'No'],
              admin: {
                width: '50%',
                placeholder: 'Indistinto',
                condition: (data, siblingData) => {
                  return (
                    !(
                      data?.classification.type === 'casa' &&
                      data?.classification.condition === 'venta'
                    ) &&
                    data?.classification.type !== 'lote' &&
                    data?.classification.type !== 'bodega' &&
                    data?.classification.type !== 'bodega_con_vinedo' &&
                    data?.classification.type !== 'campo' &&
                    data?.classification.type !== 'deposito' &&
                    data?.classification.type !== 'cochera' &&
                    data?.classification.type !== 'edificio' &&
                    data?.classification.type !== 'estacion_de_servicio' &&
                    data?.classification.type !== 'fábrica' &&
                    data?.classification.type !== 'finca' &&
                    data?.classification.type !== 'fondo_de_comercio' &&
                    data?.classification.type !== 'fraccionamiento' &&
                    data?.classification.type !== 'galpon' &&
                    data?.classification.type !== 'hotel' &&
                    data?.classification.type !== 'industria' &&
                    data?.classification.type !== 'local_comercial' &&
                    data?.classification.type !== 'loteo' &&
                    data?.classification.type !== 'negocio' &&
                    data?.classification.type !== 'playa_de_estacionamiento' &&
                    data?.classification.type !== 'terreno' &&
                    data?.classification.type !== 'vinedo'
                  )
                },
              },
              validate: validateMascotas,
            },
            {
              type: 'select',
              name: 'barrioPrivado',
              label: 'Barrio Privado',
              options: ['Si', 'No', 'Semi Privado'],
              admin: {
                width: '50%',
                placeholder: 'Indistinto',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'casa' ||
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'terreno'
                  )
                },
              },
            },
            {
              name: 'acceso',
              type: 'select',
              label: 'Acceso',
              options: propertySelectOptions.access,
              required: true,
              admin: {
                width: '50%',
                placeholder: 'Selecciona el tipo de acceso',
                description: 'Este campo solo sera visible para mercado libre',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'campo' ||
                    data?.classification.type === 'quinta' ||
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'loteo' ||
                    data?.classification.type === 'terreno'
                  )
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'agua',
              type: 'radio',
              label: 'Agua',
              options: ['Si', 'No'],
              required: true,
              admin: {
                width: '25%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'fraccionamiento' ||
                    data?.classification.type === 'loteo' ||
                    data?.classification.type === 'terreno' ||
                    data?.classification.type === 'campo' ||
                    data?.classification.type === 'fábrica' ||
                    data?.classification.type === 'finca' ||
                    data?.classification.type === 'vinedo'
                  )
                },
              },
            },
            {
              name: 'cloacas',
              type: 'radio',
              label: 'Cloacas',
              options: ['Si', 'No'],
              required: true,
              admin: {
                width: '25%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'fraccionamiento' ||
                    data?.classification.type === 'loteo' ||
                    data?.classification.type === 'terreno'
                  )
                },
              },
            },
            {
              name: 'gas',
              type: 'radio',
              label: 'Gas',
              options: ['Si', 'No'],
              required: true,
              admin: {
                width: '25%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'fraccionamiento' ||
                    data?.classification.type === 'loteo' ||
                    data?.classification.type === 'terreno' ||
                    data?.classification.type === 'cabaña' ||
                    data?.classification.type === 'campo' ||
                    data?.classification.type === 'chalet' ||
                    data?.classification.type === 'fábrica' ||
                    data?.classification.type === 'finca' ||
                    data?.classification.type === 'vinedo'
                  )
                },
              },
            },
            {
              name: 'luz',
              type: 'radio',
              label: 'Luz Eléctrica',
              options: ['Si', 'No'],
              required: true,
              admin: {
                width: '25%',
                condition: (data, siblingData) => {
                  return (
                    data?.classification.type === 'lote' ||
                    data?.classification.type === 'fraccionamiento' ||
                    data?.classification.type === 'loteo' ||
                    data?.classification.type === 'terreno' ||
                    data?.classification.type === 'campo' ||
                    data?.classification.type === 'finca' ||
                    data?.classification.type === 'vinedo'
                  )
                },
              },
            },
          ],
        },
        {
          name: 'estrellas',
          type: 'number',
          label: 'Cantidad de Estrellas',
          admin: {
            width: '50%',
            placeholder: 'Ingresa la cantidad de estrellas',
            condition: (data, siblingData) => {
              return data?.classification.type === 'hotel'
            },
          },
        },
        {
          name: 'servicios',
          type: 'select',
          label: 'Servicios',
          hasMany: true,
          admin: {
            placeholder: 'Selecciona los servicios relevantes',
            description: 'Primero debes seleccionar el tipo de propiedad y condición',
          },
          options: propertySelectOptions.amenityServices,
          filterOptions: ({ options, data }) => {
            const t = data?.classification?.type as string | undefined
            const c = data?.classification?.condition as string | undefined
            if (!t || !c) return [] // o `options` si querés mostrar todo

            return options.filter((o): o is ExtendedOption => {
              // descartar strings y quedarnos con objetos
              if (typeof o === 'string') return false
              const opt = o as ExtendedOption
              return (opt.type?.includes(t) ?? false) && (opt.condition?.includes(c) ?? false)
            })
          },
        },
        // Ambientes
        {
          name: 'ambientes',
          type: 'select',
          label: 'Ambientes y Espacios',
          hasMany: true,
          admin: {
            placeholder: 'Selecciona los ambientes y espacios relevantes',
          },
          options: propertySelectOptions.amenityEnvironments,
        },
        // Zonas cercanas
        {
          name: 'zonasCercanas',
          type: 'select',
          label: 'Zonas Cercanas',
          hasMany: true,
          admin: {
            placeholder: 'Selecciona las zonas cercanas relevantes',
          },
          options: propertySelectOptions.amenityNearbyZones,
        },
      ],
    },
    {
      name: 'extra',
      type: 'group',
      label: 'Campos extra para otros portales',
      fields: [
        {
          type: 'row',
          fields: [
            {
              type: 'number',
              name: 'bauleras',
              label: 'Cantidad de Bauleras',
              admin: {
                width: '25%',
                description: 'Este campo solo sera visible para mercado libre (importante)',
              },
            },
            {
              type: 'text',
              name: 'numeroCasa',
              label: 'Número de la Casa',
              admin: {
                width: '25%',
                description:
                  'Este campo no sera visible pero es importante para la calidad de mercado libre',
              },
            },
          ],
        },
      ],
    },

    // Generador de título y descripción con IA
    {
      name: 'aiContent',
      type: 'group',
      label: 'Título y Descripción',
      admin: {
        description:
          'Genera automáticamente el título y descripción usando IA, o edítalos manualmente.',
      },
      fields: [
        {
          name: 'aiGenerator',
          type: 'ui',
          admin: {
            components: {
              Field:
                '@/components/fields/AiTitleAndDescriptionGenerator/AiTitleAndDescriptionGenerator',
            },
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Título de la propiedad',
          required: true,
          admin: {
            description: 'Puedes generar automáticamente o escribir tu propio título',
            placeholder: 'ej: Casa moderna de 3 dormitorios en Godoy Cruz',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción de la propiedad',
          admin: {
            description: 'Descripción detallada que aparecerá en el sitio web',
            placeholder:
              'Describe las características principales, ubicación y beneficios de la propiedad...',
            rows: 6,
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'images',
      label: 'Imágenes',
      fields: [
        {
          name: 'coverImage',
          label: 'Imagen de Portada',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            components: {
              Cell: '@/components/cells/ImageCell/ImageCell',
            },
            description:
              'Imagen principal que aparecerá como portada. No repetir esta imagen en la galería.',
          },
        },
        // Imágenes con orden y principal (array de objetos)
        {
          name: 'gallery',
          label: 'Galería de Imágenes',
          type: 'upload',
          relationTo: 'media',
          hasMany: true, // 👈 habilita multi-selección / drag&drop múltiple
          admin: {
            description: 'Arrastrá varias imágenes a la vez; podés reordenarlas con drag & drop.',
          },
          validate: (val) => (Array.isArray(val) && val.length <= 50 ? true : 'Máximo 50 imágenes'),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'videoUrl',
              type: 'text',
              label: 'URL de Video',
              admin: {
                width: '50%',
                description:
                  'Enlace a un video de la propiedad (YouTube, Vimeo, etc.). Se mostrará un botón en la ficha.',
                placeholder: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
              },
            },
            {
              name: 'virtualTourUrl',
              type: 'text',
              label: 'URL de Tour Virtual 3D',
              admin: {
                width: '50%',
                description:
                  'Enlace a un tour virtual 3D (ej: Matterport). Se mostrará un botón en la ficha.',
                placeholder: 'https://my.matterport.com/show/?m=XXXXXXXXXXX',
              },
            },
          ],
        },
      ],
    },
    // Imagen de portada

    // Relaciones
    {
      name: 'owner',
      label: 'Propietario',
      type: 'relationship',
      relationTo: 'clientes',
      admin: {
        placeholder: 'Selecciona el propietario de la propiedad',
      },
      required: true,
    },
    {
      name: 'notes',
      label: 'Notas internas',
      type: 'textarea',
      admin: {
        description: 'Notas o comentarios internos sobre la propiedad (no se muestran en el sitio)',
        placeholder: 'Notas internas sobre la propiedad',
        rows: 4,
      },
    },
    {
      name: 'inmoup',
      label: 'Configuración de Inmoup',
      admin: { hidden: true },
      type: 'group',
      fields: [
        { name: 'name', type: 'text', defaultValue: 'Inmoup' },
        { name: 'uploaded', type: 'checkbox', defaultValue: false },
        { name: 'externalId', type: 'text' },
        { name: 'externalUrl', type: 'text' },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'not_sent',
          options: [
            { label: 'No enviado', value: 'not_sent' },
            { label: 'En cola', value: 'queued' },
            { label: 'OK', value: 'ok' },
            { label: 'Error', value: 'error' },
            { label: 'Desactualizado', value: 'desactualizado' },
          ],
        },
        { name: 'lastSyncAt', type: 'date' },
        { name: 'lastError', type: 'textarea' },
      ],
    },
    {
      name: 'mercadolibre',
      label: 'Configuración de MercadoLibre',
      admin: { hidden: true },
      type: 'group',
      fields: [
        { name: 'name', type: 'text', defaultValue: 'MercadoLibre' },
        { name: 'uploaded', type: 'checkbox', defaultValue: false },
        { name: 'externalId', type: 'text' },
        { name: 'externalUrl', type: 'text' },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'not_sent',
          options: [
            { label: 'No enviado', value: 'not_sent' },
            { label: 'En cola', value: 'queued' },
            { label: 'OK', value: 'ok' },
            { label: 'Error', value: 'error' },
            { label: 'Desactualizado', value: 'desactualizado' },
          ],
        },
        { name: 'lastSyncAt', type: 'date' },
        { name: 'lastError', type: 'textarea' },
      ],
    },
  ],
}
