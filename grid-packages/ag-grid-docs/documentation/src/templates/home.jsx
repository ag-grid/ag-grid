import React from 'react';
import { Helmet } from 'react-helmet';
import { withPrefix } from 'gatsby';
import { getHeaderTitle } from 'utils/page-header';
import logos from 'images/logos';
import MenuView from 'components/menu-view/MenuView';
import menuData from '../../doc-pages/licensing/menu.json';
import styles from './home.module.scss';

const processedLogos = (() => ({
    ...logos
}))();

const flatRenderItems = (items, framework) => {
    return items.reduce((prev, curr) => {
        let ret = prev;

        if (curr.frameworks && curr.frameworks.indexOf(framework) === -1) { return ret; }

        ret = prev.concat(Object.assign({},{ title: curr.title, url: curr.url }, curr.icon ? { icon: curr.icon } : {}));

        if (!curr.items) { return ret; }

        return ret.concat(flatRenderItems(curr.items, framework));
    }, []);
};

const panelItemsFilter = (pane, framework) => data => ((data.frameworks && data.frameworks.indexOf(framework) !== -1) || !data.frameworks) && data.pane === pane;

const urlMap = {
    javascript: {
        'video-tutorial': 'https://youtu.be/KS-wg5zfCXc',
        'example': 'https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview'
    },
    angular: {
        'video-tutorial': 'https://youtu.be/AeEfiWAGyLc',
        'example': 'https://stackblitz.com/edit/ag-grid-angular-hello-world',
        'thinkster': 'https://thinkster.io/tutorials/fundamentals-of-ag-grid-with-angular'
    },
    react: {
        'video-tutorial': 'https://youtu.be/6PA45adHun8',
        'example': 'https://stackblitz.com/edit/ag-grid-react-hello-world',
        'thinkster': 'https://thinkster.io/tutorials/using-ag-grid-with-react-getting-started'
    },
    vue: {
        'video-tutorial': 'https://youtu.be/eW3qCti1lsA',
        'example': 'https://stackblitz.com/edit/ag-grid-vue-hello-world'
    }
}

const parseGettingStartedUrl = (url, framework) => {
    const match = url.match(/{(\w+-?\w*)}/);
    if (match) {
        return {
            href: urlMap[framework][match[1]],
            target: '_blank',
            rel: 'noreferrer'
        }
    }
    return {
        href: withPrefix(url.replace('../', `/${framework}/`))
    };
}

const getLogo = (name, framework) => {
    if (name === 'framework') {
        return processedLogos[framework];
    }
    return processedLogos[name];
}

const GettingStartedPane = ({ framework, data }) => {
    const linksToRender = flatRenderItems(data, framework);
    return (
        <div className={styles['docs-home__getting-started__item_pane']}>
            {linksToRender.map(link => {
                const parsedLink = parseGettingStartedUrl(link.url, framework);
                return (
                    <a key={`${framework}_${link.title.replace(/\s/g,'').toLowerCase()}`} {...parsedLink} className={styles['docs-home__getting-started__item']}>
                        <div  className={styles['docs-home__getting-started__item_logo']}>
                            <img src={ getLogo(link.icon, framework) } alt={link.title}></img>
                        </div>
                        <div className={styles['docs-home__getting-started__item_label']}>
                            {link.title}
                        </div>
                    </a>
                )
            })}
        </div>
    );
};

const GettingStarted = ({ framework, data }) => {
    const leftPaneItems = data.filter(panelItemsFilter("left", framework));
    const rightPaneItems = data.filter(panelItemsFilter("right", framework));

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

const HomePage = ({ pageContext: { framework } }) => {
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
