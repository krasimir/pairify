const CATEGORY_COMMENT = 'comment';
const CATEGORY_STRING = 'string';
const CATEGORY_BLOCK = 'block';
const COMMENTS = [
  { type: 'comment-single-line', start: '//', end: '\n ', category: CATEGORY_COMMENT },
  { type: 'comment-block', start: '/*', end: '*/', category: CATEGORY_COMMENT }
]
const STRINGS = [
  { type: 'single-quotes', start: '\'', end: '\'', category: CATEGORY_STRING },
  { type: 'double-quotes', start: '"', end: '"', category: CATEGORY_STRING },
  { type: 'template-literal', start: '`', end: '`', category: CATEGORY_STRING }
]
const BLOCKS = [
  { type: 'round', start: '(', end: ')', category: CATEGORY_BLOCK },
  { type: 'curly', start: '{', end: '}', category: CATEGORY_BLOCK },
  { type: 'square', start: '[', end: ']', category: CATEGORY_BLOCK },
  { type: 'angle', start: '<', end: '>', category: CATEGORY_BLOCK }
]
const ALL = COMMENTS.concat(STRINGS, BLOCKS);
const NEW_LINE = '\n';

function match(token, line, position, cursor) {
  return {
    token,
    line,
    position,
    cursor
  }
}
function pair(type, from, to, body) {
  return {
    type,
    from: [ from.line, from.position ],
    to: [ to.line, to.position ],
    body: [body[0], body[1] - body[0]]
  }
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
  
  let position = 0;
  for(let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = code[i - 1];
    const starter = starters[char] || starters[char + nextChar] || null;
    const ender = enders[char] || enders[char + nextChar] || null;

    if (char === NEW_LINE) {
      // searching for a single line comment closing
      for(let j = stack.length-1; j >= 0; j--) {
        if (stack[j].token.type === 'comment-single-line') {
          const s = stack[j];
          stack.splice(j);
          finds.push(
            pair(
              'comment-single-line',
              { line: s.line, position: s.position },
              { line: line, position: position + 1 },
              [s.cursor, i + 1]
            )
          );
          break;
        }
      }
      line += 1;
      position = 0;

    } else {
      position += 1;
      if (stack.length > 0) {
        if (ender) {
          let foundInStack = false;
          let inStringOrComment = false;
          // walking back the stack
          for(let j = stack.length-1; j >= 0; j--) {
            if (
              stack[j].token.category === CATEGORY_COMMENT ||
              stack[j].token.category === CATEGORY_STRING
            ) {
              inStringOrComment = true;
            }
            // This is a patch for the cases where we have a fat arrow
            // as a JSX attribute. For example:
            // <button onClick={() => setCount(count + 1)}>
            if (ender.type === 'angle' && prevChar === '=') {
              break;
            }
            if (ender.type === stack[j].token.type) {
              foundInStack = true;
              if (ender.category === CATEGORY_BLOCK && inStringOrComment) {
                break;
              }
              const s = stack[j];
              stack.splice(j);
              // registering a result
              finds.push(
                pair(
                  ender.type,
                  { line: s.line, position: s.position },
                  { line: line, position: position + ender.end.length },
                  [s.cursor, i + 1]
                )
              );
              break;
            }
          }
          if (!foundInStack && starter !== null) {
            stack.push(match(starter, line, position, i));  
          }
        } else if (starter !== null) {
          stack.push(match(starter, line, position, i));
        }
      } else {
        if (starter !== null) {
          stack.push(match(starter, line, position, i));
        }
      }
    }
  }

  return finds;
}

function matchPairs(code, line, position) {
  return analyze(code)
    .filter(pair => {
      if (line > pair.from[0] && line < pair.to[0]) {
        return true;
      } else if (pair.from[0] === pair.to[0] && pair.from[0] === line) {
        return position > pair.from[1] && position <= pair.to[1];
      } else if (line === pair.from[0]) {
        return position >= pair.from[1];
      } else if (line === pair.to[0]) {
        return position < pair.to[1];
      }
      return false;
    })
}

module.exports = {
  analyze,
  match: matchPairs
}