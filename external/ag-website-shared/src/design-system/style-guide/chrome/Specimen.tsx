import classnames from 'classnames';
import type { FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from './CopyButton';

interface Props {
    /** Live rendering of the thing being documented. */
    children: ReactNode;
    /** Markup or CSS that produces it, shown beneath and copyable. */
    code?: string;
    /** Short caption above the preview. */
    label?: ReactNode;
    /** Lays the preview out as a horizontal row of variants rather than a block. */
    row?: boolean;
    /** Puts the preview on the secondary background, for things that need contrast against it. */
    onSecondary?: boolean;
    className?: string;
}

/**
 * Frames a live example next to the code that produces it.
 *
 * Pairing the two is what separates a reference from a screenshot: a developer can see the
 * rendering, read the exact classes that caused it, and copy them.
 */
export const Specimen: FunctionComponent<Props> = ({ children, code, label, row, onSecondary, className }) => (
    <figure className={classnames(styles.specimen, className)}>
        {label && <figcaption className={styles.specimenLabel}>{label}</figcaption>}
        <div
            className={classnames(styles.specimenPreview, {
                [styles.specimenPreviewRow]: row,
                [styles.specimenPreviewSecondary]: onSecondary,
            })}
        >
            {children}
        </div>
        {code && (
            <div className={styles.specimenCode}>
                <pre>
                    <code>{code}</code>
                </pre>
                <CopyButton value={code} label="Copy" />
            </div>
        )}
    </figure>
);

/**
 * Labels one variant inside a `row` specimen. Uses a plain span rather than `<label>` so it never
 * associates itself with a neighbouring form control.
 */
export const Variant: FunctionComponent<{ name: ReactNode; children: ReactNode }> = ({ name, children }) => (
    <div className={styles.variant}>
        <span className={styles.variantName}>{name}</span>
        <div className={styles.variantBody}>{children}</div>
    </div>
);
