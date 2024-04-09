import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

const columns = {
    four: [
        'column-1-4',
        'column-1-4',
        'column-1-4',
        'column-1-4',
        'column-2-4',
        'column-2-4',
        'column-3-4',
        'column-1-4',
    ],
    six: [
        'column-1-6',
        'column-1-6',
        'column-1-6',
        'column-1-6',
        'column-1-6',
        'column-1-6',
        'column-1-6',
        'column-2-6',
        'column-3-6',
        'column-2-6',
        'column-4-6',
        'column-1-6',
        'column-5-6',
    ],
    twelve: [
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-1-12',
        'column-2-12',
        'column-3-12',
        'column-4-12',
        'column-2-12',
        'column-6-12',
        'column-6-12',
        'column-5-12',
        'column-7-12',
        'column-8-12',
        'column-4-12',
        'column-9-12',
        'column-3-12',
        'column-10-12',
        'column-2-12',
        'column-11-12',
        'column-1-12',
    ],
};

export const Layout: FunctionComponent = () => {
    return (
        <>
            <h2>Layout</h2>

            <div className={styles.layoutExample}>
                {columns.four.map((col, k) => {
                    return (
                        <div key={k} className={col}>
                            <code>var(--{col.replace('column', 'width')})</code>
                        </div>
                    );
                })}
                {columns.six.map((col, k) => {
                    return (
                        <div key={k} className={col}>
                            <code>var(--{col.replace('column', 'width')})</code>
                        </div>
                    );
                })}

                {columns.twelve.map((col, k) => {
                    return (
                        <div key={k} className={col}>
                            <code>var(--{col.replace('column', 'width')})</code>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
