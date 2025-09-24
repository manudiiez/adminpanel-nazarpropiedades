// src/collections/Clientes/hooks/beforeValidateClient.ts
import type { CollectionBeforeValidateHook } from 'payload'

export const beforeValidateClient: CollectionBeforeValidateHook = async ({ data, originalDoc }) => {
  if (!data) return data // <- si viene undefined, no hacemos nada

  const firstname = (data.firstname ?? originalDoc?.firstname ?? '').trim()
  const lastname = (data.lastname ?? originalDoc?.lastname ?? '').trim()

  const full = [firstname, lastname].filter(Boolean).join(' ')
  if (full) data.fullname = full

  return data
}
