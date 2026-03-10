const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extract() {
    let docxText = '';
    try {
        const result = await mammoth.extractRawText({ path: 'F:/毕业设计/手机购买推荐app设计/手机手感人因实验数据分析报告（杨真）.docx' });
        docxText = result.value;
    } catch (e) {
        console.error('Error extracting docx:', e);
    }

    let pdfText = '';
    try {
        const pdfBuffer = fs.readFileSync('F:/毕业设计/手机购买推荐app设计/1011-手机手感最佳人因设计参考手册.pdf');
        const pdfData = await pdfParse(pdfBuffer);
        pdfText = pdfData.text;
    } catch (e) {
        console.error('Error extracting pdf:', e);
    }

    fs.writeFileSync('F:/毕业设计/手机购买推荐app设计/extracted.txt', "--- DOCX ---\n" + docxText + "\n\n--- PDF ---\n" + pdfText);
    console.log('Extraction complete.');
}

extract();
