import type { Pipe } from 'hotscript'

import type { InFns, Layer } from './layer.js'

const $layers = Symbol('$layers')
type $layers = typeof $layers

export class Producer<AFTER, LAYERS extends Layer[] = Layer[]> {
  [$layers]: LAYERS

  constructor(...layers: LAYERS) {
    this[$layers] = layers
  }

  with<NEXT_LAYERS extends Layer[]>(
    ...layers: NEXT_LAYERS
  ): Producer<AFTER, NEXT_LAYERS> {
    return new Producer(...layers)
  }

  from(before: Pipe<AFTER, InFns<LAYERS>>): AFTER {
    return [...this[$layers]]
      .reverse()
      .reduce((acc, hof) => hof(acc), before as unknown) as AFTER
  }
}
