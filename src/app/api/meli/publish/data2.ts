const dataToSend = [
  {
    id: 'CONTACT_SCHEDULE',
    name: 'Horario de contacto',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'PROPERTY_TYPE',
    name: 'Inmueble',
    tags: {
      fixed: true,
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '242060',
        name: 'Casa',
      },
    ],
    attribute_group_id: 'MAIN',
    attribute_group_name: 'Principales',
  },
  {
    id: 'OPERATION',
    name: 'Operación',
    tags: {
      fixed: true,
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '242073',
        name: 'Alquiler',
      },
    ],
    attribute_group_id: 'MAIN',
    attribute_group_name: 'Principales',
  },
  {
    id: 'OPERATION_SUBTYPE',
    name: 'Subtipo de operación',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '244562',
        name: 'Propiedad individual',
      },
      {
        id: '245034',
        name: 'Emprendimiento',
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'TOTAL_AREA',
    name: 'Superficie total',
    tags: {
      required: true,
      catalog_listing_required: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'm²',
        name: 'm²',
      },
    ],
    default_unit: 'm²',
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'COVERED_AREA',
    name: 'Superficie cubierta',
    tags: {
      required: true,
      catalog_listing_required: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'm²',
        name: 'm²',
      },
    ],
    default_unit: 'm²',
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'LAND_AREA',
    name: 'Superficie de terreno',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'm²',
        name: 'm²',
      },
    ],
    default_unit: 'm²',
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'BALCONY_AREA',
    name: 'Superficie de balcón',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'm²',
        name: 'm²',
      },
    ],
    default_unit: 'm²',
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'ROOMS',
    name: 'Ambientes',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'BEDROOMS',
    name: 'Dormitorios',
    tags: {
      required: true,
      catalog_listing_required: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'FULL_BATHROOMS',
    name: 'Baños',
    tags: {
      required: true,
      catalog_listing_required: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'PARKING_LOTS',
    name: 'Cocheras',
    tags: {
      required: true,
      catalog_listing_required: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
    hint: 'Si no tiene estacionamientos, indica 0.',
  },
  {
    id: 'HAS_GUEST_PARKING',
    name: 'Estacionamiento para visitantes',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'FLOORS',
    name: 'Cantidad de pisos',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'PROPERTY_AGE',
    name: 'Antigüedad',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'años',
        name: 'años',
      },
    ],
    default_unit: 'años',
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'PROPERTY_OWNERSHIP',
    name: 'Tipo de propiedad',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '345142',
        name: 'Casa sola',
      },
      {
        id: '345143',
        name: 'Casa en condominio',
      },
      {
        id: '345144',
        name: 'Casa en fraccionamiento',
      },
    ],
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HOUSE_NUMBER',
    name: 'Número de la casa',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HOUSE_PROPERTY_SUBTYPE',
    name: 'Tipo de casa',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '266259',
        name: 'Dúplex',
      },
      {
        id: '266260',
        name: 'Ph',
      },
      {
        id: '266261',
        name: 'Tríplex',
      },
      {
        id: '266256',
        name: 'Cabaña',
      },
      {
        id: '266257',
        name: 'Casa',
      },
      {
        id: '266258',
        name: 'Chalet',
      },
    ],
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'WITH_GATED_COMMUNITY',
    name: 'Con barrio cerrado',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'FACING',
    name: 'Orientación',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '242328',
        name: 'Sur',
      },
      {
        id: '242330',
        name: 'Oeste',
      },
      {
        id: '242327',
        name: 'Norte',
      },
      {
        id: '242329',
        name: 'Este',
      },
    ],
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'IPTU_TAX',
    name: 'Valor del IPTU',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'CONDO_VALUE',
    name: 'Valor del condominio',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_INTERNET_ACCESS',
    name: 'Acceso a internet',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'HAS_AIR_CONDITIONING',
    name: 'Aire acondicionado',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'HAS_ALARM',
    name: 'Alarma',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'CARACTERISTICAS',
    attribute_group_name: 'Características adicionales',
  },
  {
    id: 'HAS_ATTIC',
    name: 'Altillo',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'FURNISHED',
    name: 'Amoblado',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'CARACTERISTICAS',
    attribute_group_name: 'Características adicionales',
  },
  {
    id: 'PROFESSIONAL_USE_ALLOWED',
    name: 'Apto profesional',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'CARACTERISTICAS',
    attribute_group_name: 'Características adicionales',
  },
  {
    id: 'HAS_BALCONY',
    name: 'Balcón',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_HEATING',
    name: 'Calefacción',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'HAS_INDOOR_FIREPLACE',
    name: 'Chimenea',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_KITCHEN',
    name: 'Cocina',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_DINNING_ROOM',
    name: 'Comedor',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_MAID_ROOM',
    name: 'Dependencia de servicio',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_BEDROOM_SUITE',
    name: 'Dormitorio en suite',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_STUDY',
    name: 'Estudio',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_NATURAL_GAS',
    name: 'Gas natural',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_GARDEN',
    name: 'Jardín',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_TELEPHONE_LINE',
    name: 'Línea telefónica',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'CARACTERISTICAS',
    attribute_group_name: 'Características adicionales',
  },
  {
    id: 'HAS_LIVING_ROOM',
    name: 'Living',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_GRILL',
    name: 'Parrilla',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_PATIO',
    name: 'Patio',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_SWIMMING_POOL',
    name: 'Pileta',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'HAS_CLOSETS',
    name: 'Placards',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_PLAYROOM',
    name: 'Playroom',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_ELECTRIC_GATE_OPENER',
    name: 'Portón automático',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'HAS_SECURITY',
    name: 'Seguridad',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'COMOYAMEN',
    attribute_group_name: 'Comodidades y amenities',
  },
  {
    id: 'SECURITY_TYPE',
    name: 'Tipo de seguridad',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'list',
    values: [
      {
        id: '13836687',
        name: '24 horas',
      },
      {
        id: '13836688',
        name: 'Diurno',
      },
      {
        id: '13836689',
        name: 'Nocturno',
      },
      {
        id: '13836690',
        name: 'Virtual',
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_TERRACE',
    name: 'Terraza',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_HALF_BATH',
    name: 'Toilette',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'HAS_DRESSING_ROOM',
    name: 'Vestidor',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'AMBIENTES',
    attribute_group_name: 'Ambientes',
  },
  {
    id: 'ONLY_FAMILIES',
    name: 'Solo familias',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'CARACTERISTICAS',
    attribute_group_name: 'Características adicionales',
  },
  {
    id: 'WAREHOUSES',
    name: 'Bauleras',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_GYM',
    name: 'Gimnasio',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_JACUZZI',
    name: 'Jacuzzi',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_LAUNDRY',
    name: 'Con lavadero',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_LAUNDRY_CONNECTION',
    name: 'Con conexión para lavarropas',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_CABLE_TV',
    name: 'TV por cable',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_SATELITE_TV',
    name: 'Con TV satelital',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_CONTROLLED_ACCESS',
    name: 'Acesso controlado',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_PLAYGROUND',
    name: 'Parque infantil',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_GREEN_AREA',
    name: 'Con área verde',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_CINEMA_HALL',
    name: 'Área de cine',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_LIFT',
    name: 'Ascensor',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_BASKETBALL_COURT',
    name: 'Cancha de básquetbol',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_SOCCER_FIELD',
    name: 'Con cancha de fútbol',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_PADDLE_COURT',
    name: 'Cancha de paddle',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_TENNIS_COURT',
    name: 'Cancha de tenis',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_MULTIPURPOSE_SPORT_COURT',
    name: 'Con cancha polideportiva',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_BREAKFAST_BAR',
    name: 'Desayunador',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_ELECTRIC_GENERATOR',
    name: 'Grupo electrógeno',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_PARTY_ROOM',
    name: 'Salón de fiestas',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_SAUNA',
    name: 'Sauna',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_FRIDGE',
    name: 'Heladera',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_SOLAR_ENERGY',
    name: 'Con energia solar',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'AVAILABLE',
    name: 'Disponible desde',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_GARDENER',
    name: 'Jardinero',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'IS_SUITABLE_FOR_PETS',
    name: 'Admite mascotas',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'ENDORSEMENT_REQUIRED',
    name: 'Requiere aval',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'MAX_GUESTS_NUMBER',
    name: 'Cantidad máxima de habitantes',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_TAP_WATER',
    name: 'Agua corriente',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_CISTERN',
    name: 'Cisterna',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_BOILER',
    name: 'Caldera',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'WITH_VIRTUAL_TOUR',
    name: 'Con tour virtual',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'MAINTENANCE_FEE',
    name: 'Expensas',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number_unit',
    value_max_length: 255,
    allowed_units: [
      {
        id: 'ARS',
        name: 'ARS',
      },
      {
        id: 'USD',
        name: 'USD',
      },
      {
        id: 'UVA',
        name: 'UVA',
      },
    ],
    default_unit: 'ARS',
    attribute_group_id: 'FIND',
    attribute_group_name: 'Ficha técnica',
  },
  {
    id: 'CMG_SITE',
    name: 'Sitio de origen',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'CANONICAL_URL',
    name: 'Url canónica',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'DFLT',
    attribute_group_name: 'Otros',
  },
  {
    id: 'MONTHLY_RENT_FACTOR',
    name: 'Factor multiplicador de renta',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'PROPERTY_CODE',
    name: 'Código de la propiedad',
    tags: {},
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'SOCIAL_STRATUM',
    name: 'Estrato social',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'number',
    value_max_length: 18,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'PHONE_ID',
    name: 'Identificador de teléfono',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'string',
    value_max_length: 255,
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_LEADS_PENALIZATION',
    name: 'Tiene penalización por Leads',
    tags: {
      hidden: true,
      read_only: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'HAS_GOOD_QUALITY',
    name: 'Tiene buena calidad',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 1,
    value_type: 'boolean',
    values: [
      {
        id: '242084',
        name: 'No',
        metadata: {
          value: false,
        },
      },
      {
        id: '242085',
        name: 'Sí',
        metadata: {
          value: true,
        },
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
  {
    id: 'ITEM_CONDITION',
    name: 'Condición del ítem',
    tags: {
      hidden: true,
    },
    hierarchy: 'ITEM',
    relevance: 2,
    value_type: 'list',
    values: [
      {
        id: '2230284',
        name: 'Nuevo',
      },
      {
        id: '2230581',
        name: 'Usado',
      },
    ],
    attribute_group_id: 'OTHERS',
    attribute_group_name: 'Otros',
  },
]
