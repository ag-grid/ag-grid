import classnames from 'classnames';
import { convertUrl } from 'components/documentation-helpers';
import MenuView from 'components/menu-view/MenuView';
import { SEO } from 'components/SEO';
import logos from 'images/logos';
import React from 'react';
import menuData from '../../doc-pages/licensing/menu.json';
import { Icon } from '../components/Icon';
import tileStyles from '../components/menu-view/Tile.module.scss';
import supportedFrameworks from '../utils/supported-frameworks';
import featuredVideos from './featuredVideos.json';
import styles from './home.module.scss';

const flatRenderItems = (items, framework) => {
    return items.reduce((prev, curr) => {
        let ret = prev;

        if (curr.frameworks && curr.frameworks.indexOf(framework) === -1) {
            return ret;
        }

        ret = prev.concat(
            Object.assign({}, { title: curr.title, url: curr.url }, curr.icon ? { icon: curr.icon } : {})
        );

        if (!curr.items) {
            return ret;
        }

        return ret.concat(flatRenderItems(curr.items, framework));
    }, []);
};

const panelItemsFilter = (pane, framework) => (data) =>
    ((data.frameworks && data.frameworks.indexOf(framework) !== -1) || !data.frameworks) && data.pane === pane;

const urlMap = {
    javascript: {
        'video-tutorial': 'https://youtu.be/KS-wg5zfCXc',
        example: 'https://plnkr.co/edit/nmWxAxWONarW5gj2?p=preview?p=preview',
        'example-title': 'StackBlitz Example',
        'example-icon': 'stackblitz',
    },
    angular: {
        'video-tutorial': 'https://youtu.be/AeEfiWAGyLc',
        example:
            'https://codesandbox.io/p/sandbox/ag-grid-angular-example-zly6rt?file=%2Fsrc%2Fapp%2Fapp.component.ts%3A1%2C1-2%2C1',
        thinkster: 'https://thinkster.io/tutorials/fundamentals-of-ag-grid-with-angular',
        'example-title': 'CodeSandbox Example',
        'example-icon': 'codesandbox',
    },
    react: {
        'video-tutorial': 'https://youtu.be/GTu79aWJT1E',
        example: 'https://codesandbox.io/s/ag-grid-react-hello-world-9pnf3n',
        thinkster: 'https://thinkster.io/tutorials/using-ag-grid-with-react-getting-started',
        'example-title': 'CodeSandbox Example',
        'example-icon': 'codesandbox',
    },
    vue: {
        'video-tutorial': 'https://youtu.be/eW3qCti1lsA',
        example: 'https://codesandbox.io/s/ag-grid-vue-3-example-bvwik?file=/src/App.vue',
        'example-title': 'CodeSandbox Example',
        'example-icon': 'codesandbox',
    },
};

const parseGettingStartedUrl = (url, framework) => {
    const match = url.match(/{(\w+-?\w*)}/);

    if (match) {
        return {
            href: urlMap[framework][match[1]],
            target: '_blank',
            rel: 'noreferrer',
        };
    }

    return {
        href: convertUrl(url, framework),
    };
};

const getLogo = (name, framework) => logos[name === 'framework' ? framework : name];

const GettingStartedPane = ({ framework, data }) => {
    const linksToRender = flatRenderItems(data, framework);

    return (
        <>
            {linksToRender.map((link) => {
                const title = link.title.includes('{example-title}') ? urlMap[framework]['example-title'] : link.title;
                const icon = link.icon.includes('{example-icon}') ? urlMap[framework]['example-icon'] : link.icon;
                const parsedLink = parseGettingStartedUrl(link.url, framework);
                const frameworkCapitalised = framework.charAt(0).toUpperCase() + framework.slice(1);
                const alt = `${frameworkCapitalised} Grid: ${link.title}`;

                return (
                    <a
                        key={`${framework}_${link.title.replace(/\s/g, '').toLowerCase()}`}
                        {...parsedLink}
                        className={classnames(tileStyles.tile, tileStyles.linkTile)}
                    >
                        <div className={styles.gettingStartedLogo}>
                            <img src={getLogo(icon, framework)} alt={alt} />
                        </div>
                        <div className={tileStyles.linkTileTitle}>{title}</div>
                    </a>
                );
            })}
        </>
    );
};

