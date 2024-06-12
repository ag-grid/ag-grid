import type { Framework, ImportType } from '@ag-grid-types';
import Idea from '@ag-website-shared/components/alert/Idea';
import Note from '@ag-website-shared/components/alert/Note';
import Warning from '@ag-website-shared/components/alert/Warning';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@components/snippet/Snippet';
import { InfoTooltip } from '@components/theme-builder/components/general/Tooltip';
import { FRAMEWORK_DISPLAY_TEXT } from '@constants';
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
    seedRepos: SeedRepo[];
}

const EmailSales = () => {
    return (
        <>
            Please contact <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> for more assistance
        </>
    );
};

export const LicenseSetup: FunctionComponent<Props> = ({ framework, seedRepos }) => {
    const {
        hasLicense,
        setHasLicense,
        license,
        userLicense,
        setUserLicense,
        importType,
        setImportType,
        licensedProducts,
        userProducts,
        setUserProducts,
        noUserProducts,
        userLicenseExpiry,
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
                license: license || 'your license key',
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
            <p className={styles.pageDescription}>
                Validate your licence key and configure your application. See sample code and example projects to learn
                how to install your AG Grid Enterprise products.
            </p>

            <form>
                <p>Fill in the following form to get instructions on how to set up your license:</p>
                <div className={styles.inputList}>
                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="true"
                            defaultChecked={hasValue(hasLicense) && hasLicense}
                            onChange={() => setHasLicense(true)}
                        />{' '}
                        Existing license key
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="false"
                            defaultChecked={hasValue(hasLicense) && !hasLicense}
                            onChange={() => setHasLicense(false)}
                        />{' '}
                        No license key yet
                    </label>
                </div>
                {hasLicense && (
                    <textarea
                        className={classnames(styles.license, {
                            [styles.error]: errors.userLicenseError,
                        })}
                        placeholder="Paste your license here..."
                        value={userLicense}
                        onChange={(e) => {
                            setUserLicense(e.target.value);
                        }}
                    ></textarea>
                )}
                {validLicenseText && <Idea>{validLicenseText}</Idea>}
                {errors.expired && (
                    <Warning>
                        {errors.expired}. <EmailSales />
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
                        Don't have an AG Grid licence yet? Visit the{' '}
                        <a href={urlWithBaseUrl('/license-pricing')}>Pricing Page</a> to discover the power of AG Grid
                        enterprise and purchase a licence. Or email{' '}
                        <a href="mailto:info@ag-grid.com">info@ag-grid.com</a> to start a conversation or request a
                        trial licence
                    </Note>
                )}

                <div className={styles.licenseData}>
                    <div>
                        <label>Framework</label>
                        <div className={styles.frameworkContainer}>
                            <img
                                className={styles.frameworkLogo}
                                src={urlWithBaseUrl(`/images/fw-logos/${framework}.svg`)}
                                alt={framework}
                            />{' '}
                            {FRAMEWORK_DISPLAY_TEXT[framework]}
                        </div>
                    </div>
                    {hasLicense && (
                        <div>
                            <label>Expiry</label>
                            <div>{userLicenseExpiry ? userLicenseExpiry : '-'}</div>
                        </div>
                    )}

                    <div>
                        <div>Which enterprise products would you like to use?</div>
                        <div className={styles.licensedProductsContainer}>
                            <div className={styles.inputList}>
                                <label
                                    className={classnames({
                                        [styles.licensedProduct]: hasLicense && licensedProducts.grid,
                                    })}
                                >
                                    Grid Enterprise
                                    <input
                                        type="checkbox"
                                        name="products"
                                        value="gridEnterprise"
                                        checked={userProducts.gridEnterprise}
                                        onChange={() => {
                                            setUserProducts((prevProducts) => {
                                                return {
                                                    ...prevProducts,
                                                    gridEnterprise: !prevProducts.gridEnterprise,
                                                };
                                            });
                                        }}
                                    />
                                </label>

                                <label
                                    className={classnames({
                                        [styles.licensedProduct]:
                                            hasLicense && licensedProducts.grid && licensedProducts.charts,
                                    })}
                                >
                                    <span>Integrated Enterprise</span>

                                    <span className={styles.tooltipWrapper}>
                                        <InfoTooltip title="Use Charts Enterprise within Grid Enterprise through integrated charts" />
                                    </span>

                                    <input
                                        type="checkbox"
                                        name="products"
                                        value="integratedEnterprise"
                                        checked={userProducts.integratedEnterprise}
                                        onChange={() => {
                                            setUserProducts((prevProducts) => {
                                                return {
                                                    ...prevProducts,
                                                    integratedEnterprise: !prevProducts.integratedEnterprise,
                                                };
                                            });
                                        }}
                                    />
                                </label>
                                <label
                                    className={classnames({
                                        [styles.licensedProduct]: hasLicense && licensedProducts.charts,
                                    })}
                                >
                                    Charts Enterprise
                                    <input
                                        type="checkbox"
                                        name="products"
                                        value="chartsEnterprise"
                                        checked={userProducts.chartsEnterprise}
                                        onChange={() => {
                                            setUserProducts((prevProducts) => {
                                                return {
                                                    ...prevProducts,
                                                    chartsEnterprise: !prevProducts.chartsEnterprise,
                                                };
                                            });
                                        }}
                                    />
                                </label>
                            </div>
                            {errors.chartsNoIntegratedEnterprise && (
                                <Warning>{errors.chartsNoIntegratedEnterprise}</Warning>
                            )}
                            {errors.gridNoIntegratedEnterprise && (
                                <Warning>{errors.gridNoIntegratedEnterprise}</Warning>
                            )}
                            {errors.chartsNoGridEnterprise && <Warning>{errors.chartsNoGridEnterprise}</Warning>}
                            {errors.gridNoCharts && <Warning>{errors.gridNoCharts}</Warning>}
                        </div>
                    </div>
                    <div>
                        <label>
                            <a
                                href={urlWithPrefix({
                                    framework,
                                    url: './modules/#packages-vs-modules',
                                })}
                            >
                                Import type
                            </a>
                        </label>
                        <select
                            name="importType"
                            defaultValue={importType}
                            onChange={(e) => {
                                setImportType(e.target.value as ImportType);
                            }}
                        >
                            <option value="packages">Packages</option>
                            <option value="modules">Modules</option>
                        </select>
                    </div>
                </div>

                <div className={styles.results}>
                    <h2>Add Your Dependencies</h2>
                    {errors.noProducts && <Note>{errors.noProducts}</Note>}

                    <p>
                        Copy the following dependencies into your <code>package.json</code>:
                    </p>
                    {dependenciesSnippet && <Snippet framework={framework} content={dependenciesSnippet} />}

                    <p>Or install using npm:</p>
                    {npmInstallSnippet && <Snippet framework={framework} content={npmInstallSnippet} language="bash" />}

                    <h2>Set Up Your Application</h2>
                    {errors.noProducts && <Note>{errors.noProducts}</Note>}

                    {(userProducts.gridEnterprise || userProducts.integratedEnterprise || noUserProducts) && (
                        <>
                            {!noUserProducts && <p>An example of how to set up your Grid Enterprise license:</p>}
                            {bootstrapSnippet.grid && <Snippet framework={framework} content={bootstrapSnippet.grid} />}
                        </>
                    )}

                    {userProducts.chartsEnterprise && (
                        <>
                            <p>An example of how to set up your Charts Enterprise license:</p>
                            {bootstrapSnippet.charts && (
                                <Snippet framework={framework} content={bootstrapSnippet.charts} />
                            )}
                        </>
                    )}

                    {selectedSeedRepos.length ? (
                        <>
                            <p>Here are some seed code repositories to get you started:</p>

                            <table className={styles.reposTable}>
                                <thead>
                                    <tr>
                                        <th>Github Repo</th>
                                        <th>Framework</th>
                                        <th>Development Environment</th>
                                        <th>Import Type</th>
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
                    ) : undefined}
                </div>
            </form>
        </>
    );
};
