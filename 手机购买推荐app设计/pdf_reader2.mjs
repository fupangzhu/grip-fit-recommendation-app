import fs from 'fs';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("F:/毕业设计/手机购买推荐app设计/extracted_pdf2.txt", pdfParser.getRawTextContent());
    console.log("Extraction complete.");
});

pdfParser.loadPDF("F:/毕业设计/手机购买推荐app设计/1011-手机手感最佳人因设计参考手册.pdf");
