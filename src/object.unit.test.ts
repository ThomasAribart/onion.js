import type { F, O } from 'hotscript'
import type { A } from 'ts-toolbelt'

import { Layer } from './layer'
import { Onion, OnionWrap } from './onion'

type JSONStringifyLayer<PATH extends string> = Layer<
  Record<string, unknown>,
  O.Update<PATH, string>,
  O.Update<PATH, object>
>

const jsonStringifyProp =
  <PATH extends string>(path: PATH): JSONStringifyLayer<PATH> =>
  obj => ({
    ...obj,
    [path]: JSON.stringify(obj[path])
  })

describe('Onion', () => {
  describe('object', () => {
    test('JSON stringifies prop upward', () => {
      const after = Onion.wrap({ foo: 'bar', body: { foo: 'bar' } }).with(
        jsonStringifyProp('body')
      )

      const assertAfter: A.Equals<
        typeof after,
        OnionWrap<{ foo: string; body: string }>
      > = 1
      assertAfter

      expect(after).toStrictEqual({
        foo: 'bar',
        body: JSON.stringify({ foo: 'bar' }),
        with: expect.any(Function)
      })
    })

    test('JSON stringifies prop inward', () => {
      const onion = Onion.produce<{ foo: string; body: string }>().with(
        jsonStringifyProp('body')
      )

      const assertBefore: A.Equals<
        Parameters<(typeof onion)['from']>,
        [{ foo: string; body: object }]
      > = 1
      assertBefore

      const after = onion.from({ foo: 'bar', body: { foo: 'bar' } })

      const assertAfter: A.Equals<typeof after, { foo: string; body: string }> =
        1
      assertAfter

      expect(after).toStrictEqual({
        foo: 'bar',
        body: JSON.stringify({ foo: 'bar' })
      })
    })
  })

  describe('function', () => {
    const jsonStringifyRespBody: Layer<
      (...params: unknown[]) => Record<string, unknown>,
      F.MapReturnType<O.Update<'body', string>>,
      F.MapReturnType<O.Update<'body', unknown>>
    > = before => {
      const after = (...params: unknown[]) =>
        jsonStringifyProp('body')(before(...params))

      return after
    }

    test('JSON stringifies resp body outward', () => {
      const before = () => ({ body: { foo: 'bar' } })
      const after = Onion.wrap(before).with(jsonStringifyRespBody)

      const assertAfter: A.Equals<
        typeof after,
        OnionWrap<() => { body: string }>
      > = 1
      assertAfter

      expect(after()).toStrictEqual({
        body: JSON.stringify({ foo: 'bar' })
      })
    })

    test('JSON stringifies resp body inward', () => {
      const onion = Onion.produce<() => { body: string }>().with(
        jsonStringifyRespBody
      )

      const assertBefore: A.Equals<
        Parameters<(typeof onion)['from']>,
        [() => { body: unknown }]
      > = 1
      assertBefore

      const after = onion.from(() => ({ body: { foo: 'bar' } }))

      const assertAfter: A.Equals<typeof after, () => { body: string }> = 1
      assertAfter

      expect(after()).toStrictEqual({
        body: JSON.stringify({ foo: 'bar' })
      })
    })
  })
})
