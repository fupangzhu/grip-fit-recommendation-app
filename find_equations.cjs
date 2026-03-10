const fs = require('fs');

const content = fs.readFileSync('docx_content.txt', 'utf8');
const lines = content.split('\n');

let output = '';
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('y=') || line.includes('方程') || line.includes('拟合曲线')) {
        output += `Line ${i + 1}: ${line.trim()}\n`;
    }
}
fs.writeFileSync('equations_output.txt', output);
