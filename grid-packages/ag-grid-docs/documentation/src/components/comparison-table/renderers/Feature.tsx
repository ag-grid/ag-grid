import React from 'react';
import styles from '@design-system/modules/ComparisonTableRenderers.module.scss';
import { Icon } from '../../Icon';

export function Feature({ value }: { value: boolean | string }) {
    if (value) {
      return <div className={styles.feature}><span className={styles.tick}><Icon name="tick"/></span></div> 
    } else {
      return <div className={styles.feature}><span className={styles.dash}>—</span></div> 
    }
}