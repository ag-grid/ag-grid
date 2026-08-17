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
    // A monotonic count, not an index: the outgoing word stays derivable and `key` changes each swap.
    const [cycle, setCycle] = useState(0);

    const prefixText = prefix ? `${prefix} ` : '';
    const suffixText = suffix ? ` ${suffix}` : '';

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCycle((current) => current + 1);
        }, CYCLE_MS);

        return () => clearTimeout(timeout);
    }, [cycle]);

    const word = WORDS[cycle % WORDS.length];
    // Nothing to animate away on first paint, so the server-rendered word settles without moving.
    const outgoingWord = cycle > 0 ? WORDS[(cycle - 1) % WORDS.length] : undefined;

    // Only the current word is announced or server-rendered, so the H1 stays a single clean
    // heading for crawlers and screen readers; the outgoing copy and the sizer are aria-hidden.
    return (
        <span className={styles.animatedWordsOuter}>
            <span aria-hidden="true" className={styles.sizer}>
                {`${prefixText}${LONGEST_WORD}${suffixText}`}
            </span>
            {outgoingWord && (
                <span
                    key={`outgoing-${cycle}`}
                    aria-hidden="true"
                    className={classnames(styles.animatedWord, styles.wordOut, outgoingWord.className)}
                >
                    {`${prefixText}${outgoingWord.text}${suffixText}`}
                </span>
            )}
            <span key={cycle} className={classnames(styles.animatedWord, cycle > 0 && styles.wordIn, word.className)}>
                {`${prefixText}${word.text}${suffixText}`}
            </span>
        </span>
    );
};
