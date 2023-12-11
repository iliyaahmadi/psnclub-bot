require('dotenv').config();
// const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const admin = '308694790';
// Start command with the main menu
bot.command('start', (ctx) => {
  if (ctx.chat.id == admin) {
    return ctx.reply(
      'به بات psnclub خوش آمدید',
      Markup.keyboard([['🆕 پست جدید', '📝 درباره من'], ['💎 پنل ادمین']])
        .resize()
        .oneTime()
    );
  } else {
    return ctx.reply(
      'به بات psnclub خوش آمدید',
      Markup.keyboard([['🆕 پست جدید', '📝 درباره من']])
        .resize()
        .oneTime()
    );
  }
});

// admin panel
bot.hears('💎 پنل ادمین', (ctx) => {
  if (ctx.chat.id == admin) {
    return ctx.reply(
      'شما وارد پنل ادمین شدید : \n \n خروج : /start',
      Markup.inlineKeyboard([
        Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
        Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
      ])
    );
  } else {
    return bot.telegram.sendMessage(
      ctx.chat.id,
      'شما به این کامند دسترسی ندارید',
      {}
    );
  }
});
//add admin
bot.action('add-admin-tmp', (ctx) => {
  ctx.editMessageText(
    'مانند مثال زیر کاربر مورد نظر را ادمین کنید \n \n /add_admin {userId}',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به پنل', 'backToAdminMenu'),
    ])
  );
});
bot.command('add_admin', (ctx) => {
  const userReply = ctx.message.text;
  const chatId = ctx.message.chat.id;
  const userId = ctx.from.id;
  ctx
    .reply(
      `chatId : ${chatId} | userId : ${userId} | user reply : ${userReply}`
    )
    .then(() => {
      ctx.reply('کاربر مورد نظر ادمین شد.\n /start برای شروع مجدد');
    });
});
//remove admin
bot.action('remove-admin-tmp', (ctx) => {
  ctx.editMessageText(
    'مانند مثال زیر کاربر مورد نظر را حذف کنید \n \n /remove_admin {userId}',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به پنل', 'backToAdminMenu'),
    ])
  );
});
bot.command('remove_admin', (ctx) => {
  const userReply = ctx.message.text;
  const chatId = ctx.message.chat.id;
  const userId = ctx.from.id;
  ctx
    .reply(
      `chatId : ${chatId} | userId : ${userId} | user reply : ${userReply}`
    )
    .then(() => {
      ctx.reply('کاربر مورد نظر حذف شد.\n /start برای شروع مجدد');
    });
});

//user commands

//queue a post
bot.hears('🆕 پست جدید', (ctx) => {
  ctx.reply(
    'مانند مثال زیر پست خود را بفرستید \n \n /post {تکست مورد نظر}',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});
//info about bot
bot.hears('📝 درباره من', (ctx) => {
  ctx.reply(
    'این تکست درباره این باته',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});

// Back to Admin Main Menu
bot.action('backToAdminMenu', (ctx) => {
  ctx.editMessageText(
    'شما وارد پنل ادمین شدید :',
    Markup.inlineKeyboard([
      Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
      Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
    ])
  );
});
// Back to Start Main Menu
bot.action('backToMainMenu', (ctx) => {
  if (ctx.chat.id == admin) {
    return ctx.editMessageText(
      'به منوی اصلی بازگشتید',
      Markup.inlineKeyboard([
        Markup.button.callback('🆕 پست جدید', 'add-admin-tmp'),
        Markup.button.callback('📝 درباره من', 'remove-admin-tmp'),
        Markup.button.callback('💎 پنل ادمین', 'remove-admin-tmp'),
      ])
    );
  } else {
    return ctx.editMessageText(
      'به منوی اصلی بازگشتید',
      Markup.inlineKeyboard([
        Markup.button.callback('🆕 پست جدید', 'add-admin-tmp'),
        Markup.button.callback('📝 درباره من', 'remove-admin-tmp'),
      ])
    );
  }
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot started');
});
