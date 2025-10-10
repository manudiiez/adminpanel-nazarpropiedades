// Mapeos de valores internos a valores de Inmoup API

export interface MercadoLibreMappins {
  [key: string]: string | number
}

export interface MercadoLibreMappinsCity {
  [key: string]: { id: string; name: string } | number | string
}

export const propertyType = [
  {
    name: 'Campos',
    venta: 'MLA6413',
    alquiler: 'MLA6414',
    alquiler_temporario: 'MLA6414',
    total_items_in_this_category: 5133,
  },
  {
    name: 'Casas',
    venta: 'MLA401685',
    alquiler: 'MLA1467',
    alquiler_temporario: 'MLA50278',
    total_items_in_this_category: 173125,
  },
  {
    name: 'Cocheras',
    venta: 'MLA50543',
    alquiler: 'MLA50542',
    alquiler_temporario: 'MLA50542',
    total_items_in_this_category: 8850,
  },
  {
    name: 'Departamentos',
    venta: 'MLA401686',
    alquiler: 'MLA1473',
    alquiler_temporario: 'MLA50279',
    total_items_in_this_category: 221319,
  },
  {
    name: 'Depósitos y Galpones',
    venta: 'MLA1477',
    alquiler: 'MLA1476',
    alquiler_temporario: 'MLA1476',
    total_items_in_this_category: 10606,
  },
  {
    name: 'Fondo de Comercio',
    venta: 'MLA50550',
    alquiler: 'MLA50546',
    alquiler_temporario: 'MLA50546',
    total_items_in_this_category: 2251,
  },
  {
    name: 'Locales',
    venta: 'MLA79244',
    alquiler: 'MLA79243',
    alquiler_temporario: 'MLA79243',
    total_items_in_this_category: 18570,
  },
  {
    name: 'Oficinas',
    venta: 'MLA401684',
    alquiler: 'MLA50539',
    alquiler_temporario: 'MLA50539',
    total_items_in_this_category: 13851,
  },
  {
    name: 'Otros Inmuebles',
    venta: 'MLA6396',
    alquiler: 'MLA6395',
    alquiler_temporario: 'MLA50283',
    total_items_in_this_category: 5336,
  },
  {
    name: 'PH',
    venta: 'MLA105182',
    alquiler: 'MLA105181',
    alquiler_temporario: 'MLA105180',
    total_items_in_this_category: 25918,
  },
  {
    name: 'Quintas',
    venta: 'MLA458174',
    alquiler: 'MLA50549',
    alquiler_temporario: 'MLA52745',
    total_items_in_this_category: 5525,
  },
  {
    name: 'Terrenos y Lotes',
    venta: 'MLA401687',
    alquiler: 'MLA1494',
    alquiler_temporario: 'MLA1494',
    total_items_in_this_category: 106149,
  },
]

// Tipos de operación
export const conditionMappings: MercadoLibreMappins = {
  venta: 'Venta',
  alquiler: 'Alquiler',
  alquiler_temporario: 'Alquiler Temporario',
  permuta: 'Permuta',
}

// Tipos de propiedad
export const propertyTypeMappings: MercadoLibreMappins = {
  casa: 'Casas',
  departamento: 'Departamentos',
  lote: 'Terrenos y Lotes',
  bodega: 'Otros Inmuebles',
  bodega_con_vinedo: 'Otros Inmuebles',
  cabaña: 'Otros Inmuebles',
  campo: 'Campos',
  chalet: 'Otros Inmuebles',
  cochera: 'Cocheras',
  condominio: 'Otros Inmuebles',
  deposito: 'Depósitos y Galpones',
  duplex: 'Otros Inmuebles',
  edificio: 'Otros Inmuebles',
  estacion_de_servicio: 'Otros Inmuebles',
  fábrica: 'Otros Inmuebles',
  finca: 'Otros Inmuebles',
  fondo_de_comercio: 'Fondo de Comercio',
  fraccionamiento: 'Otros Inmuebles',
  galpon: 'Depósitos y Galpones',
  hotel: 'Otros Inmuebles',
  industria: 'Otros Inmuebles',
  local_comercial: 'Locales',
  loft: 'Otros Inmuebles',
  loteo: 'Terrenos y Lotes',
  negocio: 'Otros Inmuebles',
  oficina: 'Oficinas',
  ph: 'PH',
  piso: 'Otros Inmuebles',
  playa_de_estacionamiento: 'Otros Inmuebles',
  quinta: 'Quintas',
  semipiso: 'Otros Inmuebles',
  terreno: 'Terrenos y Lotes',
  triplex: 'Otros Inmuebles',
  vinedo: 'Otros Inmuebles',
}

