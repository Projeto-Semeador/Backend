const fs = require('node:fs');
const chalk = require('chalk');

// Class to log messages to the console and a file
class Logger {
    #logFolder = './logs';
    #currentFile = '';
    #fileLogging = true;
    #consoleLogging = true;
    
    // Creates a new log file if one does not exist for the current day
    #createFile() {
        if (!this.#fileLogging) {
            return;
        }

        if (!fs.existsSync(this.#logFolder)) {
            fs.mkdirSync(this.#logFolder);
        }

        // Check if there is any log file in the logs directory from today
        var timestamp = new Date().toISOString().replace(/:/g, '-');
        var logFiles = fs.readdirSync(this.#logFolder);
        var found = false;

        for (var i = 0; i < logFiles.length; i++) {
            if (logFiles[i].includes(timestamp.split('T')[0])) {
                this.#currentFile = `${this.#logFolder}/${logFiles[i]}`;
                found = true;
                break;
            }
        }

        // If no log file was found, create a new one
        if (!found) {
            this.#currentFile = `${this.#logFolder}/${timestamp}.log`;
            fs.writeFileSync(this.#currentFile, '');
        }
    }

    // Writes the log message to a file 
    #writeToFile(log) {
        if (!this.#fileLogging) {
            return;
        }

        var logString = '';

        if (log.type === 'request') {
            logString = `${log.timestamp} - [${log.method}] ${log.url} - ${log.ip}`;
        } else if (log.type === 'response') {
            logString = `${log.timestamp} - [${log.method}] ${log.url} - ${log.ip} - ${log.status} - ${log.responseTime}ms`;
        } else {
            logString = `${log.timestamp} - ${log.message}`;
        }

        fs.appendFileSync(this.#currentFile, logString + '\n');
    }

    // Writes the log message to the console
    #writeToConsole(log) {
        if (!this.#consoleLogging) {
            return;
        }

        var method = '';

        switch (log.method) {
            case 'GET':
                method = chalk.green(log.method);
                break;
            case 'POST':
                method = chalk.blue(log.method);
                break;
            case 'PUT':
                method = chalk.yellow(log.method);
                break;
            case 'DELETE':
                method = chalk.red(log.method);
                break;
            default:
                method = chalk.white(log.method);
                break;
        }

        var logString = '';

        if (log.type === 'request') {
            logString = `${log.timestamp} - [${method}] ${log.url} - ${log.ip}`;
        } else if (log.type === 'response') {
            logString = `${log.timestamp} - [${method}] ${log.url} - ${log.ip} - ${log.status} - ${log.responseTime}ms`;
        } else {
            logString = `${log.timestamp} - ${log.message}`;
        }

        console.log(logString);
    }

    /**
     * @param {string} message The message to log 
     * @description Logs a message to the console and a file
     * @example
     * logger.logMessage('This is a log message');
     * @returns {void}
    **/
    logMessage(message) {
        var log = {
            type: 'message',
            timestamp: new Date().toISOString(),
            message: message,
        }

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
        var requestTime = new Date().getTime();

        var log = {
            type: 'request',
            timestamp: timestamp,
            method: method,
            url: req.url,
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
            ip: req.ip,
        }

        this.#writeToFile(log);
        this.#writeToConsole(log);

        res.on('finish', () => {
            var responseTime = new Date().getTime() - requestTime;
            var responseLog = {
                type: 'response',
                timestamp: new Date().toISOString(),
                method: method,
                url: req.url,
                ip: req.ip,
                status: res.statusCode,
                headers: res.getHeaders(),
                responseTime: responseTime,
            };

            this.#writeToFile(responseLog);
            this.#writeToConsole(responseLog);
        });

        next();

    }

    /** 
     * @param {boolean} fileLogging Whether or not to log messages to a file
     * @param {boolean} consoleLogging Whether or not to log messages to the console
     * @param {string} logFolder The folder to store the log files
     * @description Initializes the logger
     * @example
     * const Logger = require('./util/logger');
     * const logger = new Logger(false, true, './logs');
     * @returns {Logger} 
     **/
    constructor(fileLogging = true, consoleLogging = true, logFolder = './logs') {
        this.#fileLogging = fileLogging;
        this.#consoleLogging = consoleLogging;
        this.#logFolder = logFolder;

        this.#createFile();
        this.logMessage('Logger initialized');
    }
}

module.exports = Logger;