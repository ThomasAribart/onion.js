import type { Pipe } from 'hotscript'

import type { InwardFns, Layer, OutwardFns } from './layer.js'

const $layers = Symbol('$layers')
type $layers = typeof $layers

export type OnionWrap<BEFORE> = BEFORE & {
  with<LAYERS extends Layer[]>(
    ...layers: LAYERS
  ): Pipe<BEFORE, OutwardFns<LAYERS>> extends object
    ? OnionWrap<Pipe<BEFORE, OutwardFns<LAYERS>>>
    : never
}

export class Onion<AFTER extends object, LAYERS extends Layer[] = Layer[]> {
  static wrap<BEFORE extends object>(before: BEFORE): OnionWrap<BEFORE> {
    Object.assign(before, {
      with: (...layers: Layer[]): unknown =>
        Onion.wrap(
          layers.reduce((acc, layer) => layer(acc) as object, before as object)
        )
    })

    return before as OnionWrap<BEFORE>
  }

  static produce<_AFTER extends object>(): Onion<_AFTER> {
    return new Onion<_AFTER>()
  }

  [$layers]: LAYERS

  constructor(...layers: LAYERS) {
    this[$layers] = layers
  }

  with<NEXT_LAYERS extends Layer[]>(
    ...layers: NEXT_LAYERS
  ): Onion<AFTER, NEXT_LAYERS> {
    return new Onion(...layers)
  }

  from(before: Pipe<AFTER, InwardFns<LAYERS>>): AFTER {
    return [...this[$layers]]
      .reverse()
      .reduce((acc, hof) => hof(acc), before as unknown) as AFTER
  }
}
