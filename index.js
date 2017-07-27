'use strict';

const Telegram = require('telegram-node-bot');
const tg = new Telegram.Telegram('433728794:AAHYqC2qaD88yIW5eekKbMYBVfisdRK2Hmo', {
	workers: 1 //default uses as many as the CPU calls,
	webAdmin: {
        port: process.env.PORT || 7777,
        host: process.env.HOST || 'localhost'
    }
});

const RemindController = require('./controllers/remind');
const OtherwiseController = require('./controllers/otherwise');

const remCtrl = new RemindController();

tg.router.when(new Telegram.TextCommand('/remind', 'addReminderCommand'), remCtrl)
	.when(new Telegram.TextCommand('/list', 'listCommand'), remCtrl)
	.when(new Telegram.TextCommand('/del', 'delReminderCommand'), remCtrl)
	.otherwise(new OtherwiseController);
