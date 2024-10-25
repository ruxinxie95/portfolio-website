// components/Lightbox.js
import { useEffect } from 'react';

export default function Lightbox({ images, currentImage, onClose, onPrev, onNext }) {
  // Handle "Escape" key to close the lightbox and arrow keys for navigation
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

    // Prevent background scrolling when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, onPrev, onNext]);

  if (!currentImage) return null;

  return (
    <div className="lightbox active" onClick={onClose}>
      <span className="lightbox-close" onClick={onClose}>
        &times;
      </span>
      <div className="lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={currentImage} className="lightbox-content" alt="Enlarged view" />
      </div>
      <a className="lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        &#10094;
      </a>
      <a className="lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        &#10095;
      </a>
    </div>
  );
}
