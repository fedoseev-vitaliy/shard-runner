const argv = require("minimist")(process.argv.slice(2), {
  "--": true,
  alias: {
    maxAttempts: "max-attempts",
    protractorPath: "protractor-path",
  },
});

argv.protractorArgs = argv["--"];
delete argv["--"];

import flake from "./lib/index";

let shardRunner = new flake(argv, function (status) {
  process.exit(status);
});

shardRunner.startProtractor();
