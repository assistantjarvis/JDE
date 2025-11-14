import { JournalEntry, JournalCategory } from "../types";
import { UIMessage } from "../types";

export interface ProcessedResponse {
  newHistory: UIMessage[];
  newJournal: JournalEntry[];
  responseText: string;
}

// In-memory journal store (module-scoped server memory simulation)
const inMemoryJournal: JournalEntry[] = [];

function detectCategory(text: string): JournalCategory {
  const t = text.toLowerCase();
  if (
    t.includes("shopping") ||
    t.includes("buy") ||
    t.includes("supermarket") ||
    t.includes("grocery")
  ) {
    return JournalCategory.SHOPPING;
  }
  if (
    t.includes("remind") ||
    t.includes("reminder") ||
    t.includes("remind me")
  ) {
    return JournalCategory.REMINDER;
  }
  if (t.includes("recommend") || t.includes("recommendation")) {
    return JournalCategory.RECOMMENDATION;
  }
  return JournalCategory.NOTE;
}

function looksLikeMath(q: string) {
  // very small heuristic: contains digits and arithmetic operators
  return /\d+\s*[+\-*/]\s*\d+/.test(q) || /calculate|sum|what is \d+/i.test(q);
}

export async function processUserMessage(
  userMessage: string,
  chatHistory: UIMessage[],
  journal: JournalEntry[]
): Promise<ProcessedResponse> {
  // We'll operate on a copy of the provided journal combined with module memory
  const combinedJournal = [...inMemoryJournal, ...journal];

  const newHistory: UIMessage[] = [...chatHistory];
  const userMsg: UIMessage = {
    id: Date.now().toString(),
    role: "user",
    content: userMessage,
  };
  newHistory.push(userMsg);

  // Safeguard against out-of-scope queries (simple rule-based)
  if (
    looksLikeMath(userMessage) ||
    /who|when|where|define|meaning of/i.test(userMessage)
  ) {
    const responseText =
      "I'm only a journaling app. I can't perform calculations or answer general knowledge questions.";
    const modelMsg: UIMessage = {
      id: Date.now().toString() + "-ai",
      role: "model",
      content: responseText,
    };
    newHistory.push(modelMsg);
    return { newHistory, newJournal: combinedJournal, responseText };
  }

  const text = userMessage.toLowerCase();

  // Check for queries about shopping list
  const isShoppingQuery =
    /what\s+is\s+my\s+shopping\s+list|what should i buy|what to buy|shopping list|at the supermarket/i.test(
      userMessage
    );

  if (isShoppingQuery) {
    const items = combinedJournal.filter(
      (e) => e.category === JournalCategory.SHOPPING
    );
    const responseText =
      items.length > 0
        ? `Your shopping list:\n- ${items.map((i) => i.content).join("\n- ")}`
        : "Your shopping list is empty.";

    const modelMsg: UIMessage = {
      id: Date.now().toString() + "-ai",
      role: "model",
      content: responseText,
    };
    newHistory.push(modelMsg);
    return { newHistory, newJournal: combinedJournal, responseText };
  }

  // Detect add intents (simple heuristics)
  const addIntent =
    /(add|put|remember|remind me to|please add)\s+/i.test(userMessage) ||
    /add .* to (my )?(shopping|shopping list)/i.test(userMessage);
  if (addIntent) {
    // Extract a reasonable content for the entry
    // heuristics: look for "add X to my shopping list" or "remind me to X"
    let content = userMessage;
    const matchAddTo = userMessage.match(
      /add\s+(.*?)\s+to\s+(my\s+)?(shopping list|shopping)/i
    );
    if (matchAddTo && matchAddTo[1]) {
      content = matchAddTo[1];
    } else {
      const matchRemind = userMessage.match(/remind me to\s+(.*)/i);
      if (matchRemind && matchRemind[1]) content = matchRemind[1];
    }

    const category = detectCategory(userMessage);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      category,
      content: content.trim(),
      timestamp: new Date(),
    };

    inMemoryJournal.push(newEntry);

    const responseText = `Added '${
      newEntry.content
    }' to ${category.toLowerCase()}.`;
    const modelMsg: UIMessage = {
      id: Date.now().toString() + "-ai",
      role: "model",
      content: responseText,
    };
    newHistory.push(modelMsg);
    return { newHistory, newJournal: inMemoryJournal, responseText };
  }

  // Fallback: treat as a note entry
  const fallbackCategory = detectCategory(userMessage);
  const fallbackEntry: JournalEntry = {
    id: Date.now().toString(),
    category: fallbackCategory,
    content: userMessage.trim(),
    timestamp: new Date(),
  };
  inMemoryJournal.push(fallbackEntry);
  const responseText = `Saved a new ${fallbackCategory.toLowerCase()} entry.`;
  const modelMsg: UIMessage = {
    id: Date.now().toString() + "-ai",
    role: "model",
    content: responseText,
  };
  newHistory.push(modelMsg);

  return { newHistory, newJournal: inMemoryJournal, responseText };
}

export function getJournalInMemory(): JournalEntry[] {
  return [...inMemoryJournal];
}
