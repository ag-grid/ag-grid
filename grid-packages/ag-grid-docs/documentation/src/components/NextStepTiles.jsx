import React from 'react';
import { Link } from 'gatsby';
import classnames from 'classnames';
import styles from './NextStepTiles.module.scss';

// Use disableMarkdown if you need to use nested html within your note. E.g. <kbd>.
const NextStepTiles = (props) => {
    return (
        <div className={styles.tilesContainer}>
            {props.tutorial1 === "true" &&
                <div className={styles.card}>
                    <Link to="/deep-dive">
                        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                            Create a Basic Grid
                        </div>
                    </Link>
                    <div className={styles.cardBody}>
                        <p>An introduction to the key concepts of the grid</p>
                        <img alt={'Preview of Create a Basic Grid Tutorial Output'} className={styles.exampleImg} src='https://downloads.jamesswinton.com/create-a-basic-grid-example.png' />
                    </div>
                    <hr></hr>
                    <div className={styles.cardFeatures}>
                        <p className={styles.feature}>Pagination</p>
                        <p className={styles.feature}>Sorting</p>
                        <p className={styles.feature}>Editing</p>
                        <p className={styles.feature}>Filtering</p>
                        <p className={styles.feature}>Resizing</p>
                        <p className={styles.feature}>Row Selection</p>
                    </div>
                </div>
            }
            {props.tutorial2 === "true" &&
                <div className={styles.card}>
                    <Link to="/customising-the-grid">
                        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                            Customising the Grid
                        </div>
                    </Link>
                    <p>Customise, style and extend the grid</p>
                    <div className={styles.cardBody}>
                        <img alt={'Preview of Customising the Grid Tutorial Output'} className={styles.exampleImg} src='https://downloads.jamesswinton.com/customising-the-grid.png' />
                    </div>
                    <hr></hr>
                    <div className={styles.cardFeatures}>
                        <p className={styles.feature}>Cell Renderers</p>
                        <p className={styles.feature}>Cell Styles</p>
                        <p className={styles.feature}>Row Styles</p>
                        <p className={styles.feature}>Tooltips</p>
                        <p className={styles.feature}>Value Formatters</p>
                    </div>
                </div>
            }
            {props.tutorial3 === "true" &&
                <div className={styles.card}>
                    <Link to="/advanced-features">
                        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                            Advanced Features
                        </div>
                    </Link>
                    <p>Implement advanced, enterprise features of the grid</p>
                    <div className={styles.cardBody}>
                        <img alt={'Preview of Advanced Features Tutorial Output'} className={styles.exampleImg} src='https://downloads.jamesswinton.com/customising-the-grid.png' />
                    </div>
                    <hr></hr>
                    <div className={styles.cardFeatures}>
                        <p className={styles.feature}>Aggregation</p>
                        <p className={styles.feature}>Row Grouping</p>
                        <p className={styles.feature}>Pivoting</p>
                        <p className={styles.feature}>Integrated Charts</p>
                        <p className={styles.feature}>Sparklines</p>
                        <p className={styles.feature}>Master / Detail</p>
                    </div>
                </div>
            }
        </div>
    );
};

export default NextStepTiles;
