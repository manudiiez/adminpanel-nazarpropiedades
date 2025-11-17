// src/collections/Contratos.ts
import type { CollectionConfig } from 'payload'

export const Contratos: CollectionConfig = {
  slug: 'contratos',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'type', 'status', 'listingPrice', 'currency', 'updatedAt'],

    components: {
      views: {
        edit: {
          detalles: {
            Component: '@/views/ContractDetails#default', // tu vista
            path: '/detalles', // ruta dentro del doc
            tab: {
              label: 'Detalles', // texto del tab
              href: '/detalles', // ruta dentro del doc
              order: 100,
            },
          },
          // editar: {
          //   // No necesitamos un componente: usamos la pestaña solo como link
          //   Component: '@/views/ContractEditView#default', // tu vista
          //   path: '/editar', // ruta dentro del doc
          //   tab: {
          //     label: 'Editar',
          //     // desde /:id/reportes → '../' te lleva a /:id (editor nativo)
          //     order: 100, // opcional: orden en las pestañas
          //     href: '/editar',
          //   },
          // },
        },
      },
    },
  },
  fields: [
    // título visible en listas (lo componemos en hooks)
    { name: 'displayTitle', type: 'text', admin: { hidden: true } },

    // Campos ocultos para almacenar datos de la propiedad (evita fetch adicional)
    { name: 'propertyTitle', type: 'text', admin: { hidden: true } },
    { name: 'propertyPublishedDate', type: 'date', admin: { hidden: true } },

    {
      type: 'tabs',
      tabs: [
        // PASO 1 — Tipo y partes
        {
          label: 'Paso 1 · Tipo y partes',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Tipo de contrato',
              options: [
                { label: 'Venta', value: 'venta' },
                { label: 'Alquiler', value: 'alquiler' },
              ],
              required: true,
              admin: { width: '100%' },
            },

            // Componente para autocompletar datos de la propiedad
            {
              name: 'propertyAutoFill',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/fields/PropertyAutoFill/PropertyAutoFill.tsx',
                },
              },
            },

            // relaciones (ajusta slugs)
            {
              name: 'property',
              label: 'Propiedad',
              type: 'relationship',
              relationTo: 'propiedades',
              required: true,
              filterOptions: {
                status: {
                  equals: 'activa',
                },
              },
              // admin: {
              //   appearance: 'drawer',
              // },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'owner',
                  type: 'relationship',
                  relationTo: 'clientes',
                  required: true,
                  label: 'Propietario',
                  admin: {
                    width: '50%',
                    description:
                      'Se autocompletará con el propietario de la propiedad seleccionada, pero puedes cambiarlo',
                  },
                },
                {
                  name: 'client',
                  type: 'relationship',
                  relationTo: 'clientes',
                  label: 'Comprador / Inquilino',
                  admin: {
                    width: '50%',
                  },
                  required: true,
                },
              ],
            },
          ],
        },

        // PASO 2 — Fechas
        {
          label: 'Paso 2 · Fechas',
          fields: [
            { name: 'signDate', type: 'date', label: 'Fecha de firma', required: true },
            {
              name: 'startDate',
              type: 'date',
              label: 'Inicio de posesión / alquiler',
            },
            { name: 'endDate', type: 'date', label: 'Fin de alquiler (si aplica)' },
          ],
        },

        // PASO 3 — Monto y honorarios
        {
          label: 'Paso 3 · Monto y honorarios',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'listingPrice',
                  type: 'number',
                  label: 'Precio de lista',
                  required: true,
                  admin: { width: '50%', placeholder: 'Ingresar precio al que se publico' },
                },
                {
                  name: 'currency',
                  label: 'Moneda del precio de lista',
                  type: 'select',
                  options: ['USD', 'ARS'],
                  required: true,
                  admin: { width: '50%', placeholder: 'Seleccionar moneda' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'realPrice',
                  type: 'number',
                  label: 'Precio despues de negociación',
                  required: true,
                  admin: { width: '50%', placeholder: 'Ingresar precio despues de negociación' },
                },
                {
                  name: 'realCurrency',
                  label: 'Moneda del precio negociado',
                  type: 'select',
                  options: ['USD', 'ARS'],
                  required: true,
                  admin: { width: '50%', placeholder: 'Seleccionar moneda' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ownerFee',
                  type: 'number',
                  label: 'Honorarios del propietario',
                  admin: { width: '50%', placeholder: 'Ingresar honorarios' },
                },
                {
                  name: 'ownerFeeCurrency',
                  type: 'select',
                  label: 'Moneda de honorarios del propietario',
                  options: ['USD', 'ARS'],
                  admin: { width: '50%', placeholder: 'Seleccionar moneda' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'buyerFee',
                  type: 'number',
                  label: 'Honorarios del comprador / inquilino',
                  admin: { width: '50%', placeholder: 'Ingresar honorarios' },
                },
                {
                  name: 'buyerFeeCurrency',
                  type: 'select',
                  label: 'Moneda de honorarios del comprador / inquilino',
                  options: ['USD', 'ARS'],
                  admin: { width: '50%', placeholder: 'Seleccionar moneda' },
                },
              ],
            },
            // {
            //   type: 'array',
            //   name: 'payments',
            //   label: 'Pagos',
            //   admin: {
            //     description:
            //       'Pagos relacionados al contrato (honorarios, redaccion del contrato, reservas, etc.)',
            //   },
            //   fields: [
            //     {
            //       type: 'row',
            //       fields: [
            //         {
            //           name: 'amount',
            //           type: 'number',
            //           label: 'Monto del pago',
            //           required: true,
            //           admin: { width: '50%', placeholder: 'Ingresar monto del pago' },
            //         },
            //         {
            //           name: 'currency',
            //           type: 'select',
            //           label: 'Moneda del pago',
            //           options: ['USD', 'ARS'],
            //           required: true,
            //           admin: { width: '50%', placeholder: 'Seleccionar moneda' },
            //         },
            //       ],
            //     },
            //     {
            //       name: 'label',
            //       type: 'text',
            //       label: 'Nombre del pago',
            //       required: true,
            //       admin: { width: '50%', placeholder: 'Honorarios, reservas, etc.' },
            //     },

            //     {
            //       name: 'date',
            //       type: 'date',
            //       label: 'Fecha del pago',
            //       required: true,
            //       admin: { width: '50%', placeholder: 'Seleccionar fecha del pago' },
            //     },
            //   ],
            // },
          ],
        },

        // PASO 4 — Adjuntos y notas
        {
          label: 'Paso 4 · Adjuntos y notas',
          fields: [
            {
              name: 'documents',
              type: 'upload',
              relationTo: 'contractmedia',
              hasMany: true,
              label: 'Documentos',
              admin: {
                description:
                  'Adjunta documentos relevantes como contratos, facturas, comprobantes, etc.',
              },
            },
            {
              name: 'notes',
              type: 'textarea',
              label: 'Notas',
              admin: { placeholder: 'Ingresar notas' },
            },
          ],
        },
      ],
    },
  ],

  hooks: {
    // Validaciones y "título" calculado
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return

        // validar fechas
        if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
          throw new Error('La fecha fin no puede ser anterior al inicio.')
        }

        // Construir título: "[propertyTitle] de [ownerFullname] a [clientFullname] - [signDate]"

        // Título de la propiedad (desde campo oculto)
        const propertyTitle = data.propertyTitle || 'Propiedad'

        // Nombre del propietario (owner)
        let ownerName = 'Propietario'
        if (data.owner) {
          try {
            const owner =
              typeof data.owner === 'string'
                ? await req.payload.findByID({ collection: 'clientes', id: data.owner })
                : data.owner

            if (owner?.fullname || owner?.firstName) {
              ownerName =
                owner.fullname || `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
            }
          } catch (error) {
            // Si no se puede obtener el propietario, usar valor por defecto
          }
        }

        // Nombre del cliente
        let clientName = 'Cliente'
        if (data.client) {
          try {
            const client =
              typeof data.client === 'string'
                ? await req.payload.findByID({ collection: 'clientes', id: data.client })
                : data.client

            if (client?.fullname || client?.firstName) {
              clientName =
                client.fullname || `${client.firstName || ''} ${client.lastName || ''}`.trim()
            }
          } catch (error) {
            // Si no se puede obtener el cliente, usar valor por defecto
          }
        }

        // Fecha de firma
        let formattedDate = ''
        if (data.signDate) {
          const date = new Date(data.signDate)
          formattedDate = date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        }

        // Construir el título en el formato solicitado
        if (data.client && formattedDate) {
          data.displayTitle = `${propertyTitle} de ${ownerName} a ${clientName} - ${formattedDate}`
        } else if (formattedDate) {
          data.displayTitle = `${propertyTitle} de ${ownerName} - ${formattedDate}`
        } else {
          data.displayTitle = `${propertyTitle} de ${ownerName}`
        }
      },
    ],
  },
}
