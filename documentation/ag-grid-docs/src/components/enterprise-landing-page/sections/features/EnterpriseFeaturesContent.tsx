import { TrialButton } from '@components/trial-licence-modal/TrialButton';
import { useSyncFrameworkStoreState } from '@utils/hooks/useSyncFrameworkStoreState';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './EnterpriseFeatures.module.scss';

interface FeatureData {
    id: string;
    title: string;
    features: {
        heading: string;
        detail: React.ReactNode;
    }[];
    docsLink: string;
}

const ENTERPRISE_FEATURES: FeatureData[] = [
    {
        id: 'grouping-aggregation',
        title: 'Grouping & Aggregation',
        features: [
            {
                heading: 'Multi-Level Grouping',
                detail: (
                    <>
                        <a href={urlWithBaseUrl('./data-grid/grouping/')}>Group rows</a> by one or more columns to
                        create hierarchical data views. Users can expand and collapse groups interactively.
                    </>
                ),
            },
            {
                heading: 'Automatic Aggregations',
                detail: (
                    <>
                        Calculate <a href={urlWithBaseUrl('./data-grid/aggregation/')}>aggregations</a> automatically
                        with built-in functions (sum, avg, count, min, max) or create custom aggregation functions.
                    </>
                ),
            },
            {
                heading: 'Drag & Drop Grouping',
                detail: (
                    <>
                        Enable <a href={urlWithBaseUrl('./data-grid/grouping-group-panel/')}>row group panel</a> to let
                        users drag columns to group data dynamically without code changes.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/grouping/',
    },
    {
        id: 'tree-data',
        title: 'Tree Data',
        features: [
            {
                heading: 'Hierarchical Data',
                detail: (
                    <>
                        Display <a href={urlWithBaseUrl('./data-grid/tree-data/')}>hierarchical data</a> with
                        parent-child relationships. Perfect for file browsers, org charts, and nested categories.
                    </>
                ),
            },
            {
                heading: 'Expand & Collapse',
                detail: (
                    <>
                        Users can expand and collapse tree nodes interactively. Control expansion state programmatically
                        via the API.
                    </>
                ),
            },
            {
                heading: 'Aggregation Support',
                detail: (
                    <>
                        Apply <a href={urlWithBaseUrl('./data-grid/tree-data-aggregation/')}>aggregations</a> to tree
                        data to roll up values from child nodes to parent nodes automatically.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/tree-data/',
    },
    {
        id: 'ssrm',
        title: 'Server-Side Row Model',
        features: [
            {
                heading: 'Lazy Loading',
                detail: (
                    <>
                        Handle millions of rows by{' '}
                        <a href={urlWithBaseUrl('./data-grid/server-side-model/')}>loading data on-demand</a> as users
                        scroll. Perfect for large datasets that cannot fit in browser memory.
                    </>
                ),
            },
            {
                heading: 'Server-Side Operations',
                detail: (
                    <>
                        Perform <a href={urlWithBaseUrl('./data-grid/server-side-model-sorting/')}>sorting</a>,{' '}
                        <a href={urlWithBaseUrl('./data-grid/server-side-model-filtering/')}>filtering</a>, and{' '}
                        <a href={urlWithBaseUrl('./data-grid/server-side-model-grouping/')}>grouping</a> on your server
                        for optimal performance.
                    </>
                ),
            },
            {
                heading: 'Infinite Scrolling',
                detail: (
                    <>
                        Combine with <a href={urlWithBaseUrl('./data-grid/infinite-scrolling/')}>infinite scrolling</a>{' '}
                        for seamless data loading. Reduces memory footprint and improves initial load times.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/server-side-model/',
    },
    {
        id: 'excel-export',
        title: 'Excel Export',
        features: [
            {
                heading: 'Native Excel Files',
                detail: (
                    <>
                        Export grid data to <a href={urlWithBaseUrl('./data-grid/excel-export/')}>native Excel files</a>{' '}
                        (.xlsx) with full formatting support. No server-side processing required.
                    </>
                ),
            },
            {
                heading: 'Style & Format Export',
                detail: (
                    <>
                        Export with{' '}
                        <a href={urlWithBaseUrl('./data-grid/excel-export-styles/')}>cell styles, fonts, and colors</a>.
                        Preserve your grid's appearance in the exported spreadsheet.
                    </>
                ),
            },
            {
                heading: 'Multiple Sheets',
                detail: (
                    <>
                        Export to{' '}
                        <a href={urlWithBaseUrl('./data-grid/excel-export-multiple-sheets/')}>multiple sheets</a> in a
                        single workbook. Include charts, images, and custom content.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/excel-export/',
    },
    {
        id: 'ai-toolkit',
        title: 'AI Toolkit',
        features: [
            {
                heading: 'Natural Language Control',
                detail: (
                    <>
                        Integrate your LLM with AG Grid to let users{' '}
                        <a href={urlWithBaseUrl('./data-grid/ai-toolkit/')}>control grid state via natural language</a>.
                    </>
                ),
            },
            {
                heading: 'Structured Schema Generation',
                detail: (
                    <>
                        Use <code>getStructuredSchema()</code> to generate LLM-compatible schemas. Works with any LLM
                        supporting structured outputs.
                    </>
                ),
            },
            {
                heading: 'Full State Manipulation',
                detail: (
                    <>
                        Apply LLM responses directly to the grid with <code>setState()</code>. Supports filtering,
                        sorting, aggregation, pivoting, and more.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/ai-toolkit/',
    },
    {
        id: 'set-filter',
        title: 'Set Filter',
        features: [
            {
                heading: 'Excel-Style Filtering',
                detail: (
                    <>
                        Provide users with an{' '}
                        <a href={urlWithBaseUrl('./data-grid/filter-set/')}>Excel-like filter experience</a> with
                        checkboxes for each unique value in a column.
                    </>
                ),
            },
            {
                heading: 'Search & Select',
                detail: (
                    <>
                        Built-in search box lets users quickly find values in large lists. Select all, select none, and
                        invert selection with one click.
                    </>
                ),
            },
            {
                heading: 'Async Values',
                detail: (
                    <>
                        Load filter values{' '}
                        <a href={urlWithBaseUrl('./data-grid/filter-set-filter-list/')}>asynchronously</a> from your
                        server. Perfect for columns with thousands of unique values.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/filter-set/',
    },
    {
        id: 'master-detail',
        title: 'Master/Detail',
        features: [
            {
                heading: 'Nested Grids',
                detail: (
                    <>
                        Display <a href={urlWithBaseUrl('./data-grid/master-detail/')}>hierarchical data</a> with
                        expandable rows. Each detail row contains a fully featured grid with its own columns and
                        features.
                    </>
                ),
            },
            {
                heading: 'Custom Detail Panels',
                detail: (
                    <>
                        Use{' '}
                        <a href={urlWithBaseUrl('./data-grid/master-detail-custom-detail/')}>custom detail renderers</a>{' '}
                        to display any content in the detail section - forms, charts, or custom components.
                    </>
                ),
            },
            {
                heading: 'Lazy Loading Details',
                detail: (
                    <>
                        Load detail data on-demand when rows are expanded. Independent configuration for each detail
                        grid.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/master-detail/',
    },
    {
        id: 'context-menu',
        title: 'Context Menu',
        features: [
            {
                heading: 'Right-Click Menu',
                detail: (
                    <>
                        Provide a <a href={urlWithBaseUrl('./data-grid/context-menu/')}>right-click context menu</a>{' '}
                        with built-in actions like copy, paste, export, and chart creation.
                    </>
                ),
            },
            {
                heading: 'Custom Menu Items',
                detail: (
                    <>
                        Add{' '}
                        <a href={urlWithBaseUrl('./data-grid/context-menu/#customising-the-context-menu')}>
                            custom menu items
                        </a>{' '}
                        with icons, submenus, and keyboard shortcuts. Full control over menu structure.
                    </>
                ),
            },
            {
                heading: 'Dynamic Menus',
                detail: (
                    <>
                        Show different menu items based on the clicked cell, row, or column. Context-aware menus for
                        better user experience.
                    </>
                ),
            },
        ],
        docsLink: './data-grid/context-menu/',
    },
];

export const EnterpriseFeaturesContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [contentTarget, setContentTarget] = useState<HTMLElement | null>(null);

    // Sync framework store state so example runners can load
    useSyncFrameworkStoreState('react');

    // Find the content target element for the portal
    useEffect(() => {
        const target = document.getElementById('enterprise-content-target');
        if (target) {
            setContentTarget(target);
        }
    }, []);

    const handleTabClick = (index: number) => {
        let newIndex = index;
        if (index >= ENTERPRISE_FEATURES.length) {
            newIndex = 0;
        } else if (index < 0) {
            newIndex = ENTERPRISE_FEATURES.length - 1;
        }

        setActiveTab(newIndex);

        // Dispatch custom event to notify Astro about tab change
        const event = new CustomEvent('enterprise-feature-tab-change', {
            detail: {
                index: newIndex,
                featureId: ENTERPRISE_FEATURES[newIndex].id,
            },
        });
        document.dispatchEvent(event);
    };

    // Set initial tab on mount
    useEffect(() => {
        const event = new CustomEvent('enterprise-feature-tab-change', {
            detail: {
                index: 0,
                featureId: ENTERPRISE_FEATURES[0].id,
            },
        });
        document.dispatchEvent(event);
    }, []);

    const activeFeature = ENTERPRISE_FEATURES[activeTab];

    const featureContent = (
        <div className={styles.contentContainer}>
            <div className={styles.featureContainer}>
                <h3 className={styles.title}>{activeFeature.title}</h3>
                {activeFeature.features.map((feature, index) => (
                    <div key={index} className={styles.feature}>
                        <h5 className={styles.featureHeading}>{feature.heading}</h5>
                        <span className={styles.featureDetail}>{feature.detail}</span>
                    </div>
                ))}
            </div>
            <div className={styles.buttonContainer}>
                <TrialButton
                    className={`button-secondary ${styles.trialCta} plausible-event-name=enterprise-features-trial-cta`}
                >
                    Start Free Trial
                </TrialButton>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.tabContainer}>
                {ENTERPRISE_FEATURES.map((feature, index) => (
                    <button
                        id={`feature-tab-${feature.title.toLowerCase()}`}
                        key={feature.id}
                        className={`${activeTab === index ? styles.activeTab : styles.tab} plausible-event-name=enterprise-${feature.id}-tab`}
                        onClick={() => handleTabClick(index)}
                    >
                        {feature.title}
                    </button>
                ))}
            </div>
            {contentTarget ? createPortal(featureContent, contentTarget) : featureContent}
        </>
    );
};

export default EnterpriseFeaturesContent;
