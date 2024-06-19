import type { Framework, ImportType, MenuItem } from '@ag-grid-types';
import Note from '@ag-website-shared/components/alert/Note';
import Success from '@ag-website-shared/components/alert/Success';
import Warning from '@ag-website-shared/components/alert/Warning';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { FrameworkSelectorInsideDocs } from '@components/framework-selector-inside-doc/FrameworkSelectorInsideDocs';
import { Snippet } from '@components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { type FunctionComponent, useMemo } from 'react';

import { getBootstrapSnippet, getDependenciesSnippet, getNpmInstallSnippet } from '../utils/getSnippets';
import { hasValue } from '../utils/hasValue';
import { useLicenseData } from '../utils/useLicenseData';
import styles from './LicenseSetup.module.scss';

interface SeedRepo {
    name: string;
    framework: Framework;
    importType: ImportType;
    licenseType: 'enterprise' | 'enterprise-bundle';
    devEnvironment: string;
    url: string;
}

interface Props {
    framework: Framework;
    path: string;
    menuItems: MenuItem[];
    seedRepos: SeedRepo[];
}

const DUMMY_LICENSE_KEY =
    'Using_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-963284}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{AcmeCorp}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{AcmeApp}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{AcmeApp}_need_to_be_licensed___{AcmeApp}_has_been_granted_a_Deployment_License_Add-on_for_{1}_Production_Environment___This_key_works_with_{AG_Charts_and_AG_Grid}_Enterprise_versions_released_before_{04_May_2024}____[v3]_[0102]_4F37JqkNmUUpwds1nG==WwlRFepEGJshElLJE3uKnQ6vcbwTaJF6';

const EmailSales = () => {
    return (
        <>
            Please contact <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> for more assistance
        </>
    );
};

