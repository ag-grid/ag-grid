import ThemePlaceholderDark from '@ag-website-shared/images/inline-svgs/theme-builder-dark.svg?react';
import ThemePlaceholderLight from '@ag-website-shared/images/inline-svgs/theme-builder-light.svg?react';

import styles from './EmptyState.module.scss';

export const EmptyState = () => {
    return (
        <>
            <div className={styles.emptyWrapper}>
                <ThemePlaceholderLight className={styles.iconLight} />
                <ThemePlaceholderDark className={styles.iconDark} />
                <h2 className={styles.headingEmpty}>Theme Builder isn't available on mobile</h2>
                <p className={styles.paragraphyEmpty}>Visit ag-grid.com on desktop or tablet to use this</p>
            </div>
        </>
    );
};
