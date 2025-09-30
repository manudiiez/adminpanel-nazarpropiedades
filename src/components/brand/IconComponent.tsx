import Image from 'next/image'
import React from 'react'

export default function index() {
  return <Image src="/favicon.svg" alt="Inmobiliaria" width={28} height={28} />
  // return <Image src={logo} alt="Inmobiliaria" width={32} height={32} />
  // return <img src="/favicon2.svg" alt="Inmobiliaria" />
}
