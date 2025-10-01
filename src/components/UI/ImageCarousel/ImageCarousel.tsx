'use client'

import { useState } from 'react'

interface Image {
  url: string
  filename: string
}

interface ImageCarouselProps {
  images: Image[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState('')

  const nextSlide = () => {
    if (images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }
  }

  const prevSlide = () => {
    if (images.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentSlide(index)
    }
  }

  const openImageModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setModalImageUrl('')
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div className="property-details__image-section">
        <div className="property-details__carousel">
          <div className="property-details__carousel-container">
            <div
              className="property-details__carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={index} className="property-details__carousel-slide">
                  <img
                    src={image.url}
                    alt={`Imagen ${index + 1}`}
                    className="property-details__carousel-image"
                    onClick={() => openImageModal(image.url)}
                  />
                </div>
              ))}
            </div>

            {/* Navegación del carrusel */}
            {images.length > 1 && (
              <>
                <button
                  className="property-details__carousel-nav property-details__carousel-nav--prev"
                  onClick={prevSlide}
                >
                  &#8249;
                </button>
                <button
                  className="property-details__carousel-nav property-details__carousel-nav--next"
                  onClick={nextSlide}
                >
                  &#8250;
                </button>

                {/* Indicadores */}
                <div className="property-details__carousel-indicators">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`property-details__carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Imagen */}
      {showImageModal && (
        <div className="property-details__image-modal" onClick={closeImageModal}>
          <div className="property-details__image-modal-close" onClick={closeImageModal}>
            &times;
          </div>
          <img
            src={modalImageUrl}
            alt="Imagen ampliada"
            className="property-details__image-modal-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
