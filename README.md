# DataManager
> DataManager provides a friendly interface for reading/writing typed arrays in ArrayBuffer.

## Features

- Custom types
- Auto byte alignment
- Low overhead size

## Installation

```sh
npm i @swordev/datamanger
```

## Usage

```typescript
import DataManager from "@swordev/datamanager"

const dm = new DataManager()
const data = [
	new Uint8Array(100 * 100).fill(255),
	new Float32Array([Math.PI]),
]
const encoded = dm.encode(data) // ArrayBuffer
const decoded = dm.decode(encoded) // [Uint8Array, Float32Array]
const byteLength = encoded.byteLength // 10000 + 4 + 20
```

## Examples

### JSON

```typescript
import DataManager from "@swordev/datamanager"
import { Json } from "@swordev/datamanager/TypeConfig"

const dm = new DataManager([Json])
const data = [
	{ value: new Uint8Array([2, 4, 8]) }
]
const encoded = dm.encode(data) // ArrayBuffer
const decoded = dm.decode(encoded) // [{ value: { 0: 2, 1: 4: 2: 8 } }]
```

### Extended JSON

```typescript
import DataManager from "@swordev/datamanager"
import { EJson } from "@swordev/datamanager/TypeConfig"

const dm = new DataManager([EJson])
const data = [
	{ value: new Uint8Array([2, 4, 8]) }
]
const encoded = dm.encode(data) // ArrayBuffer
const decoded = dm.decode(encoded) // [{ value: Uint8Array }]
```

### Typed arrays + Extended JSON

```typescript
import DataManager from "@swordev/datamanager"
import { EJson } from "@swordev/datamanager/TypeConfig"

const dm = new DataManager([EJson])
const data = [
	new Float32Array([Math.PI]),
	{ image: new Uint8Array(1024 * 768) }
]
const encoded = dm.encode(data) // ArrayBuffer
const decoded = dm.decode(encoded) // [Float32Array, { image: Uint8Array }]
```

### Custom type + Extended JSON

```typescript
import DataManager from "@swordev/datamanager"
import { EJsonTypeConfig } from "@swordev/datamanager/TypeConfig"

const dm = new DataManager([EJsonTypeConfig])

dm.addTypeConfig({
	100: {
		BYTES_PER_ELEMENT:
			BigUint64Array.BYTES_PER_ELEMENT,
		testEncode: value =>
			value instanceof Date,
		encode: data =>
			new BigUint64Array([BigInt((data.value as Date).getTime())]),
		decode: data =>
			new Date(Number(data.toTypedArray(BigUint64Array)[0]))
	}
})

const data = [
	new Date,
	{ date: new Date }
]
const encoded = dm.encode(data) // ArrayBuffer
const decoded = dm.decode(encoded) // [Date, { date: Date }]
```

## Building

```sh
git clone https://github.com/swordev/datamanager-js.git
cd datamanager-js
npm install
npm run build
```