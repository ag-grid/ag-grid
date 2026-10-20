import type { Framework, MenuItem } from '@ag-grid-types';
import { Select } from '@ag-website-shared/components/select/Select';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { DOCS_FRAMEWORK_REDIRECT_PAGE } from '@components/docs/constants';
import { getPageNameFromPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';
import { getFrameworkDisplayText, getNewFrameworkPath } from '@utils/framework';
import { getMenuItemFromPageName } from '@utils/getMenuItemFromPageName';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { navigate } from 'astro:transitions/client';
import { useMemo } from 'react';

import styles from './FrameworkSelectorInsideDocs.module.scss';
import { getFrameworkVersionLinks } from './frameworkVersionLinks';

interface Props {
    path: string;
    currentFramework: Framework;
    /**
     * Menu items used to check if the current page exists for the framework
     * to be changed to. If not provided, will just go to the page without
     * checks.
     */
    menuItems?: MenuItem[];
    /**
     * The frameworks the page exists in, from its `frameworks` frontmatter, used to only link to
     * versions of the page that exist. If not provided, the page is linked in every framework.
     */
    pageFrameworks?: Framework[];
}

export const FrameworkSelectorInsideDocs = ({ path, currentFramework, menuItems, pageFrameworks }: Props) => {
    const frameworkOptions = useMemo(() => {
        return FRAMEWORKS.map((framework) => ({
            label: getFrameworkDisplayText(framework),
            value: framework,
        }));
    }, []);

    const frameworkOption = useMemo(
        () => frameworkOptions.find((o: { value: string }) => o.value === currentFramework) || frameworkOptions[0],
        [frameworkOptions, currentFramework]
    );

    // Plain links beside the picker: its options only mount once it is opened, so without these the
    // server-rendered page has nothing for a crawler to follow to the other framework versions.
    const frameworkVersionLinks = useMemo(
        () => getFrameworkVersionLinks({ path, currentFramework, pageFrameworks }),
        [path, currentFramework, pageFrameworks]
    );

    const handleFrameworkChange = (selectedFramework: Framework) => {
        const pageName = getPageNameFromPath(path);
        const menuItem = menuItems && getMenuItemFromPageName({ menuItems, pageName });
        // The same page in another framework, so any query string still applies: an error page carries the
        // details of the reader's own error there, and license setup its integrated-charts choice.
        let newUrl =
            getNewFrameworkPath({
                path,
                currentFramework,
                newFramework: selectedFramework,
            }) + window.location.search;

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

        navigate(newUrl);
    };

    return (
        currentFramework && (
            <div className={styles.frameworkSelector}>
                <Select
                    isLarge
                    isPopper
                    options={frameworkOptions}
                    value={frameworkOption}
                    className={styles.select}
                    onChange={(newValue) => handleFrameworkChange(newValue.value as Framework)}
                    renderItem={(o) => {
                        return (
                            <span className={styles.frameworkItem}>
                                <img src={fwLogos[o.value]} alt={`${o.value} logo`} className={styles.frameworkLogo} />
                                {o.label}
                            </span>
                        );
                    }}
                />
                {frameworkVersionLinks.length > 0 && (
                    <nav className={styles.frameworkVersionLinks} aria-label="Other framework versions of this page">
                        <ul>
                            {frameworkVersionLinks.map(({ framework, label, href }) => (
                                <li key={framework}>
                                    {/* Clipped from view, so not a keyboard stop: the picker is the keyboard route. */}
                                    <a href={href} tabIndex={-1}>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        )
    );
};
