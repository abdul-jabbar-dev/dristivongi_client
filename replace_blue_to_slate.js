const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('/home/abdul-jabbar/Desktop/dymmy_civic_rights/client/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Regex to match Tailwind blue color utility classes
  const regex = /([a-z:-]*)(bg|text|border|ring|fill|stroke|from|to|via)-blue-([0-9]{2,3}(\/[0-9]{1,3})?)/g;
  
  const newContent = content.replace(regex, (match, prefix, type, shade) => {
    return `${prefix}${type}-slate-${shade}`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
