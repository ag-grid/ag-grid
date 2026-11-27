import styled from '@emotion/styled';
import { Info } from 'lucide-react';

import { CssValueEditor } from './CssValueEditor';
import type { ValueEditorProps } from './ValueEditorProps';

let imageValuesDocsUrl = '#';

/**
 * Hosts must call this once with a link to their own theming-parameters docs
 * page - mirrors ParamModel's setParamDocsProvider.
 */
export const setImageValuesDocsUrl = (url: string) => {
    imageValuesDocsUrl = url;
};

let cssTextImageParams = new Set<string>();

/**
 * Hosts name the image params that hold CSS images, such as a gradient or a `url()`, so they are edited as
 * CSS text. Other image params are typically embedded SVG icons, which can't be edited here.
 */
export const setCssTextImageParams = (params: Iterable<string>) => {
    cssTextImageParams = new Set(params);
};

export const ImageValueEditor = (props: ValueEditorProps<unknown>) => {
    if (cssTextImageParams.has(props.param.property)) {
        return <CssValueEditor {...props} />;
    }
    return (
        <NotSupported>
            <InfoIcon data-lucide="align-center" width={14} /> Image values can't be edited in the theme builder, export
            the theme and use <a href={imageValuesDocsUrl}>theme parameters</a> to embed an SVG image.
        </NotSupported>
    );
};

const InfoIcon = styled(Info)`
    margin-top: -4px;
`;

const NotSupported = styled('span')`
    font-style: italic;
    opacity: 0.7;
    padding-left: 8px;
    font-size: 0.8em;
`;
