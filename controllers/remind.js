'use strict';

const Telegram = require('telegram-node-bot');
const moment = require('moment');
const TelegramBaseController = Telegram.TelegramBaseController;

class RemindController extends TelegramBaseController {
    addReminderHandler($) {
    	let reminderWithDateTime = $.message.text.split(' ').slice(1).join(' ');
        let reminderMsg = reminderWithDateTime.split(' -@', 1);
        let dateTime = reminderWithDateTime.split('-@ ').slice(1);

        if(!reminderWithDateTime) {
            return $.sendMessage('Sorry, please tell me something I can remind you about.');
        }
        
        var shorthand = dateTime[0].replace(/,/g, '').split(' ').slice(0,1);
        var time = dateTime[0].replace(/,/g, '').split(' ').slice(1,2);
        if(shorthand == 'today' || shorthand == 'Today' || shorthand == 'later' && isNaN(time)) {
            dateTime = new Date(new moment().set({'hour': time[0].substring(0,2), 'minute': time[0].substring(2)}));
        } else if(shorthand == 'tmr' || shorthand == 'tomorrow' || shorthand == 'tmrw' && isNaN(time)) {
            dateTime = new Date(new moment().set({'hour': time[0].substring(0,2), 'minute': time[0].substring(2)}));
            dateTime = moment(dateTime).add(1, 'days');
        } else {
            dateTime = new Date(moment(dateTime[0], 'DD/MM/YYYY HHmm'));
            if(!moment(dateTime).isValid()) {
                return $.sendMessage('Sorry, your date/time format is invalid.');
            }      
        }

        var reminder = {msg: reminderMsg, dateTime: dateTime};
        
        $.getUserSession('reminders')
            .then(reminders => {
                if(!Array.isArray(reminders)) {
                    $.setUserSession('reminders', [reminder]);
                } else {
                    $.setUserSession('reminders', reminders.concat([reminder]));
                }
                $.sendMessage('Added \'' + reminder.msg + '\' to the list.');
            });
    }

    listHandler($) {
        let action = $.message.text.split(' ').slice(1).join(' ');
        if(action == 'all' || !action) { //e.g. /list | /list all
            $.getUserSession('reminders').then(reminders => {
                $.sendMessage(this._serializeList(reminders), {parse_mode: 'Markdown'}); 
            });
        } else if(action == 'today' || action == 'Today') { //e.g. /list today | /list Today
            $.getUserSession('reminders').then(reminders => {
                var todayReminders = this._findToday(reminders);
                $.sendMessage(todayReminders, {parse_mode: 'Markdown'});
            });
        } else if(action == 'tmr' || action == 'tommorrow' || action == 'tmrw') {
            $.getUserSession('reminders').then(reminders => {
                var tmrReminders = this._findTmr(reminders);
                $.sendMessage(tmrReminders, {parse_mode: 'Markdown'});
            });
        } else if(action == 'week' || action == 'Week') {
            $.getUserSession('reminders').then(reminders => {
                var weekReminders = this._findWeek(reminders);
                $.sendMessage(weekReminders, {parse_mode: 'Markdown'});
            });
        } else {
            var inputDate = moment(action, 'DD/MM/YYYY');
            if(inputDate.isValid()) {
                $.getUserSession('reminders').then(reminders => {
                    var dateReminders = this._findDate(reminders, inputDate);
                    $.sendMessage(dateReminders, {parse_mode: 'Markdown'});
                 });
            } else {
                $.sendMessage('Invalid format.');
            }
        }
    }

    delReminderHandler($) {
        let index = parseInt($.message.text.split(' ').slice(1)[0]);
        if (isNaN(index)) return $.sendMessage('Sorry, you didn\'t pass a valid index.');

        $.getUserSession('reminders')
            .then(reminders => {
                if (index-1 >= reminders.length || reminders == undefined) {
                    return $.sendMessage('Sorry, you didn\'t pass a valid index.');
                }
                let deleted = reminders[index-1];
                reminders.splice(index-1, 1);
                $.setUserSession('reminders', reminders);
                $.sendMessage(`'${deleted.msg}' is removed from the list.`);
            });
    }

