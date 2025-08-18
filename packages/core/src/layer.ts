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
    ? CovariantExtends<ARG, CONSTRAINT> extends true
      ? Call<FN, ARG>
      : never
    : never
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...params: any[]) => any

type Extends<LEFT, RIGHT> = LEFT extends RIGHT ? true : false

type CovariantExtends<LEFT, RIGHT> = LEFT extends AnyFn
  ? RIGHT extends AnyFn
    ? CovariantExtends<Parameters<LEFT>, Parameters<RIGHT>> extends true
      ? CovariantExtends<ReturnType<LEFT>, ReturnType<RIGHT>>
      : false
    : false
  : LEFT extends [infer LEFT_HEAD, ...infer LEFT_TAIL]
    ? RIGHT extends [infer RIGHT_HEAD, ...infer RIGHT_TAIL]
      ? CovariantExtends<LEFT_HEAD, RIGHT_HEAD> extends true
        ? CovariantExtends<LEFT_TAIL, RIGHT_TAIL>
        : false
      : RIGHT extends unknown[]
        ? CovariantExtends<LEFT_HEAD, RIGHT[number]> extends true
          ? CovariantExtends<LEFT_TAIL, RIGHT>
          : false
        : Extends<LEFT, RIGHT>
    : LEFT extends unknown[]
      ? RIGHT extends [infer RIGHT_HEAD, ...infer RIGHT_TAIL]
        ? CovariantExtends<LEFT[number], RIGHT_HEAD> extends true
          ? CovariantExtends<LEFT, RIGHT_TAIL>
          : false
        : RIGHT extends unknown[]
          ? CovariantExtends<LEFT[number], RIGHT[number]>
          : Extends<LEFT, RIGHT>
      : LEFT extends Set<infer LEFT_ELEMENTS>
        ? RIGHT extends Set<infer RIGHT_ELEMENTS>
          ? CovariantExtends<LEFT_ELEMENTS, RIGHT_ELEMENTS>
          : Extends<LEFT, RIGHT>
        : LEFT extends object
          ? RIGHT extends object
            ? {
                [KEY in keyof RIGHT]-?: KEY extends keyof LEFT
                  ? CovariantExtends<LEFT[KEY], RIGHT[KEY]>
                  : IsOptionalKey<RIGHT, KEY>
              }[keyof RIGHT]
            : Extends<LEFT, RIGHT>
          : Extends<LEFT, RIGHT>

type IsOptionalKey<OBJECT extends object, KEY extends keyof OBJECT> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  {} extends Pick<OBJECT, KEY> ? true : false
