import type { InternalFramework } from '@ag-grid-types';
import type { FileContents } from '@components/example-generator/types';
import { DEBUG_SCRIPT_FILE_NAME, EXAMPLE_STYLE_FILE_NAME } from '@constants';
import { isReactInternalFramework } from '@utils/framework';
import { getParameters } from 'codesandbox-import-utils/lib/api/define';

type SandboxFiles = Parameters<typeof getParameters>[0]['files'];

const CREATE_CODE_SANDBOX_URL = 'https://codesandbox.io/api/v1/sandboxes/define';

const getCodeSandboxTemplate = (config: object) => {
    return { ...config, tags: ['ag-grid', 'ag-charts', 'example'], published: false };
};

const getPathForFile = ({
    fileName,
    internalFramework,
}: {
    fileName: string;
    internalFramework: InternalFramework;
}) => {
    if (!isReactInternalFramework(internalFramework)) {
        return fileName;
    }

    if (fileName === 'index.html') {
        return `public/index.html`;
    }

    if (fileName === DEBUG_SCRIPT_FILE_NAME) {
        return `public/${DEBUG_SCRIPT_FILE_NAME}`;
    } else if (fileName === EXAMPLE_STYLE_FILE_NAME) {
        return `public/${EXAMPLE_STYLE_FILE_NAME}`;
    }

    if (/(.js|.jsx|.tsx|.ts|.css)$/.test(fileName)) {
        if (fileName.endsWith('.js')) {
            return `public/${fileName}`;
        }

        if (fileName.startsWith('index.')) {
            return `src/${fileName === 'index.jsx' ? 'index.js' : fileName}`;
        }

        return `src/${fileName}`;
    }

    return fileName;
};

const getCodeSandboxRuntime = (internalFramework: InternalFramework) => {
    switch (internalFramework) {
        case 'reactFunctional':
            return 'create-react-app';
        case 'reactFunctionalTs':
            return 'create-react-app-typescript';
        default:
            return 'static';
    }
};

const getCodeSandboxFiles = ({
    files,
    boilerPlateFiles,
    internalFramework,
}: {
    files: FileContents;
    boilerPlateFiles?: FileContents;
    internalFramework: InternalFramework;
}) => {
    const sandboxFiles: SandboxFiles = {};
    const isUsingSandboxTemplate = getCodeSandboxRuntime(internalFramework) !== 'static';
    const allFiles = isUsingSandboxTemplate
        ? {
              ...files,
          }
        : { ...boilerPlateFiles, ...files };

    // Only the sandbox templates (React) take a `package.json`. `boilerPlateFiles` are read as a directory
    // sweep and are merged in on the `static` runtime only, so this guards against one arriving that way —
    // on a static example it would only confuse, since the AG Grid version comes from `index.html`.
    if (allFiles['package.json'] == undefined || !isUsingSandboxTemplate) {
        delete allFiles['package.json'];
    }

    for (const [name, content] of Object.entries(allFiles)) {
        const key = getPathForFile({ fileName: name, internalFramework });
        sandboxFiles[key] = {
            content: content as string,
            isBinary: false,
        };
    }

    return sandboxFiles;
};

const createHiddenInputFactory =
    (form: HTMLFormElement) =>
    ({ name, value }: { name: string; value: string }) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;

        form.appendChild(input);
    };

export const getCodeSandboxFilesToSubmit = ({
    title,
    files,
    boilerPlateFiles,
    internalFramework,
}: {
    title: string;
    files: FileContents;
    boilerPlateFiles?: FileContents;
    internalFramework: InternalFramework;
}) => {
    const runtime = getCodeSandboxRuntime(internalFramework);
    const configFiles: SandboxFiles = {
        '.codesandbox/template.json': {
            content: JSON.stringify(getCodeSandboxTemplate({ title, runtime }), null, 2),
            isBinary: false,
        },
    };
    const sandboxFiles: SandboxFiles = {
        ...configFiles,
        ...getCodeSandboxFiles({
            files,
            boilerPlateFiles,
            internalFramework,
        }),
    };

    return sandboxFiles;
};

/**
 * Open example in code sandbox
 *
 * NOTE: Creating a form and submitting parameters instead of using the JSON API so
 * that there is no pop up warning
 */
export const openCodeSandbox = ({
    title,
    files,
    boilerPlateFiles,
    internalFramework,
}: {
    title: string;
    files: FileContents;
    boilerPlateFiles?: FileContents;
    internalFramework: InternalFramework;
}) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.style.display = 'none';
    form.action = CREATE_CODE_SANDBOX_URL;
    form.target = '_blank';

    const addHiddenInput = createHiddenInputFactory(form);
    const parameters = getParameters({
        files: getCodeSandboxFilesToSubmit({
            title,
            files,
            boilerPlateFiles,
            internalFramework,
        }),
        template: getCodeSandboxRuntime(internalFramework),
    });

    addHiddenInput({ name: 'tags[0]', value: 'ag-grid' });
    addHiddenInput({ name: 'tags[1]', value: 'ag-charts' });
    addHiddenInput({ name: 'tags[2]', value: 'example' });
    addHiddenInput({ name: 'published', value: 'false' });
    addHiddenInput({ name: 'title', value: title });
    addHiddenInput({ name: 'parameters', value: parameters });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
