import fs from "fs";
import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate caption from an image
async function generateCaption(imagePath) {
  try {
    // Read image as base64
    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

    // Send request to OpenAI
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Generate a short, descriptive caption for this image." },
            { type: "input_image", image_url: `data:image/jpeg;base64,${imageData}`},
          ],
        },
      ],
    });

    // Extract the generated caption
    const caption = response.output_text;
    console.log("Generated caption:", caption);

  } catch (error) {
    console.error("Error generating caption:", error);
  }
}

// Example usage
generateCaption("./image.png");

