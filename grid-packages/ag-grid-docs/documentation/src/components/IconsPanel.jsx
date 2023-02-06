import React, { useState } from 'react';
import { withPrefix } from 'gatsby';
import classnames from 'classnames';
import styles from './IconsPanel.module.scss';

const icons = [
    'aggregation', 'arrows', 'asc', 'cancel', 'chart',
    'checkbox-checked', 'checkbox-indeterminate',
    'checkbox-unchecked', 'color-picker',
    'columns', 'contracted', 'copy', 'cut', 'cross', 'csv', 'desc',
    'excel', 'expanded', 'eye-slash', 'eye', 'filter', 'first',
    'grip', 'group', 'last', 'left', 'linked',
    'loading', 'maximize', 'menu', 'minimize', 'next',
    'none', 'not-allowed', 'paste', 'pin', 'pivot',
    'previous', 'radio-button-off', 'radio-button-on', 'right',
    'save', 'small-down', 'small-left', 'small-right', 'small-up',
    'tick', 'tree-closed', 'tree-indeterminate', 'tree-open', 'unlinked'
];

const capitalizeName = (name) => `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;

const themes = ['alpine', 'balham', 'material'];

const onTabClick = (e, setActiveTheme, theme) => {
    e.preventDefault();
    setActiveTheme(theme);
};

const PanelTabs = ({ activeTheme, setActiveTheme }) => (
    <ul className={styles['icons-panel__container']}>
        {themes.map(theme => (
            <li className={styles['icons-panel__item']} key={`${theme}-tab`}>
                <button
                    className={classnames(styles['icons-panel__nav-link'], { [styles['icons-panel__nav-link--active']]: theme === activeTheme })}
                    data-toggle="tab"
                    role="tab"
                    onClick={e => onTabClick(e, setActiveTheme, theme)}
                    aria-controls={theme}
                    aria-selected={theme === activeTheme ? 'true' : 'false'}>{`${capitalizeName(theme)} Icons`}
                </button>
            </li>
        ))}
    </ul>
);

const IconsList = ({ theme }) => (
    <div className={styles['icons-panel__icon-list']}>
        {icons.map(icon => (
            <div className={styles['icons-panel__icon-tile']}>
                <img src={withPrefix(`/theme-icons/${theme}/${icon}.svg`)} alt={icon} title={icon}></img>
                <p className={styles['icons-panel__icon-tile__name']}>{icon}</p>
            </div>
        ))}
    </div>
);

const PanelWrapper = ({ theme }) => (
    <div className={styles['icons-panel__wrapper']}>
        <div className={styles['icons-panel__body']} role="tabpanel" aria-labelledby={`${theme}-tab`}>
            <IconsList theme={theme} />
        </div>
    </div>
);

const BottomBar = ({ theme }) => (
    <div className={styles['icons-panel__download']}><a href={withPrefix(`/theme-icons/${theme}/${theme}-icons.zip`)}>Download All</a></div>
);

/**
 * This is a viewer for the available theme icons, and will also let the user download the icons.
 */
const IconsPanel = () => {
    const [activeTheme, setActiveTheme] = useState('alpine');

    return (
        <div className={styles['icons-panel']}>
            <PanelTabs activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
            <PanelWrapper theme={activeTheme} />
            <BottomBar theme={activeTheme} />
        </div>
    );
};

export default IconsPanel;