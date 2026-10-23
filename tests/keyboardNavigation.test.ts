import test from 'node:test';
import assert from 'node:assert/strict';
import { getTabForNumericKey, isTargetInputOrEditable } from '../src/hooks/useKeyboardNavigation.ts';

test('getTabForNumericKey correctly maps keys 1-5 to mobile tabs', () => {
  assert.equal(getTabForNumericKey('1'), 'home');
  assert.equal(getTabForNumericKey('2'), 'search');
  assert.equal(getTabForNumericKey('3'), 'applications');
  assert.equal(getTabForNumericKey('4'), 'messages');
  assert.equal(getTabForNumericKey('5'), 'profile');
  assert.equal(getTabForNumericKey('6'), null);
  assert.equal(getTabForNumericKey('0'), null);
  assert.equal(getTabForNumericKey('a'), null);
  assert.equal(getTabForNumericKey(' '), null);
});

test('isTargetInputOrEditable handles null or non-element targets', () => {
  assert.equal(isTargetInputOrEditable(null), false);
  assert.equal(isTargetInputOrEditable({} as any), false);
});
