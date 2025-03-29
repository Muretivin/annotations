'use client';

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ColorPicker } from './ui/color-picker';
import { ToolButton } from './ui/tool-button';
import { Icons } from './ui/icons';
import { Annotation, AnnotationType, CommentAnnotation, HighlightAnnotation, SignatureAnnotation, StrikeThroughAnnotation, TextBoxAnnotation, UnderlineAnnotation } from '@/lib/annotations';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  file: File;
  annotations: Annotation[];
  comments: CommentAnnotation[];
  activeTool: AnnotationType | null;
  activeColor: string;
  setActiveTool: (tool: AnnotationType | null) => void;
  setActiveColor: (color: string) => void;
  onAddAnnotation: (annotation: Annotation) => void;
  onAddComment: (comment: CommentAnnotation) => void;
  onUpdateAnnotation: (id: string, update: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  onPageChange?: (page: number) => void;
}

const DocumentViewer = forwardRef<HTMLDivElement, DocumentViewerProps>(
  (
    {
      file,
      annotations,
      comments,
      activeTool,
      activeColor,
      setActiveTool,
      setActiveColor,
      onAddAnnotation,
      onAddComment,
      onUpdateAnnotation,
      onDeleteAnnotation,
      onPageChange,
    },
    ref
  ) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signaturePath, setSignaturePath] = useState<{path: string; points: {x: number; y: number}[]}>({path: '', points: []});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [textBoxContent, setTextBoxContent] = useState('');
    const [isAddingTextBox, setIsAddingTextBox] = useState(false);
    const [textBoxPosition, setTextBoxPosition] = useState({ x: 0, y: 0 });
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
    }, []);

    const onDocumentLoadError = useCallback((error: Error) => {
      console.error('PDF load error:', error);
      setError('Failed to load PDF. Please try another file.');
      setIsLoading(false);
    }, []);

    useEffect(() => {
      if (onPageChange) {
        onPageChange(pageNumber);
      }
    }, [pageNumber, onPageChange]);

    // Handle text selection for text-based annotations
    const handleTextSelection = useCallback(() => {
      if (!activeTool || !['highlight', 'underline', 'strike-through'].includes(activeTool)) return;

      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0 || !pdfContainerRef.current) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();

      const annotationBase = {
        id: `anno-${Date.now()}`,
        color: activeColor,
        position: {
          x: rect.x - containerRect.x,
          y: rect.y - containerRect.y,
          width: rect.width,
          height: rect.height,
          pageNumber: pageNumber,
        },
        content: selection.toString(),
        createdAt: new Date().toISOString(),
      };

      switch (activeTool) {
        case 'highlight':
          onAddAnnotation({ ...annotationBase, type: 'highlight' } as HighlightAnnotation);
          break;
        case 'underline':
          onAddAnnotation({ ...annotationBase, type: 'underline' } as UnderlineAnnotation);
          break;
        case 'strike-through':
          onAddAnnotation({ ...annotationBase, type: 'strike-through' } as StrikeThroughAnnotation);
          break;
      }

      selection.removeAllRanges();
    }, [activeTool, activeColor, pageNumber, onAddAnnotation]);

    // Signature drawing handlers
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeTool !== 'signature' || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setSignaturePath({
        path: `M${x},${y}`,
        points: [{x, y}]
      });
      setIsDrawing(true);
    }, [activeTool]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSignaturePath(prev => ({
        path: `${prev.path} L${x},${y}`,
        points: [...prev.points, {x, y}]
      }));
    }, [isDrawing]);

    const handleCanvasMouseUp = useCallback(() => {
      if (!isDrawing || !signaturePath.points.length || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      // Calculate bounding box of the signature
      const minX = Math.min(...signaturePath.points.map(p => p.x));
      const maxX = Math.max(...signaturePath.points.map(p => p.x));
      const minY = Math.min(...signaturePath.points.map(p => p.y));
      const maxY = Math.max(...signaturePath.points.map(p => p.y));

      const signatureAnnotation: SignatureAnnotation = {
        id: `sig-${Date.now()}`,
        type: 'signature',
        page: pageNumber,
        position: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageNumber: pageNumber,
        },
        path: signaturePath.path,
        authorName: 'User',
        createdAt: new Date().toISOString(),
      };

      onAddAnnotation(signatureAnnotation);
      setIsDrawing(false);
      setSignaturePath({path: '', points: []});
    }, [isDrawing, signaturePath, pageNumber, onAddAnnotation]);

    // Render signature on canvas
    useEffect(() => {
      if (!canvasRef.current || !signaturePath.path) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match displayed size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      const path = new Path2D(signaturePath.path);
      ctx.stroke(path);
    }, [signaturePath]);

    // Text box creation
    const handleAddTextBox = useCallback((e: React.MouseEvent) => {
      if (activeTool !== 'textbox' || !pdfContainerRef.current || !pageRef.current) return;

      const pageRect = pageRef.current.getBoundingClientRect();
      setTextBoxPosition({
        x: e.clientX - pageRect.left,
        y: e.clientY - pageRect.top,
      });
      setIsAddingTextBox(true);
    }, [activeTool]);

    const saveTextBox = useCallback(() => {
      if (!textBoxContent.trim()) {
        setIsAddingTextBox(false);
        return;
      }

      const textBoxAnnotation: TextBoxAnnotation = {
        id: `textbox-${Date.now()}`,
        type: 'textbox',
        text: textBoxContent,
        color: activeColor,
        position: {
          x: textBoxPosition.x,
          y: textBoxPosition.y,
          width: 200,
          height: 100,
          pageNumber: pageNumber,
        },
        createdAt: new Date().toISOString(),
        page: pageNumber
      };

      onAddAnnotation(textBoxAnnotation);
      setIsAddingTextBox(false);
      setTextBoxContent('');
    }, [textBoxContent, textBoxPosition, pageNumber, activeColor, onAddAnnotation]);

    // Comment handling
    const handleAddComment = useCallback((e: React.MouseEvent) => {
      if (activeTool !== 'comment' || !pdfContainerRef.current || !pageRef.current) return;

      const pageRect = pageRef.current.getBoundingClientRect();
      setTextBoxPosition({
        x: e.clientX - pageRect.left,
        y: e.clientY - pageRect.top,
      });
      setEditingCommentId(`comment-${Date.now()}`);
    }, [activeTool]);

    const saveComment = useCallback(() => {
      if (!commentText.trim()) {
        setEditingCommentId(null);
        return;
      }

      const commentAnnotation: CommentAnnotation = {
        id: editingCommentId || `comment-${Date.now()}`,
        type: 'comment',
        text: commentText,
        position: {
          x: textBoxPosition.x,
          y: textBoxPosition.y,
          width: 32,
          height: 32,
          pageNumber: pageNumber,
        },
        createdAt: new Date().toISOString(),
        page: pageNumber
      };

      onAddComment(commentAnnotation);
      setEditingCommentId(null);
      setCommentText('');
    }, [commentText, textBoxPosition, pageNumber, editingCommentId, onAddComment]);

    // Focus textarea when adding text/comment
    useEffect(() => {
      if ((isAddingTextBox || editingCommentId) && textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, [isAddingTextBox, editingCommentId]);

    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-2 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <ToolButton
              active={activeTool === 'highlight'}
              onClick={() => setActiveTool('highlight')}
              title="Highlight"
              variant={activeTool === 'highlight' ? 'default' : 'ghost'}
        
              
            >
              <Icons.Highlight className="w-5 h-5" />
            </ToolButton>
            <ToolButton
              active={activeTool === 'underline'}
              onClick={() => setActiveTool('underline')}
              title="Underline"
              variant={activeTool === 'underline' ? 'default' : 'ghost'}
            >
              <Icons.Underline className="w-5 h-5" />
            </ToolButton>
            <ToolButton
              active={activeTool === 'strike-through'}
              onClick={() => setActiveTool('strike-through')}
              title="Strike Through"
              variant={activeTool === 'strike-through' ? 'default' : 'ghost'}
            >
              <Icons.StrikeThrough className="w-5 h-5" />
            </ToolButton>
            <ToolButton
              active={activeTool === 'textbox'}
              onClick={() => setActiveTool('textbox')}
              title="Add Text"
              variant={activeTool === 'textbox' ? 'default' : 'ghost'}
            >
              <Icons.Text className="w-5 h-5" />
            </ToolButton>
            <ToolButton
              active={activeTool === 'signature'}
              onClick={() => setActiveTool('signature')}
              title="Add Signature"
              variant={activeTool === 'signature' ? 'default' : 'ghost'}
            >
              <Icons.Signature className="w-5 h-5" />
            </ToolButton>
            <ToolButton
              active={activeTool === 'comment'}
              onClick={() => setActiveTool('comment')}
              title="Add Comment"
              variant={activeTool === 'comment' ? 'default' : 'ghost'}
            >
              <Icons.Comment className="w-5 h-5" />
            </ToolButton>
            <ColorPicker value={activeColor} onChange={setActiveColor} />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                disabled={scale <= 0.5}
              >
                <Icons.ZoomOut className="w-5 h-5" />
              </Button>
              <span className="text-sm font-medium w-12 text-center dark:text-black">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                disabled={scale >= 2}
              >
                <Icons.ZoomIn className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
              >
                <Icons.ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm font-medium dark:text-black">
                Page {pageNumber} of {numPages || '--'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
                disabled={pageNumber >= (numPages || 1)}
              >
                <Icons.ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 relative overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-red-500">
              {error}
            </div>
          ) : (
            <div
              className="h-full overflow-auto"
              ref={pdfContainerRef}
              onMouseUp={['highlight', 'underline', 'strike-through'].includes(activeTool || '') ? handleTextSelection : undefined}
              onClick={activeTool === 'textbox' ? handleAddTextBox : activeTool === 'comment' ? handleAddComment : undefined}
            >
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="flex items-center justify-center h-full">Loading PDF...</div>}
                error={<div className="flex items-center justify-center h-full text-red-500">Failed to load PDF</div>}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">Loading page...</div>
                ) : (
                  <div ref={pageRef}>
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      width={800}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      loading={<div className="flex items-center justify-center h-full">Rendering page...</div>}
                    />
                  </div>
                )}
              </Document>

              {/* Signature canvas */}
              {activeTool === 'signature' && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto"
                  style={{
                    top: 0,
                    left: 0,
                    zIndex: 10,
                  }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              )}

              {/* Annotation overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {annotations
                  .filter(ann => ann.position.pageNumber === pageNumber)
                  .map(annotation => (
                    <AnnotationComponent
                      key={annotation.id}
                      annotation={annotation}
                      onUpdate={onUpdateAnnotation}
                      onDelete={onDeleteAnnotation}
                    />
                  ))}

                {comments
                  .filter(comment => comment.position.pageNumber === pageNumber)
                  .map(comment => (
                    <CommentMarker
                      key={comment.id}
                      comment={comment}
                      isActive={editingCommentId === comment.id}
                      onClick={() => setEditingCommentId(comment.id)}
                    />
                  ))}
              </div>

              {/* Text box input */}
              {isAddingTextBox && (
                <div
                  className="absolute bg-white border border-blue-300 shadow-lg rounded p-2 pointer-events-auto"
                  style={{
                    left: `${textBoxPosition.x}px`,
                    top: `${textBoxPosition.y}px`,
                    width: '200px',
                    zIndex: 20,
                  }}
                >
                  <Textarea
                    ref={textAreaRef}
                    value={textBoxContent}
                    onChange={(e) => setTextBoxContent(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full h-24 resize-none"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingTextBox(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveTextBox}>
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Comment input */}
              {editingCommentId && (
                <div
                  className="absolute bg-white border border-blue-300 shadow-lg rounded p-2 pointer-events-auto"
                  style={{
                    left: `${textBoxPosition.x}px`,
                    top: `${textBoxPosition.y}px`,
                    width: '250px',
                    zIndex: 20,
                  }}
                >
                  <Textarea
                    ref={textAreaRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter comment..."
                    className="w-full h-24 resize-none"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveComment}>
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

DocumentViewer.displayName = 'DocumentViewer';

interface AnnotationComponentProps {
  annotation: Annotation;
  onUpdate: (id: string, update: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
}

const AnnotationComponent = ({
  annotation,
  onUpdate,
  onDelete,
}: AnnotationComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`absolute ${isHovered ? 'z-10' : ''}`}
      style={{
        left: `${annotation.position.x}px`,
        top: `${annotation.position.y}px`,
        width: `${annotation.position.width}px`,
        height: `${annotation.position.height}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {annotation.type === 'highlight' && (
        <div
          className="w-full h-full opacity-50"
          style={{ backgroundColor: annotation.color }}
        />
      )}
      {annotation.type === 'underline' && (
        <div
          className="w-full absolute bottom-0"
          style={{ borderBottom: `2px solid ${annotation.color}` }}
        />
      )}
      {annotation.type === 'strike-through' && (
        <div
          className="w-full absolute top-1/2"
          style={{ 
            borderBottom: `2px solid ${annotation.color}`,
            transform: 'translateY(-50%)'
          }}
        />
      )}
      {annotation.type === 'textbox' && (
        <div 
          className="bg-white border border-gray-300 p-2 rounded shadow-sm pointer-events-auto"
          style={{ 
            color: annotation.color,
          }}
        >
          <div className="text-sm">{annotation.text}</div>
          {isHovered && (
            <div className="absolute -top-3 -right-3 flex space-x-1">
              <button
                className="p-1 bg-white rounded-full shadow"
                onClick={() => onDelete(annotation.id)}
              >
                <Icons.Trash className="w-3 h-3 text-red-500" />
              </button>
            </div>
          )}
        </div>
      )}
      {annotation.type === 'signature' && (
        <svg
          className="w-full h-full pointer-events-auto"
          viewBox={`0 0 ${annotation.position.width} ${annotation.position.height}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          <path
            d={annotation.path}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isHovered && (
            <foreignObject x={annotation.position.width - 24} y={0} width={24} height={24}>
              <button
                className="p-1 bg-white rounded-full shadow"
                onClick={() => onDelete(annotation.id)}
              >
                <Icons.Trash className="w-3 h-3 text-red-500" />
              </button>
            </foreignObject>
          )}
        </svg>
      )}
    </div>
  );
};

interface CommentMarkerProps {
  comment: CommentAnnotation;
  isActive: boolean;
  onClick: () => void;
}

const CommentMarker = ({
  comment,
  isActive,
  onClick,
}: CommentMarkerProps) => {
  return (
    <div 
      className={`absolute ${isActive ? 'z-10' : ''}`}
      style={{
        left: `${comment.position.x}px`,
        top: `${comment.position.y}px`,
      }}
      onClick={onClick}
    >
      <div className={`w-4 h-4 rounded-full cursor-pointer ${isActive ? 'bg-blue-600' : 'bg-blue-500'}`} />
      {isActive && (
        <div className="absolute left-5 top-0 bg-white border border-gray-300 p-3 rounded shadow-lg min-w-[200px] pointer-events-auto">
          <div className="text-sm">{comment.text}</div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;