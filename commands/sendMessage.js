const axios = require("axios");
const { ApiKey, Response, ThreadData } = require("../models/db");

module.exports = async function sendMessage(interaction, content) {
  try {
    // Retrieve the necessary data from the database
    const apiKeyData = await ApiKey.findOne({});
    const responseData = await Response.findOne({});

    if (!apiKeyData) {
      throw new Error("API key not found.");
    }

    if (!responseData || responseData.channelId !== interaction.channel.id) {
      await interaction.reply("Please select a bot first.");
      return;
    }

    const apiKey = apiKeyData.key;
    const botId = responseData.data.bot_id;

    const apiUrl = "https://getcody.ai/api/v1/conversations";
    const requestData = {
      name: "test",
      bot_id: botId,
    };

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });



    if (responseData && responseData.channelId === interaction.channelId) {
      // Create a new thread within the interaction
      const threadData = {
        name: "New Thread",
        auto_archive_duration: 60,
        parentId: interaction.id,
      };

      // await interaction.reply("Thread generated");
      const thread = await interaction.channel.threads.create(threadData);
   

      // Store thread ID and response data in the database
      const threadDataEntry = new ThreadData({
        key: apiKey,
        threadId: thread.id,
        responseData: response.data.data,
      });
      await threadDataEntry.save();

      const apiUrlformessage = "https://getcody.ai/api/v1/messages";

      const requestDataformessage = {
        content: content,
        conversation_id: response.data.data.id,
      };

      const responseformessage = await axios.post(
        apiUrlformessage,
        requestDataformessage,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      thread.send(responseformessage.data.data.content);
    } else {
      // Reply in the interaction to select a bot first
      // await interaction.reply("Please select a bot first.");
      return "Please Select a bot ";
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
