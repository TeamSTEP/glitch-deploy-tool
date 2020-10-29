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

    private _glitchRepoDir: string;

    public _publishFolder: string;

    public set publishFolderDir(folder: string) {
        this._publishFolder = path.join(process.cwd(), folder);
    }

    constructor(gitUrl: string) {
        if (!gitUrl.startsWith('https//')) {
            // add the https prefix if the user did not provide one
            this._gitUrl = 'https//' + gitUrl;
        } else {
            this._gitUrl = gitUrl;
        }
        const gitOptions: SimpleGitOptions = {
            baseDir: process.cwd(),
            binary: 'git',
            maxConcurrentProcesses: 2,
        };
        // setup a git client
        this._gitInst = simpleGit(gitOptions);
    }

    public async pushFilesToGlitch(path?: string) {
        const gitStatus = await this._gitInst.status();
        const hasChanges = gitStatus.modified.length + gitStatus.deleted.length + gitStatus.created.length > 0;
        if (!hasChanges) {
        }
        // if no file is given, import everything in the current directory
        if (!path) {
        }
    }

    public cleanGitInstance() {
        this._gitInst = this._gitInst.clearQueue();
    }

    private async _cloneRepo() {
        // get the absolute directory of the repo folder
        const repoDir = path.join(ROOT_DIR, REPO_FOLDER);

        if (fs.existsSync(repoDir)) {
            // remove the repo folder if it already exists
            rimraf.sync(repoDir);
        }
        // clone the glitch project repo to a folder
        await this._gitInst.clone(this._gitUrl, REPO_FOLDER);

        // set the location
        this._glitchRepoDir = repoDir;
        // change the directory to access git
        this._gitInst.cwd(repoDir);
    }

    private _replaceRepoContentWith(sourceFolder: string) {
        if (!this._glitchRepoDir) {
            throw new Error('Glitch project is not cloned to the local machine yet');
        }
        // remove everything excluding the git metadata
        Helpers.emptyFolderContent(this._glitchRepoDir, ['.git']);

        // if the source folder is an absolute directory, don't append the path
        const folderToCopy = sourceFolder.startsWith('/') ? sourceFolder : path.join(ROOT_DIR, sourceFolder);

        // move the new contents to Glitch
        Helpers.copyFolderContent(folderToCopy, this._glitchRepoDir, ['.git']);
    }
}
