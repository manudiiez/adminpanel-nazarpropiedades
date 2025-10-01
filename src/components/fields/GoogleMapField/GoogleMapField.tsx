'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import './styles.scss'

// Tipos para Google Maps
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

interface GoogleMapFieldProps {
  path: string
  label?: string
  required?: boolean
}

interface LocationData {
  lat: number
  lng: number
  address?: string
  formattedAddress?: string
}

const GoogleMapField: React.FC<GoogleMapFieldProps> = ({
  path,
  label = 'Ubicación en Mapa',
  required = false,
}) => {
  const { value, setValue } = useField<LocationData>({ path })

  // Obtener valores de los campos relacionados
  const { value: locationPrivacy } = useField({ path: 'ubication.locationPrivacy' })
  const { value: approximateRadius } = useField({ path: 'ubication.approximateRadius' })

  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const circleRef = useRef<any>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Función para buscar direcciones usando Google Places API
  const searchAddresses = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places API not loaded')
      return
    }

    setIsSearching(true)
    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'))

      const request = {
        query: query,
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        locationBias: {
          center: { lat: -32.9283, lng: -68.8445 }, // Godoy Cruz, Mendoza
          radius: 50000, // 50km radius
        },
      }

      service.textSearch(request, (results: any[], status: any) => {
        setIsSearching(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Filtrar resultados para priorizar Argentina
          const filteredResults = results.filter(
            (result) =>
              result.formatted_address &&
              result.formatted_address.toLowerCase().includes('argentina'),
          )
          setSearchResults(filteredResults.length > 0 ? filteredResults : results)
          setShowDropdown(true)
        } else {
          setSearchResults([])
          setShowDropdown(false)
        }
      })
    } catch (error) {
      console.error('Error searching addresses:', error)
      setSearchResults([])
      setShowDropdown(false)
      setIsSearching(false)
    }
  }

  // Manejar selección de resultado de búsqueda
  const handleSearchSelect = (result: any) => {
    if (result.geometry && result.geometry.location) {
      const lat =
        typeof result.geometry.location.lat === 'function'
          ? result.geometry.location.lat()
          : result.geometry.location.lat
      const lng =
        typeof result.geometry.location.lng === 'function'
          ? result.geometry.location.lng()
          : result.geometry.location.lng

      setValue({
        lat,
        lng,
        address: result.formatted_address || result.name || '',
        formattedAddress: result.formatted_address || result.name || '',
      })

      setSearchInput(result.formatted_address || result.name || '')
      setShowDropdown(false)

      // La visualización se actualizará automáticamente con el useEffect
    }
  }

  // Inicializar Google Maps
  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) return

    // Configuración inicial del mapa
    const defaultCenter =
      value?.lat && value?.lng
        ? { lat: value.lat, lng: value.lng }
        : { lat: -32.9283, lng: -68.8445 } // Godoy Cruz, Mendoza por defecto

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultCenter,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    })

    setMap(mapInstance)

    // Crear marcador
    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      draggable: true,
      position: defaultCenter,
    })

    if (!value?.lat || !value?.lng) {
      markerInstance.setVisible(false)
    }

    setMarker(markerInstance)

    // Evento de clic en el mapa
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      // Geocoding inverso para obtener la dirección
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        let address = ''
        let formattedAddress = ''

        if (status === 'OK' && results[0]) {
          address = results[0].formatted_address
          formattedAddress = results[0].formatted_address
        }

        setValue({
          lat,
          lng,
          address,
          formattedAddress,
        })

        // La visualización se actualizará automáticamente con el useEffect
      })
    })

    // Evento de arrastrar marcador
    markerInstance.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      // Geocoding inverso
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        let address = ''
        let formattedAddress = ''

        if (status === 'OK' && results[0]) {
          address = results[0].formatted_address
          formattedAddress = results[0].formatted_address
        }

        setValue({
          lat,
          lng,
          address,
          formattedAddress,
        })

        // La visualización se actualizará automáticamente con el useEffect
      })
    })

    // Configurar autocomplete para búsqueda
    // Nota: Removido el autocomplete de Google Maps para usar el plugin de geocoding de Payload

    setIsLoaded(true)
  }, [value, setValue])

  // Cargar Google Maps API
  useEffect(() => {
    if (window.google) {
      initializeMap()
      return
    }

    // Cargar script de Google Maps si no está cargado
    const script = document.createElement('script')
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    console.log('Using Google Maps API Key:', apiKey)

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    window.initGoogleMaps = () => {
      initializeMap()
    }

    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [initializeMap])

  // Actualizar visualización cuando cambien los valores relevantes
  useEffect(() => {
    if (!map || !value?.lat || !value?.lng) return

    const position = { lat: value.lat, lng: value.lng }

    // Limpiar visualizaciones anteriores
    if (marker) {
      marker.setVisible(false)
    }
    if (circleRef.current) {
      circleRef.current.setMap(null)
      circleRef.current = null
    }

    if (locationPrivacy === 'approximate') {
      // Mostrar círculo para ubicación aproximada
      const radius = approximateRadius || 500
      const newCircle = new window.google.maps.Circle({
        strokeColor: '#FF6B6B',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF6B6B',
        fillOpacity: 0.35,
        map: map,
        center: position,
        radius: radius,
      })
      circleRef.current = newCircle

      // Centrar mapa para mostrar todo el círculo
      const bounds = new window.google.maps.LatLngBounds()
      const circleBounds = newCircle.getBounds()
      if (circleBounds) {
        bounds.union(circleBounds)
        map.fitBounds(bounds)
      }
    } else if (locationPrivacy === 'exact') {
      // Mostrar marcador exacto
      if (marker) {
        marker.setPosition(position)
        marker.setVisible(true)
      }
      map.setCenter(position)
      map.setZoom(16)
    }
    // Si es 'hidden', no mostrar nada (ya limpiamos arriba)
  }, [map, marker, value?.lat, value?.lng, locationPrivacy, approximateRadius])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300)
  }

  const clearLocation = () => {
    setValue(null)
    if (marker) {
      marker.setVisible(false)
    }
    if (circleRef.current) {
      circleRef.current.setMap(null)
      circleRef.current = null
    }
    setSearchInput('')
    setSearchResults([])
    setShowDropdown(false)
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  return (
    <div className="googleMapField">
      <label className="fieldLabel">
        {label}
        {required && <span className="required">*</span>}
      </label>

      <div className="mapControls">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar dirección en Godoy Cruz, Mendoza..."
          value={searchInput}
          onChange={handleSearchInputChange}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowDropdown(true)
            }
          }}
          onBlur={() => {
            // Delay para permitir el clic en las opciones
            setTimeout(() => setShowDropdown(false), 150)
          }}
          className="searchInput"
        />
        {(value || searchInput) && (
          <button
            type="button"
            onClick={clearLocation}
            className="clearButton"
            aria-label="Limpiar ubicación"
          >
            ✕
          </button>
        )}

        {/* Dropdown de resultados de búsqueda */}
        {showDropdown && searchResults.length > 0 && (
          <div className="searchDropdown">
            {searchResults.slice(0, 5).map((result, index) => (
              <div
                key={result.place_id || index}
                onClick={() => handleSearchSelect(result)}
                className="searchResult"
              >
                <div className="searchResultText">{result.formatted_address || result.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isSearching && <div className="searchLoading">Buscando direcciones...</div>}
      </div>

      <div ref={mapRef} className="mapContainer" />

      {value && (
        <div className="locationInfo">
          <strong>Ubicación seleccionada:</strong>
          <br />
          <small>
            Lat: {value.lat?.toFixed(6)}, Lng: {value.lng?.toFixed(6)}
            {value.formattedAddress && (
              <>
                <br />
                Dirección: {value.formattedAddress}
              </>
            )}
            <br />
            <strong>
              Visualización:{' '}
              {locationPrivacy === 'exact'
                ? 'Ubicación exacta'
                : locationPrivacy === 'approximate'
                  ? `Área aproximada (${approximateRadius || 500}m de radio)`
                  : 'Ubicación oculta'}
            </strong>
          </small>
        </div>
      )}

      <p className="helpText">
        Puedes buscar una dirección en el campo de arriba o hacer clic directamente en el mapa para
        seleccionar una ubicación. El mapa mostrará la visualización según la configuración de
        privacidad seleccionada: marcador exacto, área aproximada o ubicación oculta.
      </p>
    </div>
  )
}

export default GoogleMapField
