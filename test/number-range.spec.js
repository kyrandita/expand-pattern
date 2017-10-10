import {expandPattern} from '../index';
describe('expandPattern', function() {
	it('should expand a numeric range in increasing and decreasing order', function() {
		expect(expandPattern('string')).toEqual(['string']);
		expect(expandPattern('str{1:3,4}ing')).toEqual(['str1ing', 'str2ing', 'str3ing']);
		expect(expandPattern('str{1,{a:b},3}ing')).toEqual(['str1ing', 'str2ing', 'str3ing']);
	});
});
