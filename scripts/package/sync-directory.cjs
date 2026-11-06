const fs = require('node:fs');
const path = require('node:path');

/** Writes only files whose content differs; `deleteStale` removes what the source lacks, but `keepTopLevelFolders`. */
function syncDirectory(sourceDir, targetDir, { deleteStale, keepTopLevelFolders }) {
    if (!fs.statSync(targetDir, { throwIfNoEntry: false })?.isDirectory()) {
        fs.rmSync(targetDir, { force: true });
        fs.mkdirSync(targetDir, { recursive: true });
    }
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const source = path.join(sourceDir, entry.name);
        const target = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            syncDirectory(source, target, { deleteStale, keepTopLevelFolders: false });
        } else if (!hasSameContent(source, target)) {
            fs.rmSync(target, { recursive: true, force: true });
            fs.copyFileSync(source, target);
        }
    }
    if (!deleteStale) {
        return;
    }
    for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
        // Asks the file system, not the listing: on a case-insensitive one `Foo` is the source's `foo`.
        if ((keepTopLevelFolders && entry.isDirectory()) || fs.existsSync(path.join(sourceDir, entry.name))) {
            continue;
        }
        fs.rmSync(path.join(targetDir, entry.name), { recursive: true, force: true });
    }
}

function hasSameContent(source, target) {
    const targetStat = fs.statSync(target, { throwIfNoEntry: false });
    return (
        targetStat?.isFile() === true &&
        targetStat.size === fs.statSync(source).size &&
        fs.readFileSync(source).equals(fs.readFileSync(target))
    );
}

module.exports = { syncDirectory };
