import { PDFDocument, rgb } from 'pdf-lib';
import { Annotation} from './annotations';

export async function exportAnnotatedPdf(
  originalPdf: File,
  annotations: Annotation[]
): Promise<Blob> {
  try {
    const arrayBuffer = await originalPdf.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Process each annotation
    for (const annotation of annotations) {
      const page = pages[annotation.position.pageNumber - 1];
      const { x, y, width, height } = annotation.position;

      switch (annotation.type) {
        case 'highlight':
          page.drawRectangle({
            x,
            y: page.getHeight() - y - height,
            width,
            height,
            color: rgb(1, 1, 0),
            opacity: 0.4,
          });
          break;

        case 'underline':
          page.drawLine({
            start: { x, y: page.getHeight() - y },
            end: { x: x + width, y: page.getHeight() - y },
            thickness: 1.5,
            color: rgb(0, 0, 1),
          });
          break;

        case 'strike-through':
          page.drawLine({
            start: { x, y: page.getHeight() - y - (height / 2) },
            end: { x: x + width, y: page.getHeight() - y - (height / 2) },
            thickness: 1.5,
            color: rgb(1, 0, 0),
          });
          break;

        case 'textbox':
          page.drawText(annotation.text, {
            x,
            y: page.getHeight() - y,
            size: annotation.fontSize || 12,
            color: rgb(0, 0, 0),
          });
          break;

        case 'comment':
          page.drawRectangle({
            x,
            y: page.getHeight() - y - height,
            width,
            height,
            color: rgb(1, 0, 0),
            opacity: 0.2,
            borderColor: rgb(1, 0, 0),
            borderWidth: 1,
          });
          page.drawText('Comment', {
            x: x + 5,
            y: page.getHeight() - y - 15,
            size: 10,
            color: rgb(0, 0, 0),
          });
          break;

        case 'signature':
          // Signature rendering would be more complex
          // This is a simplified version
          page.drawText('Signature', {
            x,
            y: page.getHeight() - y,
            size: 12,
            color: rgb(0, 0, 0),
          });
          break;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}