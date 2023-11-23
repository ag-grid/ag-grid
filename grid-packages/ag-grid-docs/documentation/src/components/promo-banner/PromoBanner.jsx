// PromoBanner.js

import React from 'react';
import styles from './PromoBanner.module.scss';
import LogoMarkTransparent from '../LogoMarkTransparent';
import { Icon } from '../Icon';

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
    </div>


  );
};

export default PromoBanner;