"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const path = require("path");
const shard_parser_1 = require("./shard-parser");
const logger_1 = require("./logger");
let DEFAULT_PROTRACTOR_ARGS = [];
let oneFailSpec = [];
let DEFAULT_OPTIONS = {
    maxAttempts: 3,
    nodeBin: "node",
    "--": DEFAULT_PROTRACTOR_ARGS,
    protractorArgs: DEFAULT_PROTRACTOR_ARGS,
};
class default_1 {
    constructor(option, callback) {
        this.option = option;
        this.callback = callback;
        this.option = this.option === undefined ? {} : this.option;
        this.callback = this.callback === undefined ? function foo() { return null; } : this.callback;
        this.parsedOptions = Object.assign(DEFAULT_OPTIONS, this.option);
        this.parsedOptions.protractorArgs = this.parsedOptions.protractorArgs.concat(this.parsedOptions["--"]);
        this.testAttempt = 1;
    }
    handleTestEnd(status, output) {
        if (status === 0) {
            this.callback(status);
        }
        else {
            if (++this.testAttempt <= this.parsedOptions.maxAttempts) {
                let failedSpecs = shard_parser_1.shardParser(output);
                if (failedSpecs.length === 1) {
                    oneFailSpec.push(failedSpecs);
                }
                if (failedSpecs.length === 0) {
                    failedSpecs = oneFailSpec;
                }
                logger_1.logger("info", "Re-running tests: test attempt " + this.testAttempt + "\n");
                logger_1.logger("info", "Re-running the following test files:\n");
                logger_1.logger("info", failedSpecs.join("\n") + "\n");
                return this.startProtractor(failedSpecs);
            }
            this.callback(status, output);
        }
    }
    startProtractor(failedSpecs) {
        let specFiles = failedSpecs === undefined ? [] : failedSpecs, protractorBinPath, output = "";
        if (this.parsedOptions.protractorPath) {
            protractorBinPath = path.resolve(this.parsedOptions.protractorPath);
        }
        else {
            let protractorMainPath = require.resolve("protractor");
            protractorBinPath = path.resolve(protractorMainPath, "../../bin/protractor");
        }
        let protractorArgs = [protractorBinPath].concat(this.parsedOptions.protractorArgs);
        if (specFiles.length) {
            protractorArgs = protractorArgs.map(function (arg) {
                return arg.replace(/^--suite=/, "--params.suite=");
            });
            protractorArgs.push("--specs", specFiles.join(","));
        }
        let protractor = childProcess.spawn(this.parsedOptions.nodeBin, protractorArgs, this.option.protractorSpawnOptions);
        protractor.stdout.on("data", (buffer) => {
            let text = buffer.toString();
            logger_1.logger("info", text);
            output = output + text;
        });
        protractor.stderr.on("data", (buffer) => {
            let text = buffer.toString();
            logger_1.logger("info", text);
            output = output + text;
        });
        protractor.on("close", (status) => {
            this.handleTestEnd(status, output);
        });
    }
}
exports.default = default_1;
;
