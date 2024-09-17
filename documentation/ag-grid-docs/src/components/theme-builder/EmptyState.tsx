import styles from './EmptyState.module.scss';

export const EmptyState = () => {
    return (
        <>
            <div className={styles.emptyWrapper}>
                <img
                    className={styles.lightImage}
                    alt="Theme builder preview animation"
                    src="/theme-builder/theme-builder.png"
                ></img>
                <img
                    className={styles.darkImage}
                    alt="Theme builder preview animation"
                    src="/theme-builder/theme-builder-dark.png"
                ></img>
                <h2 className={styles.headingEmpty}>Sorry, Theme Builder isn't available on smaller devices</h2>
                <p className={styles.paragraphyEmpty}>
                    Visit us on a larger device to explore our many preset themes, customise colours, spacing, and
                    typography and download your own{' '}
                    <span className={styles.lineGrid}>
                        <a href="https://www.ag-grid.com/react-data-grid/themes/">AG Grid theme</a>
                    </span>
                    .
                </p>
            </div>
        </>
    );
};
