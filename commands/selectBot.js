const axios = require("axios");
const { ApiKey, Response } = require("../models/db");

module.exports = async function selectBot(interaction) {
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "bot_select"
  ) {
    const selectedOption = interaction.values[0];

    // Find the selected option from the interaction's message component
    const selectedBot =
      interaction.message.components[0].components[0].options.find(
        option => option.value === selectedOption
      );

    if (selectedBot) {
      const botName = selectedBot.label;
      const botId = selectedBot.value;

      await interaction.reply(`You selected bot: ${botName} (ID: ${botId})`);

      const guildId = interaction.guild?.id; // Retrieve the guild ID if available
      const channelId = interaction.channel?.id;

      if (!guildId) {
        await interaction.reply("Guild ID not found.");
        return;
      }

      try {
        // Retrieve the API key from the database based on the guild ID
        const apiKeyData = await ApiKey.findOne({ guildId });

        if (!apiKeyData) {
          await interaction.reply("API key not found for this Guild.");
          return;
        }

        const apiKey = apiKeyData.key;

        const apiUrl = "https://getcody.ai/api/v1/conversations";
        const requestData = {
          name: "string",
          bot_id: botId,
        };

        const response = await axios.post(apiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        // Save the response object in the database
        console.log(response.data.data, channelId);
        await Response.findOneAndUpdate(
          { channelId: channelId },
          { data: response.data.data, channelId: channelId },
          { upsert: true }
        );
        return response.data;
      } catch (error) {
        console.error("API error:", error);
      }
    }
  }

  // Return null if the condition is not met
  return null;
};
