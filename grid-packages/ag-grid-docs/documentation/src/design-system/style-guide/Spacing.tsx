import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

const spacing = {
    'spacing-size-1': '4px',
    'spacing-size-2': '8px',
    'spacing-size-3': '12px',
    'spacing-size-4': '16px',
    'spacing-size-5': '20px',
    'spacing-size-6': '24px',
    'spacing-size-8': '32px',
    'spacing-size-10': '40px',
    'spacing-size-12': '48px',
    'spacing-size-16': '64px',
    'spacing-size-20': '80px',
    'spacing-size-24': '96px',
    'spacing-size-32': '128px',
    'spacing-size-40': '160px',
    'spacing-size-48': '192px',
    'spacing-size-56': '224px',
    'spacing-size-64': '256px',
};

export const Spacing: FunctionComponent = () => {
    return (
        <>
            <h2>Spacing</h2>

            {Object.keys(spacing).map((key) => {
                return (
                    <div key={key} className={styles.spacingItem}>
                        <div style={{ width: spacing[key] }}></div>
                        <code>${key}</code>
                    </div>
                );
            })}
        </>
    );
};
