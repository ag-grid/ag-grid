import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

const ROWS = [
    { feature: 'Row grouping', community: false, enterprise: true, since: 'v18' },
    { feature: 'Sorting', community: true, enterprise: true, since: 'v1' },
    { feature: 'Pivoting', community: false, enterprise: true, since: 'v18' },
    { feature: 'CSV export', community: true, enterprise: true, since: 'v8' },
];

const Cells: FunctionComponent = () => (
    <>
        {ROWS.map((row) => (
            <tr key={row.feature}>
                <th scope="row" data-column="Feature">
                    {row.feature}
                </th>
                <td data-column="Community">{row.community ? 'Yes' : 'No'}</td>
                <td data-column="Enterprise">{row.enterprise ? 'Yes' : 'No'}</td>
                <td data-column="Since">{row.since}</td>
            </tr>
        ))}
    </>
);

const Header: FunctionComponent = () => (
    <thead>
        <tr>
            <th scope="col">Feature</th>
            <th scope="col">Community</th>
            <th scope="col">Enterprise</th>
            <th scope="col">Since</th>
        </tr>
    </thead>
);

/** Tables: the default treatment, the compact header, and the stacking behaviour for narrow widths. */
export const Tables: FunctionComponent = () => (
    <Section
        id="tables"
        title="Tables"
        source={['elements/_table.scss', 'core/_mixins.scss']}
        lede={
            <>
                <p>
                    Tables are borderless apart from horizontal rules between rows, full width, and left aligned. There
                    is no zebra striping - separation comes from the row rules alone.
                </p>
                <p>
                    A table has no built-in horizontal scrolling, so a wide table needs either a scroll container or the
                    stacking treatment below.
                </p>
            </>
        }
    >
        <Block title="Default">
            <Specimen code={`<table>`}>
                <table>
                    <Header />
                    <tbody>
                        <Cells />
                    </tbody>
                </table>
            </Specimen>
        </Block>

        <Block
            title="Compact header"
            note={
                <p>
                    <code>.small-header</code> drops the header row to regular weight and tightens its vertical padding.
                    Use it when the header is a label rather than a heading - long reference tables, for instance, where
                    a bold header row on every table is noisy.
                </p>
            }
        >
            <Specimen code={`<table class="small-header">`}>
                <table className="small-header">
                    <Header />
                    <tbody>
                        <Cells />
                    </tbody>
                </table>
            </Specimen>
        </Block>

        <Block
            title="Stacking on narrow widths"
            note={
                <>
                    <p>
                        <code>.stack</code> collapses each row into a block, hides the header, and relabels every cell
                        from its <code>data-column</code> attribute. Cells must carry{' '}
                        <code>data-column=&quot;&lt;header text&gt;&quot;</code> for this to work - without it the cell
                        loses its meaning entirely.
                    </p>
                    <p>
                        The same behaviour is available as the <code>stack-table()</code> mixin, which is what to use
                        inside a component&rsquo;s own <code>.module.scss</code> when the table should stack at that
                        component&rsquo;s breakpoint rather than always.
                    </p>
                </>
            }
        >
            <Specimen
                label="Always stacked"
                code={`<table class="stack">
    <tbody>
        <tr>
            <th scope="row" data-column="Feature">Row grouping</th>
            <td data-column="Community">No</td>
        </tr>
    </tbody>
</table>`}
            >
                <div className={styles.narrowDemo}>
                    <table className="stack">
                        <Header />
                        <tbody>
                            <Cells />
                        </tbody>
                    </table>
                </div>
            </Specimen>

            <Specimen
                label="Stacked below a breakpoint"
                code={`@use 'design-system' as *;

.myTable {
    @media (max-width: $breakpoint-table-small) {
        @include stack-table();
    }
}`}
            >
                <p>
                    <code>stack-table()</code> lives in <code>core/_mixins.scss</code> rather than beside the table
                    element styles, so a component can reach it through <code>@use &apos;design-system&apos;</code>{' '}
                    without pulling in the global table CSS.
                </p>
            </Specimen>
        </Block>

        <Block title="Building a table">
            <Guidance
                dos={[
                    <>
                        Use <code>&lt;th scope=&quot;col&quot;&gt;</code> for column headers and{' '}
                        <code>&lt;th scope=&quot;row&quot;&gt;</code> for the first cell of each row, so the
                        relationships are announced.
                    </>,
                    <>
                        Add <code>data-column</code> to every cell in a table that might stack - it costs nothing when
                        it does not.
                    </>,
                    <>
                        Wrap a wide table in a container with <code>overflow-x: auto</code>, and give that container{' '}
                        <code>tabindex=&quot;0&quot;</code> so it can be scrolled by keyboard.
                    </>,
                    <>
                        Add a <code>&lt;caption&gt;</code> when the table&rsquo;s purpose is not clear from the
                        surrounding text.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t use <code>role=&quot;grid&quot;</code> on a static table. That role is for
                        interactive grid widgets and it changes how screen readers navigate the content.
                    </>,
                    <>
                        Don&rsquo;t use <code>&lt;td scope=&quot;row&quot;&gt;</code> - <code>scope</code> is only valid
                        on <code>&lt;th&gt;</code> and is ignored on a <code>&lt;td&gt;</code>.
                    </>,
                    <>
                        Don&rsquo;t use a table for layout. The global styles assume tabular data and will add rules
                        between your rows.
                    </>,
                ]}
            />
        </Block>

        <KnownIssue>
            <p>
                The previous version of this guide documented a <code>.no-zebra</code> class. No such class exists
                anywhere in the design system, and there is no zebra striping to turn off - the markup was carried
                forward from an earlier iteration of the table styles. It has been dropped here rather than reproduced.
            </p>
            <p>
                It also put <code>role=&quot;grid&quot;</code> on every example table and{' '}
                <code>scope=&quot;row&quot;</code> on <code>&lt;td&gt;</code> elements. Both are incorrect, and a style
                guide is the worst place to have incorrect markup, since it is copied.
            </p>
        </KnownIssue>
    </Section>
);
