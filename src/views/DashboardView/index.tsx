'use client'

import React, { useState, useEffect, useRef } from 'react'
import './styles.scss'

// Declarar Chart como global para TypeScript
declare global {
  interface Window {
    Chart: any
  }
}

interface MonthData {
  earnings: { ars: number; usd: number }
  salesCommission: { ars: number; usd: number }
  rentalCommission: { ars: number; usd: number }
  propertiesAdded: number
  propertiesSold: number
  propertiesRented: number
  activeListings: number
}

interface DashboardData {
  currentYear: number
  totalProperties: number
  newPropertiesThisYear: number
  totalEarningsThisYear: { ars: number; usd: number }
  monthlyData: {
    [year: number]: {
      [month: string]: MonthData
    }
  }
}

interface ContractData {
  id: string
  type: 'venta' | 'alquiler'
  ownerFee: number
  ownerFeeCurrency: 'USD' | 'ARS'
  buyerFee: number
  buyerFeeCurrency: 'USD' | 'ARS'
  signDate: string
  createdAt: string
  property: any
}

// Inicializar estructura de datos vacía
const initialDashboardData: DashboardData = {
  currentYear: 2025,
  totalProperties: 0,
  newPropertiesThisYear: 0,
  totalEarningsThisYear: { ars: 0, usd: 0 },
  monthlyData: {},
}

