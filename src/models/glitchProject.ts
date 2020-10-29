import queryString from 'query-string';
import fetch from 'node-fetch';

export default class GlitchProject {
    private _endpoint: string;
    private _userToken: string;
    private _projId: string;

    constructor(token: string, id: string) {
        this._endpoint = 'https://api.glitch.com';
        this._userToken = token;
        this._projId = id;
    }

    public async importFromGithub(repo: string, path = '/') {
        const repoPattern = /^[A-Za-z0-9_.-]+\/{1}[A-Za-z0-9_.-]+$/;

        if (!repo || !repoPattern.test(repo)) {
            throw new Error('Invalid Github repository name');
        }

        const query = queryString.stringify({
            authorization: this._userToken,
            projectId: this._projId,
            repo: repo,
            path: path, // the default value of '/' will import everything from the root dir
        });
        const res = await fetch(`${this._endpoint}/project/githubImport?${query}`, { method: 'POST' });

        return res;
    }
}
