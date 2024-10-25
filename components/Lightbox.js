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
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentImage) return null;

  const lightboxContent = (
    <div className="lightbox active" onClick={onClose}>
      <span className="lightbox-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>&times;</span>

      <div className="lightbox-extra lightbox-extra-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        <a className="lightbox-prev">&#10094;</a>
      </div>

      <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={currentImage} className="lightbox-content" alt="Enlarged view" />
      </div>

      <div className="lightbox-extra lightbox-extra-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        <a className="lightbox-next">&#10095;</a>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
