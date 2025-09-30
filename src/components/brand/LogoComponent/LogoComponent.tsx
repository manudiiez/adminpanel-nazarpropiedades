import Image from 'next/image'
import React from 'react'
import './index.scss'

export default function index() {
  // return <img src="/brand.svg" alt="My Custom Logo" />
  return (
    <div className="brand-wrap">
      <Image src="/logo.svg" alt="Inmobiliaria" width={250} height={100} className="brand-light" />
      <Image
        src="/logo-black.svg"
        alt="Inmobiliaria"
        width={250}
        height={100}
        className="brand-dark"
      />
    </div>
  )
}