// Estados de conservación
export const conservationStatusMappings: MercadoLibreMappins = {
  excelente: 'excelente',
  muy_bueno: 'muy-bueno',
  bueno: 'bueno',
  regular: 'regular',
  a_refaccionar: 'a-refaccionar',
}

// Orientaciones
export const orientationMappings: MercadoLibreMappins = {
  norte: 'norte',
  sur: 'sur',
  este: 'este',
  oeste: 'oeste',
  noreste: 'noreste',
  noroeste: 'noroeste',
  sureste: 'sureste',
  suroeste: 'suroeste',
}

// Tipos de cochera
export const garageTypeMappings: MercadoLibreMappins = {
  garage: 'Garage',
  garage_cochera: 'Garage/Cochera',
  garage_doble: 'Garage Doble',
  cochera_pasante: 'Cochera Pasante',
  sin_cochera: 'Sin Cochera',
}

// Monedas
export const currencyMappings: MercadoLibreMappins = {
  usd: 'dolar',
  ars: 'peso',
}

// Amueblado
export const furnishedMappings: MercadoLibreMappins = {
  si: 'si',
  no: 'no',
}

// Antigüedad (mapeo con valor numérico y tiempo)
export const antiquityMappings: { [key: string]: { value: number; tiempo: string } } = {
  a_estrenar: { value: 0, tiempo: 'años' },
  '6_meses': { value: 6, tiempo: 'meses' },
  '1_ano': { value: 1, tiempo: 'años' },
  '1_ano_y_medio': { value: 1.5, tiempo: 'años' },
  '2_anos': { value: 2, tiempo: 'años' },
  '3_anos': { value: 3, tiempo: 'años' },
  '4_anos': { value: 4, tiempo: 'años' },
  '5_anos': { value: 5, tiempo: 'años' },
  '6_anos': { value: 6, tiempo: 'años' },
  '7_anos': { value: 7, tiempo: 'años' },
  '8_anos': { value: 8, tiempo: 'años' },
  '9_anos': { value: 9, tiempo: 'años' },
  '10_anos': { value: 10, tiempo: 'años' },
  '11_anos': { value: 11, tiempo: 'años' },
  '12_anos': { value: 12, tiempo: 'años' },
  '13_anos': { value: 13, tiempo: 'años' },
  '14_anos': { value: 14, tiempo: 'años' },
  '15_anos': { value: 15, tiempo: 'años' },
  '16_anos': { value: 16, tiempo: 'años' },
  '17_anos': { value: 17, tiempo: 'años' },
  '18_anos': { value: 18, tiempo: 'años' },
  '19_anos': { value: 19, tiempo: 'años' },
  '20_anos': { value: 20, tiempo: 'años' },
  '21_anos': { value: 21, tiempo: 'años' },
  '22_anos': { value: 22, tiempo: 'años' },
  '23_anos': { value: 23, tiempo: 'años' },
  '24_anos': { value: 24, tiempo: 'años' },
  '25_anos': { value: 25, tiempo: 'años' },
  '26_anos': { value: 26, tiempo: 'años' },
  '27_anos': { value: 27, tiempo: 'años' },
  '28_anos': { value: 28, tiempo: 'años' },
  '29_anos': { value: 29, tiempo: 'años' },
  '30_anos': { value: 30, tiempo: 'años' },
  '31_anos': { value: 31, tiempo: 'años' },
  '32_anos': { value: 32, tiempo: 'años' },
  '33_anos': { value: 33, tiempo: 'años' },
  '34_anos': { value: 34, tiempo: 'años' },
  '35_anos': { value: 35, tiempo: 'años' },
  '36_anos': { value: 36, tiempo: 'años' },
  '37_anos': { value: 37, tiempo: 'años' },
  '38_anos': { value: 38, tiempo: 'años' },
  '39_anos': { value: 39, tiempo: 'años' },
  '40_anos': { value: 40, tiempo: 'años' },
  '41_anos': { value: 41, tiempo: 'años' },
  '42_anos': { value: 42, tiempo: 'años' },
  '43_anos': { value: 43, tiempo: 'años' },
  '44_anos': { value: 44, tiempo: 'años' },
  '45_anos': { value: 45, tiempo: 'años' },
  '46_anos': { value: 46, tiempo: 'años' },
  '47_anos': { value: 47, tiempo: 'años' },
  '48_anos': { value: 48, tiempo: 'años' },
  '49_anos': { value: 49, tiempo: 'años' },
  '50_anos': { value: 50, tiempo: 'años' },
  mas_de_50_anos: { value: 50, tiempo: 'años' },
}

