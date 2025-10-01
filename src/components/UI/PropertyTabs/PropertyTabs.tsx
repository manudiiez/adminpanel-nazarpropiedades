'use client'

import React, { useState } from 'react'

interface TabsProps {
  children: React.ReactNode
}

export function PropertyTabs({ children }: TabsProps) {
  const [currentTab, setCurrentTab] = useState<'datos' | 'portales'>('datos')

  return (
    <div className="property-details__tabs">
      <div className="property-details__tabs-header">
        <button
          onClick={() => setCurrentTab('datos')}
          className={`property-details__tab-btn ${currentTab === 'datos' ? 'active' : ''}`}
        >
          Datos de la Propiedad
        </button>
        <button
          onClick={() => setCurrentTab('portales')}
          className={`property-details__tab-btn ${currentTab === 'portales' ? 'active' : ''}`}
        >
          Gestión de Portales
        </button>
      </div>

      <div className="property-details__tab-content">
        {React.Children.toArray(children).map((child: any, index) => {
          if (index === 0 && currentTab === 'datos') return child
          if (index === 1 && currentTab === 'portales') return child
          return null
        })}
      </div>
    </div>
  )
}