    get routes() {
        return {
            'addReminderCommand': 'addReminderHandler',
            'listCommand': 'listHandler',
            'delReminderCommand': 'delReminderHandler'
        };
    }

    _serializeList(reminderList) {
        let serialized = '*Your Reminders:*\n\n';
        if(JSON.stringify(reminderList) === '{}' || reminderList.length <= 0) {
            return 'Your reminder list is empty.';
        }

        reminderList.forEach((reminder, index) => {
            var formattedDT = (moment(reminder.dateTime).format('DD/MM/YYYY[,] HH:mm'));
            serialized += `*${index+1}*) ${reminder.msg} @ ${formattedDT}\n`;
        });
        return serialized;
    }

    _findToday(reminderList) {
        var count = 0;
        var now = new moment();
        var todayReminders = '*Reminders For Today:*\n\n';
        if(JSON.stringify(reminderList) === '{}' || reminderList.length <= 0) {
            return 'Your reminder list is empty.';
        }

        reminderList.forEach(function(reminder, index) {
            if(moment(reminder.dateTime).isSame(now, 'day')) {
                var formattedDT = (moment(reminder.dateTime).format('DD/MM/YYYY[,] HH:mm'));
                todayReminders += `*${index+1}*) ${reminder.msg} @ ${formattedDT}\n`;
                count++;
            }
        });

        if(count == 0) return 'You have no reminders set for today.';

        return todayReminders;
    }

    _findTmr(reminderList) {
        var count = 0;
        var tmr = moment(new Date()).add(1,'days');
        var tmrReminders = '*Reminders For Tomorrow:*\n\n';
        if(JSON.stringify(reminderList) === '{}' || reminderList.length <= 0) {
            return 'Your reminder list is empty.';
        }

        reminderList.forEach(function(reminder, index) {
            if(moment(reminder.dateTime).isSame(tmr, 'day')) {
                var formattedDT = (moment(reminder.dateTime).format('DD/MM/YYYY[,] HH:mm'));
                tmrReminders += `*${index+1}*) ${reminder.msg} @ ${formattedDT}\n`;
                count++;
            }
        });

        if(count == 0) return 'You have no reminders set for tomorrow.';
        
        return tmrReminders;
    }

    _findWeek(reminderList) {
        var count = 0;
        var now = new moment();
        var weekReminders = '*Reminders For This Week:*\n\n';
        if(JSON.stringify(reminderList) === '{}' || reminderList.length <= 0) {
            return 'Your reminder list is empty.';
        }

        reminderList.forEach(function(reminder, index) {
            if(moment(reminder.dateTime).isSame(now, 'week')) {
                var formattedDT = (moment(reminder.dateTime).format('DD/MM/YYYY[,] HH:mm'));
                weekReminders += `*${index+1}*) ${reminder.msg} @ ${formattedDT}\n`;
                count++;
            }
        });

        if(count == 0) return 'You have no reminders set for the week.';
        
        return weekReminders;
    }

    _findDate(reminderList, inputDate) {
        var count = 0;
        var dateReminders = '*Reminders For ' + moment(inputDate).format('DD/MM/YYYY') + ':*\n\n';
        if(JSON.stringify(reminderList) === '{}' || reminderList.length <= 0) {
            return 'Your reminder list is empty.';
        }

        reminderList.forEach(function(reminder, index) {
            if(moment(reminder.dateTime).isSame(inputDate, 'day')) {
                var formattedDT = (moment(reminder.dateTime).format('DD/MM/YYYY[,] HH:mm'));
                dateReminders += `*${index+1}*) ${reminder.msg} @ ${formattedDT}\n`;
                count++;
            }
        });

        if(count == 0) return 'You have no reminders set for ' + inputDate + '.';
        
        return dateReminders;
    }
}

module.exports = RemindController;
