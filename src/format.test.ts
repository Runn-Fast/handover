import { describe, test, expect } from 'vitest'
import { createFormatFn, applyFormatFnList } from './format.js'

describe('createFormatFn', () => {
  test('foo → bar', () => {
    const format = {
      pattern: '/foo/g',
      replacement: 'bar',
    }
    const formatFn = createFormatFn(format)
    expect(formatFn('foo')).toBe('bar')
    expect(formatFn('foobar')).toBe('barbar')
    expect(formatFn('barfoo')).toBe('barbar')
  })

  test('fast-1234 → https://linear.app/issue/fast-1234', () => {
    const format = {
      pattern: '/fast-(\\d+)/g',
      replacement: 'https://linear.app/issue/fast-$1',
    }
    const formatFn = createFormatFn(format)
    expect(formatFn('fast-1234')).toBe('https://linear.app/issue/fast-1234')
    expect(formatFn('fast-1234 fast-5678')).toBe(
      'https://linear.app/issue/fast-1234 https://linear.app/issue/fast-5678',
    )
  })
})

test('applyFormatFnList', () => {
  const formatFnList = [
    createFormatFn({
      pattern: '/one/g',
      replacement: 'two',
    }),
    createFormatFn({
      pattern: '/two/g',
      replacement: 'three',
    }),
  ]
  expect(applyFormatFnList('one', formatFnList)).toBe('three')
  expect(applyFormatFnList('two', formatFnList)).toBe('three')
  expect(applyFormatFnList('onetwo', formatFnList)).toBe('threethree')
})
