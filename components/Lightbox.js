// components/Lightbox.js
import { useState, useEffect } from 'react';

export default function Lightbox({ images }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (image) => {
    setCurrentImage(image);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setCurrentImage(null);
  };

  const prevImage = () => {
    const currentIndex = images.indexOf(currentImage);
    const prevIndex = (currentIndex === 0 ? images.length : currentIndex) - 1;
    setCurrentImage(images[prevIndex]);
  };

  const nextImage = () => {
    const currentIndex = images.indexOf(currentImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentImage(images[nextIndex]);
  };

  // Handle "Escape" key to close the lightbox
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]); // Add "isOpen" as a dependency to trigger effect when lightbox is open

  return (
    <>
      {images.map((image, index) => (
        <img
          key={index}
          src={`/projects/${image}`}
          alt={`Project Image ${index + 1}`}
          className="project-image"
          onClick={() => openLightbox(image)}
        />
      ))}

      {isOpen && (
        <div className="lightbox active">
          <span className="lightbox-close" onClick={closeLightbox}>
            &times;
          </span>
          <div className="lightbox-image-wrapper">
            <img
              src={`/projects/${currentImage}`}
              className="lightbox-content"
              alt="Enlarged view"
            />
          </div>
          <a className="lightbox-prev" onClick={prevImage}>
              &#10094; {/* This should display the previous arrow symbol */}
          </a>
          <a className="lightbox-next" onClick={nextImage}>
              &#10095; {/* This should display the next arrow symbol */}
          </a>

        </div>
      )}
    </>
  );
}
