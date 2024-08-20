import type { Fn } from 'hotscript'

const $types = Symbol('$types')
type $types = typeof $types

export interface Layer<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TYPE extends object = any,
  OUTWARD_RESOLVER extends Fn = Fn,
  INWARD_RESOLVER extends Fn = Fn
> {
  (arg: TYPE): TYPE
  [$types]?: {
    type: TYPE
    outwardResolver: OUTWARD_RESOLVER
    inwardResolver: INWARD_RESOLVER
  }
}

export type Type<LAYER extends Layer> = NonNullable<LAYER[$types]>['type']

export type Types<LAYERS extends Layer[], OUTPUT extends object[] = []> = LAYERS extends [
  infer LAYERS_HEAD,
  ...infer LAYERS_TAIL
]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? Types<LAYERS_TAIL, [...OUTPUT, InwardResolver<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT

export type OutwardResolver<LAYER extends Layer> = NonNullable<LAYER[$types]>['outwardResolver']

export type OutwardResolvers<LAYERS extends Layer[], OUTPUT extends Fn[] = []> = LAYERS extends [
  infer LAYERS_HEAD,
  ...infer LAYERS_TAIL
]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? OutwardResolvers<LAYERS_TAIL, [...OUTPUT, OutwardResolver<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT

export type InwardResolver<LAYER extends Layer> = NonNullable<LAYER[$types]>['inwardResolver']

export type InwardResolvers<LAYERS extends Layer[], OUTPUT extends Fn[] = []> = LAYERS extends [
  infer LAYERS_HEAD,
  ...infer LAYERS_TAIL
]
  ? LAYERS_HEAD extends Layer
    ? LAYERS_TAIL extends Layer[]
      ? InwardResolvers<LAYERS_TAIL, [...OUTPUT, InwardResolver<LAYERS_HEAD>]>
      : never
    : never
  : OUTPUT
