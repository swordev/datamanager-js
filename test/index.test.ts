import { DataManager, TypedArray } from "../src/DataManager"
import * as TypeConfig from "../src/TypeConfig"
import * as Types from "../src/Types"

describe('DataManager.isArrayTyped', () => {

	it('success', () => {

		expect(DataManager.isArrayTyped(new Int8Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Int16Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Int32Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new BigInt64Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Uint8Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Uint16Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Uint32Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new BigUint64Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Uint8ClampedArray())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Float32Array())).toBeTruthy()
		expect(DataManager.isArrayTyped(new Float64Array())).toBeTruthy()

	})

	it('error', () => {

		expect(DataManager.isArrayTyped(new DataView(new ArrayBuffer(1)))).toBeFalsy()
		expect(DataManager.isArrayTyped(1)).toBeFalsy()
		expect(DataManager.isArrayTyped(null)).toBeFalsy()
		expect(DataManager.isArrayTyped(undefined)).toBeFalsy()
		expect(DataManager.isArrayTyped(function () { })).toBeFalsy()
		expect(DataManager.isArrayTyped({})).toBeFalsy()
		expect(DataManager.isArrayTyped([])).toBeFalsy()
		expect(DataManager.isArrayTyped('str')).toBeFalsy()
		expect(DataManager.isArrayTyped(true)).toBeFalsy()

	})

})

describe('DataManager.offsets', () => {

	it('without byteLength', () => {

		expect(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 1 },
			{ BYTES_PER_ELEMENT: Uint16Array.BYTES_PER_ELEMENT, length: 1 },
			{ BYTES_PER_ELEMENT: Uint32Array.BYTES_PER_ELEMENT, length: 1 }
		])).toMatchObject({ result: [0, 2, 4], byteLength: 8 })

	})

	it('with byteLength', () => {

		expect(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 5 },
			{ BYTES_PER_ELEMENT: BigInt64Array.BYTES_PER_ELEMENT, length: 5 }
		], 3)).toMatchObject({ result: [3, 8], byteLength: 48 })

		expect(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 5 },
			{ BYTES_PER_ELEMENT: BigInt64Array.BYTES_PER_ELEMENT, length: 5 }
		], 4)).toMatchObject({ result: [4, 16], byteLength: 56 })

	})

})

describe('Datamanager.encode/decode', () => {

	it('complex', () => {

		let arrays: TypedArray[] = [
			new Int8Array([1, 2]),
			new Int16Array([3, 4, 5]),
			new Int32Array([6, 7, 8, 9]),
			new BigInt64Array([BigInt(10), BigInt(11)]),
			new Uint8Array([12, 13, 14, 15, 16, 17, 18, 19, 20]),
			new Uint16Array([21]),
			new Uint32Array(9),
			new BigUint64Array([BigInt(31)]),
			new Uint8ClampedArray([]),
			new Float32Array([32, 33.33]),
			new Float64Array([Math.PI])
		]

		const buffer = DataManager.encode(arrays)
		const decodeData: [any, number][] = arrays.map(array =>
			[array.constructor as any, array.length]
		)

		expect(arrays).toMatchObject(DataManager.decode(buffer, decodeData).result)

	})


})

describe('StringType.toTypedArray', () => {

	it('success', () => {

		expect(
			Types.StringType.toTypedArray('hello world ♥')
		).toMatchObject(
			new Uint16Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 32, 9829])
		)

		expect(
			Types.StringType.toTypedArray('hello world', Uint8Array),
		).toMatchObject(
			new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
		)

	})

	it('error', () => {

		expect(() => Types.StringType.toTypedArray('hello world ♥', Uint8Array)).toThrow();

	})

})

