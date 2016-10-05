const childProcess = require("child_process");
const path = require("path");
import {shardParser} from "./shard-parser";
import {logger} from "./logger";
let DEFAULT_PROTRACTOR_ARGS = [];
let DEFAULT_OPTIONS = {
  maxAttempts: 2,
  nodeBin: "node",
  "--": DEFAULT_PROTRACTOR_ARGS,
  protractorArgs: DEFAULT_PROTRACTOR_ARGS,
};

export default class{
  parsedOptions;
  testAttempt;

  constructor(protected option: any, protected callback: any) {
    this.option = this.option === undefined ? {} : this.option;
    this.callback = this.callback === undefined ? function foo() { return null; } : this.callback;

    this.parsedOptions = Object.assign(DEFAULT_OPTIONS, this.option);
    this.parsedOptions.protractorArgs = this.parsedOptions.protractorArgs.concat(this.parsedOptions["--"]);
    this.testAttempt = 1;
  }

  handleTestEnd(status: any, output: any) {
    if (status === 0) {
      this.callback(status);
    } else {
      if (++this.testAttempt <= this.parsedOptions.maxAttempts) {
        let failedSpecs = shardParser(output);
        logger("info", "Re-running tests: test attempt " + this.testAttempt + "\n");
        logger("info", "Re-running the following test files:\n");
        logger("info", failedSpecs.join("\n") + "\n");
        return this.startProtractor(failedSpecs);
      }

      this.callback(status, output);
    }
  }

  startProtractor(failedSpecs?: any) {
    let specFiles = failedSpecs === undefined ? [] : failedSpecs,
        protractorBinPath,
        output = "";

    if (this.parsedOptions.protractorPath) {
      protractorBinPath = path.resolve(this.parsedOptions.protractorPath);
    } else {
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
      logger("info", text);
      output = output + text;
    });

    protractor.stderr.on("data", (buffer) => {
      let text = buffer.toString();
      logger("info", text);
      output = output + text;
    });

    protractor.on("exit", (status) => {
      this.handleTestEnd(status, output);
    });
  }
};
