import { LicenseManager } from '@ag-grid-enterprise/core';
import type { Framework, ImportType } from '@ag-grid-types';
import Warning from '@ag-website-shared/components/alert/Warning';
import { Snippet } from '@components/snippet/Snippet';
import { FRAMEWORK_DISPLAY_TEXT } from '@constants';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { type FunctionComponent, useEffect } from 'react';

import { getBootstrapSnippet, getDependenciesSnippet } from '../utils/getSnippets';
import { hasValue } from '../utils/hasValue';
import { useFormData } from '../utils/useFormData';
import styles from './LicenseSetup.module.scss';

interface SeedRepo {
    name: string;
    framework: Framework;
    importType: ImportType;
    url: string;
}

interface Props {
    framework: Framework;
    seedRepos: SeedRepo[];
}

export const LicenseSetup: FunctionComponent<Props> = ({ framework, seedRepos }) => {
    const {
        hasLicense,
        setHasLicense,
        license,
        setLicense,
        importType,
        setImportType,
        licensedProducts,
        setLicensedProducts,
        useStandaloneCharts,
        setUseStandaloneCharts,
    } = useFormData();
    const dependenciesSnippet = getDependenciesSnippet({
        framework,
        licensedProducts,
        importType,
        useStandaloneCharts,
    });
    const bootstrapSnippet = getBootstrapSnippet({
        framework,
        importType,
        license: license || 'your license key',
    });
    const licenseDetails = LicenseManager.getLicenseDetails(license);
    const {
        valid,
        suppliedLicenseType,
        version: licenseVersion,
        isTrial,
        expiry,
        incorrectLicenseType,
    } = licenseDetails;

    const licenseIsValid = valid || (suppliedLicenseType === 'CHARTS' && incorrectLicenseType);
    const licenseHasError = hasValue(hasLicense) && hasValue(license) && !licenseIsValid;
    const selectedSeedRepos = seedRepos.filter((seedRepo) => {
        return seedRepo.framework === framework && seedRepo.importType === importType;
    });

    useEffect(() => {
        const licensedForGrid =
            suppliedLicenseType === undefined ? true : suppliedLicenseType === 'GRID' || suppliedLicenseType === 'BOTH';
        const licensedForCharts = suppliedLicenseType === 'CHARTS' || suppliedLicenseType === 'BOTH';

        setLicensedProducts({
            grid: licensedForGrid,
            charts: licensedForCharts,
        });
    }, [suppliedLicenseType]);

    return (
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
                    I already have a license
                </label>

                <label>
                    <input
                        type="radio"
                        name="hasLicense"
                        value="false"
                        defaultChecked={hasValue(hasLicense) && !hasLicense}
                        onChange={() => setHasLicense(false)}
                    />{' '}
                    I do not have a license
                </label>
            </div>
            {hasLicense && (
                <textarea
                    className={classnames(styles.license, {
                        [styles.error]: licenseHasError,
                    })}
                    placeholder="Paste your license here..."
                    value={license}
                    onChange={(e) => {
                        setLicense(e.target.value);
                    }}
                ></textarea>
            )}
            {licenseHasError && <p className={styles.invalidLicense}>License is invalid</p>}
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
                    <>
                        <div>
                            <label>License version</label>
                            <div>{licenseVersion ? `v${licenseVersion}` : '-'}</div>
                        </div>
                        <div>
                            <label>Trial?</label>
                            <div>{isTrial ? 'yes' : 'no'}</div>
                        </div>
                        <div>
                            <label>Expiry</label>
                            <div>{expiry ? expiry : '-'}</div>
                        </div>
                    </>
                )}
                <div>
                    <div>Licensed products</div>
                    <div className={styles.licensedProductsContainer}>
                        <div className={styles.inputList}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="licensedProducts"
                                    value="grid"
                                    checked={licensedProducts.grid}
                                    onChange={() => {
                                        setLicensedProducts((prevLicensedProducts) => {
                                            return {
                                                ...prevLicensedProducts,
                                                grid: !prevLicensedProducts.grid,
                                            };
                                        });
                                    }}
                                />
                                Grid Enterprise
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="licensedProducts"
                                    value="charts"
                                    checked={licensedProducts.charts}
                                    onChange={() => {
                                        setLicensedProducts((prevLicensedProducts) => {
                                            return {
                                                ...prevLicensedProducts,
                                                charts: !prevLicensedProducts.charts,
                                            };
                                        });
                                    }}
                                />
                                Charts Enterprise
                            </label>
                        </div>
                        {!licensedProducts.grid && licensedProducts.charts && (
                            <Warning>
                                You must have a "Grid Enterprise" license to use "Charts Enterprise" within AG Grid
                            </Warning>
                        )}
                    </div>
                </div>
                <div>
                    <label>Import type</label>
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

                <div>
                    <div>Using standalone charts?</div>
                    <div className={styles.inputList}>
                        <label>
                            <input
                                type="radio"
                                name="useStandaloneCharts"
                                value="true"
                                defaultChecked={useStandaloneCharts !== undefined && useStandaloneCharts}
                                onChange={() => setUseStandaloneCharts(true)}
                            />{' '}
                            yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="useStandaloneCharts"
                                value="false"
                                defaultChecked={useStandaloneCharts !== undefined && !useStandaloneCharts}
                                onChange={() => setUseStandaloneCharts(false)}
                            />{' '}
                            no
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles.results}>
                <h3>Dependencies</h3>
                <p>
                    Copy the following dependencies into your <code>package.json</code>:
                </p>
                {dependenciesSnippet && <Snippet framework={framework} content={dependenciesSnippet} />}

                <h3>Set Up License Example</h3>
                {licensedProducts.grid && (
                    <>
                        <p>An example of how to set up your license:</p>
                        {bootstrapSnippet && <Snippet framework={framework} content={bootstrapSnippet} />}

                        {selectedSeedRepos.length ? (
                            <>
                                <p>Here are some seed code repositories to get you started:</p>
                                <ul>
                                    {selectedSeedRepos.map(({ name, url, importType }) => {
                                        return (
                                            <li key={url}>
                                                <a href={url}>{name}</a> ({importType})
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        ) : undefined}
                    </>
                )}
                {!licensedProducts.grid && (
                    <Warning>A license is only required if you use the "Grid Enterprise" product</Warning>
                )}
            </div>
        </form>
    );
};
