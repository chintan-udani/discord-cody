
const axios = require("axios");
const { ApiKey } = require("../models/db");

async function getBots(guildId) {
  try {
    const apiKeyEntry = await ApiKey.findOne({ guildId });

    if (!apiKeyEntry) {
      throw new Error("API key not found for the guild ID.");
    }

    const apiKey = apiKeyEntry.key;

    const response = await axios.get("https://getcody.ai/api/v1/bots", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 200) {
      return response.data.data; // Return the bot list
    } else {
      throw new Error("Failed to get bots. Status: " + response.status);
    }
  } catch (error) {
    console.error("Error occurred while getting bots:", error);
    throw error;
  }
}

module.exports = getBots;



