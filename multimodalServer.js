const { VertexAI } = require("@google-cloud/vertexai");

const projectId = "gemi08";
const location = "us-central1";

// Function to handle multimodal content generation
async function generateMultimodalContent(prompt, documentData) {
  const vertexAI = new VertexAI({ project: projectId, location });

  const modelName = "gemini-1.5-flash-001"; // Update with your actual model name

  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  });

  const chat = generativeModel.startChat({});

  const multimodalContent = [{ text: prompt }];
  if (documentData) {
    multimodalContent.push({ mimeType: "application/pdf", data: documentData });
  }

  async function sendMessage(content) {
    try {
      const streamResult = await chat.sendMessageStream(content);
      const response = await streamResult.response;
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  try {
    for (const content of multimodalContent) {
      await sendMessage(content);
    }

    const summaryResult = await sendMessage({
      text: "Summarize what I have learned from this conversation",
    });
    const generatedText = summaryResult.candidates[0].content.text;

    return generatedText;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Or handle error differently
  } finally {
    // Close chat (optional, consider resource management)
    // await chat.close();
  }
}

module.exports = { generateMultimodalContent };
