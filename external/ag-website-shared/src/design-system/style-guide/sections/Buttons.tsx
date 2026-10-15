import ButtonGroup from '@ag-website-shared/components/button-group/ButtonGroup';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
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
        </Block>

        <Block
            title="Open-in CTA"
            note={
                <p>
                    The icon-only control that opens an example elsewhere: a new tab, Plunker, StackBlitz or
                    CodeSandbox. Its label comes from <code>type</code>.
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
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>Use one primary button per view, for the action you most want taken.</>,
                    <>Pair a primary with secondary buttons for the alternatives beside it.</>,
                    <>
                        Label a button with the action it performs: &ldquo;Copy code&rdquo;, not &ldquo;Click
                        here&rdquo;.
                    </>,
                    <>Use a link styled as a button when the control navigates somewhere.</>,
                ]}
                donts={[
                    <>Don&rsquo;t put two primary buttons side by side - nothing tells the reader which one matters.</>,
                    <>Don&rsquo;t use a button for navigation, or a link for an action.</>,
                    <>Don&rsquo;t restyle the focus ring when changing a button&rsquo;s look.</>,
                    <>Don&rsquo;t use a button group for actions - it is for choosing one of several options.</>,
                ]}
            />
        </Block>
    </Section>
);
