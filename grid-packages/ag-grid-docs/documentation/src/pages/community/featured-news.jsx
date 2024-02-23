import React from 'react';
import newsStyles from '@design-system/modules/CommunityNews.module.scss';

const FeaturedNews = () => {
  return (
    <div>
                        <div className={newsStyles.container}>
                            <div className={newsStyles.leftColumn}>
                                <img
                                    src="../../images/community/sample.png"
                                    alt="Self-Care"
                                    className={newsStyles.image}
                                />
                                <h1 style={{paddingTop: "4px"}}>Featured Article</h1>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div className={newsStyles.rightColumn}>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Aluminum in Deodorant"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 1</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Anaerobic Exercise"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 2</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Anaerobic Exercise"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 3</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
  );
};

export default FeaturedNews;