const COMMENTS = [
  ['//', '\n'],
  ['/*', '*/']
]
const STRINGS = [
  ['\'', '\''],
  ['"', '"'],
  ['`', '`']
]
const NEW_LINE = '\n';

function findScope(code, line, position) {
  
}
function analyze(code) {
  let line = 1;
  for(let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === NEW_LINE) {
      line += 1;
    }
  }
  return {
    lines: line
  }
}

module.exports = {
  analyze,
  findScope
}