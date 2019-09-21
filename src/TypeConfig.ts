import { EJsonType } from "./Types/EJsonType"
import { StringType } from "./Types/StringType"
import { JsonType } from "./Types/JsonType"

/**
 * TypedArray type enum (reserved from 1 to 31)
 */

export enum TypedArrayTypeEnum {
	Int8Array = 1,
	Int16Array,
	Int32Array,
	BigInt64Array,
	Uint8Array,
	Uint16Array,
	Uint32Array,
	BigUint64Array,
	Uint8ClampedArray,
	Float32Array,
	Float64Array
}

/**
 * DataManager type enum (reserved from 32 to 99)
 */

export enum DataManagerTypeEnum {
	StringType = 32,
	JsonType,
	EJsonType
}

export var TypedArrayTypeConfig = {
	[TypedArrayTypeEnum.Int8Array]: new Int8Array,
	[TypedArrayTypeEnum.Int16Array]: new Int16Array,
	[TypedArrayTypeEnum.Int32Array]: new Int32Array,
	[TypedArrayTypeEnum.BigInt64Array]: new BigInt64Array,
	[TypedArrayTypeEnum.Uint8Array]: new Uint8Array,
	[TypedArrayTypeEnum.Uint16Array]: new Uint16Array,
	[TypedArrayTypeEnum.Uint32Array]: new Uint32Array,
	[TypedArrayTypeEnum.BigUint64Array]: new BigUint64Array,
	[TypedArrayTypeEnum.Uint8ClampedArray]: new Uint8ClampedArray,
	[TypedArrayTypeEnum.Float32Array]: new Float32Array,
	[TypedArrayTypeEnum.Float64Array]: new Float64Array,
}

export var JsonTypeConfig = {
	[DataManagerTypeEnum.JsonType]: new JsonType
}

export var EJsonTypeConfig = {
	[DataManagerTypeEnum.EJsonType]: new EJsonType
}

export var StringTypeConfig = {
	[DataManagerTypeEnum.StringType]: new StringType
}