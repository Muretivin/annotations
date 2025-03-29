'use client';

import { AnnotationType } from '@/lib/annotations';
import { useCallback } from 'react';

interface AnnotationToolbarProps {
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  onExport: () => Promise<void>; // Changed to async
  isLoading: boolean;
  annotations: any[]; // Add your annotation type
  file: File | null; // Add file prop
}

const colors = [
  '#FFEB3B', // Yellow
  '#FF9800', // Orange
  '#F44336', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
];

export default function AnnotationToolbar({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  onExport,
  isLoading,
  annotations,
  file,
}: AnnotationToolbarProps) {
  const handleExport = useCallback(async () => {
    if (!file) return;
    
    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [file, onExport]);
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
          className={`p-2 rounded-md ${activeTool === 'highlight' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
          title="Highlight"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'underline' ? null : 'underline')}
          className={`p-2 rounded-md ${activeTool === 'underline' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
          title="Underline"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'comment' ? null : 'comment')}
          className={`p-2 rounded-md ${activeTool === 'comment' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
          title="Add Comment"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === 'signature' ? null : 'signature')}
          className={`p-2 rounded-md ${activeTool === 'signature' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
          title="Add Signature"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setActiveColor(color)}
            className={`w-6 h-6 rounded-full ${activeColor === color ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
            style={{ backgroundColor: color }}
            title={`Color ${color}`}
          />
        ))}
      </div>

      <div className="ml-auto">
        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading || !file}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : (
            'Export PDF'
          )}
        </button>
      </div>
    </div>
  );
}