import breakpointsSource from '@design-system/core/_breakpoints.scss?raw';
import { useMemo } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';
import { TokenTable } from '../chrome/TokenTable';
import { parseSassVariables, pxVariables, resolveSassAliases } from '../lib/sassSource';
import headerTokens from '../sassTokens.module.scss';

const CONTAINERS = [
    {
        className: 'layout-grid',
        use: 'Flex row capped at --layout-max-width, with --layout-gap between children. The container for column classes.',
    },
    {
        className: 'layout-page-max-width',
        use: 'Same width cap as layout-grid but without the flex behaviour. For a single full-width block.',
    },
    {
        className: 'layout-max-width-small',
        use: 'The narrower 1240px measure used for text-heavy pages. Applies horizontal padding rather than a margin cap.',
    },
];

const COLUMN_GRIDS = [
    { total: 4, spans: [1, 1, 1, 1] },
    { total: 6, spans: [2, 2, 2] },
    { total: 12, spans: [3, 6, 3] },
];

/**
 * Page layout: the width caps, the gutter, and the fractional column classes.
 *
 * The columns are widths on flex children rather than a real CSS grid, which is why the width
 * formula subtracts the gaps before dividing - worth showing, because it explains why a column
 * class only works inside a container that applies `--layout-gap`.
 */
