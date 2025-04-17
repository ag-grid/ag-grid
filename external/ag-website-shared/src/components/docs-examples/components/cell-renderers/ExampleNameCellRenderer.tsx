import type { Framework, InternalFramework } from '@ag-grid-types';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { FRAMEWORKS } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { useEffect, useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from '../DocsExamples.module.scss';

type Props = CustomCellRendererProps & {
    columnsVisible: Record<InternalFramework, boolean>;
};

function FrameworkLink({ framework, link }: { framework: Framework; link: string }) {
    return (
        <a href={link} target="_blank">
            <img src={fwLogos[framework]} alt={framework} className={styles.frameworkLogo} />
        </a>
    );
}

export function ExampleNameCellRenderer({ value, data, node, columnsVisible }: Props) {
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
            <span>{value}</span>
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
