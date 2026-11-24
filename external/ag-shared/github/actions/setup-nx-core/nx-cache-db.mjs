// Moves Nx cache entries between CI runners. Nx names its cache DB after the machine ID, so
// entries only count once their rows are in this machine's DB. Run from the workspace root:
//   snapshot <state>          before anything runs nx: record the restored DBs
//   adopt <state>             after install: import restored rows into this machine's DB
//   export <state> <out>      write the entries this job created as a part at <out>; leaves out
//                             tasks named in NX_CACHE_EXCLUDE (`project:target`, comma or newline separated)
//   merge <state> <src>...    import parts, or other restored .nx directories, into the cache; sets
//                             the step output `imported` to how many entries Nx can now hit that it couldn't
//   trim <state> <max-mb>     delete the oldest entries until the cache fits in <max-mb>
// <out> and each <src> share the layout of `.nx`: `cache/` and `workspace-data/*.db`.
// Never fails the job: problems become warning annotations and the job keeps the cache it has.
import { execFileSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const DB_FILE = /-v\d+\.db$/;
// `cache_outputs` rows reference `task_details`, so order matters.
const TABLES = ['task_details', 'cache_outputs'];
const PART_DB = 'part-v0.db';
// Nx task hashes are decimal, and both Nx and this script join them onto cache paths.
const VALID_HASH = /^\d+$/;
const VALID_HASH_SQL = "hash <> '' AND hash NOT GLOB '*[^0-9]*'";

const workspaceDataDir = resolve(
    process.env.NX_WORKSPACE_DATA_DIRECTORY ??
        process.env.NX_PROJECT_GRAPH_CACHE_DIRECTORY ??
        join('.nx', 'workspace-data')
);
const cacheDir = resolve(process.env.NX_CACHE_DIRECTORY ?? join('.nx', 'cache'));

let sqlite;
async function openDb(path) {
    sqlite ??= await import('node:sqlite');
    return new sqlite.DatabaseSync(path);
}

function warn(message) {
    console.log(`::warning title=Nx cache DB::${message}`);
}

/** Whether `cache` holds an entry for `hash`: a real directory, never a symlink out of the cache. */
function hasEntry(cache, hash) {
    const path = join(cache, hash);
    return existsSync(path) && lstatSync(path).isDirectory();
}

function listDbs(dir = workspaceDataDir) {
    return existsSync(dir) ? readdirSync(dir).filter((name) => DB_FILE.test(name)) : [];
}

function readState(stateFile) {
    return existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : undefined;
}

function writeState(stateFile, state) {
    writeFileSync(stateFile, JSON.stringify(state));
}

function sharedColumns(db, table, schema) {
    const columns = (s) =>
        db
            .prepare(`PRAGMA ${s}.table_info(${table})`)
            .all()
            .map(({ name }) => name);
    const other = new Set(columns(schema));
    return columns('main').filter((name) => other.has(name));
}

/** Copies cache rows from `sourcePath` into the DB at `targetPath`, optionally only `hashes`. */
async function copyRows(targetPath, sourcePath, hashes) {
    const db = await openDb(targetPath);
    try {
        db.exec(`ATTACH DATABASE '${sourcePath.replaceAll("'", "''")}' AS src`);
        let filter = '';
        if (hashes) {
            db.exec('CREATE TEMP TABLE wanted (hash TEXT PRIMARY KEY)');
            const insert = db.prepare('INSERT OR IGNORE INTO wanted VALUES (?)');
            for (const hash of hashes) {
                insert.run(hash);
            }
            filter = ' AND hash IN (SELECT hash FROM wanted)';
        }
        const counts = [];
        // One transaction, so a failure leaves the target DB as it was.
        db.exec('BEGIN');
        try {
            for (const table of TABLES) {
                const columns = sharedColumns(db, table, 'src').join(', ');
                const { changes } = db
                    .prepare(
                        `INSERT OR IGNORE INTO main.${table} (${columns}) SELECT ${columns} FROM src.${table} WHERE ${VALID_HASH_SQL}${filter}`
                    )
                    .run();
                counts.push(`${changes} ${table}`);
            }
            db.exec('COMMIT');
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
        db.exec('DETACH DATABASE src');
        return counts.join(', ');
    } finally {
        db.close();
    }
}

/** Throws unless the DB has both cache tables, before any of its entries are copied. */
async function assertCacheTables(dbPath) {
    const db = await openDb(dbPath);
    try {
        const found = db
            .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${TABLES.map(() => '?').join(', ')})`)
            .all(...TABLES);
        if (found.length !== TABLES.length) {
            throw new Error(`not an Nx cache DB (needs ${TABLES.join(' and ')})`);
        }
    } finally {
        db.close();
    }
}

async function cachedHashes(dbPath) {
    const db = await openDb(dbPath);
    try {
        return db
            .prepare('SELECT hash FROM cache_outputs')
            .all()
            .map(({ hash }) => hash)
            .filter((hash) => VALID_HASH.test(hash));
    } finally {
        db.close();
    }
}

function removeDb(name) {
    const base = join(workspaceDataDir, name);
    for (const path of [base, `${base}-wal`, `${base}-shm`, base.replace(DB_FILE, (m) => m.replace('.db', '.lock'))]) {
        rmSync(path, { force: true });
    }
}

/**
 * Copies, or with `move` moves, an entry's outputs and terminal output between cache directories,
 * never overwriting. A copy is staged beside its target and renamed into place, so a failed copy
 * leaves no partial entry; a move is one rename, falling back to a copy across filesystems.
 */
function copyEntry(fromCache, toCache, hash, { move = false } = {}) {
    for (const dir of [fromCache, toCache, join(fromCache, 'terminalOutputs'), join(toCache, 'terminalOutputs')]) {
        if (existsSync(dir) && !lstatSync(dir).isDirectory()) {
            throw new Error(`${dir} is not a directory.`);
        }
    }
    let copied = false;
    for (const rel of [hash, join('terminalOutputs', hash)]) {
        const from = join(fromCache, rel);
        const to = join(toCache, rel);
        const stat = existsSync(from) ? lstatSync(from) : undefined;
        const wanted = rel === hash ? stat?.isDirectory() : stat?.isFile();
        if (wanted && !existsSync(to)) {
            if (move && tryRename(from, to)) {
                copied = true;
                continue;
            }
            const staging = `${to}.partial`;
            rmSync(staging, { recursive: true, force: true });
            // Keep relative symlinks relative to the entry, not to where it was copied from.
            cpSync(from, staging, { recursive: true, verbatimSymlinks: true });
            renameSync(staging, to);
            copied = true;
        }
    }
    return copied;
}

function tryRename(from, to) {
    try {
        renameSync(from, to);
        return true;
    } catch (error) {
        if (error.code === 'EXDEV') {
            return false;
        }
        throw error;
    }
}

/** Runs `nx report`, the cheapest command that creates this machine's DB with its cache tables. */
function ensureCurrentDb() {
    const nx = resolve('node_modules', '.bin', 'nx');
    if (!existsSync(nx)) {
        throw new Error(`${nx} not found; cannot create this machine's Nx DB.`);
    }
    execFileSync(nx, ['report'], { stdio: 'ignore' });
}

function snapshot(stateFile) {
    const restoredDbs = listDbs().filter((name) => DB_FILE.test(name));
    writeState(stateFile, { restoredDbs });
    console.log(restoredDbs.length ? `Restored Nx cache DBs: ${restoredDbs.join(', ')}` : 'No restored Nx cache DB.');
}

async function adopt(stateFile) {
    const state = readState(stateFile);
    if (!state) {
        warn('No snapshot of the restored Nx cache DBs was taken; skipping.');
        return;
    }
    ensureCurrentDb();
    // The tidy step's `nx reset` may have deleted them.
    const restored = state.restoredDbs.filter((name) => existsSync(join(workspaceDataDir, name)));
    const created = listDbs().filter((name) => DB_FILE.test(name) && !restored.includes(name));
    if (created.length > 1) {
        warn(`Expected at most one new Nx DB, found ${created.join(', ')}; leaving the cache as is.`);
        return;
    }

    let currentDb;
    if (created.length === 1) {
        currentDb = created[0];
        if (restored.length === 0) {
            console.log('No restored Nx cache DB to adopt.');
        }
        for (const name of restored) {
            try {
                const counts = await copyRows(join(workspaceDataDir, currentDb), join(workspaceDataDir, name));
                console.log(`Imported ${counts} from ${name} into ${currentDb}.`);
            } catch (error) {
                warn(`Could not import ${name}: ${error.message}`);
            } finally {
                // Even on failure: a saved archive must hold one DB for the next runner to pick its own.
                removeDb(name);
            }
        }
    } else if (restored.length === 1) {
        currentDb = restored[0];
        console.log(`This runner has the same machine ID as the one that saved the cache (${currentDb}).`);
    } else {
        const found = restored.length ? restored.join(', ') : 'no DB';
        warn(`Cannot tell which Nx DB is this machine's (found ${found}); leaving the cache as is.`);
        return;
    }
    // An entry whose directory is missing is a miss to Nx; leaving it out lets the rebuilt one export.
    const baseline = await presentHashes(join(workspaceDataDir, currentDb));
    writeState(stateFile, { ...state, currentDb, baseline });
}

function currentDbPath(state) {
    if (!state?.currentDb) {
        throw new Error("This machine's Nx DB is unknown; run adopt first.");
    }
    return join(workspaceDataDir, state.currentDb);
}

async function excludedHashes(dbPath) {
    const tasks = (process.env.NX_CACHE_EXCLUDE ?? '')
        .split(/[\s,]+/)
        .filter(Boolean);
    if (tasks.length === 0) {
        return new Set();
    }
    const db = await openDb(dbPath);
    try {
        const rows = db
            .prepare(
                `SELECT hash FROM task_details WHERE project || ':' || target IN (${tasks.map(() => '?').join(', ')})`
            )
            .all(...tasks);
        return new Set(rows.map(({ hash }) => hash));
    } finally {
        db.close();
    }
}

async function exportPart(stateFile, outDir) {
    const state = readState(stateFile);
    const sourceDb = currentDbPath(state);
    const baseline = new Set(state.baseline);
    // A restored entry that is still missing its directory was not rebuilt here.
    const candidates = (await cachedHashes(sourceDb)).filter(
        (hash) => !baseline.has(hash) && hasEntry(cacheDir, hash)
    );
    const excluded = await excludedHashes(sourceDb);
    const created = candidates.filter((hash) => !excluded.has(hash));

    const overlaps = (a, b) => a === b || a.startsWith(b + sep) || b.startsWith(a + sep);
    if ([cacheDir, workspaceDataDir].some((dir) => overlaps(outDir, dir))) {
        throw new Error(`${outDir} overlaps the live Nx cache; export to a separate directory.`);
    }
    rmSync(outDir, { recursive: true, force: true });
    const left = candidates.length - created.length;
    const excludedNote = left ? `, leaving out ${left} excluded` : '';
    if (created.length === 0) {
        console.log(`No new Nx cache entries to export${excludedNote}.`);
        return;
    }
    const outData = join(outDir, 'workspace-data');
    mkdirSync(join(outDir, 'cache', 'terminalOutputs'), { recursive: true });
    mkdirSync(outData, { recursive: true });

    // Take the table definitions from the source so the part has the same schema.
    const source = await openDb(sourceDb);
    const schema = TABLES.map(
        (table) => source.prepare('SELECT sql FROM sqlite_master WHERE type = ? AND name = ?').get('table', table).sql
    );
    source.close();
    const partDb = join(outData, PART_DB);
    const part = await openDb(partDb);
    part.exec(schema.join(';\n'));
    part.close();

    await copyRows(partDb, sourceDb, created);
    for (const hash of created) {
        copyEntry(cacheDir, join(outDir, 'cache'), hash);
    }
    console.log(`Exported ${created.length} new Nx cache entries to ${outDir}${excludedNote}.`);
}

/** Hashes in `dbPath` whose entry directory exists: what Nx can hit. */
async function presentHashes(dbPath) {
    return (await cachedHashes(dbPath)).filter((hash) => hasEntry(cacheDir, hash));
}

async function merge(stateFile, sources) {
    const state = readState(stateFile);
    const targetDb = currentDbPath(state);
    const before = (await presentHashes(targetDb)).length;
    for (const source of sources) {
        const sourceData = join(source, 'workspace-data');
        const sourceCache = join(source, 'cache');
        let names;
        try {
            names = listDbs(sourceData);
        } catch (error) {
            warn(`Skipped ${source}: ${error.message}`);
            continue;
        }
        for (const name of names) {
            const sourceDb = join(sourceData, name);
            try {
                await assertCacheTables(sourceDb);
                // An entry without its directory is a miss to Nx, so it is not worth merging.
                const hashes = (await cachedHashes(sourceDb)).filter(
                    (hash) => hasEntry(sourceCache, hash) || hasEntry(cacheDir, hash)
                );
                let copied = 0;
                for (const hash of hashes) {
                    // Sources are throwaway (a set-aside restore or an unpacked part), so move, not copy.
                    copied += copyEntry(sourceCache, cacheDir, hash, { move: true }) ? 1 : 0;
                }
                // Rows go in only once their entry is in place.
                const complete = hashes.filter((hash) => hasEntry(cacheDir, hash));
                const counts = await copyRows(targetDb, sourceDb, complete);
                console.log(`Merged ${counts} and ${copied} entry directories from ${sourceDb}.`);
            } catch (error) {
                warn(`Skipped ${sourceDb}: ${error.message}`);
            }
        }
    }
    const present = await presentHashes(targetDb);
    // Merged entries were restored, not created here, so export must not count them as new.
    writeState(stateFile, { ...state, baseline: present });
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `imported=${present.length - before}\n`);
    }
}