// Departamentos de Mendoza
export const departmentMappings: MercadoLibreMappinsCity = {
  capital: 'Capital',
  godoy_cruz: {
    id: 'TUxBQ0dPRDIyMDlm',
    name: 'Godoy Cruz',
  },
  guaymallen: {
    id: 'TUxBQ0dVQTI0Yjcw',
    name: 'Guaymallén',
  },
  las_heras: {
    id: 'TUxBQ0xBU2YzZWNh',
    name: 'Las Heras',
  },
  lujan_de_cuyo: {
    id: 'TUxBQ0xVSjRiOWZh',
    name: 'Luján de Cuyo',
  },
  maipu: {
    id: 'TUxBQ01BSWEyMzA',
    name: 'Maipú',
  },
  san_martin: {
    id: 'TUxBQ1NBTmQ4N2U4',
    name: 'San Martín',
  },
  rivadavia: {
    id: 'TUxBQ1JJVmNhOWUw',
    name: 'Rivadavia',
  },
  junin: {
    id: 'TUxBQ0pVTjhkMzk1',
    name: 'Junín',
  },
  san_rafael: {
    id: 'TUxBQ1NBTjdmNmMy',
    name: 'San Rafael',
  },
  general_alvear: {
    id: 'TUxBQ0dFTmI4MzRj',
    name: 'General Alvear',
  },
  malargue: {
    id: 'TUxBQ01BTDZjYjM4',
    name: 'Malargüe',
  },
  tupungato: {
    id: 'TUxBQ1RVUDk3Y2Nl',
    name: 'Tupungato',
  },
  tunuyan: {
    id: 'TUxBQ1RVTjk4YjBm',
    name: 'Tunuyán',
  },
  san_carlos: {
    id: 'TUxBQ1NBTmM0ZmYz',
    name: 'San Carlos',
  },
  lavalle: {
    id: 'TUxBQ0xBVjcxNjJh',
    name: 'Lavalle',
  },
  santa_rosa: {
    id: 'TUxBQ1NBTjQ2Y2Nm',
    name: 'Santa Rosa',
  },
  la_paz: {
    id: 'TUxBQ0xBWmNkODhm',
    name: 'La Paz',
  },
}

