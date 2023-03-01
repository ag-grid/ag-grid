import React from 'react';
import supportedFrameworks from '../utils/supported-frameworks';
import FrameworkSelector from './FrameworkSelector';
import Search from './search/Search';
import styles from './TopBar.module.scss';

export const TopBar = ({ frameworks, currentFramework, path }) => {
    const frameworksData = supportedFrameworks
        .filter((f) => !frameworks || frameworks.includes(f))
        .map((framework) => ({
            name: framework,
            url: path.replace(`/${currentFramework}-`, `/${framework}-`),
        }));

    return (
        <div className={styles['top-bar']}>
            <div className={styles['top-bar__wrapper']}>
                <div className={styles['top-bar__search']}>
                    <button
                        className={styles['top-bar__nav-button']}
                        type="button"
                        data-toggle="collapse"
                        data-target="#side-nav"
                        aria-controls="side-nav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className={styles['top-bar__nav-button-icon']}></span>
                    </button>

                    <Search currentFramework={currentFramework} />
                </div>

                {currentFramework && (
                    <div className={styles['top-bar__framework-selector']}>
                        <FrameworkSelector
                            data={frameworksData}
                            currentFramework={currentFramework}
                            showSelectedFramework
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
