function getProjectName(project) {
    return project.projectName === 'package.json' ? project.displayTargetFile : project.projectName;
}

export function convertToCtrf(results) {
    const passedProjects = results
        .filter((project) => project.ok && !project.filtered)
        .map((project) => {
            return {
                name: getProjectName(project),
                duration: 0, // Unknown
                status: 'passed',
                message: project.summary,
                extra: {
                    projectPackage: project.displayTargetFile,
                    dependencyCount: project.dependencyCount,
                },
            };
        });
    const failedProjects = results.filter((project) => !project.ok);

    const createVulnOutput = ({ vuln, project, status, extra = {} }) => {
        const projectName = getProjectName(project);
        // Remove first 'from' as that is the project itself
        const from = vuln.from?.slice(1).join(' > ') || '';
        const message = `${vuln.id} - ${vuln.title} affecting \`${vuln.name}\` package. From \`${projectName}\`: \`${from}\`\n\nSee https://security.snyk.io/vuln/${vuln.id}`;
        return {
            name: `${projectName}: ${vuln.name} (${vuln.id})`,
            duration: 0, // Unknown
            status,
            message,
            suite: projectName,
            extra: {
                projectPackage: project.displayTargetFile,
                snykLink: `https://security.snyk.io/vuln/${vuln.id}`,
                severity: vuln.severity,
                package: vuln.packageName,
                version: vuln.version || '',
                cve: vuln.identifiers?.CVE?.join(', ') || '',
                fixedIn: vuln.fixedIn,
                from,
                ...extra,
            },
        };
    };

    const skippedVulns = results
        .flatMap((project) => {
            return (
                project.filtered?.ignore?.map((ignore) => {
                    return {
                        ignore,
                        project,
                    };
                }) || []
            );
        })
        .map(({ ignore, project }) => {
            const snykIgnored = ignore.filtered.ignored.map((snykIgnore) => {
                return {
                    ...snykIgnore,
                    path: snykIgnore.path.join(' > '),
                };
            });

            return createVulnOutput({ vuln: ignore, project, status: 'skipped', extra: { snykIgnored } });
        });

    const failedVulns = failedProjects
        .flatMap(
            (project) =>
                project.vulnerabilities.map((vuln) => {
                    return {
                        vuln,
                        project,
                    };
                }) || []
        )
        .map(({ vuln, project }) => createVulnOutput({ vuln, project, status: 'failed' }));

    const tests = failedVulns.concat(skippedVulns).concat(passedProjects);
    const totalTests = passedProjects.length + failedVulns.length + skippedVulns.length;
    const summary = {
        passed: passedProjects.length,
        failed: failedVulns.length,
        skipped: skippedVulns.length,
        other: 0,
        suites: results.length, // Suites are the projects that are scanned
        tests: totalTests, // There are actually more tests than this, but passed projects hide the number
        start: Date.now(), // TODO
        stop: Date.now(), // TODO
        extra: {
            dependencyCount: results.reduce((count, project) => count + (project.dependencyCount || 0), 0),
            numProjects: results.length,
        },
    };
    return {
        reportFormat: 'ctrf',
        specVersion: '0.0.0',
        results: {
            tool: {
                name: 'Snyk',
            },
            summary,
            tests,
        },
    };
}
