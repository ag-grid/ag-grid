import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

const LAYERS = [
    {
        name: 'Abstract',
        example: '--color-gray-500, --color-brand-500',
        role: 'The raw palette. Fixed values with no meaning attached, identical in both themes.',
        use: 'Almost never referenced directly. Exists so semantic tokens have something to point at.',
    },
    {
        name: 'Semantic',
        example: '--color-bg-primary, --color-fg-secondary, --color-border-primary',
        role: 'Names a role, not a colour. Re-points at a different abstract value per theme.',
        use: 'The layer you reach for. If a semantic token exists for what you are styling, use it.',
    },
    {
        name: 'Component',
        example: '--color-button-primary-bg, --color-input-border-hover',
        role: 'A semantic token narrowed to one component and state.',
        use: 'Use when styling that component. Add one when a component needs to diverge from the semantic default.',
    },
    {
        name: 'Local',
        example: '--card-color, --icon-color',
        role: 'Declared by a component on itself, for its own subtree to consume or override.',
        use: 'Use to let a parent re-tint a component without new global tokens.',
    },
];

/**
 * Opening section: what the design system is made of, and the conventions that hold across every
 * other section.
 *
 * The layer model is the thing that most needs stating up front. Without it the colour section
 * reads as one flat list of 200 names, and the most common mistake - reaching for
 * `--color-gray-300` when `--color-border-primary` was meant - looks reasonable.
 */
export const Introduction: FunctionComponent = () => (
    <Section
        id="introduction"
        title="How to use this guide"
        source={['design-system.scss', 'core/_variables.scss', '_root.scss']}
        lede={
            <>
                <p>
                    This is the reference for the design system behind the AG websites - the tokens, elements and
                    components shared across the marketing site, the documentation and the blog. It is generated from
                    the design system&rsquo;s own source: token values are read out of the live stylesheet and the Sass
                    files at runtime, so nothing on this page can fall behind the code.
                </p>
                <p>
                    <strong>Designers</strong> get resolved values for both themes, contrast figures against the WCAG
                    thresholds, and the intended use of each token. <strong>Developers</strong> get the exact token,
                    class name and file for everything, all copyable.
                </p>
            </>
        }
    >
        <Block
            title="The four token layers"
            note={
                <p>
                    Colour tokens are layered, and the layer you pick determines whether your work survives a theme
                    change or a palette change. Work at the most specific layer that already exists.
                </p>
            }
        >
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Layer</th>
                            <th scope="col">Looks like</th>
                            <th scope="col">What it is</th>
                            <th scope="col">When to use it</th>
                        </tr>
                    </thead>
                    <tbody>
                        {LAYERS.map(({ name, example, role, use }) => (
                            <tr key={name}>
                                <td data-column="Layer">
                                    <strong>{name}</strong>
                                </td>
                                <td data-column="Looks like">
                                    <code>{example}</code>
                                </td>
                                <td data-column="What it is">{role}</td>
                                <td data-column="When to use it">{use}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="Naming conventions"
            note={
                <p>
                    Token names are predictable enough to guess. The prefix tells you the category, and CSS custom
                    properties and Sass variables split along a consistent line.
                </p>
            }
        >
            <Specimen
                label="Prefixes"
                code={`--color-*      colours, at every layer
--text-*       font families, sizes, line heights, weights
--layout-*     page widths, gaps, margins, fixed chrome heights
--radius-*     border radii
--shadow-*     elevation
--icon-*       icon sizing and colour

$spacing-size-*   spacing scale        (Sass only - no CSS custom property)
$breakpoint-*     viewport thresholds  (Sass only - cannot be used in a media query otherwise)
$selector-*       selector fragments for theme and third-party escaping`}
            >
                <p>
                    Anything that has to work inside a <code>@media</code> or <code>@container</code> query is a Sass
                    variable, because custom properties are not valid in a query condition. Everything else is a custom
                    property so it can be re-pointed per theme and overridden per subtree.
                </p>
            </Specimen>
        </Block>

        <Block title="Working with the system">
            <Guidance
                dos={[
                    <>
                        Use the semantic token for the role you are styling: <code>--color-border-primary</code> for a
                        border, not the grey that happens to match it today.
                    </>,
                    <>
                        Check both themes. Every colour chip on this page is split light/dark for exactly this reason -
                        a value that reads well on white often disappears on the dark background.
                    </>,
                    <>
                        Use the spacing scale for every gap, margin and padding. Values off the scale are the main
                        source of vertical rhythm drift.
                    </>,
                    <>
                        Reuse the shared elements and components below before writing new CSS. Buttons, inputs, tables
                        and alerts are all styled globally and need no classes at all in the common case.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t hardcode a colour. A literal hex will not follow the theme, and it will not follow a
                        palette change either.
                    </>,
                    <>
                        Don&rsquo;t reach past the semantic layer to an abstract token because the semantic name feels
                        wrong - that is a sign the missing token should be added.
                    </>,
                    <>
                        Don&rsquo;t add a breakpoint to match a design mock exactly. Reuse the nearest existing one; the
                        site already reflows at more widths than it should.
                    </>,
                    <>
                        Don&rsquo;t style headings by tag alone. <code>h1</code>-<code>h6</code> carry a size from the
                        type scale, so pick the tag for document structure and a <code>.text-*</code> class for size.
                    </>,
                ]}
            />
        </Block>
    </Section>
);
