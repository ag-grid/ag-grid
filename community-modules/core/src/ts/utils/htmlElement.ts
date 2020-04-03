export function addCssClass(element: HTMLElement, className: string) {
    if (!className || className.length === 0) { return; }

    if (className.indexOf(' ') >= 0) {
        className.split(' ').forEach(value => addCssClass(element, value));
        return;
    }

    if (element.classList) {
        element.classList.add(className);
    } else if (element.className && element.className.length > 0) {
        const cssClasses = element.className.split(' ');

        if (cssClasses.indexOf(className) < 0) {
            cssClasses.push(className);
            element.setAttribute('class', cssClasses.join(' '));
        }
    } else {
        // do not use element.classList = className here, it will cause
        // a read-only assignment error on some browsers (IE/Edge).
        element.setAttribute('class', className);
    }

    return element;
}

export function removeCssClass(element: HTMLElement, className: string) {
    if (element.classList) {
        element.classList.remove(className);
    } else if (element.className && element.className.length > 0) {
        const newClassName = element.className.split(' ').filter(c => c !== className).join(' ');

        element.setAttribute('class', newClassName);
    }
}

export function addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean) {
    if (addOrRemove) {
        addCssClass(element, className);
    } else {
        removeCssClass(element, className);
    }
}

/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export function radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null) {
    const parent = element.parentElement;
    let sibling = parent.firstChild as HTMLElement;

    while (sibling) {
        if (elementClass) {
            addOrRemoveCssClass(sibling, elementClass, sibling === element);
        }
        if (otherElementClass) {
            addOrRemoveCssClass(sibling, otherElementClass, sibling !== element);
        }
        sibling = sibling.nextSibling as HTMLElement;
    }
}

export function containsClass(element: HTMLElement, className: string): boolean {
    if (element.classList) {
        // for modern browsers
        return element.classList.contains(className);
    }

    if (element.className) {
        // for older browsers, check against the string of class names
        // if only one class, can check for exact match
        const onlyClass = element.className === className;
        // if many classes, check for class name, we have to pad with ' ' to stop other
        // class names that are a substring of this class
        const contains = element.className.indexOf(' ' + className + ' ') >= 0;
        // the padding above then breaks when it's the first or last class names
        const startsWithClass = element.className.indexOf(className + ' ') === 0;
        const endsWithClass = element.className.lastIndexOf(' ' + className) === (element.className.length - className.length - 1);

        return onlyClass || contains || startsWithClass || endsWithClass;
    }

    // if item is not a node
    return false;
}

export function setDisplayed(element: HTMLElement, displayed: boolean) {
    addOrRemoveCssClass(element, 'ag-hidden', !displayed);
}

export function setVisible(element: HTMLElement, visible: boolean) {
    addOrRemoveCssClass(element, 'ag-invisible', !visible);
}

export function isElementChildOfClass(element: HTMLElement, cls: string, maxNest?: number): boolean {
    let counter = 0;

    while (element) {
        if (containsClass(element, cls)) {
            return true;
        }
        element = element.parentElement;
        if (maxNest && ++counter > maxNest) { break; }
    }

    return false;
}
