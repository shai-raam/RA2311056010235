import axios from "axios";
import { Message, NewMessagePayload } from "../types";
import { Log } from "logging_middleware";

const API = "http://localhost:3000";

export async function getMessages(): Promise<Message[]> {
  await Log("frontend", "info", "api", "just fetching all my messages");
  try {
    const response = await axios.get<Message[]>(`${API}/messages`);
    await Log("frontend", "info", "api", `got ${response.data.length} messages back from server`);
    return response.data;
  } catch (error) {
    await Log("frontend", "error", "api", "oops, couldn't get the messages");
    throw error;
  }
}

export async function postMessage(
  payload: NewMessagePayload
): Promise<Message> {
  await Log("frontend", "info", "api", "about to post a new message");
  try {
    const response = await axios.post<Message>(
      `${API}/messages`,
      payload
    );
    await Log("frontend", "info", "api", "new message posted successfully!");
    return response.data;
  } catch (error) {
    await Log("frontend", "error", "api", "failed to post that message");
    throw error;
  }
}

export async function setMessageRead(id: number): Promise<void> {
  await Log("frontend", "info", "api", `marking message ${id} as seen`);
  try {
    await axios.patch(`${API}/messages/${id}`);
    await Log("frontend", "info", "api", `message ${id} is now marked as seen`);
  } catch (error) {
    await Log("frontend", "error", "api", `couldn't mark message ${id} as seen`);
    throw error;
  }
}
