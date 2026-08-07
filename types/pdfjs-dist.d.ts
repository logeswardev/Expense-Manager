declare module 'pdfjs-dist/build/pdf' {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(source: { data: Uint8Array }): { promise: Promise<{ numPages: number; getPage(pageNumber: number): Promise<{ getTextContent(): Promise<{ items: { str?: string; transform: number[] }[] }> }> }> };
}
