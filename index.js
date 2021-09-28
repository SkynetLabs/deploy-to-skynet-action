const core = require("@actions/core");
const github = require("@actions/github");
const { SkynetClient: NodeSkynetClient } = require("@skynetlabs/skynet-nodejs");
const { genKeyPairFromSeed, SkynetClient } = require("skynet-js");

function outputAxiosErrorMessage(error) {
  if (error.response) {
    const { path, method } = error.request;
    const { status, statusText } = error.response;

    console.log(
      `${method.toUpperCase()} ${path} failed with status ${status}: ${statusText}`
    );
    console.log(error.response.data || "Response contained no data");
  }
}

function prepareUploadOptions() {
  const options = {};

  if (core.getInput("try-files")) {
    // transform try-files input which is space separated list
    // of file paths into an array of those paths
    options.tryFiles = core.getInput("try-files").split(/\s+/);
  }

  if (core.getInput("not-found-page")) {
    // transform not-found-page input which is a single file path into
    // an object with a 404 key and its value being the specified path
    options.errorPages = { 404: core.getInput("not-found-page") };
  }

  return options;
}

(async () => {
  try {
    // upload to skynet
    const nodeClient = new NodeSkynetClient(core.getInput("portal-url"));
    const skynetClient = new SkynetClient(core.getInput("portal-url"));
    const skylink = await nodeClient.uploadDirectory(
      core.getInput("upload-dir"),
      prepareUploadOptions()
    );

    // generate base32 skylink url from base64 skylink
    const skylinkUrl = await skynetClient.getSkylinkUrl(skylink, {
      subdomain: true,
    });

    core.setOutput("skylink", skylink);
    console.log(`Skylink: ${skylink}`);

    core.setOutput("skylink-url", skylinkUrl);
    console.log(`Deployed to: ${skylinkUrl}`);

    // if registry is properly configured, update the skylink in the entry
    if (core.getInput("registry-seed") && core.getInput("registry-datakey")) {
      try {
        const seed = core.getInput("registry-seed");
        const dataKey = core.getInput("registry-datakey");
        const { publicKey, privateKey } = genKeyPairFromSeed(seed);

        const [entryUrl, resolverSkylink] = await Promise.all([
          skynetClient.registry.getEntryUrl(publicKey, dataKey),
          skynetClient.registry.getEntryLink(publicKey, dataKey),
          skynetClient.db.setDataLink(privateKey, dataKey, skylink),
        ]);
        const resolverUrl = await skynetClient.getSkylinkUrl(resolverSkylink, {
          subdomain: true,
        });

        console.log(`Registry entry updated: ${entryUrl}`);

        core.setOutput("resolver-skylink-url", resolverUrl);
        console.log(`Resolver Skylink Url: ${resolverUrl}`);

        core.setOutput("resolver-skylink", resolverSkylink);
        console.log(`Resolver Skylink: ${resolverSkylink}`);
      } catch (error) {
        outputAxiosErrorMessage(error);

        console.log(`Failed to update registry entry: ${error.message}`);
      }
    }

    // put a skylink in a pull request comment if available
    if (github.context.issue.number) {
      const gitHubToken = core.getInput("github-token");
      const octokit = github.getOctokit(gitHubToken);

      try {
        await octokit.rest.issues.createComment({
          ...github.context.repo,
          issue_number: github.context.issue.number,
          body: `Deployed to ${skylinkUrl}<br>Skylink: \`${skylink}\``,
        });
      } catch (error) {
        console.log(`Failed to create comment: ${error.message}`);
      }
    }
  } catch (error) {
    outputAxiosErrorMessage(error);

    core.setFailed(`Failed to deploy: ${error.message}`);
  }
})();
