import classNames from 'classnames';
import React from 'react';
import supportedFrameworks from '../utils/supported-frameworks';
import FrameworkSelector from './FrameworkSelector';
import { Icon } from './Icon';
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
        <div className="ag-styles">
            <div className={styles.topBar}>
                <div className={classNames(styles.topBarInner, 'page-margin')}>
                    <button
                        className={classNames(styles.topBarNavButton, 'button-input')}
                        type="button"
                        data-toggle="collapse"
                        data-target="#side-nav"
                        aria-controls="side-nav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span>Docs</span>
                        <Icon name="collapseCategories" />
                    </button>

                    <Search currentFramework={currentFramework} />

                    {currentFramework && (
                        <FrameworkSelector
                            data={frameworksData}
                            currentFramework={currentFramework}
                            showSelectedFramework
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
