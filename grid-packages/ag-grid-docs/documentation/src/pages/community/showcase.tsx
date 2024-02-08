import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import aboutUsStyles from '@design-system/modules/about.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const CommunityPage = () => {
    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames("doc-content", styles['doc-page'])}>
                <SEO title="Community" description="Explore the AG Grid community" />
                <header className={styles.docsPageHeader}>
                    <h1 id="top" className={styles.docsPageTitle}>
                        <div className={styles.pageTitleContainer}>
                            <div className={styles.pageTitleGroup}>
                                <span>Showcase</span>
                            </div>
                        </div>
                    </h1>
                </header>
                <span>
                    A collection of public examples that use AG Grid 
                </span>
                <div className={styles.pageSections} style={{ marginTop: '25px' }}>
                    <ul>
                        <li>
                            <a>Adaptable</a>
                        </li>
                        <li>
                            <a>Terminal Pro @ OpenBB</a>
                        </li>
                        <li>
                            <a>Tableflow</a>
                        </li>
                        <li>
                            <a>React Admin</a>
                        </li>
                        <li>
                            <a href="https://www.unavco.org/instrumentation/networks/status/all">Unavco</a>
                        </li>
                        <li>
                            <a href="https://www.prisma.io/studio">Prisma Studio</a>
                        </li>
                        <li>
                            <a href="https://github.com/enso-org/enso">Enso.org</a>
                        </li>
                        <li>
                            <a href="https://github.com/0wczar/airframe-react">Airframe React</a>
                        </li>
                        <li>
                            <a href="https://wtmdoc.walkingtec.cn/">WTM</a>
                        </li>
                        <li>
                            <a href="https://trafficcontrol.apache.org/">Apache Traffic Control</a>
                        </li>
                        <li>
                            <a href="https://github.com/yobulkdev/yobulkdev">YoBulk</a>
                        </li>
                        <li>
                            <a href="https://github.com/oughtinc/ice?tab=readme-ov-file">Ice</a>
                        </li>
                        <li>
                            <a href="https://wowup.io/">WowUp</a>
                        </li>
                        <li>
                            <a href="https://github.com/sigrennesmetropole/MapStore2">Map Store2</a>
                        </li>
                        <li>
                            <a href="https://github.com/galadhremmin/Parf-Edhellen/tree/master">Parf Edhellen</a>
                        </li>
                        <li>
                            <a href="https://github.com/certego/BuffaLogs">BuffaLogs</a>
                        </li>
                        <li>
                            <a href="https://github.com/railmapgen/rmg">Rail Map Gen</a>
                        </li>
                        <li>
                            <a href="https://github.com/REditorSupport/vscode-R">VS Code - R</a>
                        </li>
                        <li>
                            <a href="https://github.com/mxswat/mx-division-builds">MX Division Builds</a>
                        </li>
                        <li>
                            <a href="https://github.com/vxcontrol/soldr">Soldr</a>
                        </li>
                        <li>
                            <a href="https://github.com/openziti/ziti-console">Ziti Console</a>
                        </li>
                        <li>
                            <a href="https://github.com/vishwajeetraj11/quizco-frontend">Quizco</a>
                        </li>
                        <li>
                            <a href="https://github.com/sipb/hydrant">Hydrant</a>
                        </li>
                        <li>
                            <a href="https://github.com/mlflow/mlflow/tree/master">MLFlow -> Huge, 16.7k stars!!!</a>
                        </li>
                        <li>
                            <a href="https://github.com/shawnbanasick/ken-q-analysis">Ken Q Analysis</a>
                        </li>
                        <li>
                            <a href="https://github.com/gedge-platform/gedge-platform">Gedge Platform</a>
                        </li>
                        <li>
                            <a href="https://github.com/windmill-labs/windmill">Windmill</a>
                        </li>
                        <li>
                            <a href="https://github.com/jose-donato/budgetguru">Budget Guru</a>
                        </li>
                        <li>
                            <a href="https://github.com/jeffvli/feishin">Feishin</a>
                        </li>
                        <li>
                            <a href="https://github.com/mlops-ai/mlops">ML Ops</a>
                        </li>
                        <li>
                            <a href="https://github.com/opensource-emr/hospital-management-emr">Hospital Management EMR</a>
                        </li>
                        <li>
                            <a href="https://github.com/AppImage/appimage.github.io">App Image</a>
                        </li>
                        <li>
                            <a href="https://github.com/vegaprotocol/vega.xyz">Vega</a>
                        </li>
                        <li>
                            <a href="https://github.com/SCADA-LTS/Scada-LTS">Scada LTS</a>
                        </li>
                        <li>
                            <a href="https://github.com/vxcontrol/soldr">Soldr</a>
                        </li>
                        <li>
                            <a href="https://github.com/jpmorganchase/salt-ds">Salt DS</a>
                        </li>
                        <li>
                            <a href="https://github.com/sassoftware/vscode-sas-extension">VS Code SaS Extension</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
