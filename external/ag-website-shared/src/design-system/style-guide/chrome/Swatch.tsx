import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { prefersLightText } from '../lib/colour';
import type { ResolvedToken, Theme } from '../lib/tokens';

interface Props {
    token: ResolvedToken;
    /** Show only one theme instead of the split light/dark chip. */
    theme?: Theme;
    size?: keyof typeof SIZE_CLASS;
}

/** Explicit map rather than a template-built key, so the class names survive CSS module mangling. */
const SIZE_CLASS = {
    sm: styles.swatchSm,
    md: styles.swatchMd,
    lg: styles.swatchLg,
};

/**
 * Colour chip showing a token in both themes at once.
 *
 * The halves are painted with the token's fully substituted value rather than `var(--token)`,
 * which is what lets the dark half render while the page is in light mode. Seeing both together
 * is the point - most token bugs in a two-theme system are "fine in light, unreadable in dark",
 * and that is invisible in a guide that only ever paints the active theme.
 */
export const Swatch: FunctionComponent<Props> = ({ token, theme, size = 'md' }) => {
    const themes: Theme[] = theme ? [theme] : ['light', 'dark'];

    return (
        <span
            className={classnames(styles.swatch, SIZE_CLASS[size], {
                [styles.swatchSplit]: themes.length > 1,
            })}
        >
            {themes.map((which) => {
                const value = token.substituted[which];
                const rgb = token.rgb[which];

                return (
                    <span
                        key={which}
                        className={styles.swatchHalf}
                        style={{ backgroundColor: value }}
                        title={`${which}: ${token.hex[which] ?? value ?? 'not set'}`}
                    >
                        {/* A single-theme swatch labels itself; the split chip relies on order
                            (light then dark) plus the title, to stay legible at chip size. */}
                        {themes.length === 1 && rgb && (
                            <span className={prefersLightText(rgb) ? styles.swatchOnDark : styles.swatchOnLight}>
                                {token.hex[which]}
                            </span>
                        )}
                    </span>
                );
            })}
        </span>
    );
};

/** Legend explaining the split-chip convention. Rendered once, near the first swatch grid. */
export const SwatchLegend: FunctionComponent = () => (
    <p className={styles.swatchLegend}>
        Every colour chip is split: the <strong>left half is the light theme</strong>, the{' '}
        <strong>right half is the dark theme</strong>. Both halves are painted from the token&rsquo;s resolved value, so
        you can compare themes without switching the page.
    </p>
);
