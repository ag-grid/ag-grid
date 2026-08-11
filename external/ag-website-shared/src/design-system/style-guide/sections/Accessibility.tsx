import { useMemo } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide } from '../StyleGuideContext';
import { ContrastBadge } from '../chrome/ContrastBadge';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';
import { Swatch } from '../chrome/Swatch';
import { contrastRatio } from '../lib/colour';
import type { Theme } from '../lib/tokens';
import { FocusDemo } from './Components';

/**
 * The pairings actually audited, listed explicitly rather than swept up by prefix.
 *
 * An explicit list is the point of the audit. A prefix sweep flags every decorative divider and
 * every colour designed for a coloured surface, and a list of thirty "failures" that are mostly
 * fine trains people to ignore it. Each entry below is a pairing the design system genuinely
 * relies on, with the threshold WCAG actually holds it to.
 */
const AUDITED: { token: string; against: string; large: boolean }[] = [
    // Body text on the page: WCAG 1.4.3, 4.5:1.
    { token: '--color-text-primary', against: '--color-bg-primary', large: false },
    { token: '--color-text-secondary', against: '--color-bg-primary', large: false },
    { token: '--color-text-tertiary', against: '--color-bg-primary', large: false },
    { token: '--color-fg-primary', against: '--color-bg-primary', large: false },
    { token: '--color-fg-secondary', against: '--color-bg-primary', large: false },
    { token: '--color-fg-tertiary', against: '--color-bg-primary', large: false },
    { token: '--color-link', against: '--color-bg-primary', large: false },
    { token: '--color-link-hover', against: '--color-bg-primary', large: false },
    { token: '--color-fg-code', against: '--color-bg-code', large: false },

    // The same text on the recessed surface, which cards and code blocks use.
    { token: '--color-text-primary', against: '--color-bg-secondary', large: false },
    { token: '--color-link', against: '--color-bg-secondary', large: false },

    // Button labels on their own variant background.
    { token: '--color-button-primary-fg', against: '--color-button-primary-bg', large: false },
    { token: '--color-button-secondary-fg', against: '--color-button-secondary-bg', large: false },
    { token: '--color-button-tertiary-fg', against: '--color-button-tertiary-bg', large: false },

    // Non-text indicators: WCAG 1.4.11, 3:1. A control's outline is the only thing marking it.
    { token: '--color-border-primary', against: '--color-bg-primary', large: true },
    { token: '--color-input-border', against: '--color-bg-primary', large: true },
    { token: '--color-input-border-hover', against: '--color-bg-primary', large: true },
    { token: '--color-input-error', against: '--color-bg-primary', large: true },
    { token: '--color-input-bg-checked', against: '--color-bg-primary', large: true },
];

/**
 * Pairings deliberately left out of the audit, shown to the reader with the reason.
 *
 * Listing the exclusions matters as much as listing the failures - it is what stops the audit
 * being read as "these are the only colours anyone checked".
 */
const EXCLUDED = [
    {
        tokens: '--color-fg-white, --color-button-*-fg',
        reason: 'Designed for a coloured or dark surface, never for the page background. Audited against their own backgrounds where that pairing is fixed.',
    },
    {
        tokens: '--color-border-secondary, --color-border-tertiary',
        reason: 'Decorative dividers. WCAG 1.4.11 applies to indicators that convey state or bound a control, not to visual separation.',
    },
    {
        tokens: '--color-fg-disabled, --color-fg-placeholder, --color-*-disabled-*',
        reason: 'Inactive controls, exempt from 1.4.3 and 1.4.11.',
    },
    {
        tokens: '--color-fg-quinary',
        reason: 'Subtle decorative marks only. Not used for text or for anything conveying state.',
    },
    {
        tokens: '--color-*-shadow-focus',
        reason: 'Focus rings sit against the control they surround, not the page, and are paired with a border change. Judge them visually in the focus specimen below.',
    },
    {
        tokens: '--color-code-*',
        reason: 'Syntax highlighting, audited against --color-code-background in the code section instead.',
    },
];

interface Measurement {
    token: string;
    against: string;
    theme: Theme;
    ratio: number;
    /** Minimum ratio this pairing has to reach, as a number so the check is unambiguous. */
    required: number;
}

/**
 * Whether a measurement clears the ratio its own pairing requires.
 *
 * Deliberately compared against `required` rather than read off the WCAG grade label: a 3.5:1
 * result grades as "AA Large", which is a pass at the 3:1 bar and a *failure* at 4.5:1. Trusting
 * the label would quietly reclassify body text that is too low contrast as acceptable.
 */
