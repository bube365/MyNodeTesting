const express = require("express");
const cors = require("cors");
const { VertexAI } = require("@google-cloud/vertexai");
const path = require("path");
const multer = require("multer");

const projectId = "vestiaienv"; // Replace with your project ID
const location = "us-central1";
const modelName = "gemini-1.5-flash-001"; // Replace with your model name

const vertexAI = new VertexAI({ project: projectId, location });

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

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Adjust origin if needed

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

async function sendMessage(message) {
  if (!message) {
    throw new Error("Missing content for chat message"); // Improved error handling
  }

  const chat = generativeModel.startChat({});
  const streamResult = await chat.sendMessageStream(message);

  const response = await streamResult.response;
  return response;
}

async function generateContent(audioData, textPrompt) {
  const req = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "audio/mpeg",
              data: audioData,
            },
          },
          {
            text:
              // textPrompt ||
              "Generate transcription from the audio, only extract speech and ignore background audio.",
          },
        ],
      },
    ],
  };

  const streamingResp = await generativeModel.generateContentStream(req);

  for await (const item of streamingResp.stream) {
    process.stdout.write("stream chunk: " + JSON.stringify(item) + "\n");
  }

  const Initresponse = await streamingResp.response;

  // console.log("audiTransc", Initresponse);

  const chat = generativeModel.startChat({});
  const streamResult = await chat.sendMessageStream([
    Initresponse.candidates[0].content.parts[0].text,
  ]);

  const response = await streamResult.response;
  return response;
}

app.post(
  "/generate-multimodal",
  upload.single("document"),
  async (req, res) => {
    const { textPrompt } = req.body;
    console.log("req.body", req.body);

    if (!textPrompt) {
      return res.status(400).json({ error: "Missing text prompt" });
    }

    let documentData;
    // const documentData = req.file ? req.file.buffer.toString("base64") : null;
    if (req.file) {
      documentData = req.file.buffer.toString("base64");
    }

    let audioData;

    if (req.body.audioData) {
      audioData = req.body.audioData;
    }

    try {
      const content = documentData
        ? [
            { inlineData: { mimeType: "application/pdf", data: documentData } },
            { text: textPrompt },
          ]
        : audioData
        ? {
            fileData: {
              mimeType: "audio/mpeg",
              fileUri: audioData,
            },
          }
        : { text: textPrompt };

      console.log("Content to be sent:", content);

      let initialResponse;

      if (req.file) {
        initialResponse = await sendMessage(content);
      } else if (req.body.audioData) {
        initialResponse = await generateContent(audioData, textPrompt);
      } else {
        initialResponse = await sendMessage([content.text]);
      }

      res.json(initialResponse);
      return initialResponse;
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
