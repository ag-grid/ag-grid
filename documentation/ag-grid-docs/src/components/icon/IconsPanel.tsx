import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Tabs } from '@ag-website-shared/components/tabs/Tabs';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';

import styles from './IconsPanel.module.scss';
import { ICON_NAMES as ICONS, ICON_THEMES as THEMES, type IconTheme as Theme } from './iconsData';

const capitalizeName = (name: string) => `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;

const IconsList = ({ theme }: { theme: Theme }) => (
    <>
        {ICONS.map((icon) => (
            <div key={icon} className={styles.iconItem}>
                <img src={urlWithBaseUrl(`/theme-icons/${theme}/${icon}.svg`)} alt={icon} title={icon}></img>
                <p className={styles.iconName}>{icon}</p>
            </div>
        ))}
    </>
);

const PanelWrapper = ({ theme }: { theme: Theme }) => (
    <div className={styles.iconList} role="tabpanel" aria-labelledby={`${theme}-tab`}>
        <IconsList theme={theme} />
    </div>
);

const BottomBar = ({ theme }: { theme: Theme }) => (
    <footer className={styles.footer}>
        <a
            className={classnames('button', styles.downloadButton)}
            href={urlWithBaseUrl(`/theme-icons/${theme}/${theme}-icons.zip`)}
        >
            Download All <Icon name="download" />
        </a>
    </footer>
);

const Tab = ({ theme }: { theme: Theme }) => {
    return (
        <>
            <PanelWrapper theme={theme} />
            <BottomBar theme={theme} />
        </>
    );
};

/**
 * This is a viewer for the available theme icons, and will also let the user download the icons.
 */
export const IconsPanel = () => {
    return (
        <Tabs>
            {THEMES.map((theme) => (
                <Tab key={theme} tab-label={`${capitalizeName(theme)} Icons`} theme={theme} />
            ))}
        </Tabs>
    );
};
