const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const githubToken = core.getInput('github-token');
        const packagePath = core.getInput('package-file');
        const octokit = new github.getOctokit(githubToken);

        /* Fetch current package.json */
        const curRef = github.context.sha;
        const curPackageJson = (await octokit.repos.getContent({
            ...github.context.repo,
            path: packagePath,
            curRef
        })).data.content;
        const curVersion = JSON.parse(Buffer.from(curPackageJson, 'base64').toString()).version;

        /* Fetch previous package.json */
        const prevRef = ((await octokit.repos.getCommit({
            ...github.context.repo,
            ref: curRef
        })).data.parents[0] || {}).sha;
        const prevPackageJson = (await octokit.repos.getContent({
            ...github.context.repo,
            path: packagePath,
            prevRef
        })).data.content;
        const prevVersion = JSON.parse(Buffer.from(prevPackageJson, 'base64').toString()).version;

        /* Check that the current pull request package.json version property has been incremented */
        if (semver.valid(curVersion) && semver.gt(curVersion, prevVersion)) {
            core.setOutput("is_incremented", true);
        } else {
            const errorMessage = 'package.json version value was not incremented';
            core.setOutput("is_incremented", false);
            core.error(errorMessage);
            core.setFailed(errorMessage);
        }

    } catch (error) {
        core.error(error);
        core.setFailed(error.message);
    }
}

run().then();
