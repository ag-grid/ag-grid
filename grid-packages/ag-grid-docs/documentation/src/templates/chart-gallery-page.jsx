import React from 'react';
import toKebabCase from 'utils/to-kebab-case';
import ExampleRunner from 'components/example-runner/ExampleRunner';
import { SEO } from 'components/SEO';
import { getHeaderTitle } from 'utils/page-header';
import pageStyles from './doc-page.module.scss';
import styles from './chart-gallery-page.module.scss';

/**
 * This template is used for individual chart gallery pages.
 */
const ChartGalleryPageTemplate = ({ pageContext: { framework, name, description, previous, next, pageName } }) => {
    return (
        <div id="doc-page-wrapper" className={pageStyles['doc-page__wrapper']}>
            <div id="doc-content" className={pageStyles['doc-page']}>
                {/*eslint-disable-next-line react/jsx-pascal-case*/}
                <SEO
                    title={`Gallery - ${name}`}
                    description={description.replace(/<[^>]+>/g, '')}
                    framework={framework}
                    pageName={pageName} />

                <div className={styles['chart-navigation']}>
                    {/* eslint-disable jsx-a11y/control-has-associated-label */}
                    {previous && <a className={styles['chart-navigation__left']} href={`../${toKebabCase(previous)}/`} dangerouslySetInnerHTML={{ __html: `\u276e&nbsp;&nbsp;${previous}` }}></a>}
                    {next && <a className={styles['chart-navigation__right']} href={`../${toKebabCase(next)}/`} dangerouslySetInnerHTML={{ __html: `${next}&nbsp;&nbsp;\u276f` }}></a>}
                    {/* eslint-enable jsx-a11y/control-has-associated-label */}
                </div>

                <h1 className={styles['title']}>{getHeaderTitle(`Gallery - ${name}`, framework, true)}</h1>
                <p dangerouslySetInnerHTML={{ __html: description }}></p>

                <ExampleRunner
                    title={name}
                    name={toKebabCase(name)}
                    type="generated"
                    framework={framework}
                    pageName={pageName}
                    library="charts"
                    options={{ exampleHeight: '60vh' }} />
            </div>
        </div>
    );
};

export default ChartGalleryPageTemplate;
