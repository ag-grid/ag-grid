import type { Framework, ImportType } from '@ag-grid-types';
import Warning from '@ag-website-shared/components/alert/Warning';
import { Snippet } from '@components/snippet/Snippet';
import { InfoTooltip } from '@components/theme-builder/components/general/Tooltip';
import { CHARTS_SITE_URL, FRAMEWORK_DISPLAY_TEXT } from '@constants';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { type FunctionComponent } from 'react';

import { getBootstrapSnippet, getDependenciesSnippet } from '../utils/getSnippets';
import { hasValue } from '../utils/hasValue';
import { useLicenseData } from '../utils/useLicenseData';
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
        userLicensedProducts,
        setUserLicensedProducts,
        useStandaloneCharts,
        setUseStandaloneCharts,

        errors,
    } = useLicenseData();
    const dependenciesSnippet = getDependenciesSnippet({
        framework,
        licensedProducts: userLicensedProducts,
        importType,
        useStandaloneCharts,
    });
    const bootstrapSnippet = getBootstrapSnippet({
        framework,
        importType,
        license: license || 'your license key',
    });
    const selectedSeedRepos = seedRepos.filter((seedRepo) => {
        return seedRepo.framework === framework && seedRepo.importType === importType;
    });

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
                <div>
                    <div>Licensed products</div>
                    <div className={styles.licensedProductsContainer}>
                        <div className={styles.inputList}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="licensedProducts"
                                    value="grid"
                                    checked={userLicensedProducts.grid}
                                    onChange={() => {
                                        setUserLicensedProducts((prevLicensedProducts) => {
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
                                    checked={userLicensedProducts.charts}
                                    onChange={() => {
                                        setUserLicensedProducts((prevLicensedProducts) => {
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
                        {errors.chartsNoGridEnterprise && <Warning>{errors.chartsNoGridEnterprise}</Warning>}
                        {errors.chartsSupported && <Warning>{errors.chartsSupported}</Warning>}
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
                    <div>
                        Use AG Charts outside of AG Grid (<a href={CHARTS_SITE_URL}>Standalone Charts</a>){' '}
                        <InfoTooltip title="AG Charts will be included inside AG Grid Enterprise, but if you want to use AG Charts in your own application, you will need to import it separately" />
                    </div>
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
                {userLicensedProducts.grid && (
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
                {errors.noLicenseExample && <Warning>{errors.noLicenseExample}</Warning>}
            </div>
        </form>
    );
};