export const LicenseSetup: FunctionComponent<Props> = ({ framework, path, menuItems, seedRepos }) => {
    const {
        hasLicense,
        setHasLicense,
        license,
        userLicense,
        setUserLicense,
        importType,
        updateImportTypeWithUrlUpdate,
        licensedProducts,
        userProducts,
        updateUserProductsWithUrlUpdate,
        noUserProducts,
        userLicenseExpiry,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
        validLicenseText,
        errors,
    } = useLicenseData();
    const dependenciesSnippet = useMemo(
        () =>
            getDependenciesSnippet({
                framework,
                products: userProducts,
                noProducts: noUserProducts,
                importType,
            }),
        [framework, userProducts, importType]
    );
    const npmInstallSnippet = useMemo(
        () =>
            getNpmInstallSnippet({
                framework,
                products: userProducts,
                noProducts: noUserProducts,
                importType,
            }),
        [framework, userProducts, importType]
    );
    const bootstrapSnippet = useMemo(
        () =>
            getBootstrapSnippet({
                framework,
                importType,
                license: license || 'your License Key',
                userProducts,
                noProducts: noUserProducts,
            }),
        [framework, importType, license, userProducts]
    );
    const selectedSeedRepos = useMemo(
        () =>
            seedRepos
                .filter(({ licenseType }) => {
                    if (userProducts.integratedEnterprise) {
                        return licenseType === 'enterprise-bundle';
                    } else if (userProducts.chartsEnterprise || userProducts.gridEnterprise) {
                        return licenseType === 'enterprise';
                    }

                    return false;
                })
                .filter((seedRepo) => {
                    return seedRepo.framework === framework && seedRepo.importType === importType;
                }),
        [seedRepos, userProducts, framework, importType]
    );

    return (
        <>
            <form>
                <p>Do you already an AG Grid or AG Charts License Key:</p>
                <div className={styles.inputList}>
                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="true"
                            checked={hasValue(hasLicense) && hasLicense}
                            onChange={() => setHasLicense(true)}
                        />{' '}
                        I have an existing License Key
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="false"
                            checked={hasValue(hasLicense) && !hasLicense}
                            onChange={() => setHasLicense(false)}
                        />{' '}
                        I don't have a License Key yet
                    </label>
                </div>

                {hasLicense && (
                    <div className={styles.licenceWrapper}>
                        <textarea
                            className={classnames(styles.license, {
                                [styles.error]: errors.userLicenseError,
                            })}
                            placeholder="Paste your License Key here."
                            value={userLicense}
                            onChange={(e) => {
                                setUserLicense(e.target.value);
                            }}
                        ></textarea>

                        {userLicense === '' && (
                            <span className={styles.licencePlaceholder}>
                                <b>Paste your License Key here, e.g., </b>
                                <span>{DUMMY_LICENSE_KEY}</span>
                            </span>
                        )}
                    </div>
                )}

                {validLicenseText && <Success>{validLicenseText}</Success>}

                {errors.expired && (
                    <Warning>
                        {errors.expired}. <EmailSales />
                    </Warning>
                )}

                {errors.expiredTrial && (
                    <Warning>
                        {errors.expiredTrial}. <EmailSales />
                    </Warning>
                )}

                {errors.userLicenseError && (
                    <Warning>
                        {errors.userLicenseError}. <EmailSales />
                    </Warning>
                )}

                {errors.v2License && (
                    <Warning>
                        {errors.v2License}. <EmailSales />
                    </Warning>
                )}

                {/* TODO change "AG Grid" to grid/charts based on site */}
                {!hasLicense && (
                    <Note>
                        Visit the <a href={urlWithBaseUrl('/license-pricing')}>Pricing Page</a> to discover the power of
                        AG Grid Enterprise and <b>buy</b> a licence key.
                        <br />
                        Alternatively, email <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> to start a
                        conversation or <b>request a trial licence key</b>.
                    </Note>
                )}

                <div className={styles.licenseData}>
                    {hasLicense && (
                        <div>
                            <label>Licence key expires: </label>
                            <b className={(errors.expired || errors.expiredTrial) && styles.expired}>
                                {userLicenseExpiry ? userLicenseExpiry : '--'}
                            </b>
                        </div>
                    )}

                    <div>
                        <div>
                            <span>Which enterprise products are you using:</span>
                        </div>

                        <div>
                            <div className={styles.productsList}>
                                <div className={styles.productWrapper}>
                                    <label
                                        className={classnames(styles.licensedProduct, {
                                            [styles.valid]: hasLicense && licensedProducts.grid,
                                            [styles.trial]: hasLicense && userLicenseIsTrial && licensedProducts.grid,
                                            [styles.expired]:
                                                hasLicense &&
                                                (userLicenseIsExpired || userLicenseTrialIsExpired) &&
                                                licensedProducts.grid,
                                        })}
                                    >
                                        <input
                                            type="checkbox"
                                            name="products"
                                            value="gridEnterprise"
                                            checked={userProducts.gridEnterprise}
                                            onChange={() => {
                                                updateUserProductsWithUrlUpdate({
                                                    ...userProducts,
                                                    gridEnterprise: !userProducts.gridEnterprise,
                                                });
                                            }}
                                        />
                                        <strong>AG Grid Enterprise</strong>
                                    </label>

                                    <label
                                        className={classnames(styles.licensedProduct, styles.integratedProduct, {
                                            [styles.valid]:
                                                hasLicense && licensedProducts.grid && licensedProducts.charts,
                                            [styles.trial]:
                                                hasLicense &&
                                                userLicenseIsTrial &&
                                                licensedProducts.grid &&
                                                licensedProducts.charts,
                                            [styles.expired]:
                                                hasLicense &&
                                                (userLicenseIsExpired || userLicenseTrialIsExpired) &&
                                                licensedProducts.grid &&
                                                licensedProducts.charts,
                                        })}
                                    >
                                        <input
                                            type="checkbox"
                                            name="products"
                                            value="integratedEnterprise"
                                            checked={userProducts.integratedEnterprise}
                                            onChange={() => {
                                                updateUserProductsWithUrlUpdate({
                                                    ...userProducts,
                                                    integratedEnterprise: !userProducts.integratedEnterprise,
                                                });
                                            }}
                                        />
                                        <span>Integrated Charts</span>
                                    </label>
                                </div>

                                <div className={styles.productWrapper}>
                                    <label
                                        className={classnames(styles.licensedProduct, {
                                            [styles.valid]: hasLicense && licensedProducts.charts,
                                            [styles.trial]: hasLicense && userLicenseIsTrial && licensedProducts.charts,
                                            [styles.expired]:
                                                hasLicense &&
                                                (userLicenseIsExpired || userLicenseTrialIsExpired) &&
                                                licensedProducts.charts,
                                        })}
                                    >
                                        <input
                                            type="checkbox"
                                            name="products"
                                            value="chartsEnterprise"
                                            checked={userProducts.chartsEnterprise}
                                            onChange={() => {
                                                updateUserProductsWithUrlUpdate({
                                                    ...userProducts,
                                                    chartsEnterprise: !userProducts.chartsEnterprise,
                                                });
                                            }}
                                        />
                                        <strong>AG Charts Enterprise</strong>
                                    </label>
                                </div>
                            </div>

                            {errors.chartsNoGridEnterprise && (
                                <Warning>
                                    {errors.chartsNoGridEnterprise}. <EmailSales />
                                </Warning>
                            )}

                            {errors.chartsNoIntegratedEnterprise && (
                                <Warning>
                                    {errors.chartsNoIntegratedEnterprise}. <EmailSales />
                                </Warning>
                            )}

                            {errors.gridNoCharts && (
                                <Warning>
                                    {errors.gridNoCharts}. <EmailSales />
                                </Warning>
                            )}

                            {errors.gridNoIntegratedEnterprise && (
                                <Warning>
                                    {errors.gridNoIntegratedEnterprise}. <EmailSales />
                                </Warning>
                            )}

                            {(!userProducts.chartsEnterprise || !userProducts.gridEnterprise) &&
                                userProducts.integratedEnterprise && (
                                    <Warning>
                                        {errors.noIntegratedEnterprise}. <EmailSales />
                                    </Warning>
                                )}
                        </div>
                    </div>

                    <div className={styles.frameworkImportContainer}>
                        <div className={styles.frameworkContainer}>
                            <label>Framework</label>
                            <FrameworkSelectorInsideDocs
                                path={path}
                                currentFramework={framework}
                                menuItems={menuItems}
                            />
                        </div>

                        <span className={styles.divider}></span>

                        <div className={styles.importContainer}>
                            <label>
                                <span>Import type:</span>
                            </label>

                            <select
                                name="importType"
                                value={importType}
                                onChange={(e) => {
                                    updateImportTypeWithUrlUpdate(e.target.value as ImportType);
                                }}
                            >
                                <option value="packages">Packages</option>
                                <option value="modules">Modules</option>
                            </select>
                        </div>
                        <p className={classnames(styles.importsLink, 'text-sm')}>
                            <a
                                href={urlWithPrefix({
                                    framework,
                                    url: './modules/#packages-vs-modules',
                                })}
                            >
                                Learn more about import types
                            </a>
                        </p>
                    </div>
                </div>

                <div className={styles.results}>
                    <h3 id="add-your-dependencies">Add Your Dependencies</h3>
                    {errors.noProducts && <Note>{errors.noProducts}</Note>}

                    <p>
                        Copy the following dependencies into your <code>package.json</code>:
                    </p>
                    {dependenciesSnippet && (
                        <Snippet framework={framework} content={dependenciesSnippet} copyToClipboard />
                    )}

                    <p>Or install using npm:</p>
                    {npmInstallSnippet && (
                        <Snippet framework={framework} content={npmInstallSnippet} language="bash" copyToClipboard />
                    )}

                    <h3 id="set-up-your-application">Set Up Your Application</h3>
                    {errors.noProducts && <Note>{errors.noProducts}</Note>}

                    {(userProducts.gridEnterprise || userProducts.integratedEnterprise || noUserProducts) && (
                        <>
                            {!noUserProducts && <p>An example of how to set up your AG Grid Enterprise License Key:</p>}
                            {bootstrapSnippet.grid && (
                                <Snippet framework={framework} content={bootstrapSnippet.grid} copyToClipboard />
                            )}
                        </>
                    )}

                    {userProducts.chartsEnterprise && (
                        <>
                            <p>An example of how to set up your AG Charts Enterprise License Key:</p>
                            {bootstrapSnippet.charts && (
                                <Snippet framework={framework} content={bootstrapSnippet.charts} copyToClipboard />
                            )}
                        </>
                    )}

                    <h2 id="seed-repos">Seed Repositories</h2>
                    {selectedSeedRepos.length ? (
                        <>
                            <p>Here are some seed code repositories to get you started:</p>

                            <table className={styles.reposTable} role="grid">
                                <thead>
                                    <tr>
                                        <th scope="col">Github Repo</th>
                                        <th scope="col">Framework</th>
                                        <th scope="col">Development Environment</th>
                                        <th scope="col">Import Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSeedRepos.map(({ name, url, framework, devEnvironment, importType }) => {
                                        return (
                                            <tr key={url}>
                                                <td>
                                                    <a
                                                        className={classnames(styles.repoButton, 'button-secondary')}
                                                        href={url}
                                                    >
                                                        <Icon name="github" />
                                                        {name}
                                                    </a>
                                                </td>
                                                <td>
                                                    <img
                                                        className={styles.frameworkLogo}
                                                        src={urlWithBaseUrl(`/images/fw-logos/${framework}.svg`)}
                                                        alt={framework}
                                                    />{' '}
                                                    {framework}
                                                </td>
                                                <td>{devEnvironment}</td>
                                                <td>{importType}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>Select your enterprise products above to view seed repositories.</p>
                    )}
                </div>
            </form>
        </>
    );
};
