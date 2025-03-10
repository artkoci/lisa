
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
}

export type CallStatus = 'idle' | 'connecting' | 'active' | 'disconnected' | 'error';

export interface ApiConfig {
  baseUrl: string;
  // Add more API configuration options as needed
}