// Localidades/Zonas de Mendoza
export const localityMappings: MercadoLibreMappinsCity = {
  // Capital
  '1a_seccion_parque_central': 192,
  '2a_seccion_barrio_civico': 195,
  '3a_seccion_parque_ohiggins': 194,
  '4a_seccion_area_fundacional': 193,
  '5a_seccion_residencial_sur': 196,
  '6a_seccion_residencial_norte': 197,
  '7a_seccion_residencial_parque': 198,
  '8a_seccion_aeroparque': 199,
  '9a_seccion_parque_general_san_martin': 200,
  '10a_seccion_residencial_los_cerros': 201,
  '11a_seccion_san_agustin': 202,
  '12a_seccion_piedemonte': 203,

  // Godoy Cruz
  godoy_cruz_city: {
    id: 'TUxBQkdPRDUzOTha',
    name: 'Godoy Cruz',
  },
  gobernador_benegas: 2,
  las_tortugas: 4,
  presidente_sarmiento: 5,
  san_francisco_del_monte_gc: 6,
  trapiche: 7,
  villa_marini: 8,
  villa_hipodromo: {
    id: 'TVhYVmlsbGEgSGlww7Nkcm9tb1RVeEJRMGRQU',
    name: 'Villa Hipódromo',
  },
  villa_del_parque: 10,

  // Guaymallén
  guaymallen_villa_nueva: { id: 'TUxBQkdVQTEyMzRa', name: 'Guaymallén' },
  villa_nueva: 35,
  la_primavera: { id: 'TUxBQkxBUDIyNTha', name: 'La Primavera' },
  los_corralitos: { id: 'TUxBQkxPUzc5MjVa', name: 'Los Corralitos' },
  puente_de_hierro: { id: 'TUxBQlBVRTc2Njla', name: 'Puente de Hierro' },
  el_bermejo: {
    id: 'TVhYQmVybWVqb1RVeEJRMGRWUVRJMFlqY3c',
    name: 'Bermejo',
  },
  buena_nueva: 17,
  capilla_del_rosario: 18,
  colonia_segovia: { id: 'TUxBQkNPTDE4MjVa', name: 'Colonia Segovia' },
  colonia_molina: 19,
  dorrego: 21,
  el_sauce: 22,
  jesus_nazareno: 23,
  kilometro_8: 24,
  kilometro_11: 25,
  las_canas: 27,
  nueva_ciudad: 29,
  pedro_molina: 30,
  rodeo_de_la_cruz: 32,
  san_francisco_del_monte_gm: 33,
  san_jose_gm: 34,
  belgrano_gm: 823,

  // Las Heras
  blanco_encalada: {
    id: 'TUxBQkJMQTY5NTBa',
    name: 'Blanco Encalada',
  },
  jocoli_lh: {
    id: 'TUxBQkpPQzE2ODNa',
    name: 'Jocolí',
  },
  el_algarrobal: {
    id: 'QVItTUFsZ2Fycm9iYWwgQWJham8',
    name: 'Algarrobal Abajo',
  },
  el_borbollon: 45,
  el_challao: 46,
  el_pastal: 47,
  el_plumerillo: 48,
  el_resguardo: 49,
  la_cieneguita: 50,
  las_cuevas: {
    id: 'TUxBQkxBUzgxMDla',
    name: 'Las Cuevas',
  },
  las_heras_city: {
    id: 'TUxBQkxBUzgzOTZa',
    name: 'Las Heras',
  },
  los_penitentes: {
    id: 'TUxBQkxPUzk4MzNa',
    name: 'Los Penitentes',
  },
  panquehua: {
    id: 'TVhYUGFucXVlaHVhVFV4QlEweEJVMll6WldOa',
    name: 'Panquehua',
  },
  polvaredas: {
    id: 'TUxBQlBPTDU4OTda',
    name: 'Polvaredas',
  },
  puente_del_inca: {
    id: 'TUxBQlBVRTk2ODha',
    name: 'Puente del Inca',
  },
  punta_de_vacas: {
    id: 'TUxBQlBVTjg5ODVa',
    name: 'Punta de Vacas',
  },
  uspallata: {
    id: 'TUxBQlVTUDQ5MjRa',
    name: 'Uspallata',
  },

  // Luján de Cuyo
  agrelo: {
    id: 'TUxBQkFHUjUxNjNa',
    name: 'Agrelo',
  },
  barrio_perdriel_iv: {
    id: 'TUxBQkJBUjYyMzJa',
    name: 'Barrio Perdriel IV',
  },
  carrodilla: 76,
  cacheuta: {
    id: 'TUxBQkNBQzQwNTFa',
    name: 'Cacheuta',
  },
  chacras_de_coria: 78,
  costa_flores: {
    id: 'TUxBQkNPUzk0NzFa',
    name: 'Costa Flores',
  },
  el_carrizal: {
    id: 'TUxBQkVMQzQwMDBa',
    name: 'El Carrizal',
  },
  el_salto: {
    id: 'TUxBQkVMUzc0OTda',
    name: 'El Salto',
  },
  mayor_drummond: 82,
  la_puntilla: {
    id: 'TGEgUHVudGlsbGFUVXhCUTB4VlNqUmlPV1po',
    name: 'La Puntilla',
  },
  las_compuertas: {
    id: 'TUxBQkxBUzYzODBa',
    name: 'Las Compuertas',
  },
  las_vegas: {
    id: 'TUxBQkxBUzY4NTNa',
    name: 'Las Vegas',
  },
  lujan_de_cuyo_city: {
    id: 'TUxBQkxVSjI3OTBa',
    name: 'Luján de Cuyo',
  },
  perdriel: {
    id: 'TUxBQlBFUjczMzda',
    name: 'Perdriel',
  },
  potrerillos: {
    id: 'TUxBQlBPVDg5NjFa',
    name: 'Potrerillos',
  },
  vistalba: 89,
  ugarteche: {
    id: 'TUxBQlVHQTc3ODJa',
    name: 'Ugarteche',
  },
  vertientes_del_pedemonte: 91,

  // Maipú
  barrancas: {
    id: 'TUxBQkJBUjEzNjJa',
    name: 'Barrancas',
  },
  barrio_jesus_de_nazaret: {
    id: 'TUxBQkJBUjY2ODla',
    name: 'Barrio Jesús de Nazaret',
  },
  coquimbito: 61,
  cruz_de_piedra: {
    id: 'TUxBQkNSVTQwMzVa',
    name: 'Cruz de Piedra',
  },
  el_pedregal: {
    id: 'TUxBQkVMUDIwMDJa',
    name: 'El Pedregal',
  },
  fray_luis_beltran: {
    id: 'TUxBQkZSQTg4NTJa',
    name: 'Fray Luis Beltrán',
  },
  general_gutierrez: 65,
  general_ortega: 66,
  maipu_city: {
    id: 'TUxBQk1BSTYwNTNa',
    name: 'Maipú',
  },
  lunlunta: 68,
  luzuriaga: {
    id: 'TVhYTHV6dXJpYWdhVFV4QlEwMUJTV0V5TXpB',
    name: 'Luzuriaga',
  },
  rodeo_del_medio: {
    id: 'TUxBQlJPRDI4NzNa',
    name: 'Rodeo del Medio',
  },
  russell: {
    id: 'TUxBQlJVUzQ4MTNa',
    name: 'Russell',
  },
  san_roque: {
    id: 'TUxBQlNBTjY4OTNa',
    name: 'San Roque',
  },
  villa_teresa: {
    id: 'TUxBQlZJTDM4OTBa',
    name: 'Villa Teresa',
  },

  // San Martín
  alto_verde_sm: {
    id: 'TUxBQkFMVDQzMjBa',
    name: 'Alto Verde',
  },
  barrio_emanuel: {
    id: 'TUxBQkJBUjQ0ODZa',
    name: 'Barrio Emanuel',
  },
  barrio_la_estacion: 110,
  barrio_los_charabones: {
    id: 'TUxBQkJBUjE4MjVa',
    name: 'Barrio Los Charabones',
  },
  barrio_nuestra_senora_de_fatima: 112,
  chapanay: {
    id: 'TUxBQkNIQTcyMDNa',
    name: 'Chapanay',
  },
  chivilcoy: {
    id: 'TUxBQkNISTg5NDZa',
    name: 'Chivilcoy',
  },
  el_espino: 115,
  el_central: 116,
  el_divisadero: 117,
  el_ramblon: 118,
  montecaseros: {
    id: 'TUxBQk1PTjQ3NDla',
    name: 'Montecaseros',
  },
  nueva_california_est_moluches: {
    id: 'TUxBQk5VRTgzNzBa',
    name: 'Nueva California',
  },
  palmira: {
    id: 'TVhYUGFsbWlyYVRVeEJRMU5CVG1RNE4yVTQ',
    name: 'Palmira',
  },
  san_martin_city: {
    id: 'TUxBQlNBTjU4MDJa',
    name: 'San Martín',
  },
  tres_portenas: {
    id: 'TUxBQlRSRTIzNjha',
    name: 'Tres Porteñas',
  },

  // Rivadavia
  andrade: {
    id: 'TUxBQkFORDQ4OTha',
    name: 'Andrade',
  },
  barrio_cooperativa_los_campamentos: {
    id: 'TUxBQkJBUjQ4NjZa',
    name: 'Barrio Cooperativa Los Campamentos',
  },
  barrio_rivadavia: {
    id: 'TUxBQkJBUjgwMzBa',
    name: 'Barrio Rivadavia',
  },
  el_mirador: {
    id: 'TUxBQkVMTTc1NzFa',
    name: 'El Mirador',
  },
  la_central: {
    id: 'TUxBQkxBQzU0OTNa',
    name: 'La Central',
  },
  la_esperanza: {
    id: 'TUxBQkxBRTM3MjNa',
    name: 'La Esperanza',
  },
  la_florida: {
    id: 'TUxBQkxBRjE4MDFa',
    name: 'La Florida',
  },
  la_libertad: {
    id: 'TUxBQkxBTDEzNDda',
    name: 'La Libertad',
  },
  los_arboles: {
    id: 'TUxBQkxPUzQzNzVa',
    name: 'Los Árboles',
  },
  los_campamentos: {
    id: 'TUxBQkxPUzU4MTBa',
    name: 'Los Campamentos',
  },
  medrano_riv: {
    id: 'TUxBQk1FRDU1NDJa',
    name: 'Medrano',
  },
  mundo_nuevo_riv: {
    id: 'TUxBQk1VTjU0MzNa',
    name: 'Mundo Nuevo',
  },
  reduccion_de_abajo: {
    id: 'TUxBQlJFRDk1Njda',
    name: 'Reducción de Abajo',
  },
  rivadavia_city: {
    id: 'TUxBQlJJVjI5NzFa',
    name: 'Rivadavia',
  },
  santa_maria_de_oro: {
    id: 'TUxBQlNBTjM1NDNa',
    name: 'Santa María de Oro',
  },

  // Junín
  junin_centro: {
    id: 'TUxBQkpVTjE4NzJa',
    name: 'Junín',
  },
  los_barriales: {
    id: 'TUxBQkxPUzUxOTVa',
    name: 'Los Barriales',
  },
  philipps: {
    id: 'TUxBQlBISTQ3MTVa',
    name: 'Phillips',
  },
  medrano_jun: {
    id: 'TUxBQk1FRDY0ODFa',
    name: 'Medrano',
  },
  algarrobo_grande: 160,
  la_colonia: {
    id: 'TUxBQkxBQzYzNDVa',
    name: 'La Colonia',
  },
  alto_verde_jun: 161,
  rodriguez_pena: {
    id: 'TUxBQlJPRDIyODRa',
    name: 'Rodríguez Peña',
  },
  inge_giagnoni: {
    id: 'TUxBQklORzk5Njda',
    name: 'Ingeniero Giagnoni',
  },

  // San Rafael
  '25_de_mayo_villa_veinticinco_de_mayo': {
    id: 'TUxBQjI1RDU4MTNa',
    name: '25 de Mayo',
  },
  barrio_campos_el_toledano: {
    id: 'TUxBQkJBUjMwNDFa',
    name: 'Barrio Campos El Toledano',
  },
  barrio_el_nevado: {
    id: 'TUxBQkJBUjE0NzRa',
    name: 'Barrio El Nevado',
  },
  barrio_empleados_de_comercio: {
    id: 'TUxBQkJBUjMxNjRa',
    name: 'Barrio Empleados de Comercio',
  },
  barrio_intendencia: {
    id: 'TUxBQkJBUjE2ODVa',
    name: 'Barrio Intendencia',
  },
  capitan_montoya: {
    id: 'TUxBQkNBUDUzMjVa',
    name: 'Capitán Montoya',
  },
  cuadro_benegas: {
    id: 'TUxBQkNVQTYzMzNa',
    name: 'Cuadro Benegas',
  },
  el_nihuil: {
    id: 'TUxBQkVMTjIyMDFa',
    name: 'El Nihuil',
  },
  el_sosneado_sr: {
    id: 'TUxBQkVMUzUxMTBa',
    name: 'El Sosneado',
  },
  el_tropezon: {
    id: 'TUxBQkVMVDE0NDJa',
    name: 'El Tropezón',
  },
  goudge: {
    id: 'TUxBQkdPVTkyNDBa',
    name: 'Goudge',
  },
  jaime_prats_sr: {
    id: 'TUxBQkpBSTIwMzZa',
    name: 'Jaime Prats',
  },
  la_llave_nueva: {
    id: 'TUxBQkxBTDgwMTla',
    name: 'La Llave Nueva',
  },
  las_malvinas: {
    id: 'TUxBQkxBUzg4Mzla',
    name: 'Las Malvinas',
  },
  los_reyunos: {
    id: 'TUxBQkxPUzM0Mjda',
    name: 'Los Reyunos',
  },
  monte_coman: {
    id: 'TUxBQk1PTjEwMjVa',
    name: 'Monte Comán',
  },
  pobre_diablo: {
    id: 'TUxBQlBPQjcyNzda',
    name: 'Pobre Diablo',
  },
  punta_del_agua: {
    id: 'TUxBQlBVTjM3MDla',
    name: 'Punta del Agua',
  },
  rama_caida: {
    id: 'TUxBQlJBTTE1OTBa',
    name: 'Rama Caída',
  },
  real_del_padre: {
    id: 'TUxBQlJFQTUwNjNa',
    name: 'Real del Padre',
  },
  salto_de_las_rosas: {
    id: 'TUxBQlNBTDcyMTFa',
    name: 'Salto de las Rosas',
  },
  san_rafael_city: {
    id: 'TUxBQlNBTjYxMzla',
    name: 'San Rafael',
  },
  villa_atuel: {
    id: 'TUxBQlZJTDg5NDJa',
    name: 'Villa Atuel',
  },

  // General Alvear
  general_alvear: {
    id: 'TUxBQkdFTjQwMzha',
    name: 'General Alvear',
  },
  bowen: {
    id: 'TUxBQkJPVzE1MTBa',
    name: 'Bowen',
  },
  carmensa: {
    id: 'TUxBQkNBUjQ2Njha',
    name: 'Carmensa',
  },
  san_pedro_del_atuel: 39,
  colonia_alvear_oeste: 40,
  los_compartos: {
    id: 'TUxBQkxPUzI0MTla',
    name: 'Los Compartos',
  },

  // Malargüe
  agua_escondida: {
    id: 'TUxBQkFHVTYzMzda',
    name: 'Agua Escondida',
  },
  las_lenas: {
    id: 'TUxBQkxBUzY5Mjda',
    name: 'Las Leñas',
  },
  rio_grande: 190,
  malargue_city: {
    id: 'TUxBQk1BTDEzNDVa',
    name: 'Malargüe',
  },

  // Tupungato
  anchoris: 179,
  barrio_belgrano_norte: {
    id: 'TUxBQkJBUjU5Mjha',
    name: 'Barrio Belgrano Norte',
  },
  cordon_del_plata: {
    id: 'TUxBQkNPUjMxOTNa',
    name: 'Cordón del Plata',
  },
  el_peral: {
    id: 'TUxBQkVMUDY5ODBa',
    name: 'El Peral',
  },
  el_zampal: 183,
  la_arboleda: {
    id: 'TUxBQkxBQTM3NzFa',
    name: 'La Arboleda',
  },
  san_jose_tup: {
    id: 'TUxBQlNBTjc0NjJa',
    name: 'San José',
  },
  tupungato_city: {
    id: 'TUxBQlRVUDU0Nzha',
    name: 'Tupungato',
  },
  villa_bastias: 187,

  // Tunuyán
  barrio_san_cayetano: {
    id: 'TUxBQkJBUjI3NTBa',
    name: 'Barrio San Cayetano',
  },
  campo_los_andes: {
    id: 'TUxBQkNBTTE2MjNa',
    name: 'Campo Los Andes',
  },
  colonia_las_rosas: {
    id: 'TUxBQkNPTDQzNTha',
    name: 'Colonia Las Rosas',
  },
  el_manzano: {
    id: 'TUxBQkVMTTYzNTRa',
    name: 'El Manzano',
  },
  los_sauces: {
    id: 'TUxBQkxPUzg5Mjla',
    name: 'Los Sauces',
  },
  tunuyan_city: {
    id: 'TUxBQlRVTjcxMjNa',
    name: 'Tunuyán',
  },
  vista_flores: {
    id: 'TUxBQlZJUzYxNzRa',
    name: 'Vista Flores',
  },

  // San Carlos
  barrio_carrasco: 153,
  barrio_el_cepillo: {
    id: 'TUxBQkJBUjcxMDBa',
    name: 'Barrio El Cepillo',
  },
  chilecito: {
    id: 'TUxBQkNISTc2MDZa',
    name: 'Chilecito',
  },
  eugenio_bustos: {
    id: 'TUxBQkVVRzcwOTVa',
    name: 'Eugenio Bustos',
  },
  la_consulta: {
    id: 'TUxBQkxBQzIzMDRa',
    name: 'La Consulta',
  },
  pareditas_sc: {
    id: 'TUxBQlBBUjU0OTZa',
    name: 'Pareditas',
  },
  san_carlos_city: {
    id: 'TUxBQlNBTjYyMDVa',
    name: 'San Carlos',
  },

  // Lavalle
  '3_de_mayo': {
    id: 'TUxBQjNERTI0NDZa',
    name: '3 de Mayo',
  },
  barrio_alto_del_olvido: {
    id: 'TUxBQkJBUjcxMzda',
    name: 'Barrio Alto del Olvido',
  },
  barrio_jocoli_ii: {
    id: 'TUxBQkJBUjc2NDRa',
    name: 'Barrio Jocolí II',
  },
  barrio_lagunas_de_bartoluzzi: {
    id: 'TUxBQkJBUjE4OTla',
    name: 'Barrio Lagunas de Bartoluzzi',
  },
  barrio_la_palmera: {
    id: 'TUxBQkJBUjM0NDha',
    name: 'Barrio La Palmera',
  },
  barrio_la_pega: {
    id: 'TUxBQkJBUjkzMzha',
    name: 'Barrio La Pega',
  },
  barrio_los_jarilleros: {
    id: 'TUxBQkJBUjkwNDBa',
    name: 'Barrio Los Jarilleros',
  },
  barrio_los_olivos: {
    id: 'TUxBQkJBUjY4MDVa',
    name: 'Barrio Los Olivos',
  },
  barrio_virgen_del_rosario: 99,
  costa_de_araujo: {
    id: 'TUxBQkNPUzYzMzla',
    name: 'Costa de Araujo',
  },
  el_paramillo: {
    id: 'TUxBQkVMUDYzNzBa',
    name: 'El Paramillo',
  },
  el_vergel: {
    id: 'TUxBQkVMVjQ1Mjda',
    name: 'El Vergel',
  },
  ingeniero_gustavo_andre: {
    id: 'TUxBQklORzYzODJa',
    name: 'Ingeniero Gustavo André',
  },
  jocoli_lav: {
    id: 'TUxBQkpPQzk5OTRa',
    name: 'Jocolí',
  },
  jocoli_viejo: {
    id: 'TUxBQkpPQzQzMjZa',
    name: 'Jocolí Viejo',
  },
  las_violetas: {
    id: 'TUxBQkxBUzk4NjNa',
    name: 'Las Violetas',
  },
  villa_tulumaya: {
    id: 'TUxBQlZJTDgxODFa',
    name: 'Villa Tulumaya',
  },

  // Santa Rosa
  barrio_12_de_octubre: {
    id: 'TUxBQkJBUjE3NzRa',
    name: 'Barrio 12 de Octubre',
  },
  barrio_maria_auxiliadora: {
    id: 'TUxBQkJBUjIwODJa',
    name: 'Barrio María Auxiliadora',
  },
  barrio_molina_cabrera: {
    id: 'TUxBQkJBUjEzMzha',
    name: 'Barrio Molina Cabrera',
  },
  la_dormida: {
    id: 'TUxBQkxBRDEyOTJa',
    name: 'La Dormida',
  },
  las_catitas: {
    id: 'TUxBQkxBUzYxMzla',
    name: 'Las Catitas',
  },
  santa_rosa_city: {
    id: 'TUxBQlNBTjEzNjZa',
    name: 'Santa Rosa',
  },

  // La Paz
  villa_antigua: {
    id: 'TUxBQlZJTDEzODZa',
    name: 'Villa Antigua',
  },
  desaguadero: {
    id: 'TUxBQkRFUzYyOTNa',
    name: 'Desaguadero',
  },
  la_paz_city: {
    id: 'TUxBQkxBUDU3ODha',
    name: 'La Paz',
  },
}

