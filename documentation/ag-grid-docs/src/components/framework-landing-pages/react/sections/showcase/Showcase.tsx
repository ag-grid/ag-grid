import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import styles from './Showcase.module.scss';
import showcaseDetails from './showcase.json';

const Showcase: React.FC = () => {
    const [darkMode] = useDarkmode();
    const [expanded, setExpanded] = React.useState<number>(0);

    const handleExpand = (index: number) => {
        setExpanded(index === expanded ? 0 : index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.columnContainer}>
                <div className={styles.column}>
                    <div className={styles.buttonContainer}>
                        {showcaseDetails.map((item, index) => (
                            <div key={index} className={styles.button} onClick={() => handleExpand(index)}>
                                <div className={styles.buttonTitleContainer}>
                                    <span className={styles.buttonTitle}>{item.title}</span>
                                    <Icon
                                        svgClasses={styles.buttonIcon}
                                        name={expanded === index ? 'chevronDown' : 'chevronRight'}
                                    />
                                </div>
                                {expanded === index && (
                                    <div className={styles.buttonDetailContainer}>
                                        <span className={styles.buttonDetail}>{item.detail}</span>
                                        <div className={styles.buttonFooter}>
                                            {item.links.map((link, linkIndex) => (
                                                <a
                                                    key={linkIndex}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {link.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.imageContainer}>
                        {showcaseDetails.map((item, index) => {
                            if (expanded === index) {
                                return (
                                    <React.Fragment key={index}>
                                        <a href={item.url} target="_blank">
                                            <div
                                                className={styles.imageTitle}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span style={{ flex: 1, textAlign: 'center' }}>{item.site}</span>
                                                <Icon svgClasses={styles.newTabIcon} name={'newTab'} />
                                            </div>
                                            <img
                                                src={urlWithBaseUrl(
                                                    darkMode && item.imageLight ? item.imageLight : item.image
                                                )}
                                                alt={item.alt}
                                                className={styles.stackedImage}
                                            />
                                        </a>
                                    </React.Fragment>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
            <div className={styles.communityCta}>
                <button onClick={() => (window.location.href = './community/showcase')}>View More</button>
            </div>
        </div>
    );
};

export default Showcase;
