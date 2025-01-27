const getMajorMinor = (version: string) => {
    const versionSplit = version.split('.');
    const major = Number(versionSplit[0]);
    const minor = Number(versionSplit[1]);

    return { major, minor };
};

/**
 * Hide documentation links when the major and minor version is the
 * same as the library on the site
 */
function hideDocumentationLink() {
    const dataEl = document.querySelector('[data-documentation-id]') as HTMLElement;

    if (!dataEl) {
        return;
    }
    const { documentationId, version, libraryVersion } = dataEl.dataset;

    const libraryVersionParsed = getMajorMinor(libraryVersion as string);
    const versionParsed = getMajorMinor(version as string);

    if (libraryVersionParsed.major === versionParsed.major && libraryVersionParsed.minor === versionParsed.minor) {
        const documentationEl = document.getElementById(documentationId as string) as HTMLElement;
        const documentationNavEl = document
            .querySelector(`a[href="#${documentationId}"].nav-link`)
            ?.closest('li') as HTMLElement;

        documentationEl.style.display = 'none';
        documentationNavEl.style.display = 'none';
    }
}

hideDocumentationLink();
