const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');

async function run() {
    try {
        const githubToken = core.getInput('github-token');
        const packagePath = core.getInput('package-file');
        const octokit = new github.getOctokit(githubToken);

        core.debug(`repo = ${JSON.stringify(github.context.repo)} | packagePath: ${packagePath}`);

        /* Fetch PR package.json */
        const prSha = github.context.payload.pull_request.head.sha;
        const repoOwner = github.context.payload.repository.owner.login;

        core.debug(`prSha = ${prSha} | repoOwner: ${repoOwner} | repo: ${JSON.stringify(github.context.repo)}`);

        const prPackageJson = (await octokit.repos.getContent({
            owner: repoOwner,
            repo: github.context.repo.repo,
            path: packagePath,
            ref: prSha
        })).data.content;

        const prPackageVersion = JSON.parse(Buffer.from(prPackageJson, 'base64').toString()).version;

        core.debug(`prPackageVersion = ${prPackageVersion}`);

        /* Fetch Master package.json */
        const masterSha = github.context.payload.pull_request.base.sha;
        core.debug(`masterSha = ${masterSha}`);
        const prevPackageJson = (await octokit.repos.getContent({
            owner: repoOwner,
            repo: github.context.repo.repo,
            path: packagePath,
            ref: masterSha
        })).data.content;

        const masterPackageVersion = JSON.parse(Buffer.from(prevPackageJson, 'base64').toString()).version;

        core.debug(`masterPackageVersion = ${masterPackageVersion}`);

        /* Check that the current pull request package.json version property has been incremented */
        if (semver.valid(prPackageVersion) && semver.gt(prPackageVersion, masterPackageVersion)) {
            core.setOutput("is_incremented", true);
        } else {
            const errorMessage = 'package.json version value was not incremented';
            core.setOutput("is_incremented", false);
            core.setFailed(errorMessage)
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run().then();
