"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shardParser(output) {
    const lineByLine = output.toString().split("\n");
    const failedFileIDs = lineByLine.filter((line) => {
        const failed = /(launcher).*#[0-9]+-*[0-9]* failed/;
        return line.match(failed);
    })
        .map((line) => {
        const testId = /.*(#[0-9]+-*[0-9]*)/;
        return testId.exec(line)[1];
    });
    const filePath = ".*#[0-9]+-*[0-9]*.* Specs: (.*)";
    let failedSpecs = lineByLine.filter((line) => {
        return line.match(new RegExp(filePath));
    }).filter((containPath) => {
        return failedFileIDs.filter((failedFileID) => {
            return containPath.match(failedFileID + "\\D");
        }).length > 0;
    })
        .map((matchedLine) => {
        const reg = new RegExp(filePath);
        return reg.exec(matchedLine)[1];
    });
    return failedSpecs;
}
exports.shardParser = shardParser;