const GettingStarted = ({ framework, data }) => {
    const title = `Getting Started`;
    const leftPaneItems = data.filter(panelItemsFilter('left', framework));
    const rightPaneItems = data.filter(panelItemsFilter('right', framework));

    return (
        <div className={classnames(styles.section, styles.gettingStartedSection)}>
            <h2>{title}</h2>
            <div className={styles.sectionInner}>
                <GettingStartedPane framework={framework} data={leftPaneItems} />
                {rightPaneItems.length > 0 && <GettingStartedPane framework={framework} data={rightPaneItems} />}
            </div>
        </div>
    );
};

const VideoPanel = ({ framework, videos }) => {
    const title = `Videos`;
    return (
        <div className={styles.section}>
            <h2>{title}</h2>
            <div className={styles.sectionInner}>
                {videos.map((video) => (
                    <div
                        className={classnames(tileStyles.tile, tileStyles.videoTile, tileStyles.linkTile)}
                        key={video.id}
                    >
                        <a
                            href={`https://www.youtube.com/watch?v=${video.id}&list=${video.list}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                style={{ height: '100%', width: '100%' }}
                                alt={video.title || title}
                                src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                            />
                        </a>
                    </div>
                ))}
                <a href="./videos/" className={classnames(tileStyles.tile, tileStyles.linkTile)}>
                    <div className={styles.allVideosInner}>
                        <Icon name="playCircle" svgClasses={styles.allVideosIcon} />
                        <div className={tileStyles.linkTileTitle}>All Videos</div>
                    </div>
                </a>
            </div>
        </div>
    );
};

/**
 * This is the home page for the documentation.
 */
const HomePage = ({ pageContext: { framework } }) => {
    // basics / getting started
    const gettingStartedItems = menuData[0].items[0].items;

    const frameworkVideos = featuredVideos[framework];

    const otherFrameworks = () => {
        const frameworks = supportedFrameworks.filter((f) => {
            return f !== framework;
        });

        return (
            <span style={{ textTransform: 'capitalize' }}>
                <a href={`../${frameworks[0]}-data-grid/`}>{frameworks[0]}</a>,{' '}
                <a href={`../${frameworks[1]}-data-grid/`}>{frameworks[1]}</a>, or{' '}
                <a href={`../${frameworks[2]}-data-grid/`}>{frameworks[2]}</a>
            </span>
        );
    };

    return (
        <div className={styles.docsHome}>
            {/*eslint-disable-next-line react/jsx-pascal-case*/}
            <SEO
                title="Documentation"
                description="Our documentation will help you to get up and running with AG Grid."
                framework={framework}
                pageName="home"
            />

            <div className={classnames(styles.section, styles.introSection, 'font-size-responsive')}>
                <h1>AG Grid {framework} Documentation</h1>
                <p className="font-size-extra-large">Start developing with the best JavaScript Grid in the world.</p>
                <p className="font-size-medium">
                    You can get started with <a href="./getting-started/">a simple sample project and tutorial</a>,
                    watch our extensive selection of <a href="./videos/">videos</a>, or review the{' '}
                    <a href="./grid-options/">grid options</a>.
                </p>
                <p className="font-size-medium">
                    Looking for documentation for another framework? Switch to {otherFrameworks()}.
                </p>
            </div>

            <GettingStarted framework={framework} data={gettingStartedItems} />
            {frameworkVideos && frameworkVideos.length > 0 && (
                <VideoPanel framework={framework} videos={frameworkVideos} />
            )}
            <MenuView framework={framework} data={menuData} />
        </div>
    );
};

export default HomePage;
