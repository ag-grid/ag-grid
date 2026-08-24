import ButtonGroup from '@ag-website-shared/components/button-group/ButtonGroup';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';

const GROUP_BUTTONS = ['JavaScript', 'React', 'Angular', 'Vue'];

/** Live `ButtonGroup`, which needs an owner for the active index. */
const ButtonGroupDemo: FunctionComponent = () => {
    const [active, setActive] = useState('React');

    return (
        <ButtonGroup
            preText="Framework"
            buttons={GROUP_BUTTONS.map((text) => ({
                text,
                active: text === active,
                onClick: () => setActive(text),
            }))}
        />
    );
};

const VARIANTS = [
    {
        className: undefined,
        label: 'Primary',
        use: 'The one action you want on the page. A bare <button> is already primary - no class needed.',
    },
    { className: 'button-secondary', label: 'Secondary', use: 'Neutral alternatives beside a primary action.' },
    {
        className: 'button-tertiary',
        label: 'Tertiary',
        use: 'Low-emphasis actions, and brand-tinted actions in dense UI.',
    },
    { className: 'button-as-link', label: 'As link', use: 'An action that should read as a link. Still a button.' },
    {
        className: 'button-style-none',
        label: 'Unstyled',
        use: 'Strips all button chrome. For wrapping custom content in a real button.',
    },
];

/**
 * States rendered as a matrix. Hover, focus and active have `.hover` / `.focus` class equivalents in
 * `elements/_button.scss` precisely so a guide can show them all at once.
 */
const STATES: { label: string; className?: string; disabled?: boolean; ariaDisabled?: boolean }[] = [
    { label: 'Default' },
    { label: 'Hover', className: 'hover' },
    { label: 'Focus', className: 'focus' },
    { label: 'Disabled', disabled: true },
    { label: 'Aria disabled', ariaDisabled: true },
];

