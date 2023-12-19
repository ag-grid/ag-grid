import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';

const textSizes = ['2xs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];

const Text: FunctionComponent = ({ textName, fontWeight = 'normal' }) => {
    return (
        <div className={styles.textSizeItem}>
            <span>
                <code>{`var(--text-${textName})`}</code>:{' '}
            </span>
            <p className={styles.textSizeExample} style={{ fontSize: `var(--text-fs-${textName})`, fontWeight }}>
                The quick brown fox jumps over the lazy dog
            </p>
        </div>
    );
};

export const TextSizes: FunctionComponent = () => {
    return (
        <>
            <h2>Text Sizes</h2>
            <div className={styles.textSizeList}>
                <div>
                    {textSizes.map((textName) => {
                        return <Text key={textName} textName={textName} fontWeight="var(--text-regular)" />;
                    })}
                </div>
                <div>
                    {textSizes.map((textName) => {
                        return <Text key={`${textName}`} textName={`${textName}`} fontWeight="var(--text-semibold)" />;
                    })}
                </div>
                <div>
                    {textSizes.map((textName) => {
                        return <Text key={`${textName}`} textName={`${textName}`} fontWeight="var(--text-bold)" />;
                    })}
                </div>
            </div>
        </>
    );
};
