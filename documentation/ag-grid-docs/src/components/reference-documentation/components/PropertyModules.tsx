import type { Framework } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { type FunctionComponent, useCallback, useEffect, useState } from 'react';

import styles from './PropertyModules.module.scss';

const Module: FunctionComponent<{
    module: object;
    framework: Framework;
}> = ({ module, framework }) => {
    return (
        <a
            href={urlWithPrefix({
                url: './modules',
                framework,
            })}
        >
            <Icon name="module" />
            <span>{module.name}</span>
            {module.isEnterprise && <Icon name="enterprise" svgClasses={styles.enterpriseIcon} />}
        </a>
    );
};

export const PropertyModules: FunctionComponent<{
    modules: Array;
    framework: Framework;
}> = ({ modules, framework }) => {
    const firstModule = modules[0];
    const otherModules = modules.slice(0) ?? [];

    const labelCount = otherModules.length - 1;
    const [isModuleTooltipVisible, setIsModuleTooltipVisible] = useState(false);

    const toggleModuleTooltip = useCallback(() => {
        setIsModuleTooltipVisible((prev) => !prev);
    }, []);

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isModuleTooltipVisible) {
                const target = event.target as HTMLElement;
                if (!target.closest(`.${styles.moduleItem}`)) {
                    setIsModuleTooltipVisible(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isModuleTooltipVisible]);

    return (
        <div className={classnames(styles.metaItem, styles.moduleItem)}>
            <div className={styles.moduleContent}>
                <Module module={firstModule} framework={framework} />

                {otherModules.length > 1 && (
                    <>
                        <span
                            className={classnames(styles.moduleCount, {
                                [styles.moduleCountActive]: isModuleTooltipVisible,
                            })}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleModuleTooltip();
                            }}
                        >
                            +{labelCount} <Icon name="chevronDown" />
                        </span>

                        <div
                            className={classnames(styles.moduleTooltip, {
                                [styles.isVisible]: isModuleTooltipVisible,
                            })}
                        >
                            <div className={styles.moduleTooltipContent}>
                                <span className={styles.moduleTooltipTitle}>Available in any of</span>
                                {otherModules.map((module) => (
                                    <Module module={module} framework={framework} key={module.name} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
