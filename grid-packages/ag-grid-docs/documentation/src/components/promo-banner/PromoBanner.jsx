import React, { useState, useEffect } from 'react';
import styles from './PromoBanner.module.scss';
import LogoMarkTransparent from '../LogoMarkTransparent';
import CloseIcon from '../../images/inline-svgs/cross-banner.svg';

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check local storage to see if the banner should be hidden
    const isBannerHidden = localStorage.getItem('isPromoBannerHidden');
    if (isBannerHidden) {
      setIsVisible(false);
    }
  }, []);

  const handleCloseClick = () => {
    // Hide the banner and set the flag in local storage
    setIsVisible(false);
    localStorage.setItem('isPromoBannerHidden', 'true');
  };

  if (!isVisible) {
    return null; // Don't render the banner if it's hidden
  }

  return (
    <div className={styles.promoBanner}>
      <LogoMarkTransparent />
      <div className={styles.promoText}>
        Introducing our new AG Charts library
      </div>
      <a href="https://ag-grid.com/ag-charts" className={styles.visitButton}>
        <div>
          Visit →
        </div>
      </a>
      <CloseIcon
        className={styles.closeIcon}
        onClick={handleCloseClick}
      />
    </div>
  );
};

export default PromoBanner;