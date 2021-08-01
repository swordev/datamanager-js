import {
  Type,
  TypedArrayConstructor,
  TypedArray,
  EncodeInput,
  DecodeInput,
} from "./../DataManager";

export class StringType implements Type<string> {
  BYTES_PER_ELEMENT = Uint16Array.BYTES_PER_ELEMENT;

  testEncode(value: any): boolean {
    return typeof value === "string" || value instanceof StringType;
  }

  encode(data: EncodeInput) {
    return StringType.toTypedArray(data.value, Uint16Array);
  }

  decode(data: DecodeInput) {
    return StringType.fromTypedArray(data.toTypedArray(Uint16Array));
  }

  static fromTypedArray(data: TypedArray) {
    return String.fromCharCode(...(data as any));
  }

  static toTypedArray(
    value: string,
    constructor: TypedArrayConstructor = Uint16Array
  ) {
    const result = new constructor(value.length);
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      result[i] = code;
      if (result[i] !== code) throw Error("Invalid char code: " + code);
    }
    return result;
  }
}
