const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function extract() {
    try {
        console.log("Extracting DOCX...");
        const docxResult = await mammoth.extractRawText({ path: '手机手感人因实验数据分析报告（杨真）.docx' });
        fs.writeFileSync('docx_content.txt', docxResult.value);
        console.log("DOCX extracted.");

        console.log("Extracting PDF...");
        const pdfDataBuffer = fs.readFileSync('1011-手机手感最佳人因设计参考手册.pdf');
        let pdfFunc = typeof pdf === 'function' ? pdf : pdf.default;
        if (!pdfFunc) {
            console.log("Keys in pdf-parse:", Object.keys(pdf));
            pdfFunc = pdf.pdf;
        }
        if (typeof pdfFunc === 'function') {
            const pdfData = await pdfFunc(pdfDataBuffer);
            fs.writeFileSync('pdf_content.txt', pdfData.text);
            console.log("PDF extracted.");
        } else {
            console.log("Could not find pdf function");
        }
    } catch (e) {
        console.error("Error extracting:", e);
    }
}

extract();