export default function DashboardView() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)

  // Función para obtener colores CSS del tema
  const getChartColors = () => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    return {
      primary: computedStyle.getPropertyValue('--chart-primary').trim() || '#000000',
      secondary: computedStyle.getPropertyValue('--chart-secondary').trim() || '#e5e7eb',
      border: computedStyle.getPropertyValue('--chart-border').trim() || '#000000',
      borderSecondary:
        computedStyle.getPropertyValue('--chart-border-secondary').trim() || '#d1d5db',
      grid: computedStyle.getPropertyValue('--chart-grid').trim() || '#f3f4f6',
      text: computedStyle.getPropertyValue('--chart-text').trim() || '#374151',
    }
  }

  // Colores y estilos para el gráfico (usando variables CSS)
  const chartColors = getChartColors()

  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]

  const monthNames = {
    enero: 'Enero',
    febrero: 'Febrero',
    marzo: 'Marzo',
    abril: 'Abril',
    mayo: 'Mayo',
    junio: 'Junio',
    julio: 'Julio',
    agosto: 'Agosto',
    septiembre: 'Septiembre',
    octubre: 'Octubre',
    noviembre: 'Noviembre',
    diciembre: 'Diciembre',
  }

  // Funciones de utilidad
  const formatCurrency = (amount: number, currency = 'ARS') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-AR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace('US$', '$')
    } else {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      // .replace('ARS', '$')
    }
  }

  const formatDualCurrency = (amounts: { ars: number; usd: number }) => {
    if (!amounts) return formatCurrency(0, 'ARS')

    const usdAmount = amounts.usd || 0
    const arsAmount = amounts.ars || 0

    if (usdAmount > 0 && arsAmount > 0) {
      return `${formatCurrency(usdAmount, 'USD')} / ${formatCurrency(arsAmount, 'ARS')}`
    } else if (usdAmount > 0) {
      return formatCurrency(usdAmount, 'USD')
    } else if (arsAmount > 0) {
      return formatCurrency(arsAmount, 'ARS')
    } else {
      return formatCurrency(0, 'ARS')
    }
  }

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('es-AR').format(number)
  }

  const calculateYearlyTotals = (year: number) => {
    if (!dashboardData?.monthlyData[year]) {
      return {
        earnings: { ars: 0, usd: 0 },
        properties: 0,
      }
    }

    return calculateYearlyTotalsFromData(dashboardData.monthlyData[year])
  }

  // Función para obtener contratos de la API
  const fetchContracts = async (year: number) => {
    try {
      const startDate = `${year}-01-01T00:00:00.000Z`
      const endDate = `${year + 1}-01-01T00:00:00.000Z`
      const url = `/api/contratos?limit=1000&where[signDate][greater_than_equal]=${startDate}&where[signDate][less_than]=${endDate}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al obtener contratos')
      }

      const result = await response.json()
      return result.docs || []
    } catch (error) {
      console.error('Error fetching contracts:', error)
      return []
    }
  }

  // Función para obtener propiedades totales
  const fetchTotalProperties = async () => {
    try {
      const response = await fetch('/api/propiedades?limit=1')
      if (!response.ok) {
        throw new Error('Error al obtener propiedades')
      }

      const result = await response.json()
      return result.totalDocs || 0
    } catch (error) {
      console.error('Error fetching total properties:', error)
      return 0
    }
  }

  // Función para obtener propiedades creadas en un año específico
  const fetchPropertiesByYear = async (year: number) => {
    try {
      const startDate = `${year}-01-01T00:00:00.000Z`
      const endDate = `${year + 1}-01-01T00:00:00.000Z`
      const url = `/api/propiedades?limit=1000&where[createdAt][greater_than_equal]=${startDate}&where[createdAt][less_than]=${endDate}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al obtener propiedades')
      }

      const result = await response.json()
      return result.docs || []
    } catch (error) {
      console.error('Error fetching properties by year:', error)
      return []
    }
  }

  // Función para procesar contratos y propiedades, y generar datos del dashboard
  const processContractsData = (contracts: ContractData[], properties: any[], year: number) => {
    const monthNames = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ]

    // Inicializar datos mensuales
    const monthlyData: { [month: string]: MonthData } = {}
    monthNames.forEach((month) => {
      monthlyData[month] = {
        earnings: { ars: 0, usd: 0 },
        salesCommission: { ars: 0, usd: 0 },
        rentalCommission: { ars: 0, usd: 0 },
        propertiesAdded: 0,
        propertiesSold: 0,
        propertiesRented: 0,
        activeListings: 0,
      }
    })

    // Procesar contratos para comisiones y ventas/alquileres
    contracts.forEach((contract) => {
      const signDate = new Date(contract.signDate)
      const contractYear = signDate.getFullYear()

      if (contractYear !== year) return

      const month = monthNames[signDate.getMonth()]
      if (!monthlyData[month]) return

      // Obtener honorarios del propietario y comprador/inquilino
      const ownerFee = contract.ownerFee || 0
      const buyerFee = contract.buyerFee || 0
      const ownerFeeCurrency = (contract.ownerFeeCurrency || 'ARS').toUpperCase()
      const buyerFeeCurrency = (contract.buyerFeeCurrency || 'ARS').toUpperCase()

      // Calcular total de honorarios por moneda
      let totalFeesARS = 0
      let totalFeesUSD = 0

      // Sumar honorarios del propietario
      if (ownerFeeCurrency === 'ARS') {
        totalFeesARS += ownerFee
      } else if (ownerFeeCurrency === 'USD') {
        totalFeesUSD += ownerFee
      }

      // Sumar honorarios del comprador/inquilino
      if (buyerFeeCurrency === 'ARS') {
        totalFeesARS += buyerFee
      } else if (buyerFeeCurrency === 'USD') {
        totalFeesUSD += buyerFee
      }

      // Agregar comisiones según el tipo de contrato
      if (contract.type === 'venta') {
        monthlyData[month].propertiesSold += 1
        monthlyData[month].salesCommission.ars += totalFeesARS
        monthlyData[month].salesCommission.usd += totalFeesUSD
        monthlyData[month].earnings.ars += totalFeesARS
        monthlyData[month].earnings.usd += totalFeesUSD
      } else if (contract.type === 'alquiler') {
        monthlyData[month].propertiesRented += 1
        monthlyData[month].rentalCommission.ars += totalFeesARS
        monthlyData[month].rentalCommission.usd += totalFeesUSD
        monthlyData[month].earnings.ars += totalFeesARS
        monthlyData[month].earnings.usd += totalFeesUSD
      }
    })

    // Procesar propiedades para contar las agregadas por mes
    properties.forEach((property) => {
      const createdDate = new Date(property.createdAt)
      const propertyYear = createdDate.getFullYear()

      if (propertyYear !== year) return

      const month = monthNames[createdDate.getMonth()]
      if (monthlyData[month]) {
        monthlyData[month].propertiesAdded += 1
      }
    })

    return monthlyData
  }

  // Función para cargar datos de un año específico
  const loadYearData = async (year: number) => {
    try {
      setIsLoading(true)

      // Si ya tenemos datos para este año, no volver a cargar
      if (dashboardData.monthlyData[year]) {
        setIsLoading(false)
        return
      }

      // Obtener contratos y propiedades del año específico
      const [contracts, properties] = await Promise.all([
        fetchContracts(year),
        fetchPropertiesByYear(year),
      ])

      // Procesar datos del año
      const yearData = processContractsData(contracts, properties, year)

      // Actualizar datos del dashboard
      setDashboardData((prev) => ({
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [year]: yearData,
        },
      }))
    } catch (error) {
      console.error('Error loading year data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar datos iniciales del dashboard
  const loadInitialDashboardData = async () => {
    try {
      setIsLoading(true)

      const currentYear = new Date().getFullYear()

      // Obtener datos en paralelo
      const [totalProperties, contracts, properties] = await Promise.all([
        fetchTotalProperties(),
        fetchContracts(currentYear),
        fetchPropertiesByYear(currentYear),
      ])

      // Procesar datos para el año actual
      const yearData = processContractsData(contracts, properties, currentYear)

      // Calcular totales del año actual
      const currentYearTotals = calculateYearlyTotalsFromData(yearData)

      // Crear estructura de datos inicial
      const processedData: DashboardData = {
        currentYear,
        totalProperties,
        newPropertiesThisYear: currentYearTotals.properties,
        totalEarningsThisYear: currentYearTotals.earnings,
        monthlyData: {
          [currentYear]: yearData,
        },
      }

      setDashboardData(processedData)
      setCurrentYear(currentYear)
    } catch (error) {
      console.error('Error loading initial dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función auxiliar para calcular totales de un año específico
  const calculateYearlyTotalsFromData = (yearData: { [month: string]: MonthData }) => {
    let totalEarningsARS = 0
    let totalEarningsUSD = 0
    let totalProperties = 0

    if (!yearData) {
      return {
        earnings: { ars: 0, usd: 0 },
        properties: 0,
      }
    }

    Object.values(yearData).forEach((month) => {
      if (month && month.earnings) {
        totalEarningsARS += month.earnings.ars || 0
        totalEarningsUSD += month.earnings.usd || 0
      }
      totalProperties += month?.propertiesAdded || 0
    })

    return {
      earnings: { ars: totalEarningsARS, usd: totalEarningsUSD },
      properties: totalProperties,
    }
  }

  const yearTotals = calculateYearlyTotals(currentYear)
  const monthData = selectedMonth ? dashboardData.monthlyData[currentYear]?.[selectedMonth] : null

  const changeYear = async (direction: number) => {
    const newYear = currentYear + direction
    const currentActualYear = new Date().getFullYear()

    // No permitir navegar a años futuros
    if (newYear > currentActualYear) {
      return
    }

    setCurrentYear(newYear)

    // Cargar datos del nuevo año si no los tenemos
    await loadYearData(newYear)
  }

  const selectMonth = (month: string) => {
    // Si el mes ya está seleccionado, deseleccionarlo para mostrar vista anual
    if (selectedMonth === month) {
      setSelectedMonth(null)
    } else {
      setSelectedMonth(month)
    }
  }

  const createEarningsChart = () => {
    if (!chartRef.current || !window.Chart) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const yearData = dashboardData.monthlyData[currentYear]
    if (!yearData) {
      console.log('No year data available for', currentYear)
      return
    }

    // Obtener colores actualizados del CSS
    const colors = getChartColors()

    const earnings = months.map((month) => {
      const monthData = yearData[month]
      if (!monthData) return 0

      // Asegurar que los valores sean números válidos
      const arsValue = monthData.earnings?.ars || 0
      const usdValue = monthData.earnings?.usd || 0

      // Convertir USD a ARS para el gráfico (usando una tasa aproximada)
      const totalEarnings = arsValue + usdValue * 1000 // Ajustada la tasa para mejor visualización

      return totalEarnings
    })

    console.log('Chart earnings data:', earnings)
    console.log('Year data:', yearData)

    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: months.map((month) => monthNames[month as keyof typeof monthNames]),
        datasets: [
          {
            label: 'Ganancias Mensuales',
            data: earnings,
            backgroundColor: months.map((month) =>
              month === selectedMonth ? colors.primary : colors.secondary,
            ),
            borderColor: months.map((month) =>
              month === selectedMonth ? colors.border : colors.borderSecondary,
            ),
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const monthData = yearData[months[context.dataIndex]]
                if (!monthData || !monthData.earnings) return 'Sin datos'

                const arsValue = monthData.earnings.ars || 0
                const usdValue = monthData.earnings.usd || 0

                return [
                  `USD: ${formatCurrency(usdValue, 'USD')}`,
                  `ARS: ${formatCurrency(arsValue, 'ARS')}`,
                  `Total: ${formatDualCurrency(monthData.earnings)}`,
                ]
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value: any) {
                return formatCurrency(value, 'ARS')
              },
              color: colors.text,
            },
            grid: {
              color: colors.grid,
            },
          },
          x: {
            ticks: {
              color: colors.text,
            },
            grid: {
              display: false,
            },
          },
        },
        onClick: (event: any, elements: any) => {
          if (elements.length > 0) {
            const index = elements[0].index
            selectMonth(months[index])
          }
        },
      },
    })
  }

  // Cargar Chart.js y crear el gráfico
  useEffect(() => {
    const loadChartJS = async () => {
      if (!window.Chart) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
        script.onload = () => {
          createEarningsChart()
        }
        document.head.appendChild(script)
      } else {
        createEarningsChart()
      }
    }

    loadChartJS()

    // Cleanup al desmontar el componente
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [])

  // Cargar datos del dashboard al inicializar
  useEffect(() => {
    loadInitialDashboardData()
  }, [])

  // Recrear gráfico cuando cambien el año o mes seleccionado
  useEffect(() => {
    if (window.Chart && !isLoading) {
      createEarningsChart()
    }
  }, [currentYear, selectedMonth, dashboardData, isLoading])

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__content">
          <main className="dashboard__main">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '1.2rem',
                color: '#6b7280',
              }}
            >
              Cargando datos del dashboard...
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <main className="dashboard__main">
          {/* Métricas Principales */}
          <div className="dashboard__metrics">
            <div className="dashboard__metric-card">
              <div className="dashboard__metric-content">
                <div className="dashboard__metric-icon">
                  <div className="dashboard__metric-icon-bg">🏠</div>
                </div>
                <div className="dashboard__metric-info">
                  <p className="dashboard__metric-label">Total Propiedades</p>
                  <p className="dashboard__metric-value">
                    {formatNumber(dashboardData.totalProperties)}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard__metric-card">
              <div className="dashboard__metric-content">
                <div className="dashboard__metric-icon">
                  <div className="dashboard__metric-icon-bg">➕</div>
                </div>
                <div className="dashboard__metric-info">
                  <p className="dashboard__metric-label">Nuevas en {currentYear}</p>
                  <p className="dashboard__metric-value">{formatNumber(yearTotals.properties)}</p>
                </div>
              </div>
            </div>

            <div className="dashboard__metric-card">
              <div className="dashboard__metric-content">
                <div className="dashboard__metric-icon">
                  <div className="dashboard__metric-icon-bg">💰</div>
                </div>
                <div className="dashboard__metric-info">
                  <p className="dashboard__metric-label">Ganancias {currentYear} (USD/ARS)</p>
                  <p className="dashboard__metric-value">
                    {formatDualCurrency(yearTotals.earnings)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Ganancias Mensuales */}
          <div className="dashboard__chart-section">
            <div className="dashboard__chart-header">
              <h2 className="dashboard__chart-title">Ganancias Mensuales</h2>
              <div className="dashboard__year-controls">
                <button
                  className="dashboard__year-btn"
                  onClick={() => changeYear(-1)}
                  disabled={isLoading}
                >
                  ‹ {currentYear - 1}
                </button>
                <span className="dashboard__current-year">{currentYear}</span>
                <button
                  className="dashboard__year-btn"
                  onClick={() => changeYear(1)}
                  disabled={isLoading || currentYear >= new Date().getFullYear()}
                >
                  {currentYear + 1} ›
                </button>
              </div>
            </div>

            <div className="dashboard__chart-container">
              {isLoading ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    fontSize: '1rem',
                    color: '#6b7280',
                  }}
                >
                  Cargando datos de {currentYear}...
                </div>
              ) : (
                <canvas ref={chartRef} className="dashboard__chart-canvas"></canvas>
              )}
            </div>
          </div>

          {/* Selector de Mes y Detalles */}
          <div className="dashboard__details-section">
            {/* Detalles del Mes Seleccionado o Datos Anuales */}
            <div className="dashboard__month-details">
              {selectedMonth ? (
                monthData && (
                  <>
                    <h3 className="dashboard__section-title">
                      Detalles de {monthNames[selectedMonth as keyof typeof monthNames]}{' '}
                      {currentYear}
                      <button
                        className="dashboard__view-annual-btn"
                        onClick={() => setSelectedMonth(null)}
                      >
                        Ver datos anuales
                      </button>
                    </h3>

                    {/* Honorarios */}
                    <div className="dashboard__detail-metrics">
                      <div className="dashboard__detail-card dashboard__detail-card--sales">
                        <h4>Comisiones Ventas (USD/ARS)</h4>
                        <p>{formatDualCurrency(monthData.salesCommission)}</p>
                      </div>

                      <div className="dashboard__detail-card dashboard__detail-card--rental">
                        <h4>Comisiones Alquileres (USD/ARS)</h4>
                        <p>{formatDualCurrency(monthData.rentalCommission)}</p>
                      </div>

                      <div className="dashboard__detail-card dashboard__detail-card--total">
                        <h4>Total del Mes (USD/ARS)</h4>
                        <p>{formatDualCurrency(monthData.earnings)}</p>
                      </div>
                    </div>

                    {/* Estadísticas de Propiedades */}
                    <div className="dashboard__property-stats">
                      <h3 className="dashboard__section-title">Estadísticas de Propiedades</h3>
                      <div className="dashboard__stats-grid">
                        <div className="dashboard__stat-item">
                          <div className="dashboard__stat-content">
                            <span className="dashboard__stat-label">Propiedades Agregadas</span>
                            <span className="dashboard__stat-value">
                              {formatNumber(monthData.propertiesAdded)}
                            </span>
                          </div>
                        </div>
                        <div className="dashboard__stat-item">
                          <div className="dashboard__stat-content">
                            <span className="dashboard__stat-label">Propiedades Vendidas</span>
                            <span className="dashboard__stat-value">
                              {formatNumber(monthData.propertiesSold)}
                            </span>
                          </div>
                        </div>
                        <div className="dashboard__stat-item">
                          <div className="dashboard__stat-content">
                            <span className="dashboard__stat-label">Propiedades Alquiladas</span>
                            <span className="dashboard__stat-value">
                              {formatNumber(monthData.propertiesRented)}
                            </span>
                          </div>
                        </div>
                        <div className="dashboard__stat-item">
                          <div className="dashboard__stat-content">
                            <span className="dashboard__stat-label">Listings Activos</span>
                            <span className="dashboard__stat-value">
                              {formatNumber(monthData.activeListings)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              ) : (
                // Vista anual cuando no hay mes seleccionado
                <>
                  <h3 className="dashboard__section-title">
                    Resumen Anual {currentYear}
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 'normal',
                        marginLeft: '0.5rem',
                        color: 'var(--theme-text-dimmed)',
                      }}
                    >
                      (Haz clic en una barra del gráfico para ver detalles mensuales)
                    </span>
                  </h3>

                  {(() => {
                    const yearData = dashboardData.monthlyData[currentYear]
                    if (!yearData) return <p>No hay datos para {currentYear}</p>

                    // Calcular totales anuales por categoría
                    let totalSalesCommissionARS = 0
                    let totalSalesCommissionUSD = 0
                    let totalRentalCommissionARS = 0
                    let totalRentalCommissionUSD = 0
                    let totalPropertiesAdded = 0
                    let totalPropertiesSold = 0
                    let totalPropertiesRented = 0

                    Object.values(yearData).forEach((month) => {
                      totalSalesCommissionARS += month?.salesCommission?.ars || 0
                      totalSalesCommissionUSD += month?.salesCommission?.usd || 0
                      totalRentalCommissionARS += month?.rentalCommission?.ars || 0
                      totalRentalCommissionUSD += month?.rentalCommission?.usd || 0
                      totalPropertiesAdded += month?.propertiesAdded || 0
                      totalPropertiesSold += month?.propertiesSold || 0
                      totalPropertiesRented += month?.propertiesRented || 0
                    })

                    return (
                      <>
                        {/* Honorarios Anuales */}
                        <div className="dashboard__detail-metrics">
                          <div className="dashboard__detail-card dashboard__detail-card--sales">
                            <h4>Comisiones Ventas Anuales (USD/ARS)</h4>
                            <p>
                              {formatDualCurrency({
                                ars: totalSalesCommissionARS,
                                usd: totalSalesCommissionUSD,
                              })}
                            </p>
                          </div>

                          <div className="dashboard__detail-card dashboard__detail-card--rental">
                            <h4>Comisiones Alquileres Anuales (USD/ARS)</h4>
                            <p>
                              {formatDualCurrency({
                                ars: totalRentalCommissionARS,
                                usd: totalRentalCommissionUSD,
                              })}
                            </p>
                          </div>

                          <div className="dashboard__detail-card dashboard__detail-card--total">
                            <h4>Total del Año (USD/ARS)</h4>
                            <p>{formatDualCurrency(yearTotals.earnings)}</p>
                          </div>
                        </div>

                        {/* Estadísticas Anuales de Propiedades */}
                        <div className="dashboard__property-stats">
                          <h3 className="dashboard__section-title">
                            Estadísticas Anuales de Propiedades
                          </h3>
                          <div className="dashboard__stats-grid">
                            <div className="dashboard__stat-item">
                              <div className="dashboard__stat-content">
                                <span className="dashboard__stat-label">Propiedades Agregadas</span>
                                <span className="dashboard__stat-value">
                                  {formatNumber(totalPropertiesAdded)}
                                </span>
                              </div>
                            </div>
                            <div className="dashboard__stat-item">
                              <div className="dashboard__stat-content">
                                <span className="dashboard__stat-label">Propiedades Vendidas</span>
                                <span className="dashboard__stat-value">
                                  {formatNumber(totalPropertiesSold)}
                                </span>
                              </div>
                            </div>
                            <div className="dashboard__stat-item">
                              <div className="dashboard__stat-content">
                                <span className="dashboard__stat-label">
                                  Propiedades Alquiladas
                                </span>
                                <span className="dashboard__stat-value">
                                  {formatNumber(totalPropertiesRented)}
                                </span>
                              </div>
                            </div>
                            <div className="dashboard__stat-item">
                              <div className="dashboard__stat-content">
                                <span className="dashboard__stat-label">Total Operaciones</span>
                                <span className="dashboard__stat-value">
                                  {formatNumber(totalPropertiesSold + totalPropertiesRented)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
