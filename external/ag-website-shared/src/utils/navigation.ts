import type { Location, To, Update } from 'history';
import { createBrowserHistory } from 'history';
import { useEffect, useState } from 'react';

export const browserHistory = import.meta.env.SSR ? null : createBrowserHistory();

export function useHistory(callback: (data: Update) => void) {
    useEffect(() => browserHistory?.listen(callback), []);
}

export function useLocation() {
    const [location, setLocation] = useState<Location | null>(browserHistory?.location ?? null);
    useHistory(({ location }) => setLocation(location));
    return location;
}

export function navigate(to: To, options?: { state?: any; replace?: boolean }) {
    if (options?.replace) {
        browserHistory?.replace(to, options?.state);
    } else {
        browserHistory?.push(to, options?.state);
    }
}

export function scrollIntoView(element?: HTMLElement | null, options?: ScrollIntoViewOptions) {
    requestAnimationFrame(() => element?.scrollIntoView({ behavior: 'smooth', ...options }));
}

export function scrollIntoViewById(id: string, options?: ScrollIntoViewOptions) {
    scrollIntoView(document.getElementById(id), options);
}
