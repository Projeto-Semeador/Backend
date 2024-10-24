const fs = require('node:fs');

// Class to log messages to the console and a file
class Logger {
    #currentFile = '';

    /**  
        * @type {boolean} 
        * @private
        * @default true
        * @description Whether or not to log messages to a file 
    **/
    #fileLogging = true;

    /**
         * @type {boolean}
         * @private
         * @default true
         * @description Whether or not to log messages to the console
    **/
    #consoleLogging = true;

    // Writes the log message to a file 
    #writeToFile(log) {
        if (!this.#fileLogging) {
            return;
        }
        fs.appendFileSync(this.#currentFile, log);
    }

    // Writes the log message to the console
    #writeToConsole(log) {
        if (!this.#consoleLogging) {
            return;
        }

        console.log(log);
    }

    /**
     * @param {string} message The message to log 
     * @description Logs a message to the console and a file
     * @example
     * logger.logMessage('This is a log message');
     * @returns {void}
    **/
    logMessage(message) {
        var timestamp = new Date().toISOString();
        var log = `${timestamp} - ${message}`;

        this.#writeToFile(log);
        this.#writeToConsole(log);
    }

    /**
     * @param {Request} req The request object
     * @param {Response} res The response object
     * @param {NextFunction} next The next function
     * @description Logs the request to the console and a file
     * @example
     * app.use(logger.logRequest.bind(logger));
     * @returns {void}
     * **/
    logRequest(req, res, next) {
        var timestamp = new Date().toISOString();
        var method = req.method;
        var additional = '';

        switch (method) {
            case 'GET':
                method = '\x1b[32m' + method + '\x1b[0m';
                break;
            case 'POST':
                method = '\x1b[34m' + method + '\x1b[0m';
                additional = ` - ${JSON.stringify(req.body)}`;
                break;
            case 'PUT':
                method = '\x1b[33m' + method + '\x1b[0m';
                additional = ` - ${JSON.stringify(req.body)}`;
                break;
            case 'DELETE':
                method = '\x1b[31m' + method + '\x1b[0m';
                break;
        }

        var log = `${timestamp} [${method}] - ${req.path} - ${req.ip}` + additional + '\n';

        this.#writeToFile(log);
        this.#writeToConsole(log);
        next();
    }

    /** 
     * @param {boolean} fileLogging Whether or not to log messages to a file
     * @param {boolean} consoleLogging Whether or not to log messages to the console
     * @description Initializes the logger
     * @example
     * const Logger = require('./util/logger');
     * const logger = new Logger(false, true);
     * @returns {Logger} 
     **/
    constructor(
        fileLogging = true,
        consoleLogging = true
    ) {
        this.#fileLogging = fileLogging;
        this.#consoleLogging = consoleLogging;

        if (!fs.existsSync('./logs') && this.#fileLogging) {
            fs.mkdirSync('./logs');
        }

        if (this.#fileLogging) {
            var timestamp = new Date().toISOString();
            timestamp = timestamp.replace(/:/g, '-');

            this.#currentFile = './logs/' + `${timestamp}` + '.log';
            this.#writeToFile(`${timestamp} - Logger initialized\n`);
        }
    }
}

module.exports = Logger;