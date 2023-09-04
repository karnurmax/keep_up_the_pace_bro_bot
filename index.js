require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Bot Token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const MY_GROUP_CHAT_ID = "-1001929477276";

// data structure to keep track of last message time for each user in a chat
const chatUserActivity = {};

bot.on("message", (msg) => {
  console.log(msg);
  const chatId = msg.chat.id;
  if (chatId != MY_GROUP_CHAT_ID || msg.text) return;
  const userId = msg.from.id;

  if (!chatUserActivity[chatId]) {
    chatUserActivity[chatId] = {};
  }

  chatUserActivity[chatId][userId] = Date.now();

  // Your bot logic here
});

// Run a check every day to remove inactive users
setInterval(() => {
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000; // in milliseconds
  const now = Date.now();

  Object.keys(chatUserActivity).forEach((chatId) => {
    const users = chatUserActivity[chatId];

    Object.keys(users).forEach((userId) => {
      if (now - users[userId] > THREE_DAYS) {
        // Remove this user from the chat
        bot
          .kickChatMember(chatId, userId)
          .then(() => {
            console.log(`Removed user ${userId} from chat ${chatId}`);
            delete chatUserActivity[chatId][userId];
          })
          .catch((error) => {
            console.error(
              `Failed to remove user ${userId} from chat ${chatId}`,
              error
            );
          });
      }
    });
  });
}, 24 * 60 * 60 * 1000); // Run this every day
