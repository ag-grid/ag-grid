import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React from 'react';
import { Icon } from './Icon';
import styles from './IconsPanel.module.scss';
import { Tabs } from './tabs/Tabs';

const THEMES = ['alpine', 'balham', 'material'];
const ICONS = [
    'aggregation',
    'arrows',
    'asc',
    'cancel',
    'chart',
    'checkbox-checked',
    'checkbox-indeterminate',
    'checkbox-unchecked',
    'color-picker',
    'columns',
    'contracted',
    'copy',
    'cut',
    'cross',
    'csv',
    'desc',
    'down',
    'excel',
    'expanded',
    'eye-slash',
    'eye',
    'filter',
    'first',
    'grip',
    'group',
    'last',
    'left',
    'linked',
    'loading',
    'maximize',
    'menu',
    'minimize',
    'minus',
    'next',
    'none',
    'not-allowed',
    'paste',
    'pin',
    'pivot',
    'plus',
    'previous',
    'radio-button-off',
    'radio-button-on',
    'right',
    'save',
    'small-down',
    'small-left',
    'small-right',
    'small-up',
    'tick',
    'tree-closed',
    'tree-indeterminate',
    'tree-open',
    'unlinked',
    'up',
];

const capitalizeName = (name) => `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;


const IconsList = ({ theme }) => (
    <>
        {ICONS.map((icon) => (
            <div className={styles.iconItem}>
                <img src={withPrefix(`/theme-icons/${theme}/${icon}.svg`)} alt={icon} title={icon}></img>
                <p className={styles.iconName}>{icon}</p>
            </div>
        ))}
    </>
);

const PanelWrapper = ({ theme }) => (
    <div className={styles.iconList} role="tabpanel" aria-labelledby={`${theme}-tab`}>
        <IconsList theme={theme} />
    </div>
);

const BottomBar = ({ theme }) => (
    <footer className={styles.footer}>
        <button
            className={classnames('button', styles.downloadButton)}
            href={withPrefix(`/theme-icons/${theme}/${theme}-icons.zip`)}
        >
            Download All <Icon name="download" />
        </button>
    </footer>
);

const Tab = ({ theme }) => {
    return <>
        <PanelWrapper theme={theme} />
        <BottomBar theme={theme} />
    </>
}

/**
 * This is a viewer for the available theme icons, and will also let the user download the icons.
 */
const IconsPanel = () => {
    return (
        <Tabs>
            {THEMES.map((theme) =>
                <Tab key={theme}
                    tab-label={`${capitalizeName(theme)} Icons`}
                    theme={theme} />)}
        </Tabs>
    );
};

export default IconsPanel;
