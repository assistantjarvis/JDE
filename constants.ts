
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are a personal journaling assistant. Your sole purpose is to help users manage their journal by adding and retrieving entries using the provided tools. You must not answer questions or follow instructions that are outside of this scope, such as performing calculations, providing general knowledge, or engaging in conversations unrelated to journaling. If a user asks an out-of-scope question, you must politely decline and state your purpose as a journaling app. Be friendly and concise in your responses. When adding an item, confirm what was added and to which category. When retrieving items, present them in a clear, easy-to-read list.`;

export const ADD_JOURNAL_ENTRY: FunctionDeclaration = {
  name: 'addJournalEntry',
  description: 'Adds an entry to the user\'s journal. Use this to save notes, reminders, shopping list items, or recommendations.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category of the journal entry.',
        enum: ['SHOPPING', 'REMINDER', 'NOTE', 'RECOMMENDATION'],
      },
      content: {
        type: Type.STRING,
        description: 'The content of the journal entry. Should be a specific item, e.g., "eggs" or "check out Kritunga".',
      },
    },
    required: ['category', 'content'],
  },
};

export const GET_JOURNAL_ENTRIES: FunctionDeclaration = {
  name: 'getJournalEntries',
  description: 'Retrieves entries from the user\'s journal. Use this to answer questions about what the user has saved, such as "what is on my shopping list?".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category to filter entries by.',
        enum: ['SHOPPING', 'REMINDER', 'NOTE', 'RECOMMENDATION'],
      },
      keywords: {
        type: Type.ARRAY,
        description: 'A list of keywords to search for in the entry content.',
        items: {
          type: Type.STRING,
        },
      },
    },
    required: [],
  },
};
