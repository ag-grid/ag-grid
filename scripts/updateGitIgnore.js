// Note: Assumes working directory is the root of the mono-repo
const fs = require('fs');

const GIT_IGNORE = '.gitignore';

function updateGitIgnore() {
    const contents = fs.readFileSync(GIT_IGNORE, 'utf8');
    const index = contents.indexOf("# latest only")
    const newGitIgnoreContents = contents.substring(0, index);

    fs.writeFileSync(GIT_IGNORE,
        newGitIgnoreContents,
        "utf8");
}

updateGitIgnore();