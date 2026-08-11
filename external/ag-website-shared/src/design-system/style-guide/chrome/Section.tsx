import classnames from 'classnames';
import type { FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';

interface SectionProps {
    /** Anchor id; must match the id registered in `sections.ts` for the sidebar to track it. */
    id: string;
    title: string;
    /** One or two sentences on what this is and why it exists. */
    lede: ReactNode;
    /** Where the tokens or styles in this section are defined, relative to `src/design-system`. */
    source?: string | string[];
    children: ReactNode;
}

/**
 * Consistent frame for every section: heading, lede, and a pointer to the file that owns the
 * styles.
 *
 * The source pointer is the part developers reach for - a swatch is no use if finding the
 * declaration behind it means grepping the repo.
 */
export const Section: FunctionComponent<SectionProps> = ({ id, title, lede, source, children }) => {
    const sources = source == null ? [] : Array.isArray(source) ? source : [source];

    return (
        <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
            <div className={styles.sectionHeader}>
                <h2 id={`${id}-heading`}>
                    <a href={`#${id}`} className={styles.anchorLink}>
                        {title}
                    </a>
                </h2>
                {sources.length > 0 && (
                    <p className={styles.sectionSource}>
                        Defined in{' '}
                        {sources.map((path, index) => (
                            <span key={path}>
                                {index > 0 && ', '}
                                <code>{path}</code>
                            </span>
                        ))}
                    </p>
                )}
            </div>
            <div className={styles.sectionLede}>{lede}</div>
            {children}
        </section>
    );
};

/** Sub-heading inside a section. Kept out of the h2/h3 flow the site's own styles target. */
export const Block: FunctionComponent<{ title: string; note?: ReactNode; children: ReactNode }> = ({
    title,
    note,
    children,
}) => (
    <div className={styles.block}>
        <h3 className={styles.blockTitle}>{title}</h3>
        {note && <div className={styles.blockNote}>{note}</div>}
        {children}
    </div>
);

/**
 * Paired usage guidance. Both columns are required on purpose: a "do" with no matching "don't"
 * tends to restate the obvious, whereas the pair pins down the actual decision.
 */
export const Guidance: FunctionComponent<{ dos: ReactNode[]; donts: ReactNode[] }> = ({ dos, donts }) => (
    <div className={styles.guidance}>
        <div className={classnames(styles.guidanceColumn, styles.guidanceDo)}>
            <h4>Do</h4>
            <ul className="list-style-none">
                {dos.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
        <div className={classnames(styles.guidanceColumn, styles.guidanceDont)}>
            <h4>Don&rsquo;t</h4>
            <ul className="list-style-none">
                {donts.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
);

/**
 * Flags something in the design system that is a known problem rather than a rule to follow.
 *
 * Recording these in the guide instead of leaving them as `// TODO` comments in `_root.scss` is
 * the point: a designer reviewing a page needs to know which tokens are provisional.
 */
export const KnownIssue: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
    <div className={styles.knownIssue}>
        <span className={styles.knownIssueTag}>Known issue</span>
        <div>{children}</div>
    </div>
);
