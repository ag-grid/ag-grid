import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

const FILE_MAP = [
    {
        path: 'core/_variables.scss',
        holds: 'Spacing scale, transition timing, selector fragments for theme and third-party escaping.',
    },
    { path: 'core/_breakpoints.scss', holds: 'Every breakpoint, forwarded with a $breakpoint- prefix.' },
    {
        path: 'core/_mixins.scss',
        holds: 'Mixins a component module can use without pulling in global CSS - currently stack-table().',
    },
    {
        path: '_root.scss',
        holds: 'All custom properties, light theme in :root and dark under html[data-dark-mode]. The single biggest file and the one to read first.',
    },
    { path: '_base.scss', holds: 'Resets, html defaults, scrollbar styling.' },
    { path: '_layout.scss', holds: 'Layout containers and the fractional column classes.' },
    { path: '_typography.scss', holds: 'Heading-to-scale mapping, .text-* utilities, prose rhythm.' },
    { path: '_color.scss', holds: '.text-secondary and .text-tertiary utilities. Small enough to be easy to miss.' },
    {
        path: '_interactions.scss',
        holds: 'Collapse and transition-suppression utilities, view transition suppression.',
    },
    { path: 'elements/', holds: 'Global styling by tag: block, inline, button, form-elements, table.' },
    { path: 'components/', holds: 'Global styling for the card, tabs and code-block patterns.' },
    {
        path: '_site-header-tokens.scss',
        holds: 'The four header breakpoints each repo can override with @forward ... with (...).',
    },
    { path: 'style-guide/', holds: 'This page.' },
];

/** How to extend the design system, and how this page stays in step with it. */
export const Contributing: FunctionComponent = () => (
    <Section
        id="contributing"
        title="Extending the system"
        source="design-system.scss"
        lede={
            <>
                <p>
                    The design system lives in <code>external/ag-website-shared/src/design-system</code> and is loaded
                    as a single stylesheet by each site&rsquo;s layout. Because it is a shared subrepo, a change here
                    lands on AG Grid, AG Charts and AG Studio at once.
                </p>
                <p>
                    Everything on this page is generated from that source. Token tables come from scanning the live
                    stylesheet; spacing and breakpoints come from parsing the Sass files as text. Add a token and it
                    appears here with no change to this page.
                </p>
            </>
        }
    >
        <Block title="Where things live">
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">File</th>
                            <th scope="col">Holds</th>
                        </tr>
                    </thead>
                    <tbody>
                        {FILE_MAP.map(({ path, holds }) => (
                            <tr key={path}>
                                <td data-column="File">
                                    <code>{path}</code>
                                </td>
                                <td data-column="Holds">{holds}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="Adding a colour token"
            note={
                <p>
                    A new colour is almost always a new semantic or component token pointing at an existing abstract
                    value. Adding a new abstract value means extending the palette, which is a design decision rather
                    than an implementation one.
                </p>
            }
        >
            <Specimen
                code={`// _root.scss

:root {
    // Point at an abstract value, never a literal
    --color-bg-callout: var(--color-brand-50);
}

html[data-dark-mode='true'] {
    // Required unless the light value genuinely works on the dark background.
    // Check the contrast, do not assume.
    --color-bg-callout: var(--color-brand-950);
}`}
            >
                <p>
                    Then verify it: find the token in the colour section of this page, confirm both halves of its chip
                    read correctly, and check its contrast row against whatever it will carry.
                </p>
            </Specimen>
        </Block>

        <Block
            title="Adding a global element style"
            note={
                <p>
                    Global element selectors must be guarded, or they will restyle the live grid and Bryntum components
                    embedded in documentation pages. This is the single easiest way to break the docs site from a shared
                    stylesheet change.
                </p>
            }
        >
            <Specimen
                code={`@use '../core' as *;

// Wrong - also hits every <figure> inside a rendered grid
figure {
    margin-bottom: $spacing-size-4;
}

// Right - excludes .ag-* and .b-* class names
figure#{$selector-exclude-grid-bryntum} {
    margin-bottom: $spacing-size-4;
}`}
            >
                <p>
                    Use <code>$selector-exclude-grid</code> when only the grid needs excluding, and{' '}
                    <code>$selector-exclude-grid-bryntum</code> when both do. Both <code>:not()</code>s have to sit on
                    the same element - listing the two fragments as separate comma entries is a union, and each lets
                    through what the other excludes.
                </p>
            </Specimen>
        </Block>

        <Block
            title="Adding a per-repo override"
            note={
                <p>
                    A token that must differ per product is declared <code>!default</code> in the shared file and
                    configured by each repo through a same-named file earlier on the Sass load path. That is how the
                    header&rsquo;s nav-collapse threshold differs between Grid and Charts without forking the header.
                </p>
            }
        >
            <Specimen
                code={`// shared: design-system/_site-header-tokens.scss
$nav-collapse: 960px !default;

// repo: src/styles/header-tokens/_site-header-tokens.scss
// (this directory is first in the astro config's sass loadPaths)
@forward '.../design-system/site-header-tokens' with (
    $nav-collapse: 1120px
);`}
            >
                <p>
                    Only reach for this when the value genuinely varies by product. A token that is the same everywhere
                    should just be a plain variable.
                </p>
            </Specimen>
        </Block>

        <Block title="Before you add anything">
            <Guidance
                dos={[
                    <>
                        Search for an existing token first. The colour section&rsquo;s filter box searches every token
                        name on the page at once.
                    </>,
                    <>
                        Add the dark-mode value at the same time as the light one, and check both. A token with no dark
                        value silently inherits the light one.
                    </>,
                    <>
                        Prefer widening an existing semantic token&rsquo;s use over adding a near-duplicate. Two tokens
                        that always resolve to the same value are a maintenance cost with no benefit.
                    </>,
                    <>
                        Note in the pull request that the change is in <code>external/ag-website-shared</code>, since it
                        affects all three sites.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t add a token for one component&rsquo;s one-off need. Declare a local custom property
                        on the component instead.
                    </>,
                    <>
                        Don&rsquo;t add an unguarded global element selector, and don&rsquo;t widen an existing
                        guard&rsquo;s scope to make a selector match.
                    </>,
                    <>
                        Don&rsquo;t leave a <code>// TODO, review &amp; replace color</code> behind. There are already
                        several, and each one is a token nobody can safely rely on.
                    </>,
                ]}
            />
        </Block>
    </Section>
);
