// components/Lightbox.js
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ images, currentImage, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        onPrev();
      }
      if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentImage) return null;

  const lightboxContent = (
    <div className="lightbox active" onClick={onClose}>
      <span className="lightbox-close" onClick={onClose}>&times;</span>

      {/* Left Section: Previous arrow */}
      <div className="lightbox-extra lightbox-extra-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        <a className="lightbox-prev">&#10094;</a>
      </div>

      {/* Center Section: Image */}
      <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={currentImage} className="lightbox-content" alt="Enlarged view" />
      </div>

      {/* Right Section: Next arrow */}
      <div className="lightbox-extra lightbox-extra-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        <a className="lightbox-next">&#10095;</a>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body); // Render the lightbox at the top level of the DOM
}
