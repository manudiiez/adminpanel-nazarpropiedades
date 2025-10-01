'use client'
import type { SelectFieldClientComponent } from 'payload'
import { useFormFields } from '@payloadcms/ui'
import { SelectField } from '@payloadcms/ui'
import React from 'react'

const index: SelectFieldClientComponent = (props) => {
  const isReadOnly = useFormFields(([fields]) => {
    // Verificar si el departamento está seleccionado
    const departmentValue = fields?.['ubication.department']?.value
    // Si no hay departamento seleccionado, el campo estará readOnly
    return !departmentValue
  })

  return <SelectField {...props} readOnly={isReadOnly} />
}

export default index
