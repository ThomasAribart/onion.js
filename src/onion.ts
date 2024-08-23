import { Producer } from './producer'
import { Wrapper } from './wrapper'

export class Onion {
  static wrap<BEFORE extends object>(before: BEFORE): Wrapper<BEFORE> {
    return new Wrapper(before)
  }

  static produce<AFTER extends object>(): Producer<AFTER> {
    return new Producer<AFTER>()
  }
}
