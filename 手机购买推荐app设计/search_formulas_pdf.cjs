const fs = require('fs');

const contentPdf = fs.readFileSync('F:/毕业设计/手机购买推荐app设计/extracted_pdf2.txt', 'utf8');
const linesPdf = contentPdf.split('\n');
const results = [];

linesPdf.forEach(line => {
    // compact the text by removing all whitespaces and tabs to see it properly
    const compact = line.replace(/\s+/g, '');
    if (compact.includes('y=') || compact.includes('方程') || compact.includes('回归') || compact.includes('R²') || compact.includes('r2')) {
        results.push(compact);
    }
});

fs.writeFileSync('F:/毕业设计/手机购买推荐app设计/grep_results.txt', results.join('\n'));
console.log('Found ' + results.length + ' results in extracted_pdf2.txt');
