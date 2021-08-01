import { Type, DecodeInput, EncodeInput } from "./../DataManager";
import { StringType } from "./../Types/StringType"
import { IterationTypeEnum, JsonType } from "./../Types/JsonType";

export class EJsonType implements Type<Object | Array<any> | EJsonType> {

	BYTES_PER_ELEMENT = Uint16Array.BYTES_PER_ELEMENT
	value: any

	static magicKey = "\b";

	constructor(value?: any) {
		this.value = value
	}

	testEncode(value: any): boolean {
		return Array.isArray(value) || JsonType.isPlainObject(value) || value instanceof EJsonType
	}

	encode(data: EncodeInput) {

		const jsonValue = (data.value instanceof EJsonType) ? data.value.value : data.value

		const object = JsonType.iterate(jsonValue, (value, iterationType, parent, key, ref) => {

			let newValue =
				(iterationType === IterationTypeEnum.Array) ? [] :
					(iterationType === IterationTypeEnum.Object) ? {} :
						value

			const isObject = iterationType === IterationTypeEnum.None && typeof value === 'object'

			if (isObject) {
				newValue = { [EJsonType.magicKey]: data.encodeValue(value) }
			}

			if (parent) {
				if (Array.isArray(ref.value)) {
					ref.value.push(newValue)
				} else {
					ref.value[key] = newValue
				}
			}

			ref.value = newValue

			if (isObject) return false

		})

		return StringType.toTypedArray(JSON.stringify(object))

	}

	decode(data: DecodeInput) {

		const array = data.toTypedArray(Uint16Array)
		const json = JSON.parse(StringType.fromTypedArray(array))

		JsonType.iterate(json, (value, iterationType, parent, key) => {
			if (iterationType === IterationTypeEnum.Object && EJsonType.magicKey in value) {
				parent[key] = data.decodeValue(value[EJsonType.magicKey])
				return false
			}
		})

		return json

	}

}