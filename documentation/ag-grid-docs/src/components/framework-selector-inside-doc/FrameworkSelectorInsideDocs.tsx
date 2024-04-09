import type { Framework, MenuItem } from '@ag-grid-types';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { FRAMEWORKS } from '@constants';
import { DOCS_FRAMEWORK_REDIRECT_PAGE } from '@features/docs/constants';
import { getPageNameFromPath } from '@features/docs/utils/urlPaths';
import styles from '@legacy-design-system/modules/FrameworkSelectorInsideDocs.module.scss';
import { getFrameworkDisplayText } from '@utils/framework';
import { getNewFrameworkPath } from '@utils/framework';
import { getMenuItemFromPageName } from '@utils/getMenuItemFromPageName';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';

interface Props {
    path: string;
    currentFramework: Framework;
    menuItems: MenuItem[];
}

export const FrameworkSelectorInsideDocs = ({ path, currentFramework, menuItems }: Props) => {
    const handleFrameworkChange = (selectedFramework: Framework) => {
        const pageName = getPageNameFromPath(path);
        const menuItem = getMenuItemFromPageName({ menuItems: menuItems, pageName });
        let newUrl = getNewFrameworkPath({
            path,
            currentFramework,
            newFramework: selectedFramework,
        });

        // Redirect to default page if page does not exist in framework
        if (menuItem?.frameworks) {
            const withinFrameworks = menuItem?.frameworks?.includes(selectedFramework);

            if (!withinFrameworks) {
                const relativeUrl = DOCS_FRAMEWORK_REDIRECT_PAGE.startsWith('./')
                    ? DOCS_FRAMEWORK_REDIRECT_PAGE
                    : `./${DOCS_FRAMEWORK_REDIRECT_PAGE}`;
                newUrl = urlWithPrefix({
                    framework: selectedFramework,
                    url: relativeUrl,
                });
            }
        }

        window.location.href = newUrl;
    };

    const currentFrameworkLogo = currentFramework ? fwLogos[currentFramework] : null;

    return (
        <div className={classnames(styles.frameworkSelector)}>
            <div className={styles.selectFrameworkContainer}>
                {currentFrameworkLogo && (
                    <img src={currentFrameworkLogo} alt={`${currentFramework} logo`} className={styles.frameworkLogo} />
                )}
                <span className={styles.divider}></span>
                <select
                    value={currentFramework}
                    onChange={(event) => handleFrameworkChange(event.target.value as Framework)}
                    onClick={(event) => event.stopPropagation()} // Prevent event propagation
                    className={styles.select}
                    aria-label="Framework selector"
                >
                    {FRAMEWORKS.map((framework) => (
                        <option value={framework} key={framework}>
                            {getFrameworkDisplayText(framework)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
