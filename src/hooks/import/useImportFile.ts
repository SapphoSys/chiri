import { useCallback, useState } from 'react';
import { parseIcsFile, parseJsonTasksFile } from '$lib/ical/import';
import { loggers } from '$lib/logger';
import type { ParsedTaskWithStatus } from '$types/task/import';
import type { Task } from '$types/task/model';

const log = loggers.import;

export const useImportFile = () => {
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTaskWithStatus[]>([]);
  const [error, setError] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleFileContent = useCallback((name: string, content: string) => {
    setFileName(name);
    setError('');
    setParseErrors([]);

    let tasks: Partial<Task>[] = [];
    const lowerName = name.toLowerCase();

    try {
      if (lowerName.endsWith('.ics') || lowerName.endsWith('.ical')) {
        tasks = parseIcsFile(content);
      } else if (lowerName.endsWith('.json')) {
        tasks = parseJsonTasksFile(content);
      } else {
        if (content.trim().startsWith('BEGIN:VCALENDAR')) {
          tasks = parseIcsFile(content);
        } else if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
          tasks = parseJsonTasksFile(content);
        } else {
          setError('Unsupported file format. Please use .ics, .ical, or .json files.');
          return;
        }
      }
    } catch (err) {
      log.error('Error parsing file:', err);
      setError('Failed to parse file. The file may be corrupted or in an unsupported format.');
      return;
    }

    if (tasks.length === 0) {
      setError('No tasks found in the file.');
      return;
    }

    setParsedTasks(tasks.map((task) => ({ ...task, importStatus: 'pending' })));
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        const content = await file.text();
        handleFileContent(file.name, content);
      } catch (err) {
        setError('Failed to read file.');
        log.error('Failed to read file:', err);
      }
    },
    [handleFileContent],
  );

  const resetFile = useCallback(() => {
    setParsedTasks([]);
    setFileName('');
    setError('');
    setParseErrors([]);
  }, []);

  return {
    fileName,
    parsedTasks,
    error,
    parseErrors,
    handleFileContent,
    handleFileSelect,
    resetFile,
    setError,
    setParsedTasks,
  };
};