describe('JsonType.isPlainObject', () => {

	it('success', () => {

		expect(Types.JsonType.isPlainObject({})).toBeTruthy()
		expect(Types.JsonType.isPlainObject(Object.create({}))).toBeTruthy()

	})

	it('error', () => {

		expect(Types.JsonType.isPlainObject(null)).toBeFalsy()
		expect(Types.JsonType.isPlainObject(undefined)).toBeFalsy()
		expect(Types.JsonType.isPlainObject(function () { })).toBeFalsy()
		expect(Types.JsonType.isPlainObject(new function () { })).toBeFalsy()
		expect(Types.JsonType.isPlainObject(1)).toBeFalsy()
		expect(Types.JsonType.isPlainObject(false)).toBeFalsy()
		expect(Types.JsonType.isPlainObject('')).toBeFalsy()
		expect(Types.JsonType.isPlainObject([])).toBeFalsy()

	})

})

describe('Datamanager.prototype.encode/decode', () => {

	it('TypedArrays', () => {

		const dm = new DataManager()

		const data = [
			new Int8Array([1, 2]),
			new Int16Array([3, 4, 5]),
			new Int32Array([6, 7, 8, 9]),
			new BigInt64Array([BigInt(10), BigInt(11)]),
			new Uint8Array([12, 13, 14, 15, 16, 17, 18, 19, 20]),
			new Uint16Array([21]),
			new Uint32Array(9),
			new BigUint64Array([BigInt(31)]),
			new Uint8ClampedArray([]),
			new Float32Array([32, 33.33]),
			new Float64Array([Math.PI])
		]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('StringType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.StringTypeConfig
		])

		const data = [
			"hello world"
		]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('JsonType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.JsonTypeConfig
		])

		const data = [
			{ text: "hello world" }
		]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('EJsonType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.EJsonTypeConfig
		])

		const data = [{
			image: new Uint8Array(Array(5 * 5).fill(255)),
			a: {
				b: {
					c: [
						new Int8Array([1, 2]),
						new Int16Array([3, 4, 5]),
						new Int32Array([6, 7, 8, 9]),
						new BigInt64Array([BigInt(10), BigInt(11)]),
						new Uint8Array([12, 13, 14, 15, 16, 17, 18, 19, 20]),
						new Uint16Array([21]),
						new Uint32Array(9),
						new BigUint64Array([BigInt(31)]),
						new Uint8ClampedArray([]),
						new Float32Array([32, 33.33]),
						new Float64Array([Math.PI])
					]
				}
			},
			d: {
				string: 'hello',
				boolean: true,
				number: 1,
				null: null
			}
		}]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('TypedArrays + EJsonType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.EJsonTypeConfig
		])

		const typedArrays: any[] = [
			new Int8Array([1, 2]),
			new Int16Array([3, 4, 5]),
			new Int32Array([6, 7, 8, 9]),
			new BigInt64Array([BigInt(10), BigInt(11)]),
			new Uint8Array([12, 13, 14, 15, 16, 17, 18, 19, 20]),
			new Uint16Array([21]),
			new Uint32Array(9),
			new BigUint64Array([BigInt(31)]),
			new Uint8ClampedArray([]),
			new Float32Array([32, 33.33]),
			new Float64Array([Math.PI])
		]

		const data = typedArrays.concat([{
			image: new Uint8Array(Array(10 * 10).fill(255)),
			a: {
				b: {
					c: typedArrays
				}
			}
		}])

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('custom date type', () => {

		const dm = new DataManager()

		dm.addTypeConfig(TypeConfig.EJsonTypeConfig, {
			100: {
				BYTES_PER_ELEMENT: BigUint64Array.BYTES_PER_ELEMENT,
				testEncode: value => value instanceof Date,
				encode: data => new BigUint64Array([BigInt((data.value as Date).getTime())]),
				decode: data => new Date(Number(data.toTypedArray(BigUint64Array)[0]))
			}
		})

		const data = [
			new Date(1565858125372),
			{ date: new Date(1565858125373) }
		]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

	it('custom string type', () => {

		const dm = new DataManager()

		dm.addTypeConfig({
			100: {
				BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT,
				testEncode: value => typeof value === 'string',
				encode: data => Types.StringType.toTypedArray(data.value, Uint8Array),
				decode: data => Types.StringType.fromTypedArray(data.toTypedArray(Uint8Array))
			}
		})

		const data = [
			JSON.stringify({ title: 'hello world' })
		]

		expect(dm.decode(dm.encode(data))).toMatchObject(data)

	})

})