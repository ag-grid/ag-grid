/**
 * Find the parent items of the current page within the documentation menu
 */

function sectionHasPath(section, urlPath) {
    if (urlPath === section.url) {
        return true;
    } else if (section.items) {
        return section.items.reduce((acc, sectionItem) => {
            return acc || sectionHasPath(sectionItem, urlPath);
        }, false);
    }
}

function getFullPath(section, urlPath) {
    if (section.items) {
        return section.items.reduce((acc, sectionItem) => {
            const hasUrlPath = sectionHasPath(sectionItem, urlPath);
            let result = acc;

            if (hasUrlPath) {
                const furtherPath = getFullPath(sectionItem, urlPath);

                result = acc.concat(sectionItem).concat(furtherPath);
            }
            return result;
        }, []);
    }

    return [];
}

const isStandaloneChartsSection = ({ title }) => title === 'Standalone Charts';
const isGridSection = ({ title }) => title !== 'Standalone Charts';

export function findParentItems({ combinedMenuItems, path, page }) {
    const pathSegment = `/${path.split('/').reverse()[1]}/`;
    const isChartsPage = page?.startsWith('charts');
    let foundPath = [];

    // Charts and Grid have different URLs, so they can potentially have overlapping URL paths.
    // Separate the processing, so it doesn't clash
    if (isChartsPage) {
        const [standaloneChartsSection] = combinedMenuItems.filter(isStandaloneChartsSection) || [];
        const urlPath = pathSegment.replace('/', '/charts-');
        const sectionPath = getFullPath(standaloneChartsSection, urlPath);
        if (sectionPath.length) {
            foundPath = [standaloneChartsSection].concat(sectionPath);
        }
    } else {
        const [gridPath] =
            combinedMenuItems
                .map((section) => {
                    const isGrid = isGridSection(section);

                    if (isGrid) {
                        const sectionPath = getFullPath(section, pathSegment);
                        if (sectionPath.length) {
                            return [section].concat(sectionPath);
                        }
                    }
                })
                .filter((path) => Boolean(path)) || [];

        foundPath = gridPath ?? foundPath;
    }

    return foundPath;
}
