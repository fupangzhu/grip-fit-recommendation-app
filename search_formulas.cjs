const fs = require('fs');
const content = fs.readFileSync('F:/毕业设计/手机购买推荐app设计/extracted.txt', 'utf8');

const regex = /y\s*=\s*[-0-9.x\^+]+/gi;
const lines = content.split('\n');
const results = [];

lines.forEach((line, index) => {
    if (line.includes('y=') || line.includes('方程为')) {
        results.push(`Line ${index + 1}: ${line.trim()}`);
    }
});

fs.writeFileSync('F:/毕业设计/手机购买推荐app设计/grep_results.txt', results.join('\n'));
console.log('Done searching extracted.txt! Found ' + results.length + ' results.');
