export interface Message {
  id: number;
  title: string;
  message: string;
  read: boolean;
}

export let messages: Message[] = [
  {
    id: 1,
    title: "Getting Started",
    message: "You're all set! Start sharing your thoughts here.",
    read: false,
  },
];
