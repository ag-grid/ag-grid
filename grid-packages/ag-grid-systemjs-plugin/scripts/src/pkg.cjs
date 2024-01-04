const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const [inputPath, outputPath] = process.argv.slice(2);

class ExitError extends Error {
  code;
  constructor(code, message) {
    super(`Error: ${message}`);
    this.name = ExitError.name;
    this.code = code;
  }
}

try {
  if (!inputPath) throw new ExitError(1, 'Missing package.json input path');
  const inputPkgPath = path.basename(inputPath) === 'package.json' ? inputPath : path.join(inputPath, 'package.json');
  const pkgSource = (() => {
    try {
      return fs.readFileSync(inputPkgPath, 'utf-8');
    } catch (error) {
      throw new ExitError(1, `Failed to read package.json: ${inputPkgPath} (${error.code})\n`);
    }
  })();
  const pkg = (() => {
    try {
      return JSON.parse(pkgSource);
    } catch {
      throw new ExitError(1, `Invalid package.json contents: ${inputPkgPath}\n`);
    }
  })();
  const {
    name,
    version,
    license,
    description,
    author,
    keywords,
    repository,
    homepage,
    bugs,
    dependencies,
    bundleDependencies,
    optionalDependencies,
    pkg: overrides,
  } = pkg;
  const updatedPkg = {
    name,
    version,
    license,
    description,
    author,
    keywords,
    repository,
    homepage,
    bugs,
    dependencies,
    bundleDependencies,
    optionalDependencies,
    ...overrides,
  };
  const json = `${JSON.stringify(updatedPkg, null, 2)}\n`;
  if (outputPath) {
    try {
      fs.writeFileSync(outputPath, json);
      exit(0);
    } catch (error) {
      throw new ExitError(1, `Failed to write output package.json: ${outputPath} (${error.code})`);
    }
  } else {
    process.stdout.write(json, (error) => {
      if (error) {
        exit(1, `Failed to write output JSON: (${error.code})`);
      } else {
        exit(0);
      }
    });
  }
} catch (error) {
  if (error instanceof ExitError) {
    exit(error.code, error.message);
  } else {
    throw error;
  }
}

function exit(code, message) {
  if (typeof message === 'string') process.stderr.write(`${message}\n`);
  process.exit(code);
}
