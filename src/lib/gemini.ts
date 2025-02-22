import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('PUT-YOUR-API-KEY-HERE');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function detectAIContent(text: string): Promise<boolean> {
  try {
    const prompt = `
      Analyze this text for signs of AI generation. Consider:
      1. Repetitive patterns
      2. Unnatural language structures
      3. Consistent writing style
      4. Technical accuracy without human errors
      5. Lack of personal perspective
      6. Overly formal or mechanical tone
      7. Perfect grammar and punctuation
      8. Generic examples and explanations
      
      Text to analyze:
      "${text}"
      
      Based on these factors, is this text likely AI-generated? Respond with only "true" or "false".
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().toLowerCase().trim();
    
    // Additional heuristic checks
    const indicators = [
      text.length > 200 && !text.includes('I think') && !text.includes('I believe'),
      text.split('.').length > 5 && new Set(text.split('.').map(s => s.trim().length)).size < 3,
      /\b(however|therefore|furthermore|moreover)\b/gi.test(text) && text.length < 300,
      text.split(' ').length > 100 && new Set(text.split(' ')).size / text.split(' ').length < 0.4
    ];
    
    const indicatorScore = indicators.filter(Boolean).length;
    
    return response === 'true' || indicatorScore >= 2;
  } catch (error) {
    console.error('Error detecting AI content:', error);
    return false;
  }
}

export async function checkPlagiarism(text: string): Promise<{ isPlagiarized: boolean; similarity: number }> {
  try {
    // Simplified prompt to ensure consistent JSON response
    const prompt = `You are a plagiarism detection system. Analyze the following text for potential plagiarism and respond ONLY with a valid JSON object in this exact format: {"isPlagiarized":false,"similarity":0.0} where isPlagiarized is a boolean and similarity is a number between 0 and 1.

Text to analyze:
"${text}"`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    try {
      // Clean the response text to ensure it only contains the JSON object
      const cleanedResponse = responseText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const response = JSON.parse(cleanedResponse);
      
      // Validate response structure and types
      if (
        typeof response === 'object' &&
        response !== null &&
        'isPlagiarized' in response &&
        'similarity' in response &&
        typeof response.isPlagiarized === 'boolean' &&
        typeof response.similarity === 'number' &&
        response.similarity >= 0 &&
        response.similarity <= 1
      ) {
        return response;
      }
      
      throw new Error('Invalid response structure');
    } catch (parseError) {
      console.error('Error parsing plagiarism response:', parseError);
      // Fallback to content analysis if JSON parsing fails
      const textIndicators = {
        isPlagiarized: responseText.toLowerCase().includes('plagiarized') || 
                       responseText.toLowerCase().includes('copied'),
        similarity: responseText.toLowerCase().includes('high similarity') ? 0.8 :
                   responseText.toLowerCase().includes('moderate similarity') ? 0.5 :
                   responseText.toLowerCase().includes('low similarity') ? 0.2 : 0
      };
      return textIndicators;
    }
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    return { isPlagiarized: false, similarity: 0 };
  }
}