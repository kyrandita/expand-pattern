
function StringToken(val){
  this.value = val;
}
function StartToken(){}
function EndToken(){}
function ColonToken(){}
function CommaToken(){}

function SetObject(...args) {
  this.setThings = args;
  this.calc = function calc() {
    console.log('SET OBJECT', this.setThings);

    return this.setThings.reduce(function(leftSide,val){
      let rightSide = val;
      if(rightSide instanceof SetObject || rightSide instanceof RangeObject || rightSide instanceof NumericRangeObject) {
        rightSide = rightSide.calc();
      } else {
        rightSide = [rightSide];
      }
      return leftSide.concat(rightSide);
    },[]);
  }
}
function ExpandPatternObject(...args) {
  this.setThings = args;
  this.calc = function calc() {
    console.log('EP OBJECT');
    let startArray = [];
    if(this.setThings[0] instanceof RangeObject || this.setThings[0] instanceof NumericRangeObject || this.setThings[0] instanceof SetObject) {
      startArray.concat(this.setThings[0].calc());
    }else {
      startArray.push(this.setThings[0]);
    }

    return this.setThings.slice(1).reduce(function(leftSide,val){
      let rightSide = val;
      if(rightSide instanceof SetObject || rightSide instanceof RangeObject || rightSide instanceof NumericRangeObject) {
        rightSide = rightSide.calc();
      } else {
        rightSide = [rightSide];
      }
      let intermediate = [];
      for(let i of leftSide) {
        for(let j of rightSide) {
          intermediate.push(i+j);
        }
      }
      return intermediate;
    },startArray);
  }
}
let SETS = [new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's','t','u','v','w','x','y','z'])];
function RangeObject({startString, endString, step = 1, characterSet=null}){
  if(characterSet === null) {
    for (let set of SETS) {
      if(set.has(startString) && set.has(endString)) {
        this.set = [...set.values()];
        break;
      }
    }
    if(this.set === undefined) {
      throw 'error';
    }
  } else {
    this.set = characterSet;
  }
  this.start = this.set.indexOf(startString);
  this.end = this.set.indexOf(endString);
  if(this.set.indexOf(step) < 0) {
    //step is numeric or invalid
    if (typeof step == 'number') {
      this.step = (this.start < this.end) ? Math.abs(step) : -Math.abs(step);
    } else {
      //maybe try parsing as number?
      console.log(typeof step, step);
      throw 'error in numeric type';
    }
  } else {
    this.step = (this.start < this.end) ? Math.abs(this.set.indexOf(step) - this.start) : -Math.abs(this.set.indexOf(step) - this.start);
  }


  this.calc = function(){
    console.log('RANGE OBJECT');
    let val = this.start;
    let fin = this.end;
    let stp = this.step;
    let set = this.set;
    let iter = (function*() {
      let running = val;
      while(running != fin && running < set.length && running >= 0) {
        yield set[running];
        running += stp;
      }
      yield set[running];
    })();
    return [...iter];
  }
}
function NumericRangeObject({startString, endString, step = '1', base = 10}){
  let charMask = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(isNaN(base)) {
    throw 'error';
  }
  for(let char of startString) {
    let index = charMask.indexOf(char.toUpperCase());
    if (0 > index || index >= base) {
      throw 'error';
    }
  }
  for(let char of endString) {
    let index = charMask.indexOf(char.toUpperCase());
    if (0 > index || index >= base) {
      throw 'error';
    }
  }
  for(let char of step) {
    let index = charMask.indexOf(char.toUpperCase());
    if (0 > index || index >= base) {
      throw 'error';
    }
  }
  this.calc = function calc(){
    console.log('NUMERIC RANGE OBJECT');
    let padLength = Math.max(this.start.length, this.end.length);
    let val = Number.parseInt(this.start, this.base);
    let fin = Number.parseInt(this.end, this.base);
    let stp = (fin < val ? -1 : 1) * Number.parseInt(this.step, this.base);
    let iter = (function*() {
      let running = val;
      while(running != fin) {
        yield running;
        running += stp;
      }
      yield running;
    })();
    return [...iter];
  }
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
    if(char == '{') {
      if(runningString.length > 0) {
        tokenList.push(new StringToken(runningString));
        runningString = '';
      }
      tokenList.push(new StartToken());
    } else if(char == '}') {
      if(runningString.length > 0) {
        tokenList.push(new StringToken(runningString));
        runningString = '';
      }
      tokenList.push(new EndToken());
    } else if(char == ':') {
      if(runningString.length > 0) {
        tokenList.push(new StringToken(runningString));
        runningString = '';
      }
      tokenList.push(new ColonToken());
    } else if(char == ',') {
      if(runningString.length > 0) {
        tokenList.push(new StringToken(runningString));
        runningString = '';
      }
      tokenList.push(new CommaToken());
    } else {
      runningString += char;
    }
  }
  if(runningString.length > 0) {
    tokenList.push(new StringToken(runningString));
  }
  console.log(tokenList);
  return tokenList;
  //TODO preferrably the array should contain correctly typed tokens, meaning we'll likely have to make all the relevant types
  //return [new StringToken('str'), new StartToken(), new StringToken('1'), new ColonToken(':'), new StringToken('3'), new CommaToken(','), new StringToken('4'), new EndToken('}'), new StringToken('ing')];
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
  console.log(JSON.stringify(processArray));
  return new ExpandPatternObject(...processArray);
};

