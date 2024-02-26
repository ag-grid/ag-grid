import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

const radii = [
    'radius-none',
    'radius-xxs',
    'radius-xs',
    'radius-sm',
    'radius-md',
    'radius-lg',
    'radius-xl',
    'radius-2xl',
    'radius-3xl',
    'radius-4xl',
    'radius-full',
];

export const Radii: FunctionComponent = () => {
    return (
        <>
            <h2>Radii</h2>

            <div className={styles.radiiList}>
                {radii.map((radius, k) => {
                    return (
                        <div key={k}>
                            <code>var(--{radius})</code>
                            <div className={styles.radiiItem} style={{ borderTopLeftRadius: `var(--${radius})` }}></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
