
let ExpPatRange = (function(){
  let obj = {};
  obj.prototype = Array;
  return obj;
})();

function tokenize(pattern) {
  //TODO preferrably the array should contain correctly typed tokens, meaning we'll likely have to make all the relevant types
  return pattern;
}

function parse(tokens){
  //This code was done before tokenize was split into it's own function and will be rewritten to work with the output of tokenize
  let processArray = [];
  let tokenList = tokens;
  let currentToken = null;
  while(tokenList.length > 0) {
    let lIndex = tokenList.indexOf('{');
    let rIndex = tokenList.indexOf('}');
    let cIndex = tokenList.indexOf(':');
    if(cIndex < lIndex && lIndex < rIndex) {
      throw 'error';
    }
    if (cIndex > -1 && (rIndex < 0 || cIndex < rIndex) && (lIndex < 0 || cIndex < lIndex)) {
      processArray.push(tokenList.slice(0,cIndex));
      tokenList = tokenList.slice(cIndex+1);
    } else if (lIndex > -1 && (rIndex < 0 || lIndex < rIndex)) {
      processArray.push(tokenList.slice(0,lIndex));
      let subArray = parse(tokenList.slice(lIndex+1));
      tokenList = subArray.pop();
      processArray.push(subArray);
    } else if (rIndex > -1 && (lIndex < 0 || lIndex < rIndex)) {
      processArray.push(tokenList.slice(0,rIndex));
      processArray.push(tokenList.slice(rIndex+1));
      tokenList = '';
    } else {
      processArray.push(tokenList);
      tokenList = '';
    }
  }
  return processArray;
};

function calc(parseTree) {
  return parseTree;
}

export function expandPattern(pattern) {
    if(pattern.length > 0 && pattern.indexOf('{') > -1) {
      let tokens = calc(parse(tokenize(pattern)));
      return tokens;
    } else {
      return pattern;
    }
}
