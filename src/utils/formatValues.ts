// numebrs
export function formatPrice(num: number): string {
  return num.toLocaleString('es-AR') // agrega puntos cada 3 cifras
}

export function calculateFee(price: number, fee: number): number {
  return (fee / price) * 100
}

// dates
export function fechaLarga(fecha: Date): string {
  const date = new Date(fecha)
  const formatter = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // "21 de agosto de 2025"
  const partes = formatter.formatToParts(date)

  // Filtramos y unimos solo lo que queremos
  return partes
    .filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map((p) => p.value)
    .join(' ')
}

export function fechaCorta(fecha: Date): string {
  const date = new Date(fecha)
  const formatter = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  // "21 de agosto de 2025"
  return formatter.format(date)
}

export const calculateTimeOnMarket = (publishedDate: string): string => {
  if (!publishedDate) return 'No disponible'

  const published = new Date(publishedDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - published.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 día'
  if (diffDays < 30) return `${diffDays} días`
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    const remainingDays = diffDays % 30
    if (months === 1 && remainingDays === 0) return '1 mes'
    if (remainingDays === 0) return `${months} meses`
    return `${months} ${months === 1 ? 'mes' : 'meses'} y ${remainingDays} ${remainingDays === 1 ? 'día' : 'días'}`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingDays = diffDays % 365
    if (years === 1 && remainingDays === 0) return '1 año'
    if (remainingDays === 0) return `${years} años`
    const months = Math.floor(remainingDays / 30)
    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`
  }
}

export function daysBetween(fecha1: Date, fecha2: Date): number {
  // Asegurarse que fecha1 sea la menor
  const inicio = new Date(fecha1)
  const fin = new Date(fecha2)

  // Diferencia en milisegundos
  const diffMs = fin.getTime() - inicio.getTime()

  // Pasar a días
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
