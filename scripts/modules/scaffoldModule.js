const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');

const getRequiredInputs = async () => {
    const answers = await inquirer
        .prompt([
            {
                name: 'enterpriseOrCommunity',
                message: 'Will this be an [E]nterprise or [C]ommunity package [E|e/C|c]?',
            },
            {
                name: 'packageName',
                message: 'What is the module name (will become @ag-grid-community/[packageName] / @ag-grid-enterprise/[packageName]) ?',
            },
        ]);

    let enterprise = false;
    switch (answers.enterpriseOrCommunity.toLowerCase()) {
        case 'e':
            enterprise = true;
            break;
        case 'c':
            break;
        default:
            console.error(`!! Unknown value for package type: "${answers.enterpriseOrCommunity}". Please specify either "E" or "C"`);
            process.exit(1);
    }

    return {enterprise, packageName: answers.packageName};
};

const main = async () => {
    const answers = await getRequiredInputs();

    const moduleName = `${answers.enterprise ? '@ag-grid-enterprise' : '@ag-grid-community'}/${answers.packageName}`;
    const moduleDirName = `${answers.enterprise ? 'grid-enterprise-modules' : 'grid-community-modules'}/${answers.packageName}`;
    if(fs.existsSync(`./${moduleDirName}`)) {
        console.error(`!! ${moduleDirName} already exists - exiting.`);
        process.exit(1);
    }
    
    const packageVersionNumber = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'UTF-8')).version;
    const templatePackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.resolve(__dirname, './template.json')), 'UTF-8'));

    templatePackageJson.name = moduleName;
    templatePackageJson.version = packageVersionNumber;
    templatePackageJson.license = answers.enterprise ? 'Commercial' : 'MIT';
    templatePackageJson.dependencies['@ag-grid-community/core'] = `~${packageVersionNumber}`;
    if(answers.enterprise) {
        templatePackageJson.dependencies['@ag-grid-enterprise/core'] = `~${packageVersionNumber}`;
    }

    fs.mkdirSync(`./${moduleDirName}`);
    fs.mkdirSync(`./${moduleDirName}/src`);

    fsExtra.copySync(path.resolve(__dirname, './.npmignore'), `./${moduleDirName}/.npmignore`);
    fsExtra.copySync(path.resolve(__dirname, './jest.config.js'), `./${moduleDirName}/jest.config.js`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.es6.json'), `./${moduleDirName}/tsconfig.es6.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.es5.json'), `./${moduleDirName}/tsconfig.json`);
    fsExtra.copySync(path.resolve(__dirname, './main.ts'), `./${moduleDirName}/src/main.ts`);

    fs.writeFileSync(`./${moduleDirName}/package.json`, JSON.stringify(templatePackageJson, null, 4), 'UTF-8');
};

main();
