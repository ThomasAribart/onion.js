import type { F, O } from 'hotscript'
import type { A } from 'ts-toolbelt'

import { Layer } from './layer'
import { Onion } from './onion'

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
      const after = Onion.wrap({ headers: null, body: { foo: 'bar' } }).with(
        jsonStringifyProp('body')
      )

      const assertAfter: A.Equals<
        typeof after,
        { headers: null; body: string }
      > = 1
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
        body: JSON.stringify({ foo: 'bar' })
      })
    })

    test('JSON stringifies prop inward', () => {
      const onion = Onion.produce<{ headers: null; body: string }>().with(
        jsonStringifyProp('body')
      )

      const assertBefore: A.Equals<
        Parameters<(typeof onion)['from']>,
        [{ headers: null; body: object }]
      > = 1
      assertBefore

      const after = onion.from({ headers: null, body: { foo: 'bar' } })

      const assertAfter: A.Equals<
        typeof after,
        { headers: null; body: string }
      > = 1
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
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
      const before = () => ({ headers: null, body: { foo: 'bar' } })
      const after = Onion.wrap(before).with(jsonStringifyRespBody)

      const assertAfter: A.Equals<
        typeof after,
        () => { headers: null; body: string }
      > = 1
      assertAfter

      expect(after()).toStrictEqual({
        headers: null,
        body: JSON.stringify({ foo: 'bar' })
      })
    })

    test('JSON stringifies resp body inward', () => {
      const onion = Onion.produce<() => { headers: null; body: string }>().with(
        jsonStringifyRespBody
      )

      const assertBefore: A.Equals<
        Parameters<(typeof onion)['from']>,
        [() => { headers: null; body: unknown }]
      > = 1
      assertBefore

      const after = onion.from(() => ({ headers: null, body: { foo: 'bar' } }))

      const assertAfter: A.Equals<
        typeof after,
        () => { headers: null; body: string }
      > = 1
      assertAfter

      expect(after()).toStrictEqual({
        headers: null,
        body: JSON.stringify({ foo: 'bar' })
      })
    })
  })
})
