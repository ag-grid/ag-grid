interface Props {
    src: string;
    alt: string;
    width?: string;
    height?: string;
    minWidth?: string;
    maxWidth?: string;
    margin?: string;
}

export const Image = ({ src, alt, width, height, maxWidth, minWidth, margin }: Props) => {
    const style: any = {};
    if (width !== undefined) {
        style.width = width;
    }
    if (minWidth !== undefined) {
        style.minWidth = minWidth;
    }
    if (maxWidth !== undefined) {
        style.maxWidth = maxWidth;
    }
    if (height !== undefined) {
        style.height = height;
    }
    if (margin !== undefined) {
        style.margin = margin;
    }

    return <img style={style} src={src} alt={alt} />;
};
