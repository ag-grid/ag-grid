import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';
import { StyleGuideProvider } from './StyleGuideContext';
import { Sidebar } from './chrome/Sidebar';
import { Toolbar } from './chrome/Toolbar';
import { SECTIONS } from './sections';

/**
 * The design system reference.
 *
 * Structured as a sidebar plus one long scrolling document rather than a page per section, because
 * the questions this page answers are usually comparative - which grey, which of these two
 * spacings, does this read in dark mode - and comparison across a page break is hard.
 *
 * All token data is read from the live stylesheet and the design system's own Sass source at
 * runtime (see `lib/tokens.ts` and `lib/sassSource.ts`), so this page cannot fall behind the code
 * it documents.
 */
export const StyleGuide: FunctionComponent = () => (
    <StyleGuideProvider>
        <div className={styles.styleGuide}>
            <div className={styles.sidebarColumn}>
                <Sidebar />
            </div>

            <main className={styles.content}>
                <header className={styles.pageHeader}>
                    <h1>Design system</h1>
                    <p className={styles.pageLede}>
                        The tokens, elements and components shared across the AG websites. Every value on this page is
                        read from the design system itself, so it is always current.
                    </p>
                </header>

                <Toolbar />

                {SECTIONS.map(({ id, Component }) => (
                    <Component key={id} />
                ))}
            </main>
        </div>
    </StyleGuideProvider>
);
