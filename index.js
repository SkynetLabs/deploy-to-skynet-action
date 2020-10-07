const core = require("@actions/core");
const github = require("@actions/github");
const { SkynetClient } = require("@nebulous/skynet");
const { parseSkylink } = require("skynet-js");

(async () => {
  try {
    // upload to skynet
    const skynetClient = new SkynetClient();
    const skylink = await skynetClient.uploadDirectory(
      core.getInput("upload-dir")
    );
    core.setOutput("skylink", skylink);
    console.log(`Skylink: ${skylink}`);

    // put a skylink in a pull request comment if available
    if (github.context.issue.number) {
      const gitHubToken = core.getInput("github-token");
      const octokit = github.getOctokit(gitHubToken);

      await octokit.issues.createComment({
        ...github.context.repo,
        issue_number: github.context.issue.number,
        body: `Deployed to https://siasky.net/${parseSkylink(skylink)}`,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
