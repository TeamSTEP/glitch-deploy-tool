import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';
import queryString from 'query-string';

const DEFAULT_FOLDER = '.__temp-repo';

export default class GlitchRepo {
    private _gitUrl: string;
    private _gitInst: SimpleGit;
    private _projectDir: string;
    public _publishFolder: string;

    public get glitchRepoDir(): string {
        return path.join(process.cwd(), this._projectDir);
    }
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

    public async cleanRepo() {
        this._gitInst = this._gitInst.clearQueue();
    }

    private async _cloneRepo(cloneTo?: string) {
        // clone the glitch project repo to a folder
        await this._gitInst.clone(this._gitUrl, DEFAULT_FOLDER);
        const repoDir = path.join(process.cwd(), cloneTo || DEFAULT_FOLDER);
        // change the directory to access git
        this._gitInst.cwd(repoDir);

        this._projectDir = repoDir;
    }
}

class GlitchProject {
    private _endpoint: string;
    private _userToken: string;
    private _projId: string;

    constructor(token: string, id: string) {
        this._endpoint = 'https://api.glitch.com';
        this._userToken = token;
    }

    public importFromGithub(repo: string, path = '/') {
        const query = queryString.stringify({
            authorization: this._userToken,
            projectId: this._projId,
            repo: repo,
            path: path, // the default value of '/' will import everything from the root dir
        });
    }
}
