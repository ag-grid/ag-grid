import type { Point } from './geometry';

export type PositionLocation =
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';

export function getOffset(element: HTMLElement | SVGElement): Point {
    let offset;
    if (element instanceof SVGElement) {
        const parentRect = element.parentElement!.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        offset = {
            x: -parentRect.x - elementRect.width / 2,
            y: -parentRect.y - elementRect.height / 2,
        };
    } else {
        const elementRect = element.getBoundingClientRect();
        offset = {
            x: elementRect.x,
            y: elementRect.y,
        };
    }

    return offset;
}

export function getScrollOffset(): Point {
    return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop,
    };
}

export function getBoundingClientPosition({
    element,
    positionLocation = 'center',
}: {
    element: HTMLElement;
    positionLocation?: PositionLocation;
}): Point {
    let position: Point;

    const { x, y, width, height } = element.getBoundingClientRect();

    if (positionLocation === 'topLeft') {
        position = {
            x,
            y,
        };
    } else if (positionLocation === 'topCenter') {
        position = {
            x: x + width / 2,
            y,
        };
    } else if (positionLocation === 'topRight') {
        position = {
            x: x + width,
            y,
        };
    } else if (positionLocation === 'centerLeft') {
        position = {
            x: x,
            y: y + height / 2,
        };
    } else if (positionLocation === 'center') {
        position = {
            x: x + width / 2,
            y: y + height / 2,
        };
    } else if (positionLocation === 'centerRight') {
        position = {
            x: x + width,
            y: y + height / 2,
        };
    } else if (positionLocation === 'bottomLeft') {
        position = {
            x,
            y: y + height,
        };
    } else if (positionLocation === 'bottomCenter') {
        position = {
            x: x + width / 2,
            y: y + height,
        };
    } else if (positionLocation === 'bottomRight') {
        position = {
            x: x + width,
            y: y + height,
        };
    }

    return position!;
}

export function findElementWithInnerText({
    containerEl = document.body,
    selector,
    text,
    index,
}: {
    containerEl?: HTMLElement;
    selector: string;
    text: string;
    index?: number;
}): HTMLElement | undefined {
    let element!: HTMLElement;
    let curIndex = 0;

    containerEl.querySelectorAll(selector).forEach((el) => {
        const htmlElement = el as HTMLElement;
        const sanitisedElementText = htmlElement.innerText
            .trim()
            .replace(/\u200e/g, '') // Left to Right mark eg, in localisation text
            .replace(/\u200f/g, ''); // Right to Left mark eg, in localisation text
        if (sanitisedElementText === text.trim()) {
            if (index === undefined) {
                element = htmlElement;
                return;
            } else if (index === curIndex) {
                element = htmlElement;
            }
            curIndex++;
        }
    });

    return element;
}

export function getBottomMidPos(element: HTMLElement): Point {
    const screenWidth = element.clientWidth;
    const screenHeight = element.clientHeight;

    return {
        x: screenWidth / 2,
        y: screenHeight,
    };
}

export function isElementChildOfClass({
    element,
    classname,
    maxNest,
}: {
    element: HTMLElement | null;
    classname: string;
    maxNest?: HTMLElement | number;
}): boolean {
    let counter = 0;

    while (element) {
        if (element.classList.contains(classname)) {
            return true;
        }

        element = element.parentElement;

        if (typeof maxNest == 'number') {
            if (++counter > maxNest) {
                break;
            }
        } else if (element === maxNest) {
            break;
        }
    }

    return false;
}

export function isInViewport({
    element,
    threshold,
    scrollContainer,
}: {
    element: HTMLElement;
    threshold: number;
    scrollContainer?: HTMLElement;
}): boolean {
    if (!element) {
        return false;
    }

    const windowHeight = window.innerHeight;
    const elRect = element.getBoundingClientRect();
    const amountInView = (windowHeight - elRect.top) / elRect.height;

    const withinWindow = elRect.top >= 0 && elRect.bottom <= windowHeight;
    const withinVisibilityThreshold = elRect.top < windowHeight && elRect.bottom >= 0 && amountInView > threshold;
    const isWithinWindow = withinWindow || withinVisibilityThreshold;

    let isWithinViewport = isWithinWindow;
    if (scrollContainer) {
        const scrollContainerRect = scrollContainer.getBoundingClientRect();
        const scrollYDiff = elRect.y - scrollContainerRect.y;
        const withinScrollY = scrollYDiff > 0 && scrollYDiff < scrollContainerRect.height;

        isWithinViewport = isWithinViewport && withinScrollY;
    }

    return isWithinViewport;
}
