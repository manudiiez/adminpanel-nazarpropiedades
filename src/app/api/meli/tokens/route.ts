import { NextResponse } from 'next/server'
import { getAllActiveTokens } from '@/utils/mercadoLibreTokens'

export async function GET() {
  try {
    const tokens = await getAllActiveTokens()

    // Filtrar información sensible antes de devolver
    const safeTokens = tokens.map((token) => ({
      id: token.id,
      accountName: token.accountName,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      scope: token.scope,
      userId: token.userId,
      isActive: token.isActive,
      lastUsed: token.lastUsed,
      errorCount: token.errorCount,
      lastError: token.lastError,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      // No incluimos accessToken ni refreshToken por seguridad
    }))

    return NextResponse.json({
      tokens: safeTokens,
      count: safeTokens.length,
    })
  } catch (error) {
    console.error('Error al obtener tokens:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
