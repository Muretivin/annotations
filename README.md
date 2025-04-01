first clone the project 
git clone https://github.com/Muretivin/annotations.git
cd annotations 
run the command 
npm install
then run the command 
npm run dev

and navigate to https://localhost 3000


 libraries or tools used and why:
 React-PDF, PDF.js, Canvas API, SVG, React Hooks, TypeScript, Custom UI Components

 The document annotation tool leverages React-PDF and PDF.js for core PDF rendering and text layer support, with custom UI components for the annotation interface. Canvas API and SVG handle freeform drawing and signature annotations, while React hooks manage component state and annotation lifecycle. The application supports multiple annotation types (highlights, underlines, text boxes, comments, and signatures) with TypeScript ensuring type safety. Utility functions handle ID generation, positioning calculations, and timestamp management for a robust annotation workflow.


challenges
conflicts between the libraries which are not compatible
i had to downgrade to the compatible libraries and alse deleting node modules and starting again through npm install


features i would add if i had more time
Cropping, snipping, drag-and-drop tables
Charts, graphs, and embedded analytics
OCR, smart annotation suggestions
CSV, JSON, and API integrations