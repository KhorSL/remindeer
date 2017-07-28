'use strict';

const Telegram = require('telegram-node-bot');

/** For Memory Storage in event app crash **\/
const PersistentMemoryStorage = require('./adapters/PersistentMemoryStorage');
const storage = new PersistentMemoryStorage(
        `${__dirname}/data/userStorage.json`,
        `${__dirname}/data/chatStorage.json`
    );
/** **/

const tg = new Telegram.Telegram('API_KEY', {
	workers: 1,
	webAdmin: {
        port: process.env.PORT || 7777,
        host: process.env.HOST || 'localhost'
    },
    webHook: {
    	url: 'https://remindeer.herokuapp.com/',
        port: process.env.PORT || 7777,
        host: process.env.HOST || 'localhost'
    }
/**  ,storage: storage **/
});

const RemindController = require('./controllers/remind');
const StartController = require('./controllers/start');
const OtherwiseController = require('./controllers/otherwise');

const remCtrl = new RemindController();

tg.router.when(new Telegram.TextCommand('/start', 'startCommand'), new StartController())
    .when(new Telegram.TextCommand('/remind', 'addReminderCommand'), remCtrl)
	.when(new Telegram.TextCommand('/list', 'listCommand'), remCtrl)
	.when(new Telegram.TextCommand('/del', 'delReminderCommand'), remCtrl)
	.otherwise(new OtherwiseController);

/** For Memory Storage in event app crash **\/
function exitHandler(exitCode) {
    storage.flush();
    process.exit(exitCode);
}

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));
/** **/