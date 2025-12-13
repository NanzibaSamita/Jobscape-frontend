export async function extractTextFromPDF(file: File): Promise<string> {
    if (typeof window === 'undefined') {
        throw new Error('PDF parsing must run in the browser.');
    }

    const pdfjsLib = await import('pdfjs-dist');

    // ✅ Set workerSrc to a known public CDN path
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText.trim();
}
