import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FunctionComponent, ReactNode } from 'react';

import { readTokens, resolveTokens } from './lib/tokens';
import type { ResolvedToken } from './lib/tokens';

interface StyleGuideState {
    /** Every custom property the design system declares, resolved for both themes. */
    tokens: ResolvedToken[];
    /** Tokens keyed by name, for the odd lookup by exact name. */
    tokensByName: Map<string, ResolvedToken>;
    /** Free-text filter applied to token tables. Empty string means no filtering. */
    filter: string;
    setFilter: (filter: string) => void;
    /** False until the stylesheet scan has run, which needs the DOM. */
    ready: boolean;
}

const StyleGuideContext = createContext<StyleGuideState | undefined>(undefined);

export const StyleGuideProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useState<ResolvedToken[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        // The scan walks every rule in every stylesheet, so it runs once after mount rather than
        // during render. Stylesheets are already applied by the time an Astro island hydrates.
        setTokens(resolveTokens(readTokens()));
    }, []);

    const value = useMemo<StyleGuideState>(
        () => ({
            tokens,
            tokensByName: new Map(tokens.map((token) => [token.name, token])),
            filter,
            setFilter,
            ready: tokens.length > 0,
        }),
        [tokens, filter]
    );

    return <StyleGuideContext.Provider value={value}>{children}</StyleGuideContext.Provider>;
};

export const useStyleGuide = (): StyleGuideState => {
    const context = useContext(StyleGuideContext);
    if (!context) {
        throw new Error('useStyleGuide must be used within a StyleGuideProvider');
    }
    return context;
};

/**
 * Tokens under `prefix`, minus any also matching `except`, with the active filter applied.
 *
 * Filtering here rather than in each section means the search box narrows every table on the page
 * at once, which is how you find a token when you only half-remember its name.
 */
export const useTokens = (prefix: string, except: string[] = []): ResolvedToken[] => {
    const { tokens, filter } = useStyleGuide();
    const needle = filter.trim().toLowerCase();

    return useMemo(
        () =>
            tokens.filter(
                (token) =>
                    token.name.startsWith(prefix) &&
                    !except.some((excluded) => token.name.startsWith(excluded)) &&
                    (needle === '' || token.name.toLowerCase().includes(needle))
            ),
        // `except` is a literal array at every call site, so compare by content rather than
        // identity to avoid recomputing on every render.
        [tokens, prefix, except.join('|'), needle]
    );
};
