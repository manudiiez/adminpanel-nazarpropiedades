'use client'

import React from 'react'
import './styles.scss'

interface NavigationHeaderProps {
  title?: string
  backUrl?: string
  backLabel?: string
}

export default function NavigationHeader({
  title,
  backUrl = '/admin',
  backLabel = 'Volver al Dashboard',
}: NavigationHeaderProps) {
  return (
    <div className="navigation-header">
      <div className="navigation-header__content">
        <a href={backUrl} className="navigation-header__back-link">
          ← {backLabel}
        </a>
        {title && <h1 className="navigation-header__title">{title}</h1>}
      </div>
    </div>
  )
}
