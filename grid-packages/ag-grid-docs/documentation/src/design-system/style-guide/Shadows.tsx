import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

const shadows = ['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];

export const Shadows: FunctionComponent = () => {
    return (
        <>
            <h2>Shadows</h2>

            <div className={styles.shadowsList}>
                {shadows.map((shadow) => {
                    return (
                        <div key={shadow} style={{ boxShadow: `var(--${shadow})` }}>
                            <span>{shadow}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
