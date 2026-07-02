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

// The widest word, used by an invisible sizer to reserve a stable width so the heading
// doesn't reflow (layout shift / CLS) as words cycle. Picked by character length, which
// is a safe proxy here because 'JavaScript' is clearly the longest of the set; if the
// word list changes such that width no longer tracks length, revisit this.
const LONGEST_WORD = WORDS.reduce((longest, w) => (w.text.length > longest.length ? w.text : longest), '');

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

    // One visible word at a time so the H1 reads as a single clean heading for crawlers
    // and screen readers. The sizer is an aria-hidden copy of the widest word that stays
    // in the DOM purely to reserve width — the two are stacked in the same grid cell, so
    // the container width is fixed to the widest word and never shifts as words cycle.
    // `key` retriggers the entry animation on swap.
    return (
        <span className={styles.animatedWordsOuter}>
            <span aria-hidden="true" className={styles.sizer}>
                {`${prefixText}${LONGEST_WORD}${suffixText}`}
            </span>
            <span key={wordIndex} className={classnames(styles.animatedWord, word.className)}>
                {`${prefixText}${word.text}${suffixText}`}
            </span>
        </span>
    );
};
