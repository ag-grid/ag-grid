export class ModuleLogger {

    private static loggedModuleClassNames: string[] = [];

    public static logModuleClass(className: string): void {
        this.loggedModuleClassNames.push(className);
    }

    public static getLoggedModuleClassNames(): string {
        return this.loggedModuleClassNames.join(', ');
    }
}