const meetsRequirement = (measurement: Measurement): boolean => measurement.ratio >= measurement.required;

/**
 * Accessibility: the contrast audit, focus indication, and the practices the design system leaves
 * to the caller.
 *
 * The audit is computed rather than written down, so it cannot go stale and it cannot be quietly
 * incomplete. It is also the fastest way to show that "we use tokens" and "our colours are
 * accessible" are different claims.
 */
export const Accessibility: FunctionComponent = () => {
    const { tokensByName } = useStyleGuide();

    const results = useMemo<Measurement[]>(() => {
        const measured: Measurement[] = [];

        for (const { token: name, against, large } of AUDITED) {
            const token = tokensByName.get(name);
            const background = tokensByName.get(against);
            if (!token || !background) {
                continue;
            }

            for (const theme of ['light', 'dark'] as Theme[]) {
                const foreground = token.rgb[theme];
                const backdrop = background.rgb[theme];
                if (!foreground || !backdrop) {
                    continue;
                }

                measured.push({
                    token: name,
                    against,
                    theme,
                    ratio: contrastRatio(foreground, backdrop),
                    required: large ? 3 : 4.5,
                });
            }
        }

        // Worst first, so the failures are at the top where they will be read.
        return measured.sort((a, b) => a.ratio - b.ratio);
    }, [tokensByName]);

    const failures = results.filter((result) => !meetsRequirement(result));

    return (
        <Section
            id="accessibility"
            title="Accessibility"
            source={['_root.scss', 'elements/_button.scss', 'elements/_form-elements.scss']}
            lede={
                <p>
                    The design system gives you focus rings and correct semantics for free. It does not check contrast,
                    manage focus order or provide accessible names - see the table below for the split.
                </p>
            }
        >
            <Block
                title="Contrast audit"
                note={
                    <>
                        <p>
                            The pairings the design system genuinely relies on, measured in both themes from the
                            resolved token values, worst first.{' '}
                            {results.length > 0 && (
                                <strong>
                                    {failures.length} of {results.length} measured pairings do not reach the ratio they
                                    need.
                                </strong>
                            )}
                        </p>
                        <p>
                            Body text is held to 4.5:1 (WCAG 1.4.3) and non-text indicators to 3:1 (1.4.11). The
                            &ldquo;needs&rdquo; column states which applies.
                        </p>
                    </>
                }
            >
                {results.length === 0 ? (
                    <p className={styles.emptyState}>
                        Waiting for the stylesheet scan. If this stays empty, the colour section above will be empty too
                        - the whole page is driven by the same scan.
                    </p>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.tokenTable}>
                            <thead>
                                <tr>
                                    <th scope="col">Foreground</th>
                                    <th scope="col">Theme</th>
                                    <th scope="col">Against</th>
                                    <th scope="col">Measured</th>
                                    <th scope="col">Needs</th>
                                    <th scope="col">Verdict</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result) => {
                                    const token = tokensByName.get(result.token);
                                    const background = tokensByName.get(result.against);
                                    const passes = meetsRequirement(result);

                                    return (
                                        <tr key={`${result.token}-${result.against}-${result.theme}`}>
                                            <td data-column="Foreground">
                                                {token && <Swatch token={token} theme={result.theme} size="sm" />}{' '}
                                                <CopyButton
                                                    value={`var(${result.token})`}
                                                    label={result.token}
                                                    inline
                                                />
                                            </td>
                                            <td data-column="Theme">{result.theme}</td>
                                            <td data-column="Against">
                                                {background && (
                                                    <Swatch token={background} theme={result.theme} size="sm" />
                                                )}{' '}
                                                <code>{result.against}</code>
                                            </td>
                                            <td data-column="Measured">
                                                <ContrastBadge
                                                    foreground={token?.rgb[result.theme]}
                                                    background={background?.rgb[result.theme]}
                                                    large={result.required === 3}
                                                />
                                            </td>
                                            <td data-column="Needs">{result.required}:1</td>
                                            <td data-column="Verdict">
                                                <span className={passes ? styles.verdictPass : styles.verdictFail}>
                                                    {passes ? 'Pass' : 'Too low'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Block>

            <Block
                title="Deliberately not audited"
                note={
                    <p>
                        These are left out because the threshold does not apply, not because they were overlooked. If
                        you use one of them for something the exemption does not cover, check it yourself.
                    </p>
                }
            >
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Tokens</th>
                                <th scope="col">Why</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXCLUDED.map(({ tokens: names, reason }) => (
                                <tr key={names}>
                                    <td data-column="Tokens">
                                        <code>{names}</code>
                                    </td>
                                    <td data-column="Why">{reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="Focus indication"
                note={
                    <p>
                        Focus is a 4px <code>box-shadow</code> ring, not an <code>outline</code>, so it follows the
                        border radius of the control. Because it is a shadow, overriding <code>box-shadow</code> on an
                        interactive element removes the focus indicator - re-declare it if you restyle.
                    </p>
                }
            >
                <Specimen label="Tab through these" row>
                    <FocusDemo />
                </Specimen>
                <p>
                    The ring colour comes from <code>--color-button-*-shadow-focus</code> and{' '}
                    <code>--color-input-shadow-focus</code>. It is a tint of the control&rsquo;s own colour rather than
                    a single system-wide focus colour, which keeps it visible on both light and dark buttons.
                </p>
            </Block>

            <Block title="What the system handles, and what it does not">
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Concern</th>
                                <th scope="col">Handled by the design system</th>
                                <th scope="col">Yours to handle</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td data-column="Concern">Focus visibility</td>
                                <td data-column="Handled by the design system">
                                    Ring on all buttons, inputs, selects, checkboxes, radios and ranges, via{' '}
                                    <code>:focus-visible</code>.
                                </td>
                                <td data-column="Yours to handle">
                                    Custom interactive elements, and anything where you override <code>box-shadow</code>
                                    .
                                </td>
                            </tr>
                            <tr>
                                <td data-column="Concern">Colour contrast</td>
                                <td data-column="Handled by the design system">
                                    Nothing. Tokens are not validated against any threshold.
                                </td>
                                <td data-column="Yours to handle">
                                    Every pairing you introduce. Use the tables in the colour section.
                                </td>
                            </tr>
                            <tr>
                                <td data-column="Concern">Reduced motion</td>
                                <td data-column="Handled by the design system">
                                    Nothing globally. <code>.no-transitions</code> exists but is for suppressing
                                    transitions during theme and layout changes, not for the user preference.
                                </td>
                                <td data-column="Yours to handle">
                                    A <code>prefers-reduced-motion</code> block for anything that moves.
                                </td>
                            </tr>
                            <tr>
                                <td data-column="Concern">Accessible names</td>
                                <td data-column="Handled by the design system">
                                    Nothing. Icons render as bare SVG with no title.
                                </td>
                                <td data-column="Yours to handle">
                                    <code>aria-label</code> on icon-only controls, <code>&lt;label for&gt;</code> on
                                    every field.
                                </td>
                            </tr>
                            <tr>
                                <td data-column="Concern">Dark mode</td>
                                <td data-column="Handled by the design system">
                                    Every semantic and component token re-points automatically.
                                </td>
                                <td data-column="Yours to handle">
                                    Any literal colour you write, and any contrast that only works in one theme.
                                </td>
                            </tr>
                            <tr>
                                <td data-column="Concern">Grid style isolation</td>
                                <td data-column="Handled by the design system">
                                    Global element selectors are guarded with{' '}
                                    <code>:where(:not([class^=ag]):not([class^=b-]))</code> so site styles cannot leak
                                    into an embedded grid.
                                </td>
                                <td data-column="Yours to handle">
                                    New global element selectors - add the same guard or they will restyle live
                                    examples.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block title="Practices">
                <Guidance
                    dos={[
                        <>
                            Check the contrast column before committing to a colour pairing, in both themes. A token
                            being &ldquo;the right semantic token&rdquo; does not make the pairing legible.
                        </>,
                        <>
                            Keep DOM order equal to visual order. The focus ring is only useful if tabbing moves in the
                            direction the page reads.
                        </>,
                        <>
                            Convey state with more than colour: a pill has text, an error field gets{' '}
                            <code>aria-invalid</code> and a message, a required field gets <code>required</code>.
                        </>,
                        <>
                            Test with the keyboard alone. Every state shown in this guide as a <code>.hover</code> or{' '}
                            <code>.focus</code> class must also be reachable without a mouse.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t set <code>outline: none</code> without providing a replacement indicator - and
                            remember these controls already cleared <code>outline</code>, so the shadow is all there is.
                        </>,
                        <>
                            Don&rsquo;t use <code>disabled</code> where the user needs to discover why a control is
                            unavailable; <code>aria-disabled</code> keeps it reachable.
                        </>,
                        <>
                            Don&rsquo;t add <code>role=&quot;grid&quot;</code>, <code>role=&quot;button&quot;</code> or
                            similar to an element that already has the right semantics - it usually removes information
                            rather than adding it.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};