// Servicios/Amenities
export const amenityServicesMappings: MercadoLibreMappins = {
  barrio_abierto: 'barrio-abierto',
  barrio_privado: 'barrio-privado',
  aire_acondicionado: 'aire-acondicionado',
  internet_wifi: 'internet-wifi',
  financiacion: 'financiacion',
  piscina: 'piscina',
  jacuzzi: 'jacuzzi',
  apto_credito_hipotecario: 'apto-credito-hipotecario',
  cable_tv: 'cable-tv',
  calefaccion_central: 'calefaccion-central',
  permite_mascotas: 'permite-mascotas',
  ofrece_financiacion: 'ofrece-financiacion',
  telefono: 'telefono',
  uso_comercial: 'uso-comercial',
  agua_corriente: 'agua-corriente',
  alumbrado_publico: 'alumbrado-publico',
  cisterna: 'cisterna',
  desague_cloacal: 'desague-cloacal',
  energia_solar: 'energia-solar',
  gas_natural: 'gas-natural',
  luz: 'luz',
  camaras_cctv: 'camaras-cctv',
  alarma: 'alarma',
}

// Ambientes/Amenities
export const amenityEnvironmentsMappings: MercadoLibreMappins = {
  parrilla: 'parrilla',
  balcon: 'balcon',
  patio: 'patio',
  desayunador: 'desayunador',
  cocina: 'cocina',
  dormitorio_en_suite: 'dormitorio-en-suite',
  escritorio: 'escritorio',
  estudio: 'estudio',
  comedor: 'comedor',
  jardin: 'jardin',
  living: 'living',
  living_comedor: 'living-comedor',
  seguridad: 'seguridad',
  cowork: 'cowork',
  gimnasio: 'gimnasio',
  ascensor: 'ascensor',
  club_house: 'club-house',
  quincho: 'quincho',
  area_de_cine: 'area-de-cine',
  area_de_juegos_infantiles: 'area-de-juegos-infantiles',
  area_verde: 'area-verde',
  chimenea: 'chimenea',
  dependencia_de_servicio: 'dependencia-de-servicio',
  estacionamiento_para_visitantes: 'estacionamiento-para-visitantes',
  porton_automatico: 'porton-automatico',
  rampa_para_silla_de_ruedas: 'rampa-para-silla-de-ruedas',
  salon_de_usos_multiples: 'salon-de-usos-multiples',
  sauna: 'sauna',
  terraza: 'terraza',
}

