import ThemePlaceholderDark from '@ag-website-shared/images/inline-svgs/theme-builder-dark.svg?react';
import ThemePlaceholderLight from '@ag-website-shared/images/inline-svgs/theme-builder-light.svg?react';

import styles from './EmptyState.module.scss';

export const EmptyState = () => {
    return (
        <>
            <div className={styles.emptyWrapper}>
                <ThemePlaceholderLight className={styles.iconLight} />
                <ThemePlaceholderDark className={styles.iconDark} />
                <h2 className={styles.headingEmpty}>Sorry Theme Builder isn’t available on mobile</h2>
                <p className={styles.paragraphyEmpty}>
                    Visit us on a larger device to explore our many preset themes, customise colours, spacing, and
                    typography and download your own{' '}
                    <span className={styles.lineGrid}>
                        <a href="https://ag-grid.com/react-data-grid/themes/">AG Grid theme</a>
                    </span>
                    .
                </p>
            </div>
        </>
    );
};
