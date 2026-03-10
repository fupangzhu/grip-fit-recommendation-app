const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extract() {
    const parse = typeof pdfParse === 'function' ? pdfParse : pdfParse.default || pdfParse.pdfParse;
    let pdfText = '';
    try {
        const pdfBuffer = fs.readFileSync('F:/毕业设计/手机购买推荐app设计/1011-手机手感最佳人因设计参考手册.pdf');
        const pdfData = await parse(pdfBuffer);
        pdfText = pdfData.text;
    } catch (e) {
        console.error('Error extracting pdf:', e);
    }

    fs.writeFileSync('F:/毕业设计/手机购买推荐app设计/extracted_pdf.txt', pdfText);
    console.log('Extraction complete.');
}

extract();
