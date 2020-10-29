import simpleGit, { SimpleGitOptions } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import * as Helpers from '../src/helpers';

const pushToGlitch = async () => {
    const ROOT_DIR = __dirname;
    // the folder name where the repo will be cloned
    // the name itself will not matter too much we only need its contents
    const REPO_FOLDER = '.__source-repo';

    // the folder to where it will copy things
    const TARGET_FOLDER = 'target';

    const REPO_SOURCE = process.env.REPO_SOURCE;

    if (typeof REPO_SOURCE === 'undefined') {
        throw new Error('target repository has not been provided');
    }

    const glitchRepoDir = path.join(ROOT_DIR, REPO_FOLDER);
    const deployContentDir = TARGET_FOLDER ? path.join(ROOT_DIR, TARGET_FOLDER) : ROOT_DIR;

    const gitOptions: SimpleGitOptions = {
        baseDir: ROOT_DIR,
        binary: 'git',
        maxConcurrentProcesses: 2,
    };

    // setup a git client
    let git = simpleGit(gitOptions);

    if (!fs.existsSync(deployContentDir)) {
        throw new Error(`target folder ${deployContentDir} does not exists`);
    }
    if (fs.existsSync(glitchRepoDir)) {
        // remove the repo folder if it already exists
        console.log('found an existing folder, removing it before cloning...');
        rimraf.sync(glitchRepoDir);
    }

    console.log(`cloning repository...`);
    // clone the repo to the folder
    await git.clone(REPO_SOURCE, glitchRepoDir);
    await git.pull('origin');

    console.log(`changing working directory...`);
    // change the directory to access git
    await git.cwd(glitchRepoDir);

    console.log(`removing all contents in the glitch project...`);
    // remove everything excluding the git metadata
    Helpers.emptyFolderContent(glitchRepoDir, ['.git']);

    console.log(`copying new contents to the glitch project...`);
    // move the new contents
    Helpers.copyFolderContent(deployContentDir, glitchRepoDir, ['.git']);

    console.log('committing changes as [Auto commit] ' + Date.now());

    // add everything in the working directory
    await git.add('*');

    // commit and push
    const res = await git.commit('[Auto commit] ' + Date.now());
    console.log(res);

    //const pushRes = await git.push('origin', 'master');
    //console.log(pushRes);

    git = git.clearQueue();

    // remove the local repo
    rimraf.sync(glitchRepoDir);
    console.log('successfully deployed to Glitch!');
};

// script entry point
(async () => {
    await pushToGlitch();
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
