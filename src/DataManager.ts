import { TypedArrayTypeConfig } from "./TypeConfig";

export interface TypedArrayConstructor<TValue = number | bigint> {
	new(length: number): TypedArray<TValue, Function>
	new(arrayOrArrayBuffer: ArrayLike<TValue> | ArrayBufferLike): TypedArray<TValue, Function>
	new(buffer: ArrayBufferLike, byteOffset: number, length?: number): TypedArray<TValue, Function>
	readonly BYTES_PER_ELEMENT: number
	readonly prototype: TypedArray<TValue, Function>
}

export interface TypedArray<TValue = number | bigint, TConstructor = Function> extends ArrayLike<TValue> {
	constructor: TConstructor
	readonly BYTES_PER_ELEMENT: number
	readonly byteLength: number
	readonly length: number
	set(array: ArrayLike<TValue>, offset?: number): void
	[Symbol.iterator](): IterableIterator<TValue>
	[index: number]: TValue
}

export interface StrictTypedArray<TValue = number | bigint> extends TypedArray<TValue, TypedArrayConstructor<TValue>> { }

export interface Header {
	total: number
	dataTotal: number
	types: TypedArray<number>
	lengths: TypedArray<number>
	offsets: number[]
}

export interface EncodeInput<T = any> {
	value: T
	encodeValue: (value: any) => number
}

export interface DecodeInput {
	buffer: ArrayBuffer
	offset: number
	length: number
	toTypedArray: (constructor: TypedArrayConstructor) => TypedArray
	decodeValue: (index: number) => any
}

export interface Type<T = any> {
	BYTES_PER_ELEMENT: number
	testEncode?(value: T): boolean
	encode?(data: EncodeInput): TypedArray
	decode?(data: DecodeInput): T
}

export type TypeConfig = {
	[type: number]: Type
}

export class DataManager {

	protected typeConfig: TypeConfig

	constructor(configs: TypeConfig[] = [TypedArrayTypeConfig]) {
		this.setTypeConfig(...configs)
	}

	setTypeConfig(...configs: TypeConfig[]) {
		this.typeConfig = {}
		this.addTypeConfig(...configs)
	}

	addTypeConfig(...configs: TypeConfig[]) {
		for (const config of configs)
			Object.assign(this.typeConfig, config)
	}

	encodeHeader(data: [number, TypedArray][], extraData: [number, TypedArray][]): TypedArray[] {

		const total = data.length + extraData.length

		const header = {
			total: new Uint32Array([total]),
			dataTotal: new Uint32Array([data.length]),
			lengths: new Uint32Array(total),
			types: new Uint16Array(total)
		}

		data.concat(extraData).forEach((encodedValue, index) => {
			const [type, value] = encodedValue
			header.lengths[index] = value.length
			header.types[index] = type
		})

		return Object.values(header)

	}

	decodeHeader(buffer: ArrayBuffer): Header {

		const total = new Uint32Array(buffer, 0, 1)[0]

		const decoded = DataManager.decode<number>(buffer, [
			[Uint32Array, 1],
			[Uint32Array, 1],
			[Uint32Array, total],
			[Uint16Array, total]
		])

		const [, dataTotal, lengths, types] = decoded.result
		const offsetConfig: { BYTES_PER_ELEMENT: number, length: number }[] = []

		for (let index = 0; index < types.length; ++index)
			offsetConfig.push({
				BYTES_PER_ELEMENT: this.typeConfig[types[index]].BYTES_PER_ELEMENT,
				length: lengths[index]
			})

		return {
			total: total,
			types: types,
			lengths: lengths,
			dataTotal: dataTotal[0],
			offsets: DataManager.offsets(offsetConfig, decoded.byteLength).result
		}

	}

	encodeValue(value: any, extraEncodedValues: [number, TypedArray][] = [], startIndex = 0): [number, TypedArray] {

		const encodeValue = (value: any) => {
			const [type, encodedValue] = this.encodeValue(value, extraEncodedValues)
			extraEncodedValues.push([type, encodedValue])
			return startIndex + extraEncodedValues.length - 1
		}

		for (const typeValue in this.typeConfig) {

			const type = this.typeConfig[typeValue]

			if (DataManager.isArrayTyped(value)) {
				if (value instanceof type.constructor)
					return [Number(typeValue), value]
			} else if (type.testEncode) {
				if (type.testEncode(value))
					return [Number(typeValue), type.encode({
						value: value,
						encodeValue: encodeValue
					})]
			}

		}

		throw new Error('Invalid value')

	}

	decodeValue(buffer: ArrayBuffer, header: Header, index: number): any {

		const typeValue = header.types[index]
		const type = this.typeConfig[typeValue]

		if (DataManager.isArrayTyped(type)) {
			return new type.constructor(buffer, header.offsets[index], header.lengths[index])
		} else {
			return type.decode({
				buffer: buffer,
				length: header.lengths[index],
				offset: header.offsets[index],
				toTypedArray: constructor => new constructor(buffer, header.offsets[index], header.lengths[index]),
				decodeValue: index => this.decodeValue(buffer, header, index)
			})
		}

	}

	encode(input: any[]): ArrayBuffer {

		const extraEncodedValues: [number, TypedArray][] = []

		const encodedValues = input.map(
			value => this.encodeValue(value, extraEncodedValues, input.length)
		)

		const data = this
			.encodeHeader(encodedValues, extraEncodedValues)
			.concat(encodedValues.map(v => v[1]))
			.concat(extraEncodedValues.map(v => v[1]))

		return DataManager.encode(data)

	}

	decode(buffer: ArrayBuffer) {

		const header = this.decodeHeader(buffer)
		const result: any[] = []

		for (let index = 0; index < header.total; ++index) {
			if (index === header.dataTotal) break
			const decodedValue = this.decodeValue(buffer, header, index)
			result.push(decodedValue)
		}

		return result

	}

	static isArrayTyped(value: any): value is StrictTypedArray {
		return ArrayBuffer.isView(value) && !(value instanceof DataView)
	}

	static offsets(data: { BYTES_PER_ELEMENT: number, length: number }[], byteLength = 0) {

		const result = data.map(item => {

			const offset = byteLength
			const bytesPerElement = item.BYTES_PER_ELEMENT
			const mod = offset % bytesPerElement
			const offsetByMultiple = mod ? (bytesPerElement - mod) : 0

			byteLength += (bytesPerElement * item.length) + offsetByMultiple

			return offset + offsetByMultiple

		})

		return { result, byteLength }

	}

	static encode(data: TypedArray[]) {

		const offsets = DataManager.offsets(data)
		const buffer = new ArrayBuffer(offsets.byteLength)

		data.forEach((data, index) => {
			const writer = new (data as StrictTypedArray).constructor(buffer, offsets.result[index], data.length)
			writer.set(data as StrictTypedArray)
		})

		return buffer

	}

	static decode<T = number | bigint>(
		buffer: ArrayBuffer,
		data: [TypedArrayConstructor<T>, number][]
	): {
		result: TypedArray<T>[]
		byteLength: number
	} {

		const offsets = DataManager.offsets(
			data.map(item => ({
				BYTES_PER_ELEMENT: item[0].BYTES_PER_ELEMENT,
				length: item[1]
			}))
		)

		const result = data.map((item, index) =>
			new item[0](buffer, offsets.result[index], item[1])
		)

		return {
			result: result,
			byteLength: offsets.byteLength
		}

	}

}

export default DataManager