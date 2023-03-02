### Getting keys
In order to use this bot yourself, you'll need to get a token for the Telegram bot.
You can create a bot and get its token using [@BotFather](https://t.me/botfather) inside the app.

### Setting up the environment
Once you've got Telegram Bot Token create a .env file in the root of the project and then add the tokens there, the following way:
```
TELEGRAM_BOT_TOKEN="your token as string"
```
Save the file and remember adding it to your .gitignore if you're pushing the code, otherwise you'd be sharing your keys.

### Running the bot
First, we need to install the dependencies in order for the bot to run correctly. From the root, just execute the following command.
```
npm install
```
That's it, we're ready to run the bot, just use this script:
```
npm start
```
And that's all, you can now interact with your bot using Telegram.