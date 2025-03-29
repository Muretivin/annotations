// types/annotation.ts

/**
 * Types of annotations supported in the document viewer
 * 
 */


export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}



export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight';
  color: string;
  content: string;
}

export interface UnderlineAnnotation extends BaseAnnotation {
  type: 'underline';
  color: string;
  content: string;
}

export interface StrikeThroughAnnotation extends BaseAnnotation {
  type: 'strike-through';
  color: string;
  content: string;
}

export interface TextBoxAnnotation extends BaseAnnotation {
  type: 'textbox';
  text: string;
  color: string;
  fontSize?: number;
}

export interface CommentAnnotation extends BaseAnnotation {
  type: 'comment';
  text: string;
  resolved?: boolean;
  replies?: Array<{
    text: string;
    author: string;
    createdAt: string;
  }>;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  path: string;
  authorName: string;
}

export type AnnotationType = 
  | 'highlight' 
  | 'underline' 
  | 'comment' 
  | 'signature'
  | 'textbox'
  | 'strike-through'
  | 'freehand-drawing'
  | 'rectangle'
  | 'ellipse';

/**
 * Base properties shared by all annotations
 */

interface BaseAnnotation {
  /** Unique identifier for the annotation */
  id: string;
  
  /** Type of annotation */
  type: AnnotationType;
  
  /** Page number where the annotation appears (1-based index) */
  page: number;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last modification timestamp */
  updatedAt?: string;
  
  /** Author/user who created the annotation */
  author?: string;
  
  /** Position and dimensions of the annotation */
//   rect: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   };
position:Position
}
/**
 * Text highlight annotation
 */
export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight';
  
  /** Highlight color in hex format */
  color: string;
  
  /** Text content that was highlighted */
  content: string;
  position: Position;
  
  /** Character range start offset in the document text */
//   startOffset: number;
  
  /** Character range end offset in the document text */
//   endOffset: number;
}

/**
 * Text underline annotation
 */
export interface UnderlineAnnotation extends BaseAnnotation {
  type: 'underline';
  
  /** Underline color in hex format */
  color: string;
  
  /** Text content that was underlined */
  content: string;
  position: Position;
  
  /** Character range start offset */
//   startOffset: number;
  
  /** Character range end offset */
//   endOffset: number;
}

/**
 * Strike-through annotation
 */
export interface StrikeThroughAnnotation extends BaseAnnotation {
  type: 'strike-through';
  
  /** Strike-through color */
  color: string;
  
  /** Text content */
  content: string;
  position: Position;
  
  /** Character range */
  startOffset: number;
  endOffset: number;
}

/**
 * Comment/note annotation
 */
export interface CommentAnnotation extends BaseAnnotation {
  type: 'comment';
  
  /** Comment text content */
  text: string;
  
  /** Resolved status */
  resolved?: boolean;
  position: Position;
  
  /** Replies to this comment */
  replies?: Array<{
    text: string;
    author: string;
    createdAt: string;
  }>;
}

/**
 * Signature annotation
 */
export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  
  /** SVG path data for the signature */
  path: string;
  
  /** Signature color */
  color?: string;
  position: Position;
  
  /** Signature author name */
  authorName: string;
}

/**
 * Freehand drawing annotation
 */
export interface FreehandDrawingAnnotation extends BaseAnnotation {
  type: 'freehand-drawing';
  
  /** SVG path data */
  path: string;
  
  /** Stroke color */
  color: string;
  position: Position;
  
  /** Stroke width */
  strokeWidth: number;
}

/**
 * Text box annotation
 */
export interface TextBoxAnnotation extends BaseAnnotation {
  type: 'textbox';
  
  /** Text content */
  text: string;
  position: Position;
  
  /** Text color */
  color: string;
  
  /** Background color */
  backgroundColor?: string;
  
  /** Font size */
  fontSize?: number;
  
  /** Font family */
  fontFamily?: string;
}

/**
 * Rectangle shape annotation
 */
export interface RectangleAnnotation extends BaseAnnotation {
  type: 'rectangle';
  
  /** Stroke color */
  color: string;
  
  /** Stroke width */
  strokeWidth: number;
  position: Position;
  
  /** Fill color */
  fillColor?: string;
  
  /** Border style */
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Ellipse shape annotation
 */
export interface EllipseAnnotation extends BaseAnnotation {
  type: 'ellipse';
  
  /** Stroke color */
  color: string;
  position: Position;
  
  /** Stroke width */
  strokeWidth: number;
  
  /** Fill color */
  fillColor?: string;
}

/**
 * Union type representing all possible annotation types
 */
export type Annotation = 
  | HighlightAnnotation
  | UnderlineAnnotation
  | CommentAnnotation
  | SignatureAnnotation
  | TextBoxAnnotation
  | StrikeThroughAnnotation
  | FreehandDrawingAnnotation
  | RectangleAnnotation
  | EllipseAnnotation;

/**
 * Filter criteria for annotations
 */
export interface AnnotationFilter {
  type?: AnnotationType;
  page?: number;
  author?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  resolved?: boolean;
}

/**
 * Annotation creation payload
 */
export interface CreateAnnotationPayload {
  type: AnnotationType;
  page: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
  content?: string;
  text?: string;
  path?: string;
  author?: string;
}

/**
 * Annotation update payload
 */
export interface UpdateAnnotationPayload {
  id: string;
  updates: Partial<Omit<Annotation, 'id' | 'type' | 'page' | 'createdAt'>>;
}
