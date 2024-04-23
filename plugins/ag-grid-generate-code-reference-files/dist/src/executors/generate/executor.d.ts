type ExecutorOptions = {
    output: string;
};
export default function (options: ExecutorOptions): Promise<{
    success: boolean;
}>;
export {};
