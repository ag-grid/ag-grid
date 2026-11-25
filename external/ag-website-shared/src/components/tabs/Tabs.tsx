import classnames from 'classnames';
import type { FunctionComponent, ReactElement } from 'react';
import { Children, useId, useState } from 'react';

import { TabNavItem } from './TabNavItem';
import styles from './Tabs.module.scss';
import { TABS_LINKS_PROP, TAB_LABEL_PROP } from './constants';
import { useTabList } from './useTabList';

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
    const labels: string[] = contentChildren.map(({ props }: ReactElement) => props[TAB_LABEL_PROP]);

    const [internalSelected, setInternalSelected] = useState(labels[0]);

    const selected = selectedTab ?? internalSelected;
    const selectedIndex = Math.max(labels.indexOf(selected), 0);
    const handleSelect = (tab: string) => {
        setInternalSelected(tab);
        onTabChange?.(tab);
    };

    const id = useId();
    const panelId = `${id}-panel`;
    const { tablistProps, getTabProps, getPanelProps } = useTabList({
        count: labels.length,
        selectedIndex,
        onSelect: (index) => handleSelect(labels[index]),
        getTabId: (index) => `${id}-tab-${index}`,
        getPanelId: () => panelId,
    });

    return (
        <div className={classnames('tabs-outer', styles.tabsOuter, className)}>
            <header className={'tabs-header'}>
                <ul className="tabs-nav-list" {...tablistProps}>
                    {labels.map((label, index) => (
                        <TabNavItem
                            key={label}
                            label={label}
                            selected={index === selectedIndex}
                            tabProps={getTabProps(index)}
                        />
                    ))}
                </ul>

                {headerLinks && <div className={styles.externalLinks}>{headerLinks}</div>}
            </header>
            <div className="tabs-content" {...getPanelProps(selectedIndex)}>
                {contentChildren[selectedIndex]}
            </div>
        </div>
    );
};
