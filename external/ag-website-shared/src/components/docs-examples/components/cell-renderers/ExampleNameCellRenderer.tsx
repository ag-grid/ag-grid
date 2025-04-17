import type { Framework, InternalFramework } from '@ag-grid-types';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { FRAMEWORKS } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { useEffect, useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import type { ExampleProperty } from '../DocsExamples';
import styles from '../DocsExamples.module.scss';

type Props = CustomCellRendererProps & {
    columnsVisible: Record<InternalFramework, boolean>;
    properties: ExampleProperty[];
};

function FrameworkLink({ framework, link }: { framework: Framework; link: string }) {
    return (
        <a href={link} target="_blank">
            <img src={fwLogos[framework]} alt={framework} className={styles.frameworkLogo} />
        </a>
    );
}

function DisplayValue({ value, node, properties }: { value: string; node: any; properties: ExampleProperty[] }) {
    const nodeIsProperty = node.group && properties.includes(node.field);
    if (nodeIsProperty) {
        return (
            <>
                <span className={styles.propertyName}>
                    {node.rowGroupColumn.userProvidedColDef.headerName ?? node.field}
                </span>{' '}
                = <code>{value.toString()}</code>
            </>
        );
    }

    return value;
}

export function ExampleNameCellRenderer({ value, data, node, columnsVisible, properties }: Props) {
    const isPage = node.group;
    const pageName = isPage ? value : data.pageName;
    const exampleName = data?.exampleName;

    const [frameworkVisible, setFrameworkVisible] = useState<Record<Framework, boolean>>({
        react: false,
        angular: false,
        vue: false,
        javascript: false,
    });

    useEffect(() => {
        const newFrameworkVisible: Record<Framework, boolean> = {
            react: columnsVisible.reactFunctional || columnsVisible.reactFunctionalTs,
            angular: columnsVisible.angular,
            vue: columnsVisible.vue3,
            javascript: columnsVisible.vanilla || columnsVisible.typescript,
        };
        setFrameworkVisible(newFrameworkVisible);
    }, [columnsVisible]);

    return (
        <div className={styles.exampleNameContainer}>
            <span>
                <DisplayValue value={value} node={node} properties={properties} />
            </span>
            {isPage && (
                <span className={styles.frameworkLinks}>
                    {FRAMEWORKS.map((framework: Framework) => {
                        const url = isPage ? `./${pageName}` : `./${pageName}#example-${exampleName}`;
                        const link = urlWithPrefix({
                            framework,
                            url,
                        });
                        return (
                            frameworkVisible[framework] && (
                                <FrameworkLink key={framework} framework={framework} link={link} />
                            )
                        );
                    })}
                </span>
            )}
        </div>
    );
}
