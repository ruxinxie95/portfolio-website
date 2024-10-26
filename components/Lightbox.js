// components/Lightbox.js
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ images, currentImage, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentImage) return null;

  const lightboxContent = (
    <div className="lightbox active" onClick={onClose}>
      <span
        className="lightbox-close"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close Lightbox"
        role="button"
        tabIndex="0"
      >
        &times;
      </span>

      <div
        className="lightbox-extra lightbox-extra-prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous Image"
        role="button"
        tabIndex="0"
      >
        <a className="lightbox-prev">&#10094;</a>
      </div>

      <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={currentImage} className="lightbox-content" alt="Enlarged view" />
      </div>

      <div
        className="lightbox-extra lightbox-extra-next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next Image"
        role="button"
        tabIndex="0"
      >
        <a className="lightbox-next">&#10095;</a>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
