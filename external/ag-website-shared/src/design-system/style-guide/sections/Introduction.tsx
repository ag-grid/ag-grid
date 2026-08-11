import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Gotcha, Section } from '../chrome/Section';
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
            <p>
                Every value here is read from the design system&rsquo;s own source at runtime - the live stylesheet for
                tokens, the Sass files for spacing and breakpoints - so nothing on this page can fall behind the code.
            </p>
        }
    >
        <Block title="The four token layers" note={<p>Work at the most specific layer that already exists.</p>}>
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
            />
        </Block>

        <Gotcha>
            Anything used inside a <code>@media</code> or <code>@container</code> condition has to be a Sass variable -
            custom properties are not valid there. Everything else is a custom property so it can be re-pointed per
            theme. Never hardcode a colour: a literal hex follows neither the theme nor a palette change.
        </Gotcha>
    </Section>
);
