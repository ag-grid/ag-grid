import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import styles from './FrameworkTextAnimation.module.scss';

interface Props {
    prefix?: string;
    suffix?: string;
}

// Cycled framework words. The first entry is server-rendered, so it doubles as the
// no-JS fallback — keep it aligned with the page title ("JavaScript Grid").
const WORDS: { text: string; className: string }[] = [
    { text: 'JavaScript', className: styles.javascript },
    { text: 'Vue', className: styles.vue },
    { text: 'Angular', className: styles.angular },
    { text: 'React', className: styles.react },
];

const CYCLE_MS = 2500;

export const FrameworkTextAnimation: FunctionComponent<Props> = ({ prefix, suffix }) => {
    const [wordIndex, setWordIndex] = useState(0);

    const prefixText = prefix ? `${prefix} ` : '';
    const suffixText = suffix ? ` ${suffix}` : '';

    useEffect(() => {
        const timeout = setTimeout(() => {
            setWordIndex((index) => (index + 1) % WORDS.length);
        }, CYCLE_MS);

        return () => clearTimeout(timeout);
    }, [wordIndex]);

    const word = WORDS[wordIndex];

    // One word lives in the DOM at a time so the H1 reads as a single clean heading
    // for crawlers and screen readers. `key` retriggers the entry animation on swap.
    return (
        <span className={styles.animatedWordsOuter}>
            <span key={wordIndex} className={classnames(styles.animatedWord, word.className)}>
                {`${prefixText}${word.text}${suffixText}`}
            </span>
        </span>
    );
};
