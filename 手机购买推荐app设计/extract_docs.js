import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function extract() {
    try {
        console.log("Extracting PDF...");
        const pdfDataBuffer = fs.readFileSync('1011-手机手感最佳人因设计参考手册.pdf');
        const pdfData = await pdf(pdfDataBuffer);
        fs.writeFileSync('pdf_content.txt', pdfData.text);
        console.log("PDF extracted.");

        console.log("Extracting DOCX...");
        const docxResult = await mammoth.extractRawText({ path: '手机手感人因实验数据分析报告（杨真）.docx' });
        fs.writeFileSync('docx_content.txt', docxResult.value);
        console.log("DOCX extracted.");
    } catch (e) {
        console.error("Error extracting:", e);
    }
}

extract();
