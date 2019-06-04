export interface Module {
    moduleName: string;
    beans?: any[];
    enterpriseComponents?: any[];
    enterpriseBeans?: any[];
    enterpriseDefaultComponents?: { componentName: string, theClass: any }[];
}
