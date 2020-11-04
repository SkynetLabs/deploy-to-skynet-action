const core = require("@actions/core");
const github = require("@actions/github");
const { SkynetClient: NodeSkynetClient } = require("@nebulous/skynet");
const { parseSkylink, keyPairFromSeed, SkynetClient } = require("skynet-js");
const { HashDataKey } = require("skynet-js/dist/crypto");
const base64 = require("base64-js");
const base32Encode = require("base32-encode");

function decodeBase64(input = "") {
  return base64.toByteArray(
    input.padEnd(input.length + 4 - (input.length % 4), "=")
  );
}

function encodeBase32(input) {
  return base32Encode(input, "RFC4648-HEX", {
    padding: false,
  }).toLowerCase();
}

(async () => {
  try {
    // upload to skynet
    const skynetClient = new NodeSkynetClient();
    const skylink = await skynetClient.uploadDirectory(
      core.getInput("upload-dir")
    );
    core.setOutput("skylink", skylink);
    console.log(`Skylink: ${skylink}`);

    // generate base32 skylink from base64 skylink
    const skylinkDecoded = decodeBase64(parseSkylink(skylink));
    const skylinkEncodedBase32 = encodeBase32(skylinkDecoded);
    const skylinkUrl = `https://${skylinkEncodedBase32}.siasky.net`;

    core.setOutput("skylink-url", skylinkUrl);
    console.log(`Deployed to: ${skylinkUrl}`);

    // if registry is properly configured, update the skylink in the entry
    if (core.getInput("registry-seed") && core.getInput("registry-datakey")) {
      try {
        const skynetClient = new SkynetClient("https://siasky.net");
        const dataKey = core.getInput("registry-datakey");
        const { publicKey, privateKey } = keyPairFromSeed(
          core.getInput("registry-seed")
        );

        const entry = await skynetClient.registry.getEntry(publicKey, dataKey);
        const updatedEntry = {
          datakey: dataKey,
          revision: entry ? entry.entry.revision + 1 : 0,
          data: parseSkylink(skylink),
        };
        await skynetClient.registry.setEntry(privateKey, dataKey, updatedEntry);

        const encodedPublicKey = encodeURIComponent(
          `ed25519:${publicKey.toString("hex")}`
        );
        const encodedDataKey = encodeURIComponent(
          Buffer.from(HashDataKey(dataKey)).toString("hex")
        );
        console.log(
          `Registry entry updated: https://siasky.net/skynet/registry?publickey=${encodedPublicKey}&datakey=${encodedDataKey}`
        );
      } catch (error) {
        console.log(`Failed to update registry entry ${error.message}`);
      }
    }

    // put a skylink in a pull request comment if available
    if (github.context.issue.number) {
      const gitHubToken = core.getInput("github-token");
      const octokit = github.getOctokit(gitHubToken);

      try {
        await octokit.issues.createComment({
          ...github.context.repo,
          issue_number: github.context.issue.number,
          body: `Deployed to ${skylinkUrl}<br>Skylink: \`${skylink}\``,
        });
      } catch (error) {
        console.log(`Failed to create comment: ${error.message}`);
      }
    }
  } catch (error) {
    core.setFailed(`Failed to deploy: ${error.message}`);
  }
})();
