import { Collapsible } from '@ag-website-shared/components/collapsible/Collapsible';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Gotcha, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

/**
 * Live `Collapsible`, driven by a real button.
 *
 * A static screenshot of a disclosure is close to useless - the whole component is the transition -
 * so this one is worth the local state.
 */
const CollapsibleDemo: FunctionComponent = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.disclosureDemo}>
            <button
                type="button"
                className="button-secondary"
                aria-expanded={isOpen}
                aria-controls="sg-collapsible"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? 'Hide' : 'Show'} details
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} />
            </button>

            <Collapsible id="sg-collapsible" isOpen={isOpen}>
                <div className={styles.disclosurePanel}>
                    <p>
                        Height is animated from <code>0</code> to <code>auto</code>, so the panel does not need a known
                        height and can hold anything.
                    </p>
                </div>
            </Collapsible>
        </div>
    );
};

/**
 * Disclosure: the two ways the sites hide and reveal a block of content.
 *
 * Documented together because the choice between them is the whole decision - they are not
 * interchangeable, and the deciding factor (React vs Astro) is not obvious from either name.
 */
export const Disclosure: FunctionComponent = () => (
    <Section
        id="disclosure"
        title="Disclosure"
        source={['components/collapsible/Collapsible.tsx', 'components/expanding-section/ExpandingSection.astro']}
        lede={
            <p>
                Two components for hiding content behind a toggle. <code>Collapsible</code> animates a panel you supply
                the trigger for; <code>ExpandingSection</code> is a self-contained header-plus-panel for markdoc pages.
            </p>
        }
    >
        <Block
            title="Collapsible"
            note={
                <p>
                    Controlled only - it has no internal open state, so the caller owns <code>isOpen</code> and the
                    trigger. That is deliberate: the trigger is usually a button that has to carry{' '}
                    <code>aria-expanded</code> and <code>aria-controls</code>, and the component cannot label a button
                    it does not render.
                </p>
            }
        >
            <Specimen
                label="Wire the trigger to the panel yourself"
                code={`const [isOpen, setIsOpen] = useState(false);

<button
    aria-expanded={isOpen}
    aria-controls="details"
    onClick={() => setIsOpen((open) => !open)}
>
    {isOpen ? 'Hide' : 'Show'} details
</button>

<Collapsible id="details" isOpen={isOpen}>
    <div>…</div>
</Collapsible>`}
            >
                <CollapsibleDemo />
            </Specimen>

            <Specimen
                label="Props"
                code={`isOpen: boolean            // required; the component holds no state
id?: string                // matches the trigger's aria-controls
animationDuration?: number // ms, default 330
isDisabled?: boolean       // render children with no wrapper at all
ariaHidden?: boolean       // not derived from isOpen - see below
onAnimationEnd?: () => void`}
            >
                <p>
                    <code>children</code> is typed as a single <code>ReactElement</code>, not <code>ReactNode</code>, so
                    sibling nodes have to be wrapped in one element. The animation is <code>react-animate-height</code>,
                    and while it runs the component adds <code>no-overflow-anchor</code> to <code>&lt;body&gt;</code> so
                    the browser&rsquo;s scroll anchoring does not fight the height change.
                </p>
            </Specimen>
        </Block>

        <Block
            title="Expanding section"
            note={
                <p>
                    An Astro component, so it cannot be rendered here - and cannot be used from React either. It is
                    built on <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code>, which is why it needs no
                    JavaScript to be operable: the script only adds the height transition.
                </p>
            }
        >
            <Specimen
                label={
                    <>
                        Markdoc: <code>{'{% expandingSection %}'}</code>
                    </>
                }
                code={`{% expandingSection headerText="Advanced configuration" %}
Content, including other markdoc tags.
{% /expandingSection %}

{% expandingSection headerText="Open by default" isOpen=true %}
…
{% /expandingSection %}`}
            />
            <Specimen
                label="Astro"
                code={`---
import ExpandingSection from '@ag-website-shared/components/expanding-section/ExpandingSection.astro';
---

<ExpandingSection headerText="Advanced configuration" isOpen={false}>
    <p>…</p>
</ExpandingSection>`}
            />
        </Block>

        <Guidance
            dos={[
                <>
                    Reach for <code>ExpandingSection</code> in markdoc content. It is one tag, it is keyboard operable
                    without JavaScript, and the summary is already styled as a <code>.button-secondary</code>.
                </>,
                <>
                    Reach for <code>Collapsible</code> when the trigger is not a plain header - a nav item, a table row,
                    a filter panel - or when something other than the click has to open it.
                </>,
                <>
                    Put <code>aria-expanded</code> on the <em>trigger</em>, not the panel, and point{' '}
                    <code>aria-controls</code> at the <code>Collapsible</code>&rsquo;s <code>id</code>.
                </>,
            ]}
            donts={[
                <>
                    Don&rsquo;t hide anything a reader needs to complete the task, or anything that should be findable
                    by in-page search - collapsed content in <code>ExpandingSection</code> is in the DOM, but readers
                    still will not look inside it.
                </>,
                <>
                    Don&rsquo;t build a third disclosure. A bare <code>&lt;details&gt;</code> in a React tree picks up
                    none of the styling, and a <code>max-height</code> transition cannot animate to <code>auto</code> -
                    which is the only reason these components exist.
                </>,
                <>
                    Don&rsquo;t nest them. Two levels of collapsed content reads as a broken page rather than a
                    hierarchy.
                </>,
            ]}
        />

        <Gotcha>
            <code>ExpandingSection</code> needs <code>/scripts/expanding-section.js</code> to be present in the
            consuming site&rsquo;s <code>public/</code> directory. The script is deliberately external rather than
            inline so the site&rsquo;s Content-Security-Policy can drop{' '}
            <code>script-src &apos;unsafe-inline&apos;</code>, which means it is a per-repo asset the shared component
            silently depends on - the section still opens without it, just without the transition.
        </Gotcha>

        <KnownIssue>
            <p>
                <code>Collapsible</code>&rsquo;s <code>ariaHidden</code> prop is not derived from <code>isOpen</code>,
                so by default a collapsed panel is still exposed to assistive technology and its contents are still in
                the tab order. Callers have to pass <code>ariaHidden={'{!isOpen}'}</code> themselves, and most do not.
            </p>
            <p>
                <code>isDisabled</code> returns <code>children</code> directly, bypassing the wrapper - which also drops
                the <code>id</code>. Any <code>aria-controls</code> pointing at that <code>id</code> becomes a dangling
                reference in exactly the mode where the content is permanently visible.
            </p>
        </KnownIssue>
    </Section>
);
