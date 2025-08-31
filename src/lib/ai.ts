import { getSettings } from './storage';

export interface AIModel {
  id: string;
  object: string;
  owned_by: string;
}

export interface AIModelsResponse {
  object: string;
  data: AIModel[];
}

export interface AIResponseContent {
  type: string;
  text: string;
  annotations?: any[];
}

export interface AIResponseMessage {
  id: string;
  type: string;
  status: string;
  role: string;
  content: AIResponseContent[];
}

export interface AIResponseUsage {
  input_tokens: number;
  input_tokens_details: Record<string, any>;
  output_tokens: number;
  output_tokens_details: Record<string, any>;
  total_tokens: number;
}

export interface AIResponse {
  id: string;
  object: string;
  created_at: number;
  status: string;
  model: string;
  output: AIResponseMessage[];
  usage: AIResponseUsage;
}

/**
 * Fetches available AI models from the configured endpoint
 * @returns Promise with the list of available models
 */
export async function fetchModels(): Promise<AIModel[]> {
  const settings = await getSettings();
  
  if (!settings.endpoint || !settings.apiKey) {
    throw new Error('API endpoint and key must be configured in settings');
  }
  
  const endpoint = settings.endpoint.endsWith('/') 
    ? `${settings.endpoint}models` 
    : `${settings.endpoint}/models`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as AIModelsResponse;
    return data.data;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw new Error('Failed to fetch available AI models');
  }
}

/**
 * Generates an AI response based on the provided prompt
 * @param prompt The user prompt to send to the AI
 * @param options Additional options for the request
 * @returns Promise with the AI response
 */
export async function generateResponse(
  prompt: string, 
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<AIResponse> {
  const settings = await getSettings();
  
  if (!settings.endpoint || !settings.apiKey || !settings.model) {
    throw new Error('API endpoint, key, and model must be configured in settings');
  }
  
  const endpoint = settings.endpoint.endsWith('/') 
    ? `${settings.endpoint}responses` 
    : `${settings.endpoint}/responses`;
  
  const requestBody = {
    model: settings.model,
    input: prompt,
    instructions: settings.systemPrompt || '',
    max_output_tokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7,
    stream: options.stream || false
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as AIResponse;
    return data;
  } catch (error) {
    console.error('Failed to generate response:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Extracts plain text from an AI response
 * @param response The AI response object
 * @returns The extracted text as a string
 */
export function extractResponseText(response: AIResponse): string {
  try {
    // Check if we have a valid response with output messages
    if (!response || !response.output || !Array.isArray(response.output)) {
      console.error('Invalid AI response format');
      return '';
    }
    
    // Find the first message with content (typically the assistant's message)
    const message = response.output.find(msg => 
      msg && msg.role === 'assistant' && msg.content && Array.isArray(msg.content) && msg.content.length > 0
    );
    
    if (!message || !message.content || message.content.length === 0) {
      console.error('No valid message found in AI response');
      return '';
    }
    
    // Extract text from all content parts
    const textParts = message.content
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text);
    
    return textParts.join('\n');
  } catch (error) {
    console.error('Error extracting text from AI response:', error);
    return '';
  }
}
