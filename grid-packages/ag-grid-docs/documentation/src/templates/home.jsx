import React from 'react';
import logos from 'images/logos';
import MenuView from 'components/menu-view/MenuView';
import {SEO} from 'components/SEO';
import {convertUrl} from 'components/documentation-helpers';
import menuData from '../../doc-pages/licensing/menu.json';
import styles from './home.module.scss';
import menuStyles from '../components/menu-view/MenuView.module.scss';
import tileStyles from '../components/menu-view/Tile.module.scss';
import classnames from "classnames";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlayCircle} from '@fortawesome/free-solid-svg-icons'
import featuredVideos from './featuredVideos.json';

const flatRenderItems = (items, framework) => {
    return items.reduce((prev, curr) => {
        let ret = prev;

        if (curr.frameworks && curr.frameworks.indexOf(framework) === -1) {
            return ret;
        }

        ret = prev.concat(Object.assign({}, {title: curr.title, url: curr.url}, curr.icon ? {icon: curr.icon} : {}));

        if (!curr.items) {
            return ret;
        }

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
        'video-tutorial': 'https://youtu.be/GTu79aWJT1E',
        'example': 'https://stackblitz.com/edit/ag-grid-react-hello-world',
        'thinkster': 'https://thinkster.io/tutorials/using-ag-grid-with-react-getting-started'
    },
    vue: {
        'video-tutorial': 'https://youtu.be/eW3qCti1lsA',
        'example': 'https://stackblitz.com/edit/ag-grid-vue-hello-world'
    }
};

const parseGettingStartedUrl = (url, framework) => {
    const match = url.match(/{(\w+-?\w*)}/);

    if (match) {
        return {
            href: urlMap[framework][match[1]],
            target: '_blank',
            rel: 'noreferrer'
        };
    }

    return {
        href: convertUrl(url, framework)
    };
};

const getLogo = (name, framework) => logos[name === 'framework' ? framework : name];

const GettingStartedPane = ({framework, data}) => {
    const linksToRender = flatRenderItems(data, framework);

    return (
        <div className={styles['docs-home__getting-started__item_pane']}>
            {linksToRender.map(link => {
                const parsedLink = parseGettingStartedUrl(link.url, framework);
                const frameworkCapitalised = framework.charAt(0).toUpperCase() + framework.slice(1);
                const alt = `${frameworkCapitalised} Grid: ${link.title}`;

                return (
                    <a key={`${framework}_${link.title.replace(/\s/g, '').toLowerCase()}`} {...parsedLink}
                       className={styles['docs-home__getting-started__item']}>
                        <div className={styles['docs-home__getting-started__item_logo']}>
                            <img src={getLogo(link.icon, framework)} alt={alt} style={{height: 64, width: 64}}/>
                        </div>
                        <div className={styles['docs-home__getting-started__item_label']}>
                            {link.title}
                        </div>
                    </a>
                );
            })}
        </div>
    );
};

const GettingStarted = ({framework, data}) => {
    const title = `${framework === 'javascript' ? 'JavaScript' : framework} Data Grid: Getting Started`;
    const leftPaneItems = data.filter(panelItemsFilter('left', framework));
    const rightPaneItems = data.filter(panelItemsFilter('right', framework));

    return (
        <div className={styles['docs-home__getting-started']}>
            <h2 className={styles['docs-home__getting-started__title']}>{title}</h2>
            <div className={styles['docs-home__getting-started__row']}>
                <GettingStartedPane framework={framework} data={leftPaneItems}/>
                {rightPaneItems.length > 0 && <GettingStartedPane framework={framework} data={rightPaneItems}/>}
            </div>
        </div>
    );
};

const VideoPanel = ({framework, videos}) => {
    const title = framework === 'javascript' ? 'JavaScript' : `${framework} Data Grid: Videos`;
    return (
        <div className={menuStyles['menu-view']}>
            <h2 className={menuStyles['menu-view__title']}>
                {title}
            </h2>
            <div className={menuStyles['menu-view__tile-row']}>
                {videos.map(video => (
                        <div className={classnames(tileStyles['menu-view-tile'], tileStyles['video-tile'])} style={{height: "10rem"}} key={video.id}>
                            <a href={`https://www.youtube.com/watch?v=${video.id}&list=${video.list}`} target="_blank" rel="noreferrer">
                                <img style={{height: "100%", width: "100%"}} alt={video.title || title} src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}/>
                            </a>
                        </div>
                    )
                )}
                <div className={classnames(tileStyles['menu-view-tile'])} style={{height: "10rem"}}>
                    <div className={styles['docs-home__video-panel__videos__all-videos']}>
                        <a href="./videos/" style={{margin: "auto"}}>
                            <div style={{flexDirection: "column"}}>
                                <FontAwesomeIcon icon={faPlayCircle} size="6x"/>
                                <div className={styles['docs-home__video-panel__videos__all-videos__title']}>All Videos</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
};

/**
 * This is the home page for the documentation.
 */
const HomePage = ({pageContext: {framework}}) => {
    // basics / getting started
    const gettingStartedItems = menuData[0].items[0].items;

    const frameworkVideos = featuredVideos[framework];

    return (
        <div className={styles['docs-home']}>
            {/*eslint-disable-next-line react/jsx-pascal-case*/}
            <SEO
                title="Documentation"
                description="Our documentation will help you to get up and running with AG Grid."
                framework={framework}
                pageName="home"
            />
            <GettingStarted framework={framework} data={gettingStartedItems}/>
            {frameworkVideos && frameworkVideos.length > 0 && <VideoPanel framework={framework} videos={frameworkVideos}/>}
            <MenuView framework={framework} data={menuData}/>
        </div>
    );
};

export default HomePage;
