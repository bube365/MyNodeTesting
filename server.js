const express = require("express");
const { VertexAI } = require("@google-cloud/vertexai");
const path = require("path"); // Import path module

// Replace with your project ID and location
const projectId = "gemini-ai-423208";
const location = "us-central1";

// Replace with your deployed model name
const modelName = "gemini-1.5-flash-preview-0514"; // Full model resource name (e.g., projects/your-project-id/locations/us-central1/models/your-model-name)

const vertexAI = new VertexAI({ project: projectId, location });
const generativeModel = vertexAI.preview.getGenerativeModel({
  model: modelName,
});

const app = express();
const port = process.env.PORT || 5001; // Use environment variable for deployment flexibility

app.use(express.json()); // Parse incoming JSON data

// Serve the HTML file for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generate-text", async (req, res) => {
  const { textPrompt } = req.body; // Extract prompt from request body

  if (!textPrompt) {
    return res.status(400).json({ error: "Missing text prompt" }); // Handle missing prompt
  }

  try {
    const request = {
      contents: [{ text: textPrompt }], // Provide prompt data
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    const generatedText = [];

    for await (const item of streamingResp.stream) {
      generatedText.push(item.text);
    }

    const aggregatedResponse = await streamingResp.response; // Potential additional response data

    res.json({ generatedText, ...aggregatedResponse }); // Return combined response
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" }); // Handle errors
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
