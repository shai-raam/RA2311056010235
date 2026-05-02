export interface Message {
  id: number;
  title: string;
  message: string;
  read: boolean;
}

export interface NewMessagePayload {
  title: string;
  message: string;
}
