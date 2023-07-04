const { Client, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

const getBots = require("./commands/getBots");
const getcodyToken = require("./commands/getcodyToken");
const selectBot = require("./commands/selectBot");
const sendMessage = require("./commands/sendMessage");
const threadReply = require("./commands/threadReply");

const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//define commands
const commands = [
  {
    name: "getcody-token",
    description: "Fires a curl command with the provided API key",
    options: [
      {
        name: "api_key",
        description: "The API key",
        type: 3, // String type
        required: true,
      },
    ],
  },
  {
    name: "get-bots",
    description: "Get the list of bots",
    options: [], // Add any options specific to the get-bots command
  },
  {
    name: "send-message",
    description: "Send a message to a conversation",
    options: [
      {
        name: "content",
        description: "The content of the message",
        type: 3, // String type
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "9" }).setToken(token);

//registering the slash commands

client.once("ready", async () => {
  try {
    const guilds = await client.guilds.fetch();
    const guildId = guilds.first()?.id;

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("Successfully registered slash commands!");
  } catch (error) {
    console.error("Failed to register slash commands:", error);
  }
});

//Replies to all the slash commands when they are invoked
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "getcody-token") {
    await getcodyToken(interaction);
  }

  //Code to get bots
  if (commandName === "get-bots") {
    const guildId = interaction.guild.id; // Retrieve the Guild ID

    try {
      const botList = await getBots(guildId);
      // console.log(botList.data);

      // Format the bot list for the dropdown menu
      const options = botList.map(bot => ({
        label: bot.name,
        value: bot.id,
      }));

      await interaction.deferReply(); // Defer the reply to the same thread

      await interaction.editReply({
        content: "Here is the list of bots:",
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "bot_select",
                options,
                placeholder: "Select a bot",
              },
            ],
          },
        ],
      });
    } catch (error) {
      await interaction.reply("Failed to retrieve bot list.");
    }
  }
});

client.on("interactionCreate", async interaction => {
  const response = await selectBot(interaction);
});

// client.on("interactionCreate", async interaction => {
//   if (!interaction.isCommand()) return;
//   const { commandName, options } = interaction;
//   if (commandName === "send-message") {
//     try {
//       // Call the sendMessage function with the message content
//       const messageContent = options.getString("content");
//       await sendMessage(interaction, messageContent);

//       // You can perform any additional logic here after sending the message
//     } catch (error) {
//       console.error("Error:", error);
//       await message.reply("An error occurred while sending the message.");
//     }
//   }
// });

client.on("messageCreate", async message => {
  if (message.channel.isThread()) {
    if (message.author.bot === false) {
      // const messg = await sendMessage(message, message.content);
      await threadReply(message,message.channel.id, message.content);
      // await message.channel.send(messg);
    }
  } else if (message.mentions.has(client.user)) {
    await sendMessage(message, message.content);
  }
});

// const threadIdToCheck = '1121696498506276874';
// threadReply(threadIdToCheck);?

client.login(token);
