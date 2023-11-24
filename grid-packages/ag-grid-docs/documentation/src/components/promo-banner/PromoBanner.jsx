// PromoBanner.js

import React, { useState, useEffect } from 'react';
import styles from './PromoBanner.module.scss';
import LogoMarkTransparent from '../LogoMarkTransparent';
import CloseIcon from '../../images/inline-svgs/cross-banner.svg';

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage to see if the banner should be hidden
    const isBannerHidden = localStorage.getItem('isPromoBannerHidden');
    setIsVisible(!isBannerHidden);
  }, []);

  const handleCloseClick = () => {
    // Hide the banner and set the flag in local storage
    setIsVisible(false);
    localStorage.setItem('isPromoBannerHidden', 'true');
  };

  return (
    <div className={`${styles.promoBanner} ${isVisible ? styles.visible : styles.hidden}`}>
      <LogoMarkTransparent />
      <a href="https://ag-grid.com/ag-charts" >
      <div className={styles.promoText}>
        Introducing our new AG Charts library
      </div>
      </a>
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
