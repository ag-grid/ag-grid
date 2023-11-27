type FormattingFn = (dateTime: Date, paddingChar?: string) => string;
export declare function buildFormatter(formatString: string): FormattingFn;
export {};
