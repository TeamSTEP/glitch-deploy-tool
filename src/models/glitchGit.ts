import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import * as Helpers from '../helpers';
import _ from 'lodash';

export interface CommitAuthor {
    name: string;
    email: string;
}

const REPO_FOLDER = '.__source-repo';

const DEFAULT_AUTHOR: CommitAuthor = {
    name: 'Glitch Deploy Tool',
    email: 'glitch@users.noreply.deploy.com',
};
export default class GlitchRepo {
    private _remoteOrigin: string;

    private _gitInst: SimpleGit;

    private _glitchRepoDir: string | undefined;

    private _logMsg: boolean;

    private _authorInfo: CommitAuthor;

    constructor(remoteOrigin: string, logMessage = false, commitAs?: CommitAuthor) {
        if (!remoteOrigin.startsWith('https://')) {
            // add the https prefix if the user did not provide one
            this._remoteOrigin = 'https://' + remoteOrigin;
        } else {
            this._remoteOrigin = remoteOrigin;
        }
        const gitOptions: SimpleGitOptions = {
            baseDir: this.rootDir,
            binary: 'git',
            maxConcurrentProcesses: 2,
        };

        this._logMsg = logMessage;
        // setup a git client
        this._gitInst = simpleGit(gitOptions);

        this._authorInfo = commitAs || DEFAULT_AUTHOR;
    }

    public get rootDir() {
        return process.cwd();
    }

    public get git() {
        return this._gitInst;
    }

    public async publishFilesToGlitch(targetFolder?: string) {
        try {
            let folderToCopy = '';

            // if no folder name or path is given, import everything in the current directory
            if (!targetFolder || targetFolder === '*' || targetFolder === '.') {
                folderToCopy = this.rootDir;
            } else {
                // if the folder name was given, check if it's in absolute path or not
                folderToCopy = targetFolder.startsWith('/') ? targetFolder : path.join(this.rootDir, targetFolder);
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

            this._writeLog('successfully deployed to Glitch!');
        } finally {
            // clean the left over files before exiting
            this.cleanGitInstance();
        }
    }

    public cleanGitInstance() {
        if (!this._glitchRepoDir) {
            throw new Error('Glitch project is not cloned to the local machine yet');
        }
        this._writeLog('cleaning up the local repo...');

        this._gitInst = this._gitInst.clearQueue();
        // remove the local repo
        rimraf.sync(this._glitchRepoDir);
    }

    private async _cloneRepo() {
        // get the absolute directory of the repo folder
        const repoDir = path.join(this.rootDir, REPO_FOLDER);

        if (fs.existsSync(repoDir)) {
            this._writeLog('found an existing repository, removing it before cloning a new one');
            // remove the repo folder if it already exists
            rimraf.sync(repoDir);
        }

        this._writeLog('cloning repository...');
        // clone the glitch project repo to a folder
        await this._gitInst.clone(this._remoteOrigin, REPO_FOLDER);

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

        this._writeLog('removing everything inside the cloned repository');

        // remove everything excluding the git metadata
        Helpers.emptyFolderContent(this._glitchRepoDir, ['.git']);

        // if the source folder is an absolute directory, don't append the path
        const folderToCopy = sourceFolder.startsWith('/') ? sourceFolder : path.join(this.rootDir, sourceFolder);

        this._writeLog(`copying everything inside ${folderToCopy} to the local repo`);
        // move the new contents to Glitch
        Helpers.copyFolderContent(folderToCopy, this._glitchRepoDir, ['.git', REPO_FOLDER]);
    }

    private async _parseSystemAuthor() {
        const gitConfigList = await this._gitInst.listConfig();
        const config = {
            name: gitConfigList.all['user.name'],
            email: gitConfigList.all['user.email'],
        };

        // obtain the first entry of the user info if there are multiple values
        const user: CommitAuthor = {
            name: Array.isArray(config.name) ? config.name[0] : config.name,
            email: Array.isArray(config.email) ? config.email[0] : config.email,
        };

        // if the author information does not exists, return null
        if (!user.email || !user.name) return null;
        else return user.email.startsWith('none') || user.name.startsWith('none') ? null : user;
    }

    private async _currentCommitAuthor() {
        const localAuth = await this._parseSystemAuthor();

        // use the local author information if there is a local author and the user did not provide any author info during instantiation
        const useLocalAuthor = !!(localAuth && _.isEqual(this._authorInfo, DEFAULT_AUTHOR));

        // we can do a non-null assertion because the above state must be true for it to pass
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const currentAuthor = useLocalAuthor ? localAuth! : this._authorInfo;

        if (!localAuth) {
            // if there are no local config set the local git identity so that the commit command won't show an error
            await this._gitInst.addConfig('user.name', currentAuthor.name, true);
            await this._gitInst.addConfig('user.email', currentAuthor.email, true);
        }

        return currentAuthor;
    }

    private async _pushChangesToRemote() {
        // add everything in the working directory
        await this._gitInst.add('./*');

        const commitAs = await this._currentCommitAuthor();

        // commit all changes added above to git and author it with the provided information
        const commitRes = await this._gitInst.commit(`[Auto commit] ${Date.now()}`, undefined, {
            '--author': `"${commitAs.name} <${commitAs.email}>"`,
        });

        this._writeLog('committing the following changes to Glitch...');
        this._writeLog(commitRes.summary);

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
        if (this._logMsg) {
            // set the simple-git debug output variable. Refer to this for the details: <https://github.com/steveukx/git-js#enable-logging>
            if (process.env.DEBUG !== 'simple-git:task:*') {
                process.env.DEBUG = 'simple-git:task:*';
            }
            // output custom logs
            console.debug(message);
        }
    }
}
