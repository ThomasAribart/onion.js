import type { Fn } from 'hotscript'

const $types = Symbol('$types')
type $types = typeof $types

export interface Layer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TYPE = any,
  OUTWARD_FN extends Fn = Fn,
  INWARD_FN extends Fn = Fn
> {
  (arg: TYPE): TYPE
  [$types]?: {
    type: TYPE
    outFn: OUTWARD_FN
    inFn: INWARD_FN
  }
}

export type Type<LAYER extends Layer> = NonNullable<LAYER[$types]>['type']

export type Types<
  LAYERS extends Layer[],
  OUTPUT extends unknown[] = []
> = LAYERS extends [infer LAYERS_HEAD, ...infer LAYERS_TAIL]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? Types<LAYERS_TAIL, [...OUTPUT, Type<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT

export type OutwardFn<LAYER extends Layer> = NonNullable<LAYER[$types]>['outFn']

export type OutwardFns<
  LAYERS extends Layer[],
  OUTPUT extends Fn[] = []
> = LAYERS extends [infer LAYERS_HEAD, ...infer LAYERS_TAIL]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? OutwardFns<LAYERS_TAIL, [...OUTPUT, OutwardFn<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT

export type InwardFn<LAYER extends Layer> = NonNullable<LAYER[$types]>['inFn']

export type InwardFns<
  LAYERS extends Layer[],
  OUTPUT extends Fn[] = []
> = LAYERS extends [infer LAYERS_HEAD, ...infer LAYERS_TAIL]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? InwardFns<LAYERS_TAIL, [...OUTPUT, InwardFn<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT
