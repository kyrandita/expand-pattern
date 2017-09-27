function parseRange(pattern) {
  if(true){
    return [pattern];
  } else {
    return [expandPattern(pattern)];
  }
}

export function expandPattern(pattern) {
    if(pattern.length > 0 && pattern.indexOf('{') > -1) {
      console.log(parseRange(pattern.slice(pattern.indexOf('{'))));
      return parseRange(pattern.slice(pattern.indexOf('{')+1)).map((x)=>{console.log(x);return pattern.slice(0,pattern.indexOf('{')).concat(x);});
    } else {
      return pattern;
    }
}
