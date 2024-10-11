// components/FadeInImage.js

import React from 'react';
import Image from 'next/image';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import styles from './FadeInImage.module.css'; // Create corresponding CSS

const FadeInImage = ({ src, alt, width, height, className, ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`${styles.fadeInImageWrapper} ${isVisible ? styles.visible : ''} ${className}`}
      {...props}
    >
      <Image src={src} alt={alt} width={width} height={height} />
    </div>
  );
};

export default FadeInImage;
