import type { Framework } from '@ag-grid-types';
import { Alert } from '@ag-website-shared/components/alert/Alert';
import { urlWithPrefix } from '@utils/urlWithPrefix';

interface Props {
    moduleName: string;
    framework: Framework;
}

export const ModuleCallout = ({ moduleName, framework }: Props) => {
    return (
        <>
            <Alert type="info">
                <p>
                    If you are selecting modules, you will need to import <code>{moduleName}</code>.<span> </span>
                    <a
                        href={urlWithPrefix({
                            framework,
                            url: `./modules`,
                        })}
                        target={'_blank'}
                    >
                        More information on Modules
                    </a>
                    .
                </p>
            </Alert>
        </>
    );
};
