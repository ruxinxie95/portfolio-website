// components/ImageGrid.js
import { useState } from 'react';
import Lightbox from './Lightbox';


export default function ImageGrid({ images, imageMetadata, description }) {  // Add description here
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
                
                {/* Project Description */}
                {description && <p className="project-description">{description}</p>}

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
                                <p className="artist-name">© {imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                            </div>
                        ))}
                    </div>
                ))}

                {gridGroups['1'] && (
                    <div key="grid-1" className="grid-container grid-1">
                        {gridGroups['1'].map((image, imageIndex) => (
                            <div key={imageIndex} className="grid-image-2">
                                <img
                                    src={image}
                                    alt={`Grid 1 Image ${imageIndex + 1}`}
                                    className="grid-image"
                                    onClick={() => openLightbox(grid1Index + imageIndex)}
                                />
                                <p className="artist-name">© {imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {remainingNonGridImages[0] && (
                    <div className="project-image-wrapper">
                        <img
                            src={remainingNonGridImages[0]}
                            alt="Project Image 1"
                            className="project-image"
                            onClick={() => openLightbox(firstImageIndex)}
                        />
                        <p className="artist-name">© {imageMetadata[remainingNonGridImages[0]]?.artist || 'Unknown Artist'}</p>
                    </div>
                )}

                {gridGroups['2'] && (
                    <div key="grid-2" className="grid-container grid-2">
                        {gridGroups['2'].map((image, imageIndex) => (
                            <div key={imageIndex} className="grid-image-2">
                                <img
                                    src={image}
                                    alt={`Grid 2 Image ${imageIndex + 1}`}
                                    className="grid-image"
                                    onClick={() => openLightbox(grid2Index + imageIndex)}
                                />
                                <p className="artist-name">© {imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {remainingNonGridImages[1] && (
                    <div className="project-image-wrapper">
                        <img
                            src={remainingNonGridImages[1]}
                            alt="Project Image 2"
                            className="project-image"
                            onClick={() => openLightbox(secondImageIndex)}
                        />
                        <p className="artist-name">© {imageMetadata[remainingNonGridImages[1]]?.artist || 'Unknown Artist'}</p>
                    </div>
                )}

                {gridGroups['3'] && (
                    <div key="grid-3" className="grid-container grid-3">
                        {gridGroups['3'].map((image, imageIndex) => (
                            <div key={imageIndex} className="grid-image-2">
                                <img
                                    src={image}
                                    alt={`Grid 3 Image ${imageIndex + 1}`}
                                    className="grid-image"
                                    onClick={() => openLightbox(grid3Index + imageIndex)}
                                />
                                <p className="artist-name">© {imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {remainingNonGridImages.slice(2).map((image, index) => {
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
