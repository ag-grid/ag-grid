// PromoBanner.js

import React from 'react';
import styles from './PromoBanner.module.scss';
import LogoMarkTransparent from '../LogoMarkTransparent';
import CloseIcon from '../../images/inline-svgs/cross-banner.svg';


const PromoBanner = () => {
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
<CloseIcon className={styles.closeIcon} />

    </div>


  );
};

export default PromoBanner;