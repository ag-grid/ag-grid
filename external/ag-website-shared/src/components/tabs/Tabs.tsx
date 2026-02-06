import classnames from 'classnames';
import type { FunctionComponent, ReactElement } from 'react';
import { Children, useState } from 'react';

import { TabNavItem } from './TabNavItem';
import styles from './Tabs.module.scss';
import { TABS_LINKS_PROP, TAB_LABEL_PROP } from './constants';

interface Props {
    children: ReactElement[];
    /** Controlled mode: the currently selected tab label */
    selectedTab?: string;
    /** Controlled mode: callback when tab selection changes */
    onTabChange?: (tab: string) => void;
    className?: string;
}

export const Tabs: FunctionComponent<Props> = ({ children, selectedTab, onTabChange, className }) => {
    const contentChildren = Children.map(children, (child) => {
        return child.props[TAB_LABEL_PROP] ? child : null;
    }).filter(Boolean);
    const headerLinks = Children.map(children, (child) => {
        return child.props[TABS_LINKS_PROP] ? child : null;
    }).filter(Boolean);

    const [internalSelected, setInternalSelected] = useState(contentChildren[0]?.props[TAB_LABEL_PROP]);

    const selected = selectedTab ?? internalSelected;
    const handleSelect = (tab: string) => {
        setInternalSelected(tab);
        onTabChange?.(tab);
    };

    return (
        <div className={classnames('tabs-outer', styles.tabsOuter, className)}>
            <header className={'tabs-header'}>
                <ul className="tabs-nav-list" role="tablist">
                    {contentChildren.map(({ props }: ReactElement) => {
                        const label = props[TAB_LABEL_PROP];
                        return (
                            <TabNavItem
                                key={label}
                                label={label}
                                selected={selected === label}
                                onSelect={handleSelect}
                            />
                        );
                    })}
                </ul>

                {headerLinks && <div className={styles.externalLinks}>{headerLinks}</div>}
            </header>
            <div className="tabs-content" role="tabpanel" aria-labelledby={`${selected} tab`}>
                {contentChildren.find(({ props }: ReactElement) => props[TAB_LABEL_PROP] === selected)}
            </div>
        </div>
    );
};
