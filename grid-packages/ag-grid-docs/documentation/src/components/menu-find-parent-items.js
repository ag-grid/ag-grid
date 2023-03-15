/**
 * Find the parent items of the current page within the documentation menu
 */

function sectionHasPath(section, urlPath) {
    if (section.items) {
        return section.items.reduce((acc, sectionItem) => {
            return acc || sectionHasPath(sectionItem, urlPath);
        }, false);
    } else {
        return urlPath === section.url;
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

export function findParentItems(combinedMenuItems, urlPath) {
    let foundPath;
    combinedMenuItems.forEach((section) => {
        if (foundPath) {
            return;
        }

        const sectionPath = getFullPath(section, urlPath);
        if (sectionPath.length) {
            foundPath = [section].concat(sectionPath);
        }
    });

    return foundPath || [];
}
