import {expandPattern} from '../index';
describe('expandPattern', function() {
	it('should expand a numeric range in increasing and decreasing order', function() {
		expect(expandPattern('string')).toEqual(['string']);
		expect(expandPattern('str{1:3,4}ing')).toEqual(['str1ing', 'str2ing', 'str3ing']);
		expect(expandPattern('str{1,{a:b},3}ing')).toEqual(['str1ing', 'straing', 'strbing', 'str3ing']);
		expect(expandPattern('str{e:g:b}ing')).toEqual(['streing', 'strcing']);
		expect(expandPattern('str{1:2:6}ing')).toEqual(['str1ing', 'str3ing', 'str5ing']);
		expect(expandPattern('{1:6}')).toEqual(['1', '2', '3', '4', '5', '6']);
		expect(expandPattern('{A:D}')).toEqual(['A', 'B', 'C', 'D']);
		expect(expandPattern('{1:11,4}')).toEqual([ "1", "2", "3", "10", "11" ]);
	});
});
