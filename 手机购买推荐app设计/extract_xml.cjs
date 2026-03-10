const fs = require('fs');
const xml = fs.readFileSync('temp_docx/word/document.xml', 'utf8');
const text = xml.replace(/<[^>]+>/g, '');
fs.writeFileSync('xml_text.txt', text);
