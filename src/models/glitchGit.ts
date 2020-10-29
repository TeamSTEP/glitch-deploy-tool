import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import * as Helpers from '../helpers';

const REPO_FOLDER = '.__source-repo';

const ROOT_DIR = process.cwd();

export default class GlitchRepo {
    private _gitUrl: string;
    private _gitInst: SimpleGit;

    private _glitchRepoDir: string | undefined;

    private _logMsg: boolean;

    constructor(gitUrl: string, logMessage = false) {
        if (!gitUrl.startsWith('https://')) {
            // add the https prefix if the user did not provide one
            this._gitUrl = 'https://' + gitUrl;
        } else {
            this._gitUrl = gitUrl;
        }
        const gitOptions: SimpleGitOptions = {
            baseDir: ROOT_DIR,
            binary: 'git',
            maxConcurrentProcesses: 2,
        };

        this._logMsg = logMessage;
        // setup a git client
        this._gitInst = simpleGit(gitOptions);
    }

    public async publishFilesToGlitch(targetFolder?: string) {
        let folderToCopy = '';

        // if no folder name or path is given, import everything in the current directory
        if (!targetFolder || targetFolder === '*') {
            folderToCopy = ROOT_DIR;
        } else {
            // if the folder name was given, check if it's in absolute path or not
            folderToCopy = targetFolder.startsWith('/') ? targetFolder : path.join(ROOT_DIR, targetFolder);
            if (!fs.existsSync(folderToCopy)) {
                throw new Error(`target folder ${folderToCopy} does not exists`);
            }
        }

        await this._cloneRepo();

        if (!this._glitchRepoDir) {
            throw new Error('Glitch project is not cloned to the local machine yet');
        }

        this._replaceRepoContentWith(folderToCopy);

        await this._pushChangesToRemote();

        this._writeLog('cleaning up...');
        this._cleanGitInstance();
        // remove the local repo
        rimraf.sync(this._glitchRepoDir);

        this._writeLog('done');
    }

    private _cleanGitInstance() {
        this._gitInst = this._gitInst.clearQueue();
    }

    private async _cloneRepo() {
        // get the absolute directory of the repo folder
        const repoDir = path.join(ROOT_DIR, REPO_FOLDER);

        if (fs.existsSync(repoDir)) {
            this._writeLog('found an existing repository, removing it before cloning a new one');
            // remove the repo folder if it already exists
            rimraf.sync(repoDir);
        }

        this._writeLog('cloning repository...');
        // clone the glitch project repo to a folder
        await this._gitInst.clone(this._gitUrl, REPO_FOLDER);

        // set the location
        this._glitchRepoDir = repoDir;
        this._writeLog('setting git directory');
        // change the git directory to where we cloned the repo
        this._gitInst.cwd(repoDir);
    }

    private _replaceRepoContentWith(sourceFolder: string) {
        if (!this._glitchRepoDir) {
            throw new Error('Glitch project is not cloned to the local machine yet');
        }

        this._writeLog('removing everything inside the Glitch repository');

        // remove everything excluding the git metadata
        Helpers.emptyFolderContent(this._glitchRepoDir, ['.git']);

        // if the source folder is an absolute directory, don't append the path
        const folderToCopy = sourceFolder.startsWith('/') ? sourceFolder : path.join(ROOT_DIR, sourceFolder);

        this._writeLog(`cloning everything inside ${folderToCopy} to Glitch`);
        // move the new contents to Glitch
        Helpers.copyFolderContent(folderToCopy, this._glitchRepoDir, ['.git']);
    }

    private async _pushChangesToRemote() {
        this._writeLog('committing all changes to Glitch...');
        // add everything in the working directory
        await this._gitInst.add('*');

        // commit all changes to git
        await this._gitInst.commit('[Auto commit] ' + Date.now());

        this._writeLog('pushing folder to Glitch...');

        // pull before pushing
        await this._gitInst.pull('origin', 'master');
        // push all commits to remote origin
        await this._gitInst.push('origin', 'master');
    }

    /**
     * A console log wrapper for logging debug messages
     * @param message message to write
     */
    private _writeLog<T>(message?: T) {
        if (this._logMsg) console.log(message);
    }
}
