import type { B, Call, O } from 'hotscript'

import { composeDown, composeUp } from './compose'
import type { Layer } from './layer'
import { Onion } from './onion'

type WrapLayer<PATH extends string> = Layer<
  { [KEY in PATH]: unknown },
  O.Update<PATH, O.Record<'_'>>,
  { [KEY in PATH]: { _?: unknown } },
  O.Update<PATH, O.Get<'_'>>
>

const wrapProp =
  <PATH extends string>(path: PATH): WrapLayer<PATH> =>
  obj => ({
    ...obj,
    [path]: { _: obj[path] }
  })

type JSONStringifyLayer<PATH extends string> = Layer<
  { [KEY in PATH]: Record<string, unknown> },
  O.Update<PATH, string>,
  { [KEY in PATH]: string },
  O.Update<PATH, Record<string, unknown>>
>

const jsonStringifyProp =
  <PATH extends string>(path: PATH): JSONStringifyLayer<PATH> =>
  obj => ({
    ...obj,
    [path]: JSON.stringify(obj[path])
  })

describe('compose', () => {
  describe('composeDown', () => {
    test('applies wraps > JSONStringifies (outward)', () => {
      const after = Onion.wrap({ headers: null, body: { foo: 'bar' } }).with(
        composeDown(
          //
          wrapProp('body'),
          jsonStringifyProp('body')
        )
      )

      const assertAfter: Call<
        B.Equals<typeof after, { headers: null; body: string }>
      > = true
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
        body: JSON.stringify({ _: { foo: 'bar' } })
      })
    })

    test('applies wraps > JSONStringifies (inward)', () => {
      const onion = Onion.produce<{ headers: null; body: string }>().with(
        // NOTE: This is confusing, you're not supposed to do that
        composeDown(
          //
          wrapProp('body'),
          jsonStringifyProp('body')
        )
      )

      const assertBefore: Call<
        B.Equals<
          Parameters<(typeof onion)['from']>,
          [{ headers: null; body: unknown }]
        >
      > = true
      assertBefore

      const after = onion.from({ headers: null, body: { foo: 'bar' } })

      const assertAfter: Call<
        B.Equals<typeof after, { headers: null; body: string }>
      > = true
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
        body: JSON.stringify({ _: { foo: 'bar' } })
      })
    })

    test('applies JSONStringifies > wraps (outward)', () => {
      const after = Onion.wrap({ headers: null, body: { foo: 'bar' } }).with(
        // NOTE: This is confusing, you're not supposed to do that
        composeUp(wrapProp('body'), jsonStringifyProp('body'))
      )

      const assertAfter: Call<
        B.Equals<typeof after, { headers: null; body: { _: string } }>
      > = true
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
        body: { _: JSON.stringify({ foo: 'bar' }) }
      })
    })

    test('applies JSONStringifies > wraps (inward)', () => {
      const onion = Onion.produce<{
        headers: null
        body: { _: string }
      }>().with(composeUp(wrapProp('body'), jsonStringifyProp('body')))

      const assertBefore: Call<
        B.Equals<
          Parameters<(typeof onion)['from']>,
          [{ headers: null; body: Record<string, unknown> }]
        >
      > = true
      assertBefore

      const after = onion.from({ headers: null, body: { foo: 'bar' } })

      const assertAfter: Call<
        B.Equals<typeof after, { headers: null; body: { _: string } }>
      > = true
      assertAfter

      expect(after).toStrictEqual({
        headers: null,
        body: { _: JSON.stringify({ foo: 'bar' }) }
      })
    })
  })
})
