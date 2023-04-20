import classnames from 'classnames';
import React, { FunctionalComponent, ReactNode, useState } from 'react';
import styles from './Tabs.module.scss';

const TAB_LABEL_PROP = 'tab-label'; // NOTE: kebab case to match markdown html props
const TABS_LINK_TYPE_NAME = 'TabsLinks';

interface Props {
    heading: string;
    children: ReactNode;
}

export const Tabs: FunctionalComponent<Props> = ({ children }) => {
    const contentChildren = children.filter((child) => child.props && child.props[TAB_LABEL_PROP]);
    const linksChildren = children.filter((child) => child.type?.name === TABS_LINK_TYPE_NAME);

    const [selected, setSelected] = useState(contentChildren[0]?.props[TAB_LABEL_PROP]);

    return (
        <div className={classnames('tabs-outer', styles.tabsOuter)}>
            <header className={'tabs-header'}>
                <ul className="tabs-nav-list" role="tablist">
                    {contentChildren.map(({ props }, idx) => {
                        const label = props[TAB_LABEL_PROP];
                        return (
                            <li key={label} className="tabs-nav-item" role="presentation">
                                <button
                                    className={classnames('button-style-none', 'tabs-nav-link', {
                                        active: label === selected,
                                    })}
                                    onClick={(e) => {
                                        setSelected(label);
                                        e.preventDefault();
                                    }}
                                    role="tab"
                                    disabled={label === selected}
                                >
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {linksChildren}
            </header>
            <div className="tabs-content" role="tabpanel" aria-labelledby={`${selected} tab`}>
                {contentChildren.find(({ props }) => props[TAB_LABEL_PROP] === selected)}
            </div>
        </div>
    );
};
