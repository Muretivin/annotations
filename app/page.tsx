'use client';

import { useState, useRef } from 'react';
import { Annotation, AnnotationType, CommentAnnotation } from '@/lib/annotations';
import DocumentUploader from './components/DocumentUploader';
import AnnotationToolbar from './components/AnnotationToolbar';
import DocumentViewer from './components/DocumentViewer';
import CommentPanel from './components/CommentPanel';
import { exportAnnotatedPdf } from '@/lib/pdf-export';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [activeColor, setActiveColor] = useState<string>('#FFEB3B');
  const [comments, setComments] = useState<CommentAnnotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnnotations([]);
    setComments([]);
  };

  const handleAddAnnotation = (annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleUpdateAnnotation = (id: string, update: Partial<Annotation>) => {
    setAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, ...update } as Annotation : ann)
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const handleAddComment = (comment: CommentAnnotation) => {
    setComments(prev => [...prev, comment]);
  };

  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateComment = (id: string, text: string) => {
    setComments(prev => 
      prev.map(c => c.id === id ? { ...c, text } : c)
    );
  };

  const handleExport = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const annotatedPdf = await exportAnnotatedPdf(file, [...annotations, ...comments]);
      
      // Trigger download
      const url = URL.createObjectURL(annotatedPdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {!file ? (
        <DocumentUploader onFileUpload={handleFileUpload} />
      ) : (
        <div className="flex flex-col space-y-4">
          <AnnotationToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            onExport={handleExport}
            isLoading={isLoading}
            annotations={annotations}
            file={file}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DocumentViewer
                file={file}
                annotations={annotations}
                comments={comments}
                activeTool={activeTool}
                activeColor={activeColor}
                setActiveTool={setActiveTool}
                setActiveColor={setActiveColor}
                onAddAnnotation={handleAddAnnotation}
                onAddComment={handleAddComment}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                ref={pdfViewerRef}
              />
            </div>
            <CommentPanel 
              comments={comments}
              onDeleteComment={handleDeleteComment}
              onUpdateComment={handleUpdateComment}
            />
          </div>
        </div>
      )}
    </div>
  );
}