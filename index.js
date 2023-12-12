require('dotenv').config();
const fs = require('fs/promises');
const fsSync = require('fs');
const { Telegraf, Markup } = require('telegraf');
const cron = require('node-cron');
const schedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');
const bot = new Telegraf(process.env.BOT_TOKEN);
const usersFile = `${__dirname}/db/users.json`;
const admin = '97960068'; // aragon : 97960068 || bot : 353804646:AAGAowZxCdj2BOl-CYkskyj0CNucBYzbCVg
const dev = '308694790';
const channelId = '@testpsn123';
const { promisify } = require('util');
const delay = promisify(setTimeout);
const delayTimeOut = 15; //seconds

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
      Markup.keyboard([['🆕 پست جدید', '🤖 درباره بات'], ['💎 پنل آراگون']])
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
bot.hears('💎 پنل آراگون', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    return ctx.reply(
      'شما وارد پنل ادمین شدید : \n',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
          Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
        ],
        [Markup.button.callback('لیست ادمین ها', 'list-admin-tmp')],
        [Markup.button.callback('خروج', 'backToMainMenu')],
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
bot.action('💎 پنل آراگون', (ctx) => {
  if (isAdmin(ctx.chat.id)) {
    return ctx.editMessageText(
      'شما وارد پنل ادمین شدید : \n',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
          Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
        ],
        [Markup.button.callback('لیست ادمین ها', 'list-admin-tmp')],
        [Markup.button.callback('خروج', 'backToMainMenu')],
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
//show admins
bot.action('list-admin-tmp', async (ctx) => {
  const admins = await findAll();
  if (isAdmin(ctx.chat.id)) {
    ctx.editMessageText(
      `لیست ادمین ها :  \n \n ${admins}`,
      Markup.inlineKeyboard([
        Markup.button.callback('بازگشت به پنل', 'backToAdminMenu'),
      ])
    );
  } else {
    return ctx.reply('شما به این کامند دسترسی ندارید');
  }
});
///////////////////////////////////////////////user commands////////////////////////////////////////////////////
//queue a post
bot.hears('🆕 پست جدید', async (ctx) => {
  if (await findUser(ctx.chat.id)) {
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
  if (await findUser(ctx.chat.id)) {
    ctx.editMessageText(
      'مانند مثال زیر پست خود را بفرستید و لطفا در محتوای پستتون دقت کنید \n \n /post {تکست مورد نظر}',
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
  if (await findUser(ctx.chat.id)) {
    //get user data
    let userData = await getUserData(ctx.chat.id);
    userData.posts = userData.posts || [];
    const count = userData.posts.length;
    if (count >= 50) {
      return ctx.reply('به محدودیت رسیدید (50 پست)');
    }
    const filePath = `${__dirname}/db/${ctx.chat.id}.json`;
    const msg = ctx.message.text;
    //remove /post from text
    const words = msg.split(' ');
    words.shift();
    const newPost = words.join(' ');
    // insert post to user's file
    const dataToSave = {
      postId: uuidv4(),
      post: newPost,
      displayed: false,
      time: Date.now(),
    };
    userData.posts.push(dataToSave);
    const jsonString = JSON.stringify(userData, null, 2);
    await fs.writeFile(filePath, jsonString);
    try {
      return ctx.reply(
        `پست مورد نظر به صف کاربر اضافه شد.\n
         ایدی پست : ${dataToSave.postId}\n
         محتوای پست : ${dataToSave.post}\n
          تعداد پست ها : ${count + 1}/50\n
         /start برای شروع مجدد`
      );
    } catch (error) {
      console.error(error);
      return ctx.reply('فرستادن پست به مشکل خورد.\n\n/start برای شروع مجدد');
    }
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
    '🔘 پیامرسان کانال PSNCLUB برای راحتیه هرچه تمام کاربران در پیدا کردن محصول خود و همینطور ادمین ها میباشد',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});
bot.action('🤖 درباره بات', (ctx) => {
  ctx.editMessageText(
    '🔘 پیامرسان کانال PSNCLUB برای راحتیه هرچه تمام کاربران در پیدا کردن محصول خود و همینطور ادمین ها میباشد',
    Markup.inlineKeyboard([
      Markup.button.callback('بازگشت به منو', 'backToMainMenu'),
    ])
  );
});
/////////////////////////////////////////////////////////////////////////////////////////////////
// Back to Admin Main Menu
bot.action('backToAdminMenu', (ctx) => {
  ctx.editMessageText(
    'شما وارد پنل ادمین شدید : \n',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('ادمین جدید', 'add-admin-tmp'),
        Markup.button.callback('حذف ادمین', 'remove-admin-tmp'),
      ],
      [Markup.button.callback('لیست ادمین ها', 'list-admin-tmp')],
      [Markup.button.callback('خروج', 'backToMainMenu')],
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
        [Markup.button.callback('💎 پنل آراگون', '💎 پنل آراگون')],
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
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////schedule///////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

const midnightJob = schedule.scheduleJob('0 0 * * *', async () => {
  try {
    // Delete all messages in the specified channel
    const data = await readMessageIds();
    const users = await findAll();
    for (const id of data) {
      await bot.telegram.deleteMessage(channelId, id).then((done, err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    for (const userId of users) {
      await fs.writeFile(
        `${__dirname}/db/${userId}.json`,
        JSON.stringify({ posts: [] }, null, 2)
      );
    }
    await fs.writeFile(
      `${__dirname}/db/messages.json`,
      JSON.stringify([], null, 2)
    );
    // Send a new message to the channel
    await bot.telegram.sendMessage(channelId, 'چنل ریست شد');
  } catch (error) {
    console.error('Error:', error);
  }
});

let dayJob;
dayJob = schedule.scheduleJob('0 9 * * *', async () => {
  const currentHour = new Date().getHours();
  const currentDate = new Date().getUTCDate();
  try {
    if (currentHour < 22) {
      try {
        sendPosts();
        await bot.telegram.sendMessage(
          dev,
          `فعالیت بات اغاز شد \n ساعت : ${currentHour} \n تاریخ : ${currentDate} `
        );
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.log('It is after 11 pm. Stopping the scheduled job.');
      dayJob.cancel();
      await bot.telegram.sendMessage(
        dev,
        `فعالیت بات به پایان رسید شد \n ساعت : ${currentHour} \n تاریخ : ${currentDate} `
      );
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

////////////////Start the bot////////////////////////////
bot.launch();

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////////////functions///////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

async function findAll() {
  try {
    const data = await fs.readFile(usersFile, 'utf8');
    const jsonData = JSON.parse(data);
    const users = jsonData.user_ids;
    return users;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function findUser(id) {
  const userId = Number(id);
  try {
    const data = await fs.readFile(usersFile, 'utf8');
    const jsonData = JSON.parse(data);
    const users = jsonData.user_ids;
    return users.includes(userId);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createUser(id) {
  try {
    const userId = Number(id);
    const data = await fs.readFile(usersFile);
    const jsonData = JSON.parse(data);
    if (!jsonData.user_ids.includes(userId)) {
      // Add the new user ID to the array
      jsonData.user_ids.push(userId);
      // Write the updated data back to the file
      await fs.writeFile(
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
      await fs.writeFile(`${__dirname}/db/${userId}.json`, '', 'utf8');
      console.log(`user with id of ${userId} added to database.`);
      return true;
    } else {
      console.log(`already was a user with id ${userId} in database.`);
      return false;
    }
  } catch (error) {
    console.error(`Error in creating user ID to JSON : ${error.message}`);
    return false;
  }
}

async function removeUser(id) {
  try {
    const userId = Number(id);
    const data = await fs.readFile(usersFile);
    const jsonData = JSON.parse(data);
    // Check if the user ID exists
    const index = jsonData.user_ids.indexOf(userId);
    if (index !== -1) {
      // Remove the user ID from the array
      jsonData.user_ids.splice(index, 1);
      // Write the updated data back to the file
      await fs.writeFile(
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
      await fs.unlink(`${__dirname}/db/${userId}.json`);
      console.log(
        `User ID ${userId} has been successfully removed from the JSON file.`
      );
      return true;
    } else {
      console.log(`User ID ${userId} does not exist in the JSON file.`);
      return false;
    }
  } catch (error) {
    console.error(
      `Error removing user ID from the JSON file: ${error.message}`
    );
    return false;
  }
}

function isAdmin(id) {
  if (id == admin || id == dev) {
    return true;
  } else {
    return false;
  }
}

async function getUserData(id) {
  try {
    const userId = Number(id);
    const data = await fs.readFile(`${__dirname}/db/${userId}.json`);
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.log(err);
    return {};
  }
}

async function readMessageIds() {
  try {
    const fileContent = await fs.readFile(
      `${__dirname}/db/messages.json`,
      'utf-8'
    );
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error(`Error reading message ids ${userId}: ${error.message}`);
    return [];
  }
}

async function sendPosts() {
  try {
    const messages = await readMessageIds();

    while (true) {
      const userIDs = await findAll();

      let postsExist = false;

      for (const userId of userIDs) {
        const userData = await getUserData(userId);

        const postsToSend = userData.posts
          .filter((post) => !post.displayed)
          .slice(0, 2);

        if (postsToSend.length > 0) {
          postsExist = true;

          for (const post of postsToSend) {
            const mId = await bot.telegram.sendMessage(
              '@testpsn123',
              post.post,
              {}
            );
            messages.push(mId.message_id);
            post.displayed = true;
          }

          await fs.writeFile(
            `${__dirname}/db/${userId}.json`,
            JSON.stringify(userData, null, 2)
          );
          await fs.writeFile(
            `${__dirname}/db/messages.json`,
            JSON.stringify(messages, null, 2)
          );
          await sleep(delayTimeOut * 1000);
        } else {
          console.log(`No post to send for user ${userId}`);
          await fs.writeFile(
            `${__dirname}/db/${userId}.json`,
            JSON.stringify(userData, null, 2)
          );
        }
      }

      if (!postsExist) {
        console.log('No posts to send. Waiting for a while...');
        await sleep(delayTimeOut * 1000);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
