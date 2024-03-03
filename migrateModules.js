const fs = require('fs-extra');

const frameworks = ['react', 'vue', 'vue3', 'angular'];

fs.readdirSync("./grid-community-modules/").forEach(file => {
    if (file !== 'all-modules') {
        fs.copySync(`./grid-community-modules/${file}`, `./community-modules/${file}`, {overwrite: true});

        if(!frameworks.some(framework => file.includes(framework))) {
            const moduleName = require(`./grid-community-modules/${file}/package.json`).name;
            const packageContents = JSON.parse(fs.readFileSync(`./community-modules/core/package.json`, 'utf-8'));
            packageContents.name = moduleName;
            fs.writeFileSync(`./community-modules/${file}/package.json`, JSON.stringify(packageContents, null, 2), 'utf-8');

            fs.cpSync(`./community-modules/core/tsconfig.json`, `./community-modules/${file}/tsconfig.json`);
            fs.cpSync(`./community-modules/core/tsconfig.lib.json`, `./community-modules/${file}/tsconfig.lib.json`);
            fs.cpSync(`./community-modules/core/tsconfig.spec.json`, `./community-modules/${file}/tsconfig.spec.json`);
            fs.cpSync(`./community-modules/core/tsconfig.types.json`, `./community-modules/${file}/tsconfig.types.json`);
            fs.cpSync(`./community-modules/core/tsconfig.types.watch.json`, `./community-modules/${file}/tsconfig.types.watch.json`);
            fs.cpSync(`./community-modules/core/tsconfig.watch.json`, `./community-modules/${file}/tsconfig.watch.json`);

            let projectContents = fs.readFileSync(`./community-modules/core/project.json`, 'utf-8');
            projectContents = projectContents.replaceAll('community-modules/core', `community-modules/${file}`);
            projectContents = JSON.parse(projectContents);
            projectContents.name = moduleName;

            fs.writeFileSync(`./community-modules/${file}/project.json`, JSON.stringify(projectContents, null, 2), 'utf-8');
        }
    }
})

fs.readdirSync("./grid-enterprise-modules/").forEach(file => {
    if (file !== 'all-modules') {
        fs.copySync(`./grid-enterprise-modules/${file}`, `./enterprise-modules/${file}`, {overwrite: true});

        if(!frameworks.some(framework => file.includes(framework))) {
            const moduleName = require(`./grid-enterprise-modules/${file}/package.json`).name;
            const packageContents = JSON.parse(fs.readFileSync(`./enterprise-modules/core/package.json`, 'utf-8'));
            packageContents.name = moduleName;
            fs.writeFileSync(`./enterprise-modules/${file}/package.json`, JSON.stringify(packageContents, null, 2), 'utf-8');

            fs.cpSync(`./enterprise-modules/core/tsconfig.json`, `./enterprise-modules/${file}/tsconfig.json`);
            fs.cpSync(`./enterprise-modules/core/tsconfig.lib.json`, `./enterprise-modules/${file}/tsconfig.lib.json`);
            fs.cpSync(`./enterprise-modules/core/tsconfig.spec.json`, `./enterprise-modules/${file}/tsconfig.spec.json`);
            fs.cpSync(`./enterprise-modules/core/tsconfig.types.json`, `./enterprise-modules/${file}/tsconfig.types.json`);
            fs.cpSync(`./enterprise-modules/core/tsconfig.types.watch.json`, `./enterprise-modules/${file}/tsconfig.types.watch.json`);
            fs.cpSync(`./enterprise-modules/core/tsconfig.watch.json`, `./enterprise-modules/${file}/tsconfig.watch.json`);

            let projectContents = fs.readFileSync(`./enterprise-modules/core/project.json`, 'utf-8');
            projectContents = projectContents.replaceAll('enterprise-modules/core', `enterprise-modules/${file}`);
            projectContents = JSON.parse(projectContents);
            projectContents.name = moduleName;

            fs.writeFileSync(`./enterprise-modules/${file}/project.json`, JSON.stringify(projectContents, null, 2), 'utf-8');
        }
    }
})
