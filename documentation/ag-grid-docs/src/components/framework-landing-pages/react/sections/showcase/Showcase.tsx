import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import styles from './Showcase.module.scss';

const Showcase: React.FC = () => {
    const [expanded, setExpanded] = React.useState(0);

    const handleExpand = (index: number) => {
        setExpanded(index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.columnContainer}>
                <div className={styles.column}>
                    <div className={styles.buttonContainer}>
                        <div className={styles.button} onClick={() => handleExpand(0)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>Finance</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 0 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 0 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>
                                        Analyse complex financial data, perform calculations and visualise the data in
                                        charts, all directly from AG Grid. <br /> <br />
                                        In this example, openbb use both AG Grid and AG Charts to power their openbb
                                        terminal for financial markets
                                    </span>
                                    <div className={styles.buttonFooter}>
                                        <a>Preview</a>
                                        <a>Source Code</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.button} onClick={() => handleExpand(1)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>ML/AI</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 1 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 1 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>Details about ML/AI - MLFlow</span>
                                    <div className={styles.buttonFooter}>
                                        <a>Preview</a>
                                        <a>Source Code</a>
                                    </div>{' '}
                                </div>
                            )}
                        </div>

                        <div className={styles.button} onClick={() => handleExpand(2)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>Databases</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 2 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 2 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>Details about Database UIs - MongoDB</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.button} onClick={() => handleExpand(3)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>Data Modelling</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 3 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 3 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>Details about Modelling - NASA</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.button} onClick={() => handleExpand(4)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>Dashboards</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 4 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 4 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>Details about Dashboards - React Admin</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.imageContainer}>
                        {expanded === 0 && (
                            <>
                                <div className={styles.imageTitle}>open.bb</div>
                                <img
                                    src="/landing-pages/showcase/openbb.png"
                                    alt="OpenBB Terminal Pro Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
                        {expanded === 1 && (
                            <>
                                <div className={styles.imageTitle}>open.bb</div>
                                <img
                                    src="/landing-pages/showcase/mlflow.png"
                                    alt="MLFlow Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
                        {expanded === 2 && <img src="image3.jpg" alt="Image 3" className={styles.stackedImage} />}
                        {expanded === 3 && <img src="image4.jpg" alt="Image 4" className={styles.stackedImage} />}
                        {expanded === 4 && <img src="image5.jpg" alt="Image 5" className={styles.stackedImage} />}
                    </div>
                </div>
            </div>
            <div className={styles.communityCta}>
                <button>View More</button>
            </div>
        </div>
    );
};

export default Showcase;
