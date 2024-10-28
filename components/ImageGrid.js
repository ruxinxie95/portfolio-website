//components/ImageGrid.js
import { useState } from 'react';
import Lightbox from './Lightbox';

export default function ImageGrid({ images, imageMetadata, description, videos }) {  // Add videos as a prop
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const groupGridImages = () => {
        const gridGroups = {};
        images.forEach(image => {
            const gridMatch = image.match(/grid(-?\d+)_img\d+/);
            if (gridMatch) {
                const gridGroup = gridMatch[1];
                if (!gridGroups[gridGroup]) {
                    gridGroups[gridGroup] = [];
                }
                gridGroups[gridGroup].push(image);
            }
        });
        return gridGroups;
    };

    const gridGroups = groupGridImages();
    const coverImage = images.find(img => img.includes('cover'));
    const remainingNonGridImages = images.filter(img => img !== coverImage && !img.includes('grid'));

    const allImages = [
        coverImage,
        ...Object.values(gridGroups).flat(),
        ...remainingNonGridImages,
    ].filter(Boolean);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => setIsLightboxOpen(false);

    const goPrev = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
        );
    };

    const goNext = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    let currentIndex = 1;
    const grid1Index = currentIndex;
    currentIndex += gridGroups['1']?.length || 0;
    const firstImageIndex = currentIndex;
    currentIndex += 1;
    const grid2Index = currentIndex;
    currentIndex += gridGroups['2']?.length || 0;
    const secondImageIndex = currentIndex;
    currentIndex += 1;
    const grid3Index = currentIndex;
    currentIndex += gridGroups['3']?.length || 0;
    const remainingImagesStartIndex = currentIndex;

    return (
        <>
            <div className="project-images">
                {coverImage && (
                    <div className="cover-image-wrapper">
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="cover-image"
                            onClick={() => openLightbox(0)}
                        />
                        <p className="artist-name">© {imageMetadata[coverImage]?.artist || 'Unknown Artist'}</p>
                    </div>
                )}
                
                {/* Video Section - Added here */}
                {videos && videos.length > 0 && (
                    <div className="video-section">
                        {videos.map((videoUrl, index) => (
                            <video key={index} controls width="100%" style={{ marginBottom: '20px' }}>
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ))}
                    </div>
                )}

                {/* Project Description */}
                {description && <p className="project-description">{description}</p>}

                {/* Grid Images Rendering */}
                {Object.keys(gridGroups).map((key, idx) => (
                    <div key={`grid-${key}`} className={`grid-container grid-${key}`}>
                        {gridGroups[key].map((image, imageIndex) => (
                            <div key={imageIndex} className="grid-image-2">
                                <img
                                    src={image}
                                    alt={`Grid ${key} Image ${imageIndex + 1}`}
                                    className="grid-image"
                                    onClick={() => openLightbox(idx + imageIndex)}
                                />
                                
                            </div>
                        ))}
                    </div>
                ))}

                {/* Other images */}
                {remainingNonGridImages.map((image, index) => {
                    const globalIndex = remainingImagesStartIndex + index;
                    return (
                        <div key={index} className="project-image-wrapper">
                            <img
                                src={image}
                                alt={`Project Image ${index + 3}`}
                                className="project-image"
                                onClick={() => openLightbox(globalIndex)}
                            />
                            <p className="artist-name">© {imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                        </div>
                    );
                })}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <Lightbox
                    images={allImages}
                    currentImage={allImages[currentImageIndex]}
                    onClose={closeLightbox}
                    onPrev={goPrev}
                    onNext={goNext}
                />
            )}
        </>
    );
}
