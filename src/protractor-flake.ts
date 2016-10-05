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

let shardRerunner = new flake(argv, function (status) {
  process.exit(status);
});

shardRerunner.startProtractor();
