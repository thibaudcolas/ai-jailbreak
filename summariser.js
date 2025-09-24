import 'dotenv/config'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import * as process from 'process'

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required')
  process.exit(1)
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function extractRecipeFromHtml() {  
  try {
    const htmlPath = path.join(process.cwd(), 'index.html')
    
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ index.html not found in current directory')
      process.exit(1)
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8')
    
    const recipe = await analyzeHtmlForRecipe(htmlContent)
    
    const outputPath = path.join(process.cwd(), 'extracted-recipe.txt')
    fs.writeFileSync(outputPath, recipe)
    
    console.log(`\x1b[1m\x1b[32mRecipe extracted!\x1b[0m`)
    console.log(`Saved to: \x1b[3m\x1b[90m${outputPath}\x1b[0m`)
    
  } catch (error) {
    console.error('❌ Failed to extract recipe:', error.message)
    process.exit(1)
  }
}

async function analyzeHtmlForRecipe(htmlContent) {
  const systemPrompt = `You are a recipe extraction expert. Analyze the provided HTML content and extract the recipe information.

Extract and format:
- Recipe title
- Ingredients list (with quantities)
- Step-by-step instructions
- Any additional notes (prep time, cook time, servings, etc.)

Present the recipe in a clean, readable format that someone could easily follow to cook the dish.`

  const userPrompt = `HTML Content:
${htmlContent}`

  try {
    console.log('Extracting the recipe...')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })

    const extractedRecipe = response.choices[0]?.message?.content

    if (!extractedRecipe) {
      throw new Error('No recipe content returned from AI')
    }

    return extractedRecipe

  } catch (error) {
    console.error('❌ AI analysis failed:', error.message)
    throw error
  }
}

await extractRecipeFromHtml()
