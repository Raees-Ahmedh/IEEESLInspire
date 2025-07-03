import { useState, useEffect, useCallback } from 'react';
import { streamService, StreamClassificationResponse } from '../services/streamService';

interface UseStreamClassificationResult {
  streamName: string | null;
  streamId: number | null;
  matchedRule: string | null;
  isLoading: boolean;
  error: string | null;
  classifySubjects: (subjectIds: number[]) => Promise<void>;
  clearStream: () => void;
}

export const useStreamClassification = (): UseStreamClassificationResult => {
  const [streamName, setStreamName] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<number | null>(null);
  const [matchedRule, setMatchedRule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifySubjects = useCallback(async (subjectIds: number[]) => {
    // Only classify if we have exactly 3 valid subject IDs
    const validSubjectIds = subjectIds.filter(id => id > 0);
    
    if (validSubjectIds.length !== 3) {
      clearStream();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await streamService.classifySubjects(validSubjectIds);
      
      if (response.success && response.data) {
        setStreamName(response.data.streamName);
        setStreamId(response.data.streamId);
        setMatchedRule(response.data.matchedRule);
      } else {
        setError(response.error || 'Failed to classify subjects');
        clearStreamData();
      }
    } catch (err) {
      setError('Network error occurred');
      clearStreamData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearStreamData = () => {
    setStreamName(null);
    setStreamId(null);
    setMatchedRule(null);
  };

  const clearStream = useCallback(() => {
    clearStreamData();
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    streamName,
    streamId,
    matchedRule,
    isLoading,
    error,
    classifySubjects,
    clearStream
  };
};