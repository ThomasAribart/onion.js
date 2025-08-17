import type { Call, Fn, PartialApply } from 'hotscript'

const $types = Symbol('$types')
type $types = typeof $types

export interface Layer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BEFORE = any,
  OUT_FN extends Fn = Fn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AFTER = any,
  IN_FN extends Fn = Fn
> {
  (arg: BEFORE): AFTER
  [$types]?: {
    before: BEFORE
    outFn: OUT_FN
    after: AFTER
    inFn: IN_FN
  }
}

export type Before<LAYER extends Layer> = NonNullable<LAYER[$types]>['before']

export type OutFn<LAYER extends Layer> = PartialApply<
  TypedCall,
  [NonNullable<LAYER[$types]>['outFn'], Before<LAYER>]
>

export type After<LAYER extends Layer> = NonNullable<LAYER[$types]>['after']

export type OutFns<
  LAYERS extends Layer[],
  OUT_FNS extends Fn[] = []
> = LAYERS extends [infer LAYERS_HEAD, ...infer LAYERS_TAIL]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? OutFns<LAYERS_TAIL, [...OUT_FNS, OutFn<LAYERS_HEAD>]>
      : never
    : never
  : OUT_FNS

export type InFn<LAYER extends Layer> = PartialApply<
  TypedCall,
  [NonNullable<LAYER[$types]>['inFn'], After<LAYER>]
>

export type InFns<
  LAYERS extends Layer[],
  OUTPUT extends Fn[] = []
> = LAYERS extends [infer LAYERS_HEAD, ...infer LAYERS_TAIL]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? InFns<LAYERS_TAIL, [...OUTPUT, InFn<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT

interface TypedCall extends Fn {
  return: this['args'] extends [
    infer FN extends Fn,
    infer CONSTRAINT,
    infer ARG,
    ...unknown[]
  ]
    ? ARG extends CONSTRAINT
      ? Call<FN, ARG>
      : never
    : never
}