// Zonas cercanas/Amenities
export const amenityNearbyZonesMappings: MercadoLibreMappins = {
  colegios: 'colegios',
  universidades: 'universidades',
  guarderias: 'guarderias',
  hospitales: 'hospitales',
  centros_de_salud: 'centros-de-salud',
  centro_comercial: 'centro-comercial',
  shopping: 'shopping',
  supermercados: 'supermercados',
  club_deportivo: 'club-deportivo',
  zona_deportiva: 'zona-deportiva',
  ciclovia: 'ciclovia',
  paradas_de_colectivo: 'paradas-de-colectivo',
  estacion_de_tren: 'estacion-de-tren',
  estacion_de_subte: 'estacion-de-subte',
  parque: 'parque',
  plaza: 'plaza',
}

// Objeto principal con todos los mapeos
export const mercadolibreMappings = {
  condition: conditionMappings,
  propertyType: propertyTypeMappings,
  conservationStatus: conservationStatusMappings,
  orientation: orientationMappings,
  garageType: garageTypeMappings,
  currency: currencyMappings,
  furnished: furnishedMappings,
  antiquity: antiquityMappings,
  department: departmentMappings,
  locality: localityMappings,
  amenityServices: amenityServicesMappings,
  amenityEnvironments: amenityEnvironmentsMappings,
  amenityNearbyZones: amenityNearbyZonesMappings,
}
export const mendoza = 21
