'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;

class OtherwiseController extends TelegramBaseController {
	handle($) {
		$.sendMessage('Sorry, I don\'t understand.');
	}
}

module.exports = OtherwiseController;