"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["debug"] = 1] = "debug";
    LOG_LEVELS[LOG_LEVELS["info"] = 2] = "info";
    LOG_LEVELS[LOG_LEVELS["silent"] = 3] = "silent";
})(LOG_LEVELS || (LOG_LEVELS = {}));
function logger(levelName, message) {
    let currentLevel = LOG_LEVELS[process.env.PROTRACTOR_FLAKE_LOG_LEVEL] || LOG_LEVELS.info;
    let incomingLevel = LOG_LEVELS[levelName];
    if (incomingLevel >= currentLevel) {
        process.stdout.write(message);
    }
}
exports.logger = logger;
;
