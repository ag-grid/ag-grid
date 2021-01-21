import React from 'react';
import { Helmet } from 'react-helmet';
import { withPrefix } from 'gatsby';
import { getHeaderTitle } from 'utils/page-header';
import fwLogos from 'images/fw-logos';
import supportedFrameworks from 'utils/supported-frameworks';
import MenuView from 'components/menu-view/MenuView';
import menuData from '../../doc-pages/licensing/menu.json';
import styles from './home.module.scss';

const backgroundColor = {
    javascript: '#f8df1e',
    angular: '#1976d3',
    react: '#282c34',
    vue: '#50c297'
};

const logos = (() => {
    const obj = {};

    for (let framework of supportedFrameworks) {
        obj[framework] = fwLogos[framework === 'vue' ? 'vueInverted' : framework];
    }

    return obj;
})();

const flatRenderItems = (items, framework) => {
    return items.reduce((prev, curr) => {
        let ret = prev;

        if (curr.frameworks && curr.frameworks.indexOf(framework) === -1) { return ret; }

        ret = prev.concat({ title: curr.title, url: curr.url });

        if (!curr.items) { return ret; }

        return ret.concat(flatRenderItems(curr.items, framework));
    }, []);
};

const panelItemsFilter = (pane, framework) => data => ((data.frameworks && data.frameworks.indexOf(framework) !== -1) || !data.frameworks) && data.pane === pane;

const GettingStartedPane = ({framework, data}) => {
    const linksToRender = flatRenderItems(data, framework);
    const numberOfColumns = Math.ceil(linksToRender.length / 5);

    return (
        <div className={styles['docs-home__getting-started__framework_pane']}>
            <div className={styles['docs-home__getting-started__framework_overview']}>
                <a href="./getting-started/" className={styles['docs-home__getting-started__framework_logo']}>
                    <img
                        style={{ backgroundColor: backgroundColor[framework] }}
                        alt={framework}
                        src={logos[framework]} />
                </a>
            </div>
            <div
                className={styles['docs-home__getting-started__items']}
                style={{ gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)` }}>
                {linksToRender.map(link => <a
                    key={link.title}
                    href={withPrefix(link.url.replace('../', `/${framework}/`))}>{link.title}</a>)}
            </div>
        </div>
    );
}

const GettingStarted = ({ framework, data }) => {
    const leftPaneItems = data.filter(panelItemsFilter("left", framework))
    const rightPaneItems = data.filter(panelItemsFilter("right", framework))

    return (
        <div className={styles['docs-home__getting-started']}>
            <h2 className={styles['docs-home__getting-started__title']}>Getting Started</h2>
            <div className={styles['docs-home__getting-started__row']}>
                <GettingStartedPane framework={framework} data={leftPaneItems} />
                {rightPaneItems.length > 0 && <GettingStartedPane framework={framework} data={rightPaneItems} />}
            </div>
        </div>
    );
};

const HomePage = ({ pageContext }) => {
    const { framework } = pageContext;

    // basics / getting started
    const gettingStartedItems = menuData[0].items[0].items;

    return (
        <div className={styles['docs-home']}>
            <Helmet title={getHeaderTitle('Documentation', framework)} />
            <GettingStarted framework={framework} data={gettingStartedItems} />
            <MenuView framework={framework} data={menuData} />
        </div>
    );
};

export default HomePage;
