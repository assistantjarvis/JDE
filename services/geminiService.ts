// Fix: Import `Content` type to correctly model conversation history.
import { GoogleGenAI, GenerateContentResponse, Part, Content,FunctionCall } from '@google/genai';
import { JournalEntry, JournalCategory } from '../types';
import { SYSTEM_INSTRUCTION, ADD_JOURNAL_ENTRY, GET_JOURNAL_ENTRIES } from '../constants';

const tools = [{ functionDeclarations: [ADD_JOURNAL_ENTRY, GET_JOURNAL_ENTRIES] }];

export interface ProcessedResponse {
  // Fix: The chat history should be an array of `Content` objects, not `Part` objects.
  newHistory: Content[];
  newJournal: JournalEntry[];
  responseText: string;
}

export async function processUserMessage(
  userMessage: string,
  // Fix: The chat history parameter is an array of `Content` objects.
  chatHistory: Content[],
  journal: JournalEntry[]
): Promise<ProcessedResponse> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Fix: `contents` must be of type `Content[]` to represent the conversation.
  const contents: Content[] = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

  let response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      tools,
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  const call = response.functionCalls?.[0];

  if (call) {
    let functionResult: { [key: string]: any };
    let newJournal = [...journal];
    const modelResponsePart = response.candidates?.[0]?.content;
    if (!modelResponsePart) {
      throw new Error("Invalid response from model");
    }

    if (call.name === 'addJournalEntry') {
      const { category, content } = call.args as { category: JournalCategory, content: string };
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        category,
        content,
        timestamp: new Date(),
      };
      newJournal.push(newEntry);
      functionResult = { success: true, message: `Added '${content}' to ${category.toLowerCase()}.` };
    } else if (call.name === 'getJournalEntries') {
      const { category, keywords } = call.args as { category?: JournalCategory, keywords?: string[] };
      let filteredEntries = [...journal];
      if (category) {
        filteredEntries = filteredEntries.filter(entry => entry.category === category);
      }
      if (keywords && keywords.length > 0) {
        filteredEntries = filteredEntries.filter(entry =>
          keywords.some(keyword => entry.content.toLowerCase().includes(keyword.toLowerCase()))
        );
      }
      functionResult = { entries: filteredEntries.map(e => ({ content: e.content, category: e.category })) };
    } else {
      functionResult = { error: 'Unknown function call' };
    }

    const functionResponsePart: Part = {
      functionResponse: {
        name: call.name,
        response: functionResult,
      },
    };
    
    // Fix: The function response `Part` must be wrapped in a `Content` object with role 'tool'
    // to maintain a valid `Content[]` array for the conversation history.
    const toolResponseContent: Content = {
      role: 'tool',
      parts: [functionResponsePart]
    };
    
    const contentsWithFunctionResponse = [...contents, modelResponsePart, toolResponseContent];
    
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsWithFunctionResponse,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return {
      newHistory: [...contentsWithFunctionResponse, response.candidates![0].content],
      newJournal,
      responseText: response.text,
    };
  } else {
    return {
      newHistory: [...contents, response.candidates![0].content],
      newJournal: journal,
      responseText: response.text,
    };
  }
}
