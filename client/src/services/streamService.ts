interface StreamClassificationResponse {
  success: boolean;
  data?: {
    streamId: number;
    streamName: string;
    matchedRule: string;
    subjectIds: number[];
  };
  error?: string;
  details?: string;
}

interface Stream {
  id: number;
  name: string;
  description?: string;
}

interface StreamsResponse {
  success: boolean;
  data: Stream[];
}

class StreamService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  }

  /**
   * Classify subjects to determine the stream
   */
  async classifySubjects(subjectIds: number[]): Promise<StreamClassificationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/streams/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectIds }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error classifying subjects:', error);
      return {
        success: false,
        error: 'Failed to classify subjects',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all available streams
   */
  async getAllStreams(): Promise<StreamsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/streams`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching streams:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Quick validation using URL parameters
   */
  async validateSubjectCombination(subjectId1: number, subjectId2: number, subjectId3: number): Promise<StreamClassificationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/streams/validate/${subjectId1}/${subjectId2}/${subjectId3}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating subjects:', error);
      return {
        success: false,
        error: 'Failed to validate subjects',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const streamService = new StreamService();
export type { StreamClassificationResponse, Stream, StreamsResponse };