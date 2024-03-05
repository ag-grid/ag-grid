import { FRAMEWORKS } from '@constants';
import styles from '@design-system/modules/FrameworkSelectorInsideDocs.module.scss';
import fwLogos from '@images/fw-logos';
import { getFrameworkDisplayText, getNewFrameworkPath } from '@utils/framework';
import classnames from 'classnames';
import React from 'react';

import { Dropdown } from '../../components/dropdown/Dropdown';

export const FrameworkSelectorInsideDocs = ({ path, currentFramework }) => {
    const handleFrameworkChange = (selectedFramework) => {
        const newUrl = getNewFrameworkPath({
            path,
            currentFramework,
            newFramework: selectedFramework,
        });
        window.location.href = newUrl;
    };

    const currentFrameworkLogo = currentFramework ? fwLogos[currentFramework] : null;

    // Create dropdown items for each framework
    const dropdownItems = FRAMEWORKS.map((framework) => {
        const frameworkDisplayText = getFrameworkDisplayText(framework);
        const frameworkLogo = fwLogos[framework];
        return (
            <div key={framework} onClick={() => handleFrameworkChange(framework)} className={styles.dropdownItem}>
                {frameworkLogo && (
                    <img src={frameworkLogo} alt={`${framework} logo`} className={styles.frameworkLogoInDropdown} />
                )}
                <div className={styles.frameworkItem}>{frameworkDisplayText}</div>
            </div>
        );
    });

    return (
        <div className={classnames(styles.frameworkSelector)}>
            <Dropdown
                triggerLabel={
                    <>
                        {currentFrameworkLogo && (
                            <img
                                src={currentFrameworkLogo}
                                alt={`${currentFramework} logo`}
                                className={styles.frameworkLogoInline}
                            />
                        )}{' '}
                        <div className={styles.frameworkItem}>{getFrameworkDisplayText(currentFramework)}</div>
                    </>
                }
            >
                {dropdownItems}
            </Dropdown>
        </div>
    );
};
