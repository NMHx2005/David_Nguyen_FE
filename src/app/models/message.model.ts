export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  username: string; // For quick access
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageCreation {
  content: string;
  channelId: string;
}

export interface MessageUpdate {
  content: string;
}
