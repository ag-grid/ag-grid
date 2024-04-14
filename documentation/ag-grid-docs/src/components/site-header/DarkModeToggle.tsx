import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/Icon.module.scss';
import gridHeaderStyles from '@legacy-design-system/modules/SiteHeader.module.scss';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classNames from 'classnames';

export const DarkModeToggle = () => {
    const [darkmode, setDarkmode] = useDarkmode();

    return (
        <li className={classNames(gridHeaderStyles.navItem, gridHeaderStyles.buttonItem)}>
            <button
                className={classNames(gridHeaderStyles.navLink, 'button-style-none')}
                onClick={() => setDarkmode(!darkmode)}
            >
                <div className={classNames(gridHeaderStyles.icon, gridHeaderStyles.pseudoIcon)} />

                <span>Dark Mode</span>
            </button>
        </li>
    );
};
