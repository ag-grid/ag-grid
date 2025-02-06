import { gridUrlWithPrefix } from '@ag-website-shared/utils/gridUrlWithPrefix';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import type { FunctionComponent } from 'react';

import styles from './features.module.scss';

interface Props {
    type: 'community' | 'enterprise';
}

function Section({ index, feature }) {
    const framework = useFrameworkFromStore();
    return (
        <a key={index} className={styles.card} href={gridUrlWithPrefix({ framework, url: feature.link })}>
            <h4 className={styles.title}>{feature.title}</h4>
            <p className={styles.description}>{feature.description}</p>
        </a>
    );
}

const FeaturesSection: FunctionComponent<Props> = ({ type }) => {
    const communityFeatures = [
        {
            title: 'Data Grid Essentials',
            description: 'Row and column configurations, sorting, filtering, and pagination.',
        },
        {
            title: 'Cell Rendering',
            description: 'Custom cell rendering - use your own components inside cells.',
            link: './component-cell-renderer',
        },
        {
            title: 'Themes and Styling',
            description: 'Pre-built themes and CSS customization.',
            link: './theming',
        },
        {
            title: 'Accessibility Support',
            description: 'ARIA support and keyboard navigation.',
            link: './accessibility',
        },
        {
            title: 'Performance Optimisations',
            description: 'Column and row virtualization enabled by default.',
            link: './dom-virtualisation',
        },
        {
            title: 'Major Frameworks',
            description: 'Support for React, Angular and Vue, in addition to vanilla JavaScript.',
        },
    ];

    const enterpriseFeatures = [
        {
            title: 'Server-Side Row Model',
            description: 'Efficiently handle large datasets by loading data on-demand from the server.',
            link: './server-side-model',
        },
        {
            title: 'Excel Export',
            description: 'Advanced export options, including styles and formulas.',
            link: './excel-export',
        },
        {
            title: 'Pivot Tables & Aggregations',
            description: 'Built-in pivot and aggregation capabilities for complex data analysis.',
            link: './pivoting',
        },
        {
            title: 'Range Selection',
            description: 'Select and manipulate ranges of data.',
            link: './cell-selection',
        },
        {
            title: 'Integrated Charts',
            description: 'Create and customize charts directly within the grid.',
            link: './integrated-charts',
        },
        {
            title: 'Master/Detail View',
            description: 'Nested grid views for hierarchical data representation.',
            link: './master-detail',
        },
        {
            title: 'Row Grouping & Multi-Column Sorting',
            description: 'Advanced grouping and sorting options for better data organization.',
            link: './grouping',
        },
        {
            title: 'Clipboard Operations',
            description: 'Enhanced copy and paste functionality, including support for Excel-like behaviour.',
            link: './clipboard',
        },
        {
            title: 'Tool Panels',
            description: 'Built-in configuration panels for columns and filters, or create your own custom panels.',
            link: './tool-panel',
        },
        {
            title: 'Custom Context Menu & Sidebars',
            description: 'Additional UI elements for enhanced user interaction and customization.',
            link: './context-menu',
        },
    ];

    return (
        <div className={styles.container}>
            {type === 'community'
                ? communityFeatures.map((feature, index) => <Section key={index} index={index} feature={feature} />)
                : enterpriseFeatures.map((feature, index) => <Section key={index} index={index} feature={feature} />)}
        </div>
    );
};

export default FeaturesSection;
