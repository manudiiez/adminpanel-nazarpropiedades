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
  const [isChartLoading, setIsChartLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [currentSemester, setCurrentSemester] = useState(0) // 0 para primer semestre, 1 para segundo
  const [allContracts, setAllContracts] = useState<ContractData[]>([])
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

  const monthNamesShort = {
    enero: 'Ene',
    febrero: 'Feb',
    marzo: 'Mar',
    abril: 'Abr',
    mayo: 'May',
    junio: 'Jun',
    julio: 'Jul',
    agosto: 'Ago',
    septiembre: 'Sep',
    octubre: 'Oct',
    noviembre: 'Nov',
    diciembre: 'Dic',
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
      setIsChartLoading(true)

      // Siempre cargar contratos del año solicitado para la lista
      const [contracts, properties] = await Promise.all([
        fetchContracts(year),
        fetchPropertiesByYear(year),
      ])

      // Actualizar contratos del año seleccionado
      setAllContracts(contracts)

      // Solo procesar datos del dashboard si no los tenemos ya
      if (!dashboardData.monthlyData[year]) {
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
      }
    } catch (error) {
      console.error('Error loading year data:', error)
    } finally {
      setIsChartLoading(false)
    }
  }

  // Función para cargar datos iniciales del dashboard
  const loadInitialDashboardData = async () => {
    try {
      setIsChartLoading(true)

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
      setAllContracts(contracts) // Almacenar todos los contratos
    } catch (error) {
      console.error('Error loading initial dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsChartLoading(false)
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

  const changeSemester = (direction: number) => {
    const newSemester = currentSemester + direction
    const currentActualYear = new Date().getFullYear()

    // Si va más allá del semestre 1
    if (newSemester > 1) {
      // Solo permitir si no estamos en el año actual, o si estamos en el año actual pero no es futuro
      if (currentYear < currentActualYear) {
        changeYear(1)
        setCurrentSemester(0)
      }
      // Si estamos en el año actual, no hacer nada (no permitir ir al futuro)
    }
    // Si va antes del semestre 0, cambiar al año anterior y setear semestre 1
    else if (newSemester < 0) {
      changeYear(-1)
      setCurrentSemester(1)
    }
    // Cambio normal de semestre
    else {
      setCurrentSemester(newSemester)
    }
  }

  // Función para filtrar contratos según la vista actual
  const getFilteredContracts = () => {
    if (!allContracts.length) return []

    let filteredContracts = allContracts.filter((contract) => {
      const signDate = new Date(contract.signDate)
      return signDate.getFullYear() === currentYear
    })

    // Si hay un mes seleccionado, filtrar por ese mes
    if (selectedMonth) {
      filteredContracts = filteredContracts.filter((contract) => {
        const signDate = new Date(contract.signDate)
        const contractMonth = months[signDate.getMonth()]
        return contractMonth === selectedMonth
      })
    }
    // Si estamos en móvil, filtrar por semestre
    else if (isMobileView) {
      const startMonth = currentSemester * 6
      const endMonth = startMonth + 6
      filteredContracts = filteredContracts.filter((contract) => {
        const signDate = new Date(contract.signDate)
        const monthIndex = signDate.getMonth()
        return monthIndex >= startMonth && monthIndex < endMonth
      })
    }

    // Ordenar por fecha de firma (más recientes primero)
    return filteredContracts.sort(
      (a, b) => new Date(b.signDate).getTime() - new Date(a.signDate).getTime(),
    )
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

    // Determinar qué meses mostrar según el modo responsive
    let displayMonths = months
    if (isMobileView) {
      // Primer semestre: enero-junio, Segundo semestre: julio-diciembre
      const startIndex = currentSemester * 6
      displayMonths = months.slice(startIndex, startIndex + 6)
    }

    // Separar datos por moneda según los meses a mostrar
    const earningsUSD = displayMonths.map((month) => {
      const monthData = yearData[month]
      return monthData?.earnings?.usd || 0
    })

    const earningsARS = displayMonths.map((month) => {
      const monthData = yearData[month]
      return monthData?.earnings?.ars || 0
    })

    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: displayMonths.map((month) =>
          isMobileView
            ? monthNamesShort[month as keyof typeof monthNamesShort]
            : monthNames[month as keyof typeof monthNames],
        ),
        datasets: [
          {
            label: 'Ganancias USD',
            data: earningsUSD,
            backgroundColor: 'rgba(107, 114, 128, 0.8)', // Gris medio para USD
            borderColor: '#6b7280',
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            label: 'Ganancias ARS',
            data: earningsARS,
            backgroundColor: 'rgba(165, 170, 180, 0.8)', // Gris claro para ARS
            borderColor: '#9ca3af',
            borderWidth: 2,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: colors.text,
              usePointStyle: false,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const currency = context.datasetIndex === 0 ? 'USD' : 'ARS'
                const value = context.parsed.y || 0
                return `${currency}: ${formatCurrency(value, currency)}`
              },
              afterBody: function (tooltipItems: any) {
                const chartIndex = tooltipItems[0].dataIndex
                const actualMonth = displayMonths[chartIndex]
                const monthData = yearData[actualMonth]
                if (!monthData || !monthData.earnings) return []

                return ['', `Total mes: ${formatDualCurrency(monthData.earnings)}`]
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            ticks: {
              callback: function (value: any) {
                return formatCurrency(value, 'USD')
              },
              color: colors.text,
            },
            grid: {
              color: colors.grid,
            },
            title: {
              display: true,
              text: 'Ganancias (USD)',
              color: colors.text,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            ticks: {
              callback: function (value: any) {
                return formatCurrency(value, 'ARS')
              },
              color: colors.text,
            },
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Ganancias (ARS)',
              color: colors.text,
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
            const chartIndex = elements[0].index
            const actualMonth = displayMonths[chartIndex]
            selectMonth(actualMonth)
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

  // Detectar cambio de tamaño de pantalla para modo responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth <= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Cargar datos del dashboard al inicializar
  useEffect(() => {
    loadInitialDashboardData()
  }, [])

  // Recrear gráfico cuando cambien el año, mes seleccionado, o modo responsive
  useEffect(() => {
    if (window.Chart && !isChartLoading) {
      createEarningsChart()
    }
  }, [currentYear, selectedMonth, dashboardData, isChartLoading, isMobileView, currentSemester])

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
                {isMobileView ? (
                  // Controles para semestres en modo responsive
                  <>
                    <button
                      className="dashboard__year-btn"
                      onClick={() => changeSemester(-1)}
                      disabled={isChartLoading}
                    >
                      ‹ Anterior
                    </button>
                    <span className="dashboard__current-year">
                      {currentYear} - {currentSemester === 0 ? '1er Semestre' : '2do Semestre'}
                    </span>
                    <button
                      className="dashboard__year-btn"
                      onClick={() => changeSemester(1)}
                      disabled={
                        isChartLoading ||
                        (currentYear >= new Date().getFullYear() && currentSemester === 1)
                      }
                    >
                      Siguiente ›
                    </button>
                  </>
                ) : (
                  // Controles normales para años en modo desktop
                  <>
                    <button
                      className="dashboard__year-btn"
                      onClick={() => changeYear(-1)}
                      disabled={isChartLoading}
                    >
                      ‹ {currentYear - 1}
                    </button>
                    <span className="dashboard__current-year">{currentYear}</span>
                    <button
                      className="dashboard__year-btn"
                      onClick={() => changeYear(1)}
                      disabled={isChartLoading || currentYear >= new Date().getFullYear()}
                    >
                      {currentYear + 1} ›
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="dashboard__chart-container" style={{ position: 'relative' }}>
              <canvas ref={chartRef} className="dashboard__chart-canvas"></canvas>
              {isChartLoading && (
                <div className="dashboard__chart-loading">Cargando datos de {currentYear}...</div>
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

          {/* Lista de Contratos */}
          <div className="dashboard__contracts-section">
            <div className="dashboard__contracts-header">
              <h3 className="dashboard__section-title">
                Contratos{' '}
                {selectedMonth
                  ? `- ${monthNames[selectedMonth as keyof typeof monthNames]} ${currentYear}`
                  : isMobileView
                    ? `- ${currentYear} (${currentSemester === 0 ? '1er Semestre' : '2do Semestre'})`
                    : `- ${currentYear}`}
              </h3>
              <span className="dashboard__contracts-count">
                {getFilteredContracts().length} contratos
              </span>
            </div>

            <div className="dashboard__contracts-list">
              {getFilteredContracts().length > 0 ? (
                getFilteredContracts().map((contract) => (
                  <div key={contract.id} className="dashboard__contract-card">
                    <div className="dashboard__contract-header">
                      <div className="dashboard__contract-type">
                        <span
                          className={`dashboard__contract-badge dashboard__contract-badge--${contract.type}`}
                        >
                          {contract.type === 'venta' ? 'Venta' : 'Alquiler'}
                        </span>
                        <span className="dashboard__contract-date">
                          {new Date(contract.signDate).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <div className="dashboard__contract-total">
                        {(() => {
                          const ownerFee = contract.ownerFee || 0
                          const buyerFee = contract.buyerFee || 0
                          const ownerCurrency = contract.ownerFeeCurrency || 'ARS'
                          const buyerCurrency = contract.buyerFeeCurrency || 'ARS'

                          // Calcular totales por moneda
                          let totalUSD = 0
                          let totalARS = 0

                          if (ownerCurrency === 'USD') totalUSD += ownerFee
                          else totalARS += ownerFee

                          if (buyerCurrency === 'USD') totalUSD += buyerFee
                          else totalARS += buyerFee

                          if (totalUSD > 0 && totalARS > 0) {
                            return `${formatCurrency(totalUSD, 'USD')} / ${formatCurrency(totalARS, 'ARS')}`
                          } else if (totalUSD > 0) {
                            return formatCurrency(totalUSD, 'USD')
                          } else {
                            return formatCurrency(totalARS, 'ARS')
                          }
                        })()}
                      </div>
                    </div>

                    <div className="dashboard__contract-details">
                      <div className="dashboard__contract-property">
                        <strong>Propiedad:</strong> {contract.property?.title || 'Sin título'}
                      </div>

                      <div className="dashboard__contract-fees">
                        <div className="dashboard__contract-fee">
                          <span className="dashboard__fee-label">
                            Honorarios Propietario ({contract.ownerFeeCurrency || 'ARS'}):
                          </span>
                          <span className="dashboard__fee-value">
                            {formatCurrency(
                              contract.ownerFee || 0,
                              contract.ownerFeeCurrency || 'ARS',
                            )}
                          </span>
                        </div>
                        <div className="dashboard__contract-fee">
                          <span className="dashboard__fee-label">
                            Honorarios {contract.type === 'venta' ? 'Comprador' : 'Inquilino'} (
                            {contract.buyerFeeCurrency || 'ARS'}):
                          </span>
                          <span className="dashboard__fee-value">
                            {formatCurrency(
                              contract.buyerFee || 0,
                              contract.buyerFeeCurrency || 'ARS',
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="dashboard__contract-actions">
                        <a
                          href={`/admin/collections/contratos/${contract.id}/detalles`}
                          className="dashboard__contract-btn"
                          rel="noopener noreferrer"
                        >
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard__no-contracts">
                  <p>No hay contratos para el período seleccionado</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