/** Buttons: variants, every state, and the disabled-versus-aria-disabled distinction. */
export const Buttons: FunctionComponent = () => (
    <Section
        id="buttons"
        title="Buttons"
        source="elements/_button.scss"
        lede={
            <p>
                Styled by element, so a bare <code>&lt;button&gt;</code> is already the primary variant. Adding{' '}
                <code>.button</code>, <code>.button-secondary</code> or <code>.button-tertiary</code> to an{' '}
                <code>&lt;a&gt;</code> gives a link the same treatment while keeping middle-click and open-in-new-tab.
            </p>
        }
    >
        <Block title="Variants and states">
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Variant</th>
                            {STATES.map(({ label }) => (
                                <th key={label} scope="col">
                                    {label}
                                </th>
                            ))}
                            <th scope="col">Use for</th>
                        </tr>
                    </thead>
                    <tbody>
                        {VARIANTS.map(({ className, label, use }) => (
                            <tr key={label}>
                                <td data-column="Variant">
                                    <CopyButton
                                        value={className ?? '<button>'}
                                        label={className ? `.${className}` : '<button>'}
                                        inline
                                    />
                                </td>
                                {STATES.map((state) => (
                                    <td key={state.label} data-column={state.label}>
                                        <button
                                            type="button"
                                            className={classnames(className, state.className)}
                                            disabled={state.disabled}
                                            aria-disabled={state.ariaDisabled}
                                        >
                                            Button
                                        </button>
                                    </td>
                                ))}
                                <td data-column="Use for">{use}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="disabled or aria-disabled"
            note={
                <p>
                    Identical to look at, different on purpose. <code>disabled</code> also sets{' '}
                    <code>pointer-events: none</code> and drops the button from the tab order;{' '}
                    <code>aria-disabled</code> keeps it focusable while still announcing it as disabled.
                </p>
            }
        >
            <Specimen
                row
                code={`<!-- Removed from the tab order. Nobody can reach it to find out why. -->
<button disabled>Submit</button>

<!-- Focusable and hoverable, announced as disabled. Pair with an
     explanation of what would enable it. -->
<button aria-disabled="true">Submit</button>`}
            >
                <Variant name="disabled">
                    <button type="button" disabled>
                        Submit
                    </button>
                </Variant>
                <Variant name="aria-disabled">
                    <button type="button" aria-disabled>
                        Submit
                    </button>
                </Variant>
            </Specimen>
        </Block>

        <Block
            title="With icons"
            note={
                <p>
                    Each variant sets <code>--icon-color</code> to its own foreground, so an <code>Icon</code> inside a
                    button follows the variant and its hover state with no extra styling.
                </p>
            }
        >
            <Specimen
                row
                code={`<button>
    Run example <Icon name="play" />
</button>`}
            >
                <Variant name="Primary">
                    <button type="button">
                        Run example <Icon name="play" />
                    </button>
                </Variant>
                <Variant name="Secondary">
                    <button type="button" className="button-secondary">
                        Copy <Icon name="copy" />
                    </button>
                </Variant>
                <Variant name="Tertiary">
                    <button type="button" className="button-tertiary">
                        Open <Icon name="newTab" />
                    </button>
                </Variant>
                <Variant name="As link">
                    <button type="button" className="button-as-link">
                        Show more <Icon name="chevronDown" />
                    </button>
                </Variant>
            </Specimen>
        </Block>

        <Block title="Links styled as buttons">
            <Specimen row code={`<a href="/pricing" class="button">See pricing</a>`}>
                <Variant name=".button">
                    <a href="#buttons" className="button">
                        See pricing
                    </a>
                </Variant>
                <Variant name=".button-secondary">
                    <a href="#buttons" className="button-secondary">
                        Documentation
                    </a>
                </Variant>
                <Variant name=".button-tertiary">
                    <a href="#buttons" className="button-tertiary">
                        Examples
                    </a>
                </Variant>
            </Specimen>
        </Block>

        <Block
            title="Button group"
            note={
                <p>
                    A segmented control: mutually exclusive options where exactly one is selected. Every button is a{' '}
                    <code>.button-secondary</code> underneath, so the group is a layout and selection wrapper rather
                    than a new variant.
                </p>
            }
        >
            <Specimen
                code={`<ButtonGroup
    preText="Framework"
    buttons={frameworks.map((text) => ({
        text,
        active: text === selected,
        onClick: () => setSelected(text),
    }))}
/>`}
            >
                <ButtonGroupDemo />
            </Specimen>
            <p>
                Each entry is <code>{'{ text, active?, onClick?, className? }'}</code> and <code>text</code> doubles as
                the React key, so the labels within a group have to be unique. <code>preText</code> is optional leading
                copy - it renders as bare text beside the group rather than as a <code>&lt;label&gt;</code>, so it does
                not announce as the group&rsquo;s name.
            </p>
        </Block>

        <Block
            title="Open-in CTA"
            note={
                <p>
                    The icon-only control that opens an example elsewhere - a new tab, Plunker, StackBlitz, CodeSandbox.
                    It takes either an <code>href</code> or an <code>onClick</code> and renders an{' '}
                    <code>&lt;a&gt;</code> or a <code>&lt;button&gt;</code> to match, so the element is always right for
                    what the control actually does.
                </p>
            }
        >
            <Specimen
                row
                code={`<OpenInCTA type="newTab" href={exampleUrl} />
<OpenInCTA type="plunker" onClick={openInPlunker} tracking={trackPlunker} />

<!-- markdoc -->
{% openInCTA type="stackblitz" href="…" text="Open in" /%}`}
            >
                {(['newTab', 'plunker', 'stackblitz', 'codesandbox'] as const).map((type) => (
                    <Variant key={type} name={type}>
                        <OpenInCTA type={type} href="#buttons" />
                    </Variant>
                ))}
            </Specimen>
            <p>
                The label comes from <code>type</code>, both as the visible tooltip and as the <code>aria-label</code>,
                so there is nothing to write and nothing to get out of step. The optional <code>tracking</code> callback
                fires alongside the navigation for analytics. Links always open in a new tab with{' '}
                <code>rel=&quot;noreferrer&quot;</code>.
            </p>
            <p>
                Two behaviours are worth knowing before you reuse it. The tooltip is CSS-only and always in the DOM, so
                its text is announced in addition to the <code>aria-label</code> - the same word twice. And the button
                branch is hidden outright on Mobile Safari, via an <code>@supports (-webkit-touch-callout: none)</code>{' '}
                query in the stylesheet, because the sandboxes it opens do not work there. Anything you add as a{' '}
                <code>button</code> rather than a link inherits that disappearance.
            </p>
        </Block>

        <Gotcha>
            The focus ring is a <code>box-shadow</code>, not an <code>outline</code> - so overriding{' '}
            <code>box-shadow</code> on a button silently removes it. Re-declare it if you restyle. Buttons inside a form
            also default to <code>type=&quot;submit&quot;</code>; set <code>type=&quot;button&quot;</code> on anything
            that is not the submit control.
        </Gotcha>

        <KnownIssue>
            <p>
                <strong>
                    A <code>.button-style-none</code> label disappears on hover.
                </strong>{' '}
                Look at the Hover cell of its row in the matrix above - it is blank. The base button rule sets{' '}
                <code>color: var(--color-button-primary-fg)</code> on <code>:hover</code>, and{' '}
                <code>.button-style-none</code> resets only <code>background-color</code> and <code>border</code>, not{' '}
                <code>color</code>. The label therefore becomes white on a transparent background: measured, it goes
                from <code>rgb(16, 24, 40)</code> to <code>rgb(255, 255, 255)</code> while the background stays{' '}
                <code>rgba(0, 0, 0, 0)</code>.
            </p>
            <p>
                <code>.button-as-link</code> is unaffected because it declares its own hover colour. The fix is for{' '}
                <code>.button-style-none</code> to do the same in <code>elements/_button.scss</code>. Until then, any
                usage that does not set its own colour has an invisible hover state - there are around a dozen, in the
                docs navigation, the tab strip, the video player and the example runner&rsquo;s code viewer.
            </p>
            <p>
                <code>OpenInCTA.astro</code> does{' '}
                <code>
                    import {'{'} type CtaType {'}'}
                </code>{' '}
                from <code>OpenInCTA.tsx</code>, but <code>CtaType</code> is declared there without <code>export</code>.
                It is an unresolved import that survives only because <code>.astro</code> files are not covered by the
                type-check gate; the <code>Props</code> interface it annotates is therefore not actually constrained to
                the four valid values.
            </p>
            <p>
                <code>OpenInCTA</code>&rsquo;s button branch uses <code>.button-style-none</code>, so it is subject to
                the hover defect above. It gets away with it because the control&rsquo;s visible content is an{' '}
                <code>&lt;svg&gt;</code> icon with its own <code>fill</code> rather than text, and the reset does not
                touch <code>fill</code>.
            </p>
        </KnownIssue>
    </Section>
);
