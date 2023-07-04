const axios = require("axios");
const { ApiKey } = require("../models/db");
// const ApiKey = require("../models/db");
module.exports = async interaction => {
  const apiKey = interaction.options.getString("api_key");

  if (!apiKey) {
    await interaction.reply("Please provide an API key.");
    return;
  }

  const guildId = interaction.guild.id; //retrives the guild id

  try {
    const existingApiKey = await ApiKey.findOneAndUpdate(
      { guildId: guildId },
      { key: apiKey, guildId: guildId },
      { upsert: true }
    );

    if (existingApiKey) {
      await interaction.reply("API key set Successfully.");
      return;
    }
    

    // Save the API key and guild id to the database
    const savedApiKey = new ApiKey({ key: apiKey, guildId });
    await savedApiKey.save();

    const response = await axios.get("https://getcody.ai/api/v1/bots", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 200) {
      await interaction.reply("Api key set successfully!");
    } else {
      await interaction.reply("Invalid API key.");
    }
  } catch (error) {
    console.log(error);
    await interaction.reply("Error occurred while accessing the API.");
  }
};
