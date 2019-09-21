import { DataManager, TypedArray } from "./../src/DataManager"
import * as TypeConfig from "./../src/TypeConfig"
import * as Types from "./../src/Types"
import { assert, expect } from "chai"

describe('DataManager.isArrayTyped', () => {

	it('success', () => {

		assert.isTrue(DataManager.isArrayTyped(new Int8Array()))
		assert.isTrue(DataManager.isArrayTyped(new Int16Array()))
		assert.isTrue(DataManager.isArrayTyped(new Int32Array()))
		assert.isTrue(DataManager.isArrayTyped(new BigInt64Array()))
		assert.isTrue(DataManager.isArrayTyped(new Uint8Array()))
		assert.isTrue(DataManager.isArrayTyped(new Uint16Array()))
		assert.isTrue(DataManager.isArrayTyped(new Uint32Array()))
		assert.isTrue(DataManager.isArrayTyped(new BigUint64Array()))
		assert.isTrue(DataManager.isArrayTyped(new Uint8ClampedArray()))
		assert.isTrue(DataManager.isArrayTyped(new Float32Array()))
		assert.isTrue(DataManager.isArrayTyped(new Float64Array()))

	})

	it('error', () => {

		assert.isFalse(DataManager.isArrayTyped(new DataView(new ArrayBuffer(1))))
		assert.isFalse(DataManager.isArrayTyped(1))
		assert.isFalse(DataManager.isArrayTyped(null))
		assert.isFalse(DataManager.isArrayTyped(undefined))
		assert.isFalse(DataManager.isArrayTyped(function () { }))
		assert.isFalse(DataManager.isArrayTyped({}))
		assert.isFalse(DataManager.isArrayTyped([]))
		assert.isFalse(DataManager.isArrayTyped('str'))
		assert.isFalse(DataManager.isArrayTyped(true))

	})

})

describe('DataManager.offsets', () => {

	it('without byteLength', () => {

		assert.deepEqual(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 1 },
			{ BYTES_PER_ELEMENT: Uint16Array.BYTES_PER_ELEMENT, length: 1 },
			{ BYTES_PER_ELEMENT: Uint32Array.BYTES_PER_ELEMENT, length: 1 }
		]), { result: [0, 2, 4], byteLength: 8 })

	})

	it('with byteLength', () => {

		assert.deepEqual(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 5 },
			{ BYTES_PER_ELEMENT: BigInt64Array.BYTES_PER_ELEMENT, length: 5 }
		], 3), { result: [3, 8], byteLength: 48 })

		assert.deepEqual(DataManager.offsets([
			{ BYTES_PER_ELEMENT: Uint8Array.BYTES_PER_ELEMENT, length: 5 },
			{ BYTES_PER_ELEMENT: BigInt64Array.BYTES_PER_ELEMENT, length: 5 }
		], 4), { result: [4, 16], byteLength: 56 })

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

		assert.deepEqual(arrays, DataManager.decode(buffer, decodeData).result)

	})


})

describe('StringType.toTypedArray', () => {

	it('success', () => {

		assert.deepEqual(
			Types.StringType.toTypedArray('hello world ♥'),
			new Uint16Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 32, 9829])
		)

		assert.deepEqual(
			Types.StringType.toTypedArray('hello world', Uint8Array),
			new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
		)

	})

	it('error', () => {

		expect(() => Types.StringType.toTypedArray('hello world ♥', Uint8Array)).to.throw();

	})

})

describe('JsonType.isPlainObject', () => {

	it('success', () => {

		assert.isTrue(Types.JsonType.isPlainObject({}))
		assert.isTrue(Types.JsonType.isPlainObject(Object.create({})))

	})

	it('error', () => {

		assert.isFalse(Types.JsonType.isPlainObject(null))
		assert.isFalse(Types.JsonType.isPlainObject(undefined))
		assert.isFalse(Types.JsonType.isPlainObject(function () { }))
		assert.isFalse(Types.JsonType.isPlainObject(new function () { }))
		assert.isFalse(Types.JsonType.isPlainObject(1))
		assert.isFalse(Types.JsonType.isPlainObject(false))
		assert.isFalse(Types.JsonType.isPlainObject(''))
		assert.isFalse(Types.JsonType.isPlainObject([]))

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

		assert.deepEqual(dm.decode(dm.encode(data)), data)

	})

	it('StringType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.StringTypeConfig
		])

		const data = [
			"hello world"
		]

		assert.deepEqual(dm.decode(dm.encode(data)), data)

	})

	it('JsonType', () => {

		const dm = new DataManager([
			TypeConfig.TypedArrayTypeConfig,
			TypeConfig.JsonTypeConfig
		])

		const data = [
			{ text: "hello world" }
		]

		assert.deepEqual(dm.decode(dm.encode(data)), data)

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
			}
		}]

		assert.deepEqual(dm.decode(dm.encode(data)), data)

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

		assert.deepEqual(dm.decode(dm.encode(data)), data)

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

		assert.deepEqual(dm.decode(dm.encode(data)), data)

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

		assert.deepEqual(dm.decode(dm.encode(data)), data)

	})

})