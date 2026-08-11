import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import type { ResolvedToken, Theme } from '../lib/tokens';
import { ContrastBadge } from './ContrastBadge';
import { CopyButton } from './CopyButton';
import { Swatch } from './Swatch';

interface Props {
    tokens: ResolvedToken[];
    /**
     * Token to measure each row's contrast against, per theme. Supply this for foreground, text,
     * border and link groups; leave it off for backgrounds and non-colour tokens.
     */
    contrastAgainst?: ResolvedToken;
    /** Grade contrast against the large-text threshold. */
    largeText?: boolean;
    /** Hide the swatch column for token groups that are not colours. */
    withoutSwatch?: boolean;
    /** Text shown when the filter excludes every row. */
    emptyLabel?: string;
}

/** Renders the alias chain as `--a -> --b -> #fff`, which is what a developer needs to debug a token. */
const AliasChain: FunctionComponent<{ token: ResolvedToken; theme: Theme }> = ({ token, theme }) => {
    const chain = token.aliasChain[theme];
    const literal = token.hex[theme] ?? token.substituted[theme];

    if (chain.length === 0) {
        return <span className={styles.tokenLiteral}>{literal ?? <em>not set</em>}</span>;
    }

    return (
        <span className={styles.aliasChain}>
            {chain.map((name) => (
                <span key={name} className={styles.aliasStep}>
                    <code>{name}</code>
                </span>
            ))}
            <span className={styles.tokenLiteral}>{literal}</span>
        </span>
    );
};

/**
 * The workhorse table behind most sections: one row per token, with the name copyable, both
 * themes' resolved values, and how the value was arrived at.
 *
 * Showing light and dark side by side rather than "whatever the page is currently set to" is
 * deliberate; it turns theme review from a toggling exercise into reading one table.
 */
export const TokenTable: FunctionComponent<Props> = ({
    tokens,
    contrastAgainst,
    largeText,
    withoutSwatch = false,
    emptyLabel = 'No tokens match the current filter.',
}) => {
    if (tokens.length === 0) {
        return <p className={styles.emptyState}>{emptyLabel}</p>;
    }

    return (
        <div className={styles.tableScroll}>
            <table className={styles.tokenTable}>
                <thead>
                    <tr>
                        {!withoutSwatch && <th scope="col">Light / dark</th>}
                        <th scope="col">Token</th>
                        <th scope="col">Light</th>
                        <th scope="col">Dark</th>
                        {contrastAgainst && (
                            <>
                                <th scope="col">Contrast (light)</th>
                                <th scope="col">Contrast (dark)</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token) => (
                        <tr key={token.name}>
                            {!withoutSwatch && (
                                <td data-column="Light / dark">
                                    <Swatch token={token} size="sm" />
                                </td>
                            )}
                            <td data-column="Token">
                                <CopyButton value={`var(${token.name})`} label={token.name} inline />
                            </td>
                            <td data-column="Light">
                                <AliasChain token={token} theme="light" />
                            </td>
                            <td data-column="Dark">
                                {token.raw.dark == null ? (
                                    <span className={styles.tokenInherited}>same as light</span>
                                ) : (
                                    <AliasChain token={token} theme="dark" />
                                )}
                            </td>
                            {contrastAgainst && (
                                <>
                                    <td data-column="Contrast (light)">
                                        <ContrastBadge
                                            foreground={token.rgb.light}
                                            background={contrastAgainst.rgb.light}
                                            large={largeText}
                                        />
                                    </td>
                                    <td data-column="Contrast (dark)">
                                        <ContrastBadge
                                            foreground={token.rgb.dark}
                                            background={contrastAgainst.rgb.dark}
                                            large={largeText}
                                        />
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/**
 * A colour scale rendered as a strip, the way a designer expects to read one.
 *
 * The table view is better for looking a single token up; a strip is better for judging whether
 * the steps are evenly spaced, which is a question only the visual form answers.
 */
export const ScaleStrip: FunctionComponent<{ tokens: ResolvedToken[]; theme: Theme }> = ({ tokens, theme }) => (
    <div className={styles.scaleStrip}>
        {tokens.map((token) => (
            <div key={token.name} className={styles.scaleStep}>
                <span
                    className={styles.scaleSwatch}
                    style={{ backgroundColor: token.substituted[theme] }}
                    title={`${token.name}: ${token.hex[theme]}`}
                />
                <span className={styles.scaleStepLabel}>{token.label.split('-').pop()}</span>
                <span className={styles.scaleStepValue}>{token.hex[theme]}</span>
            </div>
        ))}
    </div>
);
