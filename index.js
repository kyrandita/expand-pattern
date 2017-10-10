
function StringToken(val){
  this.value = val;
}
function StartToken(){}
function EndToken(){}
function ColonToken(){}
function CommaToken(){}

function SetObject(...args){
  this.setThings = args;
}
function RangeObject(startString, endString, step = 1, characterSet){
  this.start = startString;
  this.end = endString;
  this.step = step;
  this.set = characterSet;
}
function NumericRangeObject(startString, endString, step = 1, base = 10){
  this.start = startString;
  this.end = endString;
  this.step = step;
  this.base = base;
}
function Context(tokens){
  this[Symbol.iterator] = function(){return this;};
  Object.defineProperty(this, 'tokens', {get: function(){return tokens;}});
  this.next = function(){
    return {
      value:tokens[this.curIndex++],
      done: tokens.length < this.curIndex
    };
  };
  this.peek = function(){return tokens[this.curIndex];};
  this.curIndex = 0;
}

function tokenize(pattern) {
  let runningString = '';
  let tokenList = [];
  for(let char of pattern) {
    // console.log(char);
  }
  //return tokenList;
  //TODO preferrably the array should contain correctly typed tokens, meaning we'll likely have to make all the relevant types
  return [new StringToken('str'), new StartToken(), new StringToken('1'), new ColonToken(':'), new StringToken('3'), new CommaToken(','), new StringToken('4'), new EndToken('}'), new StringToken('ing')];
}

function parse(context){
  //This code was done before tokenize was split into it's own function and will be rewritten to work with the output of tokenize
  let processArray = [];
  let state = Symbol.for('string');
  for(let token of context) {
    if(token instanceof StringToken) {
      processArray.push(token.value);
    } else if(token instanceof StartToken) {
      processArray.push(parseRange(context));
    }
  }
  return new SetObject(...processArray);
};

function parseRange(context) {
  let firstToken = context.next().value;
  if (firstToken instanceof StartToken){
    firstToken = parseRange(context);
  }
  let secondToken = context.next().value;
  if (secondToken instanceof CommaToken) {
    let setPieces = [firstToken];
    for(let token of context) {
      if(token instanceof StartToken) {
        setPieces.push(parseRange(context));
      } else if (token instanceof StringToken) {
        setPieces.push(token.value);
      } else if (token instanceof EndToken) {
        return SetObject(...setPieces);
      }
    }
  } else if (secondToken instanceof ColonToken) {
    let rangeStart = firstToken.value, rangeEnd = null, stepChar = null, numericBase = 10;
    let tempToken = context.next();
    let numeric = false;
    if(tempToken.done || !tempToken.value instanceof StringToken) {
      throw 'ERROR: range must have at least beginning and end of range';
    }
    rangeEnd = tempToken.value.value;
    tempToken = context.next();
    if(tempToken.done) {
      throw 'error';
    }
    if(tempToken.value instanceof ColonToken) {
      tempToken = context.next();
      if(tempToken.done || !tempToken.value instanceof StringToken) {
        throw 'error';
      }
      stepChar = rangeEnd;
      rangeEnd = tempToken.value.value;
      tempToken = context.next();
    }
    if(tempToken.done) {
      throw 'error';
    }
    if(tempToken.value instanceof CommaToken) {
      numeric = true;
      tempToken = context.next();
      if(tempToken.done || !tempToken.value instanceof StringToken) {
        throw 'error';
      }
      numericBase = Number.parseInt(tempToken.value.value);
      tempToken = context.next();
    }
    if (tempToken.done || !tempToken.value instanceof EndToken) {
      throw 'error';
    }
    if(numeric || Number.parseFloat(rangeStart).toString(numericBase) == rangeStart && Number.parseFloat(rangeEnd).toString(numericBase) == rangeEnd) {
      let step = stepChar? Math.abs(Number.parseFloat(rangeStart) - Number.parseFloat(stepChar)) : 1;
      return new NumericRangeObject(Number.parseFloat(rangeStart), Number.parseFloat(rangeEnd), step, numericBase);
    }
    //TODO find set start and end are from, if step check that also
    return new RangeObject();
  } else {
    throw 'bad crap happened';
  }
}

function calc(parseTree) {
  let totalArray = [];
  console.log(parseTree);
  if(!parseTree instanceof SetObject && !parseTree instanceof RangeObject && !parseTree instanceof NumericRangeObject) {
    throw 'error';
  }
  return parseTree;
}

export function expandPattern(pattern) {
    if(pattern.length > 0 && pattern.indexOf('{') > -1) {
      let tokens = calc(parse(new Context(tokenize(pattern))));
      return tokens;
    } else {
      return [pattern];
    }
}
