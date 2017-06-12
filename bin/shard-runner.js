"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argv = require("minimist")(process.argv.slice(2), {
    "--": true,
    alias: {
        maxAttempts: "max-attempts",
        protractorPath: "protractor-path",
    },
});
argv.protractorArgs = argv["--"];
delete argv["--"];
const index_1 = require("./lib/index");
exports.shardRunner = new index_1.default(argv, function (status) {
    process.exit(status);
});
exports.shardRunner.startProtractor();
