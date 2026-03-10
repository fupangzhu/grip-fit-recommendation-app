const fs = require('fs');
const text = fs.readFileSync('xml_text.txt', 'utf8');

const regex = /.{0,50}y\s*=\s*[^，。,]+.{0,50}/g;
const matches = text.match(regex) || [];

let result = `Found ${matches.length} matches for y=...\n`;
for (let i = 0; i < matches.length; i++) {
    result += `Match ${i + 1}: ${matches[i].trim()}\n`;
}

const regex2 = /.{0,50}方程.{0,50}/g;
const matches2 = text.match(regex2) || [];
result += `\nFound ${matches2.length} matches for 方程...\n`;
let uniqueMatches2 = [...new Set(matches2)];
for (let i = 0; i < uniqueMatches2.length; i++) {
    result += `Match ${i + 1}: ${uniqueMatches2[i].trim()}\n`;
}

fs.writeFileSync('matches_output.txt', result);
