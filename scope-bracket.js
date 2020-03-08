const COMMENTS = [
  { type: 'comment-single-line', start: '//', end: '\n '},
  { type: 'comment-block', start: '/*', end: '*/' }
]
const STRINGS = [
  { type: 'single-quotes', start: '\'', end: '\'' },
  { type: 'double-quotes', start: '"', end: '"' },
  { type: 'template-literal', start: '`', end: '`' }
]
const BLOCKS = [
  { type: 'round', start: '(', end: ')' },
  { type: 'curly', start: '{', end: '}' },
  { type: 'square', start: '[', end: ']' },
  { type: 'angle', start: '<', end: '>' }
]
const ALL = COMMENTS.concat(STRINGS, BLOCKS);
const NEW_LINE = '\n';

function match(token, line, position) {
  return {
    token,
    line,
    position
  }
}
function pair(type, from, to) {
  return {
    type,
    from: [ from.line, from.position ],
    to: [ to.line, to.position ]
  }
}

function findScope(code, line, position) {
  
}
function analyze(code) {
  let line = 1;
  let stack = [];
  let finds = [];
  let starters = ALL.reduce((res, token) => {
    res[token.start] = token;
    return res;
  }, {});
  let enders = ALL.reduce((res, token) => {
    res[token.end] = token;
    return res;
  }, {});
  

  for(let position = 0; position < code.length; position++) {
    const char = code[position];
    const nextChar = code[position + 1];
    const starter = starters[char] || starters[char + nextChar] || null;
    const ender = enders[char] || enders[char + nextChar] || null;

    // if (starter) console.log(starter.type, stack.length, `ender=${!!ender}`);

    if (char === NEW_LINE) {
      line += 1;
    } else {
      if (stack.length > 0) {
        if (ender) {
          // console.log('     ', ender.type, stack[stack.length - 1].token.type);
          if (ender.type === stack[stack.length - 1].token.type) {
            const s = stack.pop();
            // console.log(stack);
            finds.push(
              pair(
                ender.type,
                { line: s.line, position: s.position },
                { line: line, position: position + 1 }
              )
            )
          } else if (starter !== null) {
            stack.push(match(starter, line, position + 1));  
          }
        } else if (starter !== null) {
          stack.push(match(starter, line, position + 1));
        }
      } else {
        if (starter !== null) {
          stack.push(match(starter, line, position + 1));
        }
      }
    }
  }

  return finds;
}

module.exports = {
  analyze,
  findScope
}