import { describe, test, expect } from 'vitest'
import { createFormatFn, applyFormatFnList } from './format.js'

describe('createFormatFn', () => {
  test('foo → bar', () => {
    const format = {
      pattern: '/foo/g',
      replacement: 'bar',
    }
    const formatFunction = createFormatFn(format)
    expect(formatFunction('foo')).toBe('bar')
    expect(formatFunction('foobar')).toBe('barbar')
    expect(formatFunction('barfoo')).toBe('barbar')
  })

  test('fast-1234 → https://linear.app/issue/fast-1234', () => {
    const format = {
      pattern: '/fast-(\\d+)/g',
      replacement: 'https://linear.app/issue/fast-$1',
    }
    const formatFunction = createFormatFn(format)
    expect(formatFunction('fast-1234')).toBe(
      'https://linear.app/issue/fast-1234',
    )
    expect(formatFunction('fast-1234 fast-5678')).toBe(
      'https://linear.app/issue/fast-1234 https://linear.app/issue/fast-5678',
    )
  })
})

test('applyFormatFnList', () => {
  const formatFunctionList = [
    createFormatFn({
      pattern: '/one/g',
      replacement: 'two',
    }),
    createFormatFn({
      pattern: '/two/g',
      replacement: 'three',
    }),
  ]
  expect(applyFormatFnList('one', formatFunctionList)).toBe('three')
  expect(applyFormatFnList('two', formatFunctionList)).toBe('three')
  expect(applyFormatFnList('onetwo', formatFunctionList)).toBe('threethree')
})