export const LayoutSection: FunctionComponent = () => {
    const layout = useTokens('--layout-', ['--layout-width-']);
    const widths = useTokens('--layout-width-');

    return (
        <Section
            id="layout"
            title="Layout"
            source={['_root.scss', '_layout.scss']}
            lede={
                <p>
                    <code>--layout-max-width</code> (1800px) for wide visual pages,{' '}
                    <code>--layout-max-width-small</code> (1240px) for reading-length text.
                </p>
            }
        >
            <Block title="Tokens">
                <TokenTable tokens={layout} withoutSwatch />
            </Block>

            <Block title="Containers">
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Class</th>
                                <th scope="col">What it does</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONTAINERS.map(({ className, use }) => (
                                <tr key={className}>
                                    <td data-column="Class">
                                        <CopyButton value={className} label={`.${className}`} inline />
                                    </td>
                                    <td data-column="What it does">{use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="Columns"
                note={
                    <p>
                        <code>.column-&lt;span&gt;-&lt;total&gt;</code> in 4, 6 and 12 column grids. These are widths on
                        flex children, not a real grid, so they only add up inside a container that sets{' '}
                        <code>--layout-gap</code> - the formula subtracts the gutters before dividing.
                    </p>
                }
            >
                {COLUMN_GRIDS.map(({ total, spans }) => (
                    <Specimen
                        key={total}
                        label={`${total}-column grid`}
                        code={spans.map((span) => `<div class="column-${span}-${total}">`).join('\n')}
                    >
                        <div className={styles.columnDemo}>
                            {spans.map((span, index) => (
                                <div key={index} className={`column-${span}-${total} ${styles.columnDemoCell}`}>
                                    {span}/{total}
                                </div>
                            ))}
                        </div>
                    </Specimen>
                ))}
                <TokenTable tokens={widths} withoutSwatch />
            </Block>

            <Block title="Laying out a page">
                <Guidance
                    dos={[
                        <>
                            Wrap page content in <code>.layout-max-width-small</code> when it is mostly prose - the
                            1240px measure keeps line lengths readable.
                        </>,
                        <>
                            Use <code>var(--layout-gap)</code> for gutters, so a column class and its container agree on
                            the gap they are subtracting.
                        </>,
                        <>
                            Offset in-page anchors with <code>--layout-scroll-offset</code>, which already accounts for
                            the sticky header.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t use a column class outside a container that sets <code>--layout-gap</code>; the
                            widths will not add up.
                        </>,
                        <>
                            Don&rsquo;t hardcode the header height. Use <code>--layout-site-header-height</code> so a
                            header change does not leave content underlapping it.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};

/**
 * Breakpoints.
 *
 * The important message here is structural: there is no shared breakpoint scale. Nearly every
 * breakpoint is owned by one component and named after it, which is why the list is long and the
 * values cluster. Sorting by pixel value rather than by name is what makes that visible.
 */
export const Breakpoints: FunctionComponent = () => {
    const { filter } = useStyleGuide();
    const all = useMemo(() => pxVariables(resolveSassAliases(parseSassVariables(breakpointsSource))), []);

    const needle = filter.trim().toLowerCase();
    const visible = all.filter((entry) => needle === '' || entry.name.toLowerCase().includes(needle));
    const widest = all.length > 0 ? all[all.length - 1].px! : 1;

    // Resolves an alias to its px value so the table shows a number rather than just the name it
    // points at - the number is what a designer is looking for.
    const aliasOf = (breakpointName: string): string => {
        const target = all.find((entry) => entry.name === breakpointName);
        return target
            ? `${target.value} (aliases $breakpoint-${breakpointName})`
            : `aliases $breakpoint-${breakpointName}`;
    };

    // Effective values, resolved through Sass so a repo's `@forward ... with (...)` override is
    // what shows rather than the shared `!default`. `query` records whether the threshold is a
    // container query or a media query, because that distinction changes what the number measures.
    const headerBreakpoints = [
        {
            name: '$nav-collapse',
            value: headerTokens['header-nav-collapse'],
            query: 'container',
            tunable: true,
            use: 'The real hamburger threshold. Below it the inline nav collapses to the mobile menu.',
        },
        {
            name: '$docs-search-inline',
            value: headerTokens['header-docs-search-inline'],
            query: 'container',
            tunable: true,
            use: 'Above it .headerInner becomes a grid and search sits in the nav row; below it the header stays a wrapping flex row and search takes its own full-width row.',
        },
        {
            name: '$switcher-popup-at',
            value: headerTokens['header-switcher-popup-at'],
            query: 'container',
            tunable: true,
            use: 'Products switcher becomes a popup.',
        },
        {
            name: '$search-box-cap-at',
            value: headerTokens['header-search-box-cap-at'],
            query: 'container',
            tunable: true,
            use: 'Search box stops growing.',
        },
        {
            name: '$sticky-at',
            value: `${headerTokens['header-nav-collapse']} (aliases $nav-collapse)`,
            query: 'media',
            tunable: false,
            use: 'Header becomes position: sticky. Must be @media because a container cannot query its own size, so it only approximates $nav-collapse and lands a scrollbar width later.',
        },
        {
            name: '$docs-button-hide-at',
            value: aliasOf('docs-nav-medium'),
            query: 'media',
            tunable: false,
            use: 'Mobile nav button hides. Must be @media so it agrees to the pixel with DocsNav’s own query - a container query here would measure the viewport minus the scrollbar.',
        },
        {
            name: '$docs-search-stack',
            value: aliasOf('site-header-extra-small'),
            query: 'container',
            tunable: false,
            use: 'Docs button and search stop wrapping onto separate lines.',
        },
        {
            name: '$switcher-show',
            value: `${headerTokens['header-nav-collapse']} (aliases $nav-collapse)`,
            query: 'container',
            tunable: false,
            use: 'Products switcher appears. Aliased deliberately - it needs room exactly when the nav does.',
        },
    ];

    return (
        <Section
            id="breakpoints"
            title="Breakpoints"
            source={['core/_breakpoints.scss', '_site-header-tokens.scss', 'components/site-header/_breakpoints.scss']}
            lede={
                <>
                    <p>
                        Breakpoints are Sass variables with a <code>$breakpoint-</code> prefix. There is no global
                        scale: each value belongs to one component and is named after it, so a component reflows when
                        its own content stops fitting rather than at a shared device width.
                    </p>
                </>
            }
        >
            <Block title="Where the site reflows" note={<p>Every breakpoint, plotted on one axis.</p>}>
                <div className={styles.ruler}>
                    {all.map((entry) => (
                        <span
                            key={entry.name}
                            className={styles.rulerTick}
                            style={{ left: `${(entry.px! / widest) * 100}%` }}
                            title={`$breakpoint-${entry.name}: ${entry.value}`}
                        />
                    ))}
                    <span className={styles.rulerScale}>
                        <span>0</span>
                        <span>{widest}px</span>
                    </span>
                </div>
            </Block>

            <Block
                title="Site header"
                note={
                    <p>
                        The header responds to its own width rather than the viewport&rsquo;s. Values are the ones in
                        force on this site.
                    </p>
                }
            >
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Variable</th>
                                <th scope="col">Effective value</th>
                                <th scope="col">Query</th>
                                <th scope="col">Per-repo</th>
                                <th scope="col">Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {headerBreakpoints.map(({ name, value, query, tunable, use }) => (
                                <tr key={name}>
                                    <td data-column="Variable">
                                        <CopyButton value={name} inline />
                                    </td>
                                    <td data-column="Effective value">{value}</td>
                                    <td data-column="Query">
                                        <code>{query === 'container' ? '@container' : '@media'}</code>
                                    </td>
                                    <td data-column="Per-repo">
                                        {tunable ? 'tunable' : <span className={styles.tokenInherited}>fixed</span>}
                                    </td>
                                    <td data-column="Controls">{use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="All breakpoints"
                note={<p>Sorted by width. The name tells you which component owns the value.</p>}
            >
                {visible.length === 0 ? (
                    <p className={styles.emptyState}>No breakpoints match the current filter.</p>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.tokenTable}>
                            <thead>
                                <tr>
                                    <th scope="col">Variable</th>
                                    <th scope="col">Width</th>
                                    <th scope="col">Gap to previous</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((entry, index) => {
                                    // Gap is measured against the previous entry in the unfiltered,
                                    // value-sorted list, so filtering the table cannot make two distant
                                    // breakpoints look adjacent.
                                    const position = all.indexOf(entry);
                                    const previous = position > 0 ? all[position - 1] : undefined;
                                    const gap = previous ? entry.px! - previous.px! : undefined;

                                    return (
                                        <tr key={entry.name}>
                                            <td data-column="Variable">
                                                <CopyButton value={`$breakpoint-${entry.name}`} inline />
                                            </td>
                                            <td data-column="Width">{entry.value}</td>
                                            <td data-column="Gap to previous">
                                                {gap == null ? (
                                                    <span className={styles.tokenInherited}>first</span>
                                                ) : (
                                                    <span className={gap <= 20 ? styles.gapTight : undefined}>
                                                        {gap}px
                                                    </span>
                                                )}
                                                {index === 0 && position > 0 && (
                                                    <span className={styles.tokenInherited}> (filtered view)</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Block>

            <Block title="Usage">
                <Guidance
                    dos={[
                        <>
                            Reuse the nearest existing value. A component reflowing at 940px when a neighbour reflows at
                            920px reads as a bug, not a design.
                        </>,
                        <>
                            Prefer a container query when a component&rsquo;s layout depends on its own width - it then
                            works wherever the component is placed.
                        </>,
                        <>
                            Name it after the component and the state it changes, matching the existing{' '}
                            <code>&lt;component&gt;-&lt;size&gt;</code> pattern.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t introduce a breakpoint to match a mock&rsquo;s artboard width; artboards are not
                            device widths.
                        </>,
                        <>
                            Don&rsquo;t alias one component&rsquo;s breakpoint from another&rsquo;s unless they must
                            move together - that coupling is hard to spot later.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};
