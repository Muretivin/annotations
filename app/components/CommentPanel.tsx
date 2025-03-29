'use client';

import { useState } from 'react';
import { CommentAnnotation } from '@/lib/annotations';
import { Button } from './ui/button';

interface CommentPanelProps {
  comments: CommentAnnotation[];
  onDeleteComment: (id: string) => void;
  onUpdateComment: (id: string, text: string) => void;
}

export default function CommentPanel({ 
  comments, 
  onDeleteComment,
  onUpdateComment
}: CommentPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEdit = (comment: CommentAnnotation) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSave = (id: string) => {
    onUpdateComment(id, editText);
    setEditingId(null);
  };

  return (
    <div className="w-full md:w-80 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Click on the document to add comments.</p>
      ) : (
        <ul className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {comments.map((comment) => (
            <li key={comment.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSave(comment.id)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-2">{comment.text}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Page {comment.position.pageNumber}</span>
                    <div className="space-x-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(comment)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}