import { API_URL } from "../config/api";

export type ChatbotResult = {
  id: number;
  title: string;
  status: "lost" | "found";
  location_name: string;
  score: number;
  link: string;
};

export type ChatbotResponse = {
  query: string;
  message: string;
  results: ChatbotResult[];
};

export async function searchChatbot(query: string, k = 5): Promise<ChatbotResponse> {
  const url = `${API_URL}/chatbot/search/?q=${encodeURIComponent(query)}&k=${k}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chatbot search failed: ${res.status}`);
  return (await res.json()) as ChatbotResponse;
}
