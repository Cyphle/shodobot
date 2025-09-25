export interface LeannSearchResult {
  id: string;
  title: string;
  content: string;
  url?: string;
  score: number;
  metadata?: {
    file_path?: string;
    file_type?: string;
    page_number?: number;
    [key: string]: any;
  };
}

export interface LeannSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface LeannAskOptions {
  question: string;
  context_limit?: number;
  temperature?: number;
}

export interface LeannAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}
