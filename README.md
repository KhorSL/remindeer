# Remindeer
Minimal task list telegram bot developed for personal use.

# Installation/Set up
```
$ npm install --save telegram-node-bot
$ npm install --save moment
```

# Deployment on Heroku/After Deployment
```
$ heroku scale web=0 worker=1
$ heroku config:set TELEGRAM_TOKEN=API_KEY
```

# References
- https://github.com/Naltox/telegram-node-bot
- https://github.com/n1try/telegram-bot-tutorial