/** Bytes in the files under `path`. */
function sizeOf(path) {
    const stat = lstatSync(path, { throwIfNoEntry: false });
    if (!stat?.isDirectory()) {
        return stat?.size ?? 0;
    }
    return readdirSync(path).reduce((total, name) => total + sizeOf(join(path, name)), 0);
}

async function trim(stateFile, maxMb) {
    const limit = Number(maxMb) * 1024 * 1024;
    if (!(limit > 0)) {
        throw new Error(`Invalid cache size limit "${maxMb}".`);
    }
    if (!existsSync(cacheDir)) {
        return;
    }
    const db = await openDb(currentDbPath(readState(stateFile)));
    try {
        // Cache hits in other jobs never reach this DB, so creation time is the best age we have.
        const hashes = db
            .prepare('SELECT hash FROM cache_outputs ORDER BY created_at, hash')
            .all()
            .map(({ hash }) => hash)
            .filter((hash) => VALID_HASH.test(hash));
        const known = new Set(hashes);
        const before = sizeOf(cacheDir);
        let total = before;
        const removeEntry = (hash) => {
            for (const path of [join(cacheDir, hash), join(cacheDir, 'terminalOutputs', hash)]) {
                total -= sizeOf(path);
                rmSync(path, { recursive: true, force: true });
            }
        };
        // Entries without a row are misses to Nx, so they go first.
        const orphans = readdirSync(cacheDir).filter((name) => VALID_HASH.test(name) && !known.has(name));
        orphans.forEach(removeEntry);
        const deleteRow = db.prepare('DELETE FROM cache_outputs WHERE hash = ?');
        let removed = 0;
        for (const hash of hashes) {
            if (total <= limit) {
                break;
            }
            // Row first: an interrupted trim leaves an orphan, which the next trim removes.
            deleteRow.run(hash);
            removeEntry(hash);
            ++removed;
        }
        const mb = (bytes) => Math.round(bytes / 1024 / 1024);
        console.log(
            `Nx cache was ${mb(before)} MB; removed ${removed} oldest entries and ${orphans.length} without a row, leaving ${mb(total)} MB (limit ${maxMb} MB).`
        );
    } finally {
        db.close();
    }
}

const [mode, stateFile, ...rest] = process.argv.slice(2);
try {
    if (!stateFile) {
        throw new Error('Missing <state> argument.');
    }
    if (mode === 'snapshot') {
        snapshot(stateFile);
    } else if (mode === 'adopt') {
        await adopt(stateFile);
    } else if (mode === 'export' && rest.length === 1) {
        await exportPart(stateFile, resolve(rest[0]));
    } else if (mode === 'merge' && rest.length > 0) {
        await merge(stateFile, rest.map((source) => resolve(source)));
    } else if (mode === 'trim' && rest.length === 1) {
        await trim(stateFile, rest[0]);
    } else {
        throw new Error(`Unknown or incomplete command "${mode}".`);
    }
} catch (error) {
    warn(error.message);
}
