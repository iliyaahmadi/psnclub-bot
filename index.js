const fs = require('fs');
require('dotenv').config();

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch((err, ctx) => {
  console.log(`we got an error => ${ctx.updateType}`, err);
});

bot.start((ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, 'به بات psnclub خوش امدید', {});
});

bot.command('admin', (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, 'به بات psnclub خوش امدید', {});
});

bot.launch();
