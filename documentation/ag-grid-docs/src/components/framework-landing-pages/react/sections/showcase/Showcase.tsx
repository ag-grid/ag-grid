import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import React from 'react';

import styles from './Showcase.module.scss';

const Showcase: React.FC = () => {
    const [darkMode] = useDarkmode();

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
                                        AG Grid, with standalone charts from AG Charts.
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
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.button} onClick={() => handleExpand(2)}>
                            <div className={styles.buttonTitleContainer}>
                                <span className={styles.buttonTitle}>Developer Platforms</span>{' '}
                                <Icon svgClasses={styles.buttonIcon} name={expanded === 2 ? 'minimize' : 'maximize'} />
                            </div>
                            {expanded === 2 && (
                                <div className={styles.buttonDetailContainer}>
                                    <span className={styles.buttonDetail}>
                                        Open-source developer platform and workflow engine who use AG Grid as part of
                                        their drag & drop UI builder.
                                    </span>
                                    <div className={styles.buttonFooter}>
                                        <a>Preview</a>
                                        <a>Source Code</a>
                                    </div>
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
                                    <span className={styles.buttonDetail}>
                                        Planning, scheduling, and sequencing tools for modern space missions. AG Grid is
                                        used throughout to help visualise mission data.
                                    </span>
                                    <div className={styles.buttonFooter}>
                                        <a>Preview</a>
                                        <a>Source Code</a>
                                    </div>
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
                                    <span className={styles.buttonDetail}>
                                        An open source React library for building dashboards, with AG Grid enterprise
                                        support for building React tables with advanced features.
                                    </span>
                                    <div className={styles.buttonFooter}>
                                        <a className={styles.secondaryCta}>Preview</a>
                                        <a className={styles.primaryCta}>Source Code</a>
                                    </div>
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
                                <div className={styles.imageTitle}>mlflow.org</div>
                                <img
                                    src="/landing-pages/showcase/mlflow.png"
                                    alt="MLFlow Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
                        {expanded === 2 && (
                            <>
                                <div className={styles.imageTitle}>windmill.dev</div>
                                <img
                                    src={`/landing-pages/showcase/${darkMode ? 'windmill-light.png' : 'windmill.png'}`}
                                    alt="Windmill Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
                        {expanded === 3 && (
                            <>
                                <div className={styles.imageTitle}>nasa.ammos.io</div>
                                <img
                                    src={`/landing-pages/showcase/${darkMode ? 'nasa-aerie-light.png' : 'nasa-aerie.png'}`}
                                    alt="NASA Aerie Admin Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
                        {expanded === 4 && (
                            <>
                                <div className={styles.imageTitle}>marmelab.com/react-admin</div>
                                <img
                                    src="/landing-pages/showcase/react-admin.png"
                                    alt="React Admin Landing Page with React Table"
                                    className={styles.stackedImage}
                                />
                            </>
                        )}
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
