import { pathJoin } from '@utils/pathJoin';

interface Props {
    baseUrl: string;
    files: string[];
    nonce?: string;
}

export const Scripts = ({ baseUrl, files = [], nonce }: Props) => {
    return files.map((file) => {
        const srcFile = pathJoin(baseUrl, file);
        return <script key={file} nonce={nonce} src={srcFile} />;
    });
};
