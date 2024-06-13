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
        updateImportTypeWithUrlUpdate,
        licensedProducts,
        userProducts,
        updateUserProductsWithUrlUpdate,
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
            <form>
                <p>Fill in the following form to get instructions on how to set up your license:</p>
                <div className={styles.inputList}>
                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="true"
                            checked={hasValue(hasLicense) && hasLicense}
                            onChange={() => setHasLicense(true)}
                        />{' '}
                        Existing license key
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="hasLicense"
                            value="false"
                            checked={hasValue(hasLicense) && !hasLicense}
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
                    {hasLicense && (
                        <div>
                            <label>Licence expires: </label>
                            <b className={errors.expired && styles.expired}>
                                {userLicenseExpiry ? userLicenseExpiry : '--'}
                            </b>
                        </div>
                    )}

                    <div>
                        <div>
                            <span>Which enterprise products are you using:</span>
                            <span className={styles.tooltipWrapper}>
                                <InfoTooltip title="Integrated Enterprise: Use AG Charts Enterprise features within AG Grid Enterprise through integrated charts" />
                            </span>
                        </div>

                        <div>
                            <div className={styles.inputList}>
                                <label className={hasLicense && licensedProducts.grid ? styles.licensedProduct : ''}>
                                    <b>AG Grid Enterprise</b>
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
                                </label>

                                <label className={hasLicense && licensedProducts.charts ? styles.licensedProduct : ''}>
                                    <b>AG Charts Enterprise</b>
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
                                </label>

                                <label
                                    className={
                                        hasLicense && licensedProducts.grid && licensedProducts.charts
                                            ? styles.licensedProduct
                                            : ''
                                    }
                                >
                                    <b>Integrated Enterprise</b>

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

                    <div className={styles.frameworkImportContainer}>
                        <div className={styles.frameworkContainer}>
                            <label>Framework</label>
                            <img
                                className={styles.frameworkLogo}
                                src={urlWithBaseUrl(`/images/fw-logos/${framework}.svg`)}
                                alt={framework}
                            />
                            <b>{FRAMEWORK_DISPLAY_TEXT[framework]}</b>
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
                        <a
                            className={classnames(styles.importsLink, 'text-sm')}
                            href={urlWithPrefix({
                                framework,
                                url: './modules/#packages-vs-modules',
                            })}
                        >
                            Learn more about import types
                        </a>
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
                            {!noUserProducts && <p>An example of how to set up your AG Grid Enterprise license:</p>}
                            {bootstrapSnippet.grid && (
                                <Snippet framework={framework} content={bootstrapSnippet.grid} copyToClipboard />
                            )}
                        </>
                    )}

                    {userProducts.chartsEnterprise && (
                        <>
                            <p>An example of how to set up your Charts Enterprise license:</p>
                            {bootstrapSnippet.charts && (
                                <Snippet framework={framework} content={bootstrapSnippet.charts} copyToClipboard />
                            )}
                        </>
                    )}

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
                    ) : undefined}
                </div>
            </form>
        </>
    );
};
