import { Type, EncodeInput, DecodeInput } from "./../DataManager";
import { StringType } from "./../Types/StringType";

export class JsonType implements Type<Object | Array<any>> {

	BYTES_PER_ELEMENT = Uint16Array.BYTES_PER_ELEMENT

	testEncode(value: any): boolean {
		return Array.isArray(value) || JsonType.isPlainObject(value)
	}

	encode(data: EncodeInput) {
		return StringType.toTypedArray(JSON.stringify(data.value))
	}

	decode(data: DecodeInput) {
		const array = data.toTypedArray(Uint16Array)
		return JSON.parse(StringType.fromTypedArray(array))
	}

	static isPlainObject(value: any): value is Object {

		if (!value || typeof value !== 'object')
			return false

		let proto = value
		let nextProto: any

		while (nextProto = Object.getPrototypeOf(proto)) {
			proto = nextProto
			if (proto.constructor && proto.constructor !== Object)
				return false
		}

		return proto === Object.prototype

	}

	static iterate(
		data: any,
		cb: (
			value: any,
			iterationType: 0 | 1 | 2,
			parent: Object | Array<any> | undefined,
			key: string | undefined,
			ref: { value: Object | Array<any> | undefined }
		) => boolean | void
	) {

		const ref: { value: any } = { value: undefined }
		const stack: any[] = [[data, null, null, ref]]
		let firstRef = true
		let result: any

		while (stack.length) {

			let [value, parent, key, ref] = stack.shift()

			let iterationType: 0 | 1 | 2 =
				Array.isArray(value) ? 1 :
					JsonType.isPlainObject(value) ? 2 :
						0

			const cbResult = cb(value, iterationType, parent, key, ref)

			if (firstRef) {
				result = ref.value
				firstRef = false
			}

			if (cbResult === false || iterationType === 0)
				continue

			const newStack: any[] = []

			for (const valueKey in value)
				newStack.push([
					value[valueKey],
					value,
					valueKey,
					{ value: ref.value }
				])

			stack.unshift(...newStack)

		}

		return result

	}

}