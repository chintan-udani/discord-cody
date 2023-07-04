// const { ThreadData } = require("../models/db");
// const axios = require("axios");
// // Function to check if the thread ID is stored in the schema
// module.exports = async function checkThreadInSchema(
//   message,
//   threadId,
//   content
// ) {
//   try {
//     console.log(content);
//     const response = await ThreadData.findOne({ threadId });

//     if (response) {
//       console.log("Match found in schema:");
//       const apiKey = response.key;
//       const conversation_id = response.responseData.id;
//       const apiUrl = "https://getcody.ai/api/v1/messages";

//       const requestData = {
//         content: content,
//         conversation_id: conversation_id,
//       };

//       const responsess = await axios.post(apiUrl, requestData, {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//       });

//       message.channel.send(responsess.data.data.content);
//       //   thread.send(responseformessage.data.data.content);
//     }
//   } catch (error) {
//     message.channel.send("Ohh Something Went Wrong");
//   }
// };

// // Usage example

const { ThreadData } = require("../models/db");
const axios = require("axios");

module.exports = async function checkThreadInSchema(
  message,
  threadId,
  content
) {
  try {
    const response = await ThreadData.findOne({ threadId });

    if (response) {
      const apiKey = response.key;
      const conversation_id = response.responseData.id;
      const apiUrl = "https://getcody.ai/api/v1/messages";
      const requestData = {
        content: content,
        conversation_id: conversation_id,
      };

      // Make the HTTP request
      const responseArray = await Promise.all([
        axios.post(apiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const responsess = responseArray[0];
      message.channel.send(responsess.data.data.content);
    }
  } catch (error) {
    message.channel.send("Oops, something went wrong");
  }
};
