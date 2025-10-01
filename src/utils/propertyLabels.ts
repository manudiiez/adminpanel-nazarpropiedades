// Funciones utilitarias para obtener labels de las opciones de propiedades

import { propertySelectOptions, type SelectOption } from '@/data/propertyOptions'

/**
 * Función genérica para obtener el label de un value en cualquier conjunto de opciones
 */
function getLabelByValue(options: SelectOption[], value: string): string {
  const option = options.find((opt) => opt.value === value)
  return option?.label || value // Si no encuentra el value, devuelve el value original
}

/**
 * Obtiene el label para el tipo de propiedad
 */
export function getPropertyTypeLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.type, value)
}

/**
 * Obtiene el label para la condición (venta/alquiler)
 */
export function getConditionLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.condition, value)
}

/**
 * Obtiene el label para la moneda
 */
export function getCurrencyLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.currency, value)
}

/**
 * Obtiene el label para el estado de conservación
 */
export function getConservationStatusLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.conservationStatus, value)
}

/**
 * Obtiene el label para la orientación
 */
export function getOrientationLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.orientation, value)
}

/**
 * Obtiene el label para el tipo de cochera
 */
export function getGarageTypeLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.garageType, value)
}

/**
 * Obtiene el label para la privacidad de ubicación
 */
export function getLocationPrivacyLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.locationPrivacy, value)
}

/**
 * Obtiene el label para amueblado
 */
export function getFurnishedLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.furnished, value)
}

/**
 * Obtiene el label para antigüedad
 */
export function getAntiquityLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.antiquity, value)
}

/**
 * Obtiene el label para departamento
 */
export function getDepartmentLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.department, value)
}

/**
 * Obtiene el label para localidad
 */
export function getLocalityLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.locality, value)
}

/**
 * Obtiene el label para servicios/amenities
 */
export function getAmenityServiceLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.amenityServices, value)
}

/**
 * Obtiene el label para ambientes/amenities
 */
export function getAmenityEnvironmentLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.amenityEnvironments, value)
}

/**
 * Obtiene el label para zonas cercanas/amenities
 */
export function getAmenityNearbyZoneLabel(value: string): string {
  return getLabelByValue(propertySelectOptions.amenityNearbyZones, value)
}

/**
 * Obtiene múltiples labels para arrays de valores (útil para amenities)
 */
export function getMultipleLabels(options: SelectOption[], values: string[]): string[] {
  return values.map((value) => getLabelByValue(options, value))
}

/**
 * Obtiene múltiples labels para amenities de servicios
 */
export function getAmenityServicesLabels(values: string[]): string[] {
  return getMultipleLabels(propertySelectOptions.amenityServices, values)
}

/**
 * Obtiene múltiples labels para amenities de ambientes
 */
export function getAmenityEnvironmentsLabels(values: string[]): string[] {
  return getMultipleLabels(propertySelectOptions.amenityEnvironments, values)
}

/**
 * Obtiene múltiples labels para amenities de zonas cercanas
 */
export function getAmenityNearbyZonesLabels(values: string[]): string[] {
  return getMultipleLabels(propertySelectOptions.amenityNearbyZones, values)
}

/**
 * Función genérica que puede manejar cualquier campo de propiedad
 */
export function getPropertyFieldLabel(
  fieldName: keyof typeof propertySelectOptions,
  value: string,
): string {
  const options = propertySelectOptions[fieldName]
  if (!options) {
    console.warn(`Campo '${fieldName}' no encontrado en propertySelectOptions`)
    return value
  }
  return getLabelByValue(options, value)
}

/**
 * Función de utilidad para formatear valores de moneda con su label
 */
export function formatCurrencyWithLabel(amount: number, currencyValue: string): string {
  const currencyLabel = getCurrencyLabel(currencyValue)
  return `${currencyLabel} ${amount.toLocaleString()}`
}

/**
 * Función de utilidad para obtener el símbolo de moneda
 */
export function getCurrencySymbol(currencyValue: string): string {
  const symbols: Record<string, string> = {
    usd: '$',
    ars: '$',
    USD: '$', // Compatibilidad con formato legacy
    ARS: '$',
  }
  return symbols[currencyValue] || currencyValue
}

// Objeto con todas las funciones para fácil importación
export const propertyLabels = {
  type: getPropertyTypeLabel,
  condition: getConditionLabel,
  currency: getCurrencyLabel,
  conservationStatus: getConservationStatusLabel,
  orientation: getOrientationLabel,
  garageType: getGarageTypeLabel,
  locationPrivacy: getLocationPrivacyLabel,
  furnished: getFurnishedLabel,
  antiquity: getAntiquityLabel,
  department: getDepartmentLabel,
  locality: getLocalityLabel,
  amenityService: getAmenityServiceLabel,
  amenityEnvironment: getAmenityEnvironmentLabel,
  amenityNearbyZone: getAmenityNearbyZoneLabel,
  amenityServicesMultiple: getAmenityServicesLabels,
  amenityEnvironmentsMultiple: getAmenityEnvironmentsLabels,
  amenityNearbyZonesMultiple: getAmenityNearbyZonesLabels,
  formatCurrency: formatCurrencyWithLabel,
  getCurrencySymbol,
  getFieldLabel: getPropertyFieldLabel,
}
