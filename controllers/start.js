'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {
	startHandler($) {
		$.sendMessage('Hi! I am Remindeer. The commands to operate me are as follows:\nremind - e.g. /remind [my reminder] -@ DD/MM/YYYY HHmm\nlist - all, today, tmr, week\ndel - e.g. /del [index]');
	}

	get routes() {
        return {
        	'startCommand': 'startHandler'
        };
    }
}

module.exports = StartController;