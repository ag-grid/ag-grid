import type { Framework } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { type FunctionComponent, useCallback, useEffect, useId, useRef, useState } from 'react';

import styles from './PropertyModules.module.scss';

const Module: FunctionComponent<{
    module: object;
    framework: Framework;
}> = ({ module, framework }) => {
    return (
        <a
            tabIndex={0}
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
    const tooltipId = useId();
    const toggleRef = useRef<HTMLButtonElement>(null);
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

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isModuleTooltipVisible && event.key === 'Escape') {
                setIsModuleTooltipVisible(false);
                toggleRef.current?.focus();
            }
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModuleTooltipVisible]);

    return (
        <div className={classnames(styles.metaItem, styles.moduleItem)}>
            <div className={styles.moduleContent}>
                <Module module={firstModule} framework={framework} />

                {otherModules.length > 1 && (
                    <>
                        <button
                            ref={toggleRef}
                            type="button"
                            // Safari omits buttons from the tab order without an explicit tabindex.
                            tabIndex={0}
                            className={classnames(styles.moduleCount, {
                                [styles.moduleCountActive]: isModuleTooltipVisible,
                            })}
                            aria-expanded={isModuleTooltipVisible}
                            aria-controls={tooltipId}
                            aria-label={`${isModuleTooltipVisible ? 'Hide' : 'Show'} ${labelCount} more modules`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleModuleTooltip();
                            }}
                        >
                            +{labelCount} <Icon name="chevronDown" />
                        </button>

                        <div
                            id={tooltipId}
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