function parseRange(context) {
  let firstToken = context.next().value;
  if (firstToken instanceof StartToken){
    firstToken = parseRange(context);
  }
  let secondToken = context.next().value;
  if (secondToken instanceof CommaToken) {
    let setPieces = [firstToken.value];
    for(let token of context) {
      if(token instanceof StartToken) {
        setPieces.push(parseRange(context));
      } else if (token instanceof StringToken) {
        setPieces.push(token.value);
      } else if (token instanceof EndToken) {
        return new SetObject(...setPieces);
      }
    }
  } else if (secondToken instanceof ColonToken) {
    let parameterSet = {};
    parameterSet.startString = firstToken.value;
    let rangeStart = firstToken.value, rangeEnd = null, stepChar = null, numericBase = 10;
    let tempToken = context.next();
    let numeric = false;
    if(tempToken.done || !tempToken.value instanceof StringToken) {
      throw 'ERROR: range must have at least beginning and end of range';
    }
    rangeEnd = tempToken.value.value;
    parameterSet.endString = tempToken.value.value;
    tempToken = context.next();
    if(tempToken.done) {
      throw 'error';
    }
    if(tempToken.value instanceof ColonToken) {
      tempToken = context.next();
      if(tempToken.done || !tempToken.value instanceof StringToken) {
        throw 'error';
      }
      parameterSet.step = parameterSet.endString;
      parameterSet.endString = tempToken.value.value;
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
      if(tempToken.done || !tempToken.value instanceof StringToken || isNaN(tempToken.value.value)) {
        throw 'error';
      }
      numericBase = tempToken.value.value;
      parameterSet.base = tempToken.value.value;
      tempToken = context.next();
    }
    if (tempToken.done || !tempToken.value instanceof EndToken) {
      throw 'error';
    }
    if(numeric || !isNaN(parameterSet.startString) && !isNaN(parameterSet.endString)) {
      // let step = stepChar? Math.abs(Number.parseFloat(rangeStart) - Number.parseFloat(stepChar)) : 1;
      // return new NumericRangeObject(rangeStart, rangeEnd, stepChar, numericBase);
      return new NumericRangeObject(parameterSet);
    }
    //TODO find set start and end are from, if step check that also
    return new RangeObject(parameterSet);
  } else {
    throw 'bad crap happened';
  }
}

function calc(parseTree) {
  console.log(parseTree);
  if(!parseTree instanceof SetObject && !parseTree instanceof RangeObject && !parseTree instanceof NumericRangeObject) {
    throw 'error';
  }
  return parseTree.calc();
}

export function expandPattern(pattern) {
  console.log('START PATTERN',pattern);
    if(pattern.length > 0 && pattern.indexOf('{') > -1) {
      try {
        return calc(parse(new Context(tokenize(pattern))));
      } catch (e) {
        console.log('ERROR in', pattern);
        throw e;
      }
    } else {
      return [pattern];
    }
}
