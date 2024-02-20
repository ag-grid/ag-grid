import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../../../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Wrappers and Integrations</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    A collection of wrappers and integrations that allow you to use AG Grid with other languages,
                    frameworks and tools
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <ul>
                        <li>
                            <a target="_blank" href="https://github.com/plotly/dash">Dash Plotly AG Grid</a> from <a target="_blank" href="https://plotly.com/">Plotly</a> - A Python wrapper for AG Grid
                        </li>
                        <li>
                            <a target="_blank" href="https://github.com/MichaelKim/ag-grid-svelte">Svelte Wrapper</a> from <a target="_blank">Michael Kim</a> - A Svelte wrapper for AG Grid
                        </li>
                        <li>
                            <a target="_blank" href="https://github.com/PablocFonseca/streamlit-aggrid">Streamlit</a> from <a target="_blank">Pablo Fonesca</a> - An AG Grid plugin for Streamlit
                        </li>
                        <li>
                            <a target="_blank" href="https://github.com/widgetti/ipyaggrid">IPYAGrid</a> from <a target="_blank">Widgetti</a> - An AG Grid plugin for IPYA
                        </li>
                        <li>
                            <a target="_blank" href="https://docs.lowdefy.com/AgGrid#title">AG Grid plugin for Lowdefy</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://github.com/systelab/systelab-components?ref=blog.ag-grid.com"> SysteLab Angular Components</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.astrouxds.com/patterns/table/#complex-tables">Astro UX Design System</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://xh.io/#hoist">Hoist UI Toolkit</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://developer.blackbaud.com/skyux/components/data-grid?docs-active-tab=development">Sky UI Kit</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://ui.vuestic.dev/ui-elements/data-table">Vuestic UI</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
