import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { contrastRatio, formatRatio, gradeContrast } from '../lib/colour';
import type { Rgb, WcagGrade } from '../lib/colour';

const GRADE_CLASS: Record<WcagGrade, string> = {
    AAA: styles.gradePass,
    AA: styles.gradePass,
    'AA Large': styles.gradeWarn,
    Fail: styles.gradeFail,
};

interface Props {
    foreground?: Rgb;
    background?: Rgb;
    /** Grade against the 3:1 large-text threshold rather than 4.5:1. */
    large?: boolean;
}

/**
 * WCAG 2.1 contrast ratio for a foreground/background pair, graded.
 *
 * This is the single biggest gap the old guide had for designers: it showed which colours exist
 * but never whether a given pairing is legible, so accessibility was checked after the fact in a
 * separate tool - or not at all.
 */
export const ContrastBadge: FunctionComponent<Props> = ({ foreground, background, large = false }) => {
    if (!foreground || !background) {
        return <span className={styles.gradeUnknown}>&mdash;</span>;
    }

    const ratio = contrastRatio(foreground, background);
    const grade = gradeContrast(ratio, large);

    return (
        <span
            className={classnames(styles.grade, GRADE_CLASS[grade])}
            title={`${formatRatio(ratio)} against the ${large ? '3:1 large text' : '4.5:1 body text'} threshold`}
        >
            <span className={styles.gradeRatio}>{formatRatio(ratio)}</span>
            <span className={styles.gradeLabel}>{grade}</span>
        </span>
    );
};
