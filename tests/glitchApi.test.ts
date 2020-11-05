import { GlitchProject } from '../src';
import nock from 'nock';

describe('Importing Github repositories to Glitch', () => {
    // set up a mock token and query params for the test
    const token = '7dd3b76-a13c-a13c-a13c-152b3539bdcd';
    const projectId = '8c28b8-9db3-6098-1ab2-54e70d3347b4';
    const repo = 'userorg/project';
    const path = 'build';

    beforeEach(() => {
        nock.disableNetConnect();
    });

    it('imports the given repo to Glitch with a status 200', async () => {
        nock('https://api.glitch.com')
            .post('/project/githubImport')
            .query({
                authorization: token,
                projectId,
                repo,
                path,
            })
            .reply(200, { status: 200 });

        const glitchApi = new GlitchProject(token, projectId);
        const response = await glitchApi.importFromGithub(repo, path);
        expect(response.status).toBe(200);
    });

    it('imports the given repo with a subdirectory in the parameter', async () => {
        nock('https://api.glitch.com')
            .post('/project/githubImport')
            .query({
                authorization: token,
                projectId,
                repo,
                path: '/', // default path
            })
            .reply(200, { status: 200 });

        const glitchApi = new GlitchProject(token, projectId);
        const response = await glitchApi.importFromGithub(repo);
        expect(response.status).toBe(200);
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    //todo: add a unit test for GlitchGit class
});
