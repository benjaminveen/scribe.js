/**
 * Created by ben on 4/28/17.
 */

'use strict';

const fs = require('fs');

let scribe;
let config;

function ScribeException(message){
    this.message = message;
    this.name = 'ScribeException';
}

class Scribe{

    constructor(configuration = 'environment', logname = ''){
        this.config = this.createConfigObject(configuration);
        this.logname = this.getLogName(logname);
        if(this.config.definedLogLevels.indexOf(this.config.loglevel) === -1)
            throw new ScribeException('Configured log level is not a valid log level');
        else
            this.loglevel = this.config.loglevel;
        this.environment = this.config.environment;
        this.date = this.getTodaysDate();
        this.filename = '/logs/' + logname + '.txt';
    }

    createConfigObject(config){
        if(config === 'environment'){
            let envConfig = {};
            envConfig['loglevel'] = process.env.loglevel;
            envConfig['definedLogLevels'] = process.env.definedLogLevels;
            envConfig['environment'] = process.env.environment;
            envConfig['definedEnvironments'] = process.env.definedEnvironments
            return envConfig;
        }
        return config;
    }

    log(message, loglevel) {
        if (this.definedLogLevels[loglevel] <= this.definedLogLevels[this.loglevel]) {
            if (this.environment === 'production') {
               fs.appendFileSync(this.filename, message);
            } else if (this.environment === 'development') {
                console.log(message);
            } else {
                throw new ScribeException('Configured environment is not valid');
            }
        }
    }

    logAsync(message, loglevel){
        if (this.definedLogLevels[loglevel] <= this.definedLogLevels[this.loglevel]) {
            fs.appendFile(this.filename, message, (error) => {
                if(error)
                    throw new ScribeException(error);
            });
        }
    }

    getLogName(logname){
        if(logname === '')
            return 'scribe_' + getTodaysDate();
        else
            return 'scribe_' + logname;
    }

    getTodaysDate(){
        let date = new Date();
        let month = date.getMonth();
        let year = date.getYear();
        let day = date.getDate();
        return [year, month, day].join('/');
    }

}

let getScribe = (configFile = '', logname = '') => {
    if(!scribe && !config && configFile === '')
        throw new ScribeException('No existing Scribe instance and no configuration file provided');
    else if(!scribe){
        config = configFile;
        scribe = new Scribe(configFile, logname);
    }
    return scribe;
};

exports.getScribe = getScribe;