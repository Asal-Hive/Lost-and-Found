import { API_URL } from "../config/api";

export type ChatbotResult = {
  id: number;
  title: string;
  status: "lost" | "found";
  location_name: string;
  score: number;
  link: string; // frontend link (e.g. /items?itemId=123)
};

export async function searchChatbot(query: string, k = 5): Promise<ChatbotResult[]> {
  const url = `${API_URL}/chatbot/search/?q=${encodeURIComponent(query)}&k=${k}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Chatbot search failed: ${res.status}`);
  }
  const data = await res.json();
  return (data?.results || []) as ChatbotResult[];
}
