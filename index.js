require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const usersFile = `${__dirname}/db/users.json`;
const admin = '308694790'; // aragon : 97960068 || bot : 353804646:AAGAowZxCdj2BOl-CYkskyj0CNucBYzbCVg
const dev = '308694790';
let users;
fs.readFile(usersFile, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
    return false;
  }
  const jsonData = JSON.parse(data);
  users = jsonData.user_ids;
});

bot.catch((err, ctx) => {
  console.error(`Error in ${ctx.updateType}`, err);
  // Notify the admin user with error details
  // bot.telegram.sendMessage(
  //   admin,
  //   `کاربری با آیدی ${ctx.chat.id} به مشکل خورد \n \n Error in ${ctx.updateType}: ${err.message}`
  // );
  bot.telegram.sendMessage(
    dev,
    `کاربری با آیدی ${ctx.chat.id} به مشکل خورد \n \n Error in ${ctx.updateType}: ${err.message}`
  );
  // You can customize the error response based on your needs
  ctx.reply(
    'درخواست شما به مشکل خورد! لطفا برای رفع مشکل با ادمین در ارتباط باشید'
  );
  // avoid unhandled promise rejections
  return Promise.resolve();
});

// Start command with the main menu
bot.command('start', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    return ctx.reply(
      'به بات اراگون خوش آمدید',
      Markup.keyboard([['🆕 پست جدید', '🤖 درباره بات'], ['💎 پنل ادمین']])
        .resize()
        .oneTime()
    );
  } else {
    return ctx.reply(
      'به بات اراگون خوش آمدید',
      Markup.keyboard([['🆕 پست جدید', '🤖 درباره بات']])
        .resize()
        .oneTime()
    );
  }
});
//////////////////////////////////////admin panel////////////////////////////////////////////////////
bot.hears('💎 پنل ادمین', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    return ctx.reply(
      'شما وارد پنل ادمین شدید : \n \n خروج : /start',
      Markup.inlineKeyboard([
        Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
        Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
bot.action('💎 پنل ادمین', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    return ctx.editMessageText(
      'شما وارد پنل ادمین شدید : \n \n خروج : /start',
      Markup.inlineKeyboard([
        Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
        Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
//add admin
bot.action('add-admin-tmp', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    ctx.editMessageText(
      'مانند مثال زیر کاربر مورد نظر را ادمین کنید \n \n /add_admin {userId}',
      Markup.inlineKeyboard([
        Markup.button.callback('بازگشت به پنل', 'backToAdminMenu'),
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
bot.command('add_admin', async (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    const msg = ctx.message.text.split(' ');
    const id = msg[1];
    const regex = /^\d{9}$/;
    if (regex.test(id)) {
      await createUser(id).then(() => {
        return ctx.reply(`ادمین جدید با ایدی ${id} اضافه شد`);
      });
    } else {
      return ctx.reply('ایدی داده شده معتبر نیست');
    }
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
//remove admin
bot.action('remove-admin-tmp', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    ctx.editMessageText(
      'مانند مثال زیر کاربر مورد نظر را حذف کنید \n \n /remove_admin {userId}',
      Markup.inlineKeyboard([
        Markup.button.callback('بازگشت به پنل', 'backToAdminMenu'),
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
bot.command('remove_admin', async (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    const msg = ctx.message.text.split(' ');
    const id = msg[1];
    const regex = /^\d{9}$/;
    if (regex.test(id)) {
      await removeUser(id).then(() => {
        return ctx.reply(`کاربر  با ایدی ${id} حذف شد`);
      });
    } else {
      return ctx.reply('ایدی داده شده معتبر نیست');
    }
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
///////////////////////////////////////////////user commands////////////////////////////////////////////////////
//queue a post
bot.hears('🆕 پست جدید', async (ctx) => {
  if (findUser(ctx.chat.id)) {
    ctx.reply(
      'مانند مثال زیر پست خود را بفرستید \n \n /post {تکست مورد نظر}',
      Markup.inlineKeyboard([
        Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
      ])
    );
  } else {
    return ctx.reply(
      'شما دسترسی به این بخش ندارید.\n \n @AragoN_PSN برای خرید'
    );
  }
});

bot.action('🆕 پست جدید', async (ctx) => {
  if (findUser(ctx.chat.id)) {
    ctx.editMessageText(
      'مانند مثال زیر پست خود را بفرستید \n \n /post {تکست مورد نظر}',
      Markup.inlineKeyboard([
        Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
      ])
    );
  } else {
    return ctx.reply(
      'شما دسترسی به این بخش ندارید.\n \n @AragoN_PSN برای خرید'
    );
  }
});
bot.command('post', async (ctx) => {
  if (findUser(ctx.chat.id)) {
    const msg = ctx.message.text;
    //remove /post from text
    const words = msg.split(' ');
    words.shift();
    const post = words.join(' ');
    // insert post to user's file
    const dataToSave = {
      post: post,
    };
    const filePath = `${__dirname}/db/${ctx.chat.id}.json`;
    const jsonString = JSON.stringify(dataToSave, null, 2);
    fs.writeFileSync(filePath, jsonString);
    return ctx.reply(dataToSave).then(() => {
      ctx.reply(
        'پست مورد نظر به کاربر صف اضافه شد.\n \n /start برای شروع مجدد'
      );
    });
  } else {
    return ctx.reply(
      'شما دسترسی به این بخش ندارید.\n \n @AragoN_PSN برای خرید'
    );
  }
});
////////////////////////////////////////////////
//info about bot
bot.hears('🤖 درباره بات', (ctx) => {
  ctx.reply(
    'این تکست درباره این باته',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});
bot.action('🤖 درباره بات', (ctx) => {
  ctx.editMessageText(
    'این تکست درباره این باته',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});
/////////////////////////////////////////////////////////////////////////////////////////////////
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
  if (isAdmin(ctx.chat.id)) {
    return ctx.editMessageText(
      'به منوی اصلی بازگشتید',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🆕 پست جدید', '🆕 پست جدید'),
          Markup.button.callback('🤖 درباره بات', '🤖 درباره بات'),
        ],
        [Markup.button.callback('💎 پنل ادمین', '💎 پنل ادمین')],
      ])
    );
  } else {
    return ctx.editMessageText(
      'به منوی اصلی بازگشتید',
      Markup.inlineKeyboard([
        Markup.button.callback('🆕 پست جدید', '🆕 پست جدید'),
        Markup.button.callback('🤖 درباره بات', '🤖 درباره بات'),
      ])
    );
  }
});

////////////////Start the bot////////////////////////////
bot.launch().then(() => {
  console.log('Bot started');
});

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////functions///////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

function findUser(userId) {
  try {
    return users.includes(userId);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createUser(id) {
  try {
    const userId = Number(id);
    fs.readFile(usersFile, (err, data) => {
      const jsonData = JSON.parse(data);
      if (!jsonData.user_ids.includes(userId)) {
        // Add the new user ID to the array
        jsonData.user_ids.push(userId);
        // Write the updated data back to the file
        fs.writeFile(
          usersFile,
          JSON.stringify(jsonData, null, 2),
          'utf8',
          (err) => {
            if (err) {
              console.log(err);
              return flase;
            }
          }
        );
        console.log(`user with id of ${userId} added to database.`);
        return true;
      } else {
        console.log(`already was a user with id ${userId} in database.`);
        return false;
      }
    });
  } catch (error) {
    console.error(`Error in creating user ID to JSON : ${error.message}`);
    return false;
  }
}

async function removeUser(id) {
  try {
    const userId = Number(id);
    fs.readFile(usersFile, (err, data) => {
      const jsonData = JSON.parse(data);
      // Check if the user ID exists
      const index = jsonData.user_ids.indexOf(userId);
      if (index !== -1) {
        // Remove the user ID from the array
        jsonData.user_ids.splice(index, 1);
        // Write the updated data back to the file
        fs.writeFileSync(
          usersFile,
          JSON.stringify(jsonData, null, 2),
          'utf8',
          (err) => {
            if (err) {
              console.log(err);
              return flase;
            }
          }
        );
        console.log(
          `User ID ${userId} has been successfully removed from the JSON file.`
        );
        return true;
      } else {
        console.log(`User ID ${userId} does not exist in the JSON file.`);
        return false;
      }
    });
  } catch (error) {
    console.error(
      `Error removing user ID from the JSON file: ${error.message}`
    );
    return false;
  }
}

function isAdmin(id) {
  return id === admin || dev ? true : false;
}
