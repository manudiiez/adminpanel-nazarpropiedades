'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { fechaCorta } from '@/utils/formatValues'

interface ContractDetailsClientProps {
  propertyId?: string | number
  clientId?: string | number
  label?: string
  document?: any
}

export function ContractDetailsClient({
  propertyId,
  clientId,
  label,
  document,
}: ContractDetailsClientProps) {
  const router = useRouter()

  const downloadDocument = (id: string) => {
    console.log(`Descargando documento con ID: ${id}...`)
    router.push(`/admin/collections/media/${id}`)
    showNotification(`Descargando documento con ID: ${id}...`, 'info')
    setTimeout(() => {
      showNotification(`${id} descargado exitosamente`, 'success')
    }, 1500)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'contract-details__doc-icon--blue',
      green: 'contract-details__doc-icon--green',
      yellow: 'contract-details__doc-icon--yellow',
      purple: 'contract-details__doc-icon--purple',
    }
    return colorMap[color as keyof typeof colorMap] || 'contract-details__doc-icon--blue'
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  // Si es para navegar a propiedad
  if (propertyId) {
    return (
      <div className="contract-details__property-actions">
        <button
          onClick={() => router.push(`/admin/collections/propiedades/${propertyId}/detalles`)}
          className="client-details__property-action-secondary"
        >
          Ver propiedad
        </button>
      </div>
    )
  }

  // Si es para navegar a cliente
  if (clientId && label) {
    return (
      <button
        onClick={() => router.push(`/admin/collections/clientes/${clientId}/detalles`)}
        className="client-details__property-action-secondary"
      >
        {label}
      </button>
    )
  }

  // Si es para mostrar documento
  if (document && getColorClasses) {
    return (
      <div
        className="contract-details__document-item"
        onClick={() => downloadDocument(document.id)}
      >
        <div className="contract-details__document-info">
          <div
            className={`contract-details__doc-icon ${getColorClasses(document.color || 'blue')}`}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div className="contract-details__document-text">
            <div className="contract-details__document-name">{document.filename}</div>
            <div className="contract-details__document-date">{fechaCorta(document.createdAt)}</div>
          </div>
        </div>
        <div className="contract-details__document-download">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  return null
}
