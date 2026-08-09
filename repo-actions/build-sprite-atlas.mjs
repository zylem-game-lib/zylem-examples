/**
 * Normalizes `src/assets/zylem-man-sprites.png` into a uniform-grid sprite
 * atlas the engine can address with plain UV math.
 *
 * The source sheet is an opaque RGB image whose frames sit at irregular
 * positions, so this script keys out the flat background, finds each frame,
 * and re-packs them into fixed-size cells aligned on a shared foot baseline.
 *
 * Pure Node: no sharp/ImageMagick dependency, PNG in and out via zlib.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PACKAGE_ROOT, 'src', 'assets');

const SOURCE_PNG = path.join(ASSETS_DIR, 'zylem-man-sprites.png');
const OUTPUT_PNG = path.join(ASSETS_DIR, 'zylem-man-atlas.png');
const OUTPUT_META = path.join(ASSETS_DIR, 'zylem-man-atlas.ts');

/** Flat sheet background. Measured from the source border pixels. */
const BACKGROUND = [241, 241, 241];
/** Deviation from {@link BACKGROUND} below which a keyed pixel is fully clear. */
const KEY_LOW = 18;
/** Deviation at and above which a pixel is fully opaque. */
const KEY_HIGH = 48;

/** Transparent margin kept around cell contents, in pixels. */
const CELL_PADDING = 6;
/** Cell dimensions are rounded up to this multiple to keep UVs tidy. */
const CELL_ALIGNMENT = 16;

/**
 * Expected animation bands, top to bottom. Segmentation is validated against
 * these counts so a bad key threshold fails loudly instead of silently
 * emitting a scrambled atlas.
 */
const BANDS = [
	{ name: 'idle', frames: 4, speed: 0.18, loop: true },
	{ name: 'walk', frames: 6, speed: 0.1, loop: true },
	{ name: 'run', frames: 5, speed: 0.06, loop: true },
	{ name: 'duck', frames: 2, speed: 0.12, loop: false },
	{ name: 'jump', frames: 4, speed: 0.12, loop: false },
];

// ── PNG decoding ────────────────────────────────────────────────────────────

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readChunks(buffer) {
	if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
		throw new Error('Source file is not a PNG.');
	}

	const chunks = [];
	let offset = 8;
	while (offset < buffer.length) {
		const length = buffer.readUInt32BE(offset);
		const type = buffer.toString('ascii', offset + 4, offset + 8);
		const data = buffer.subarray(offset + 8, offset + 8 + length);
		chunks.push({ type, data });
		if (type === 'IEND') break;
		offset += 12 + length;
	}
	return chunks;
}

function paethPredictor(a, b, c) {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	return pb <= pc ? b : c;
}

function unfilter(raw, width, height, bytesPerPixel) {
	const stride = width * bytesPerPixel;
	const out = Buffer.alloc(stride * height);
	let pos = 0;

	for (let y = 0; y < height; y++) {
		const filterType = raw[pos++];
		const line = raw.subarray(pos, pos + stride);
		pos += stride;

		const cur = out.subarray(y * stride, (y + 1) * stride);
		const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

		for (let i = 0; i < stride; i++) {
			const a = i >= bytesPerPixel ? cur[i - bytesPerPixel] : 0;
			const b = prev ? prev[i] : 0;
			const c = prev && i >= bytesPerPixel ? prev[i - bytesPerPixel] : 0;
			let value = line[i];

			switch (filterType) {
				case 0:
					break;
				case 1:
					value = (value + a) & 255;
					break;
				case 2:
					value = (value + b) & 255;
					break;
				case 3:
					value = (value + ((a + b) >> 1)) & 255;
					break;
				case 4:
					value = (value + paethPredictor(a, b, c)) & 255;
					break;
				default:
					throw new Error(`Unsupported PNG filter type ${filterType}.`);
			}

			cur[i] = value;
		}
	}

	return out;
}

function decodePng(buffer) {
	const chunks = readChunks(buffer);
	const header = chunks.find((chunk) => chunk.type === 'IHDR');
	if (!header) throw new Error('PNG is missing an IHDR chunk.');

	const width = header.data.readUInt32BE(0);
	const height = header.data.readUInt32BE(4);
	const bitDepth = header.data[8];
	const colorType = header.data[9];
	const interlace = header.data[12];

	if (bitDepth !== 8) {
		throw new Error(`Only 8-bit PNGs are supported (got ${bitDepth}-bit).`);
	}
	if (interlace !== 0) {
		throw new Error('Interlaced PNGs are not supported.');
	}
	if (colorType !== 2 && colorType !== 6) {
		throw new Error(
			`Only RGB and RGBA PNGs are supported (got color type ${colorType}).`,
		);
	}

	const channels = colorType === 6 ? 4 : 3;
	const idat = Buffer.concat(
		chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data),
	);
	const pixels = unfilter(zlib.inflateSync(idat), width, height, channels);

	return { width, height, channels, pixels };
}

// ── PNG encoding ────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
	const table = new Int32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c;
	}
	return table;
})();

function crc32(buffer) {
	let crc = -1;
	for (let i = 0; i < buffer.length; i++) {
		crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);
	const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(typeAndData), 0);
	return Buffer.concat([length, typeAndData, crc]);
}

/**
 * Filters a scanline with all five PNG predictors and keeps the one with the
 * smallest absolute-value sum, the standard heuristic for picking a filter.
 */
function filterScanline(cur, prev, stride, bytesPerPixel) {
	let best = null;

	for (let filterType = 0; filterType < 5; filterType++) {
		const line = Buffer.alloc(stride);
		let score = 0;

		for (let i = 0; i < stride; i++) {
			const a = i >= bytesPerPixel ? cur[i - bytesPerPixel] : 0;
			const b = prev ? prev[i] : 0;
			const c = prev && i >= bytesPerPixel ? prev[i - bytesPerPixel] : 0;
			let value;

			switch (filterType) {
				case 0:
					value = cur[i];
					break;
				case 1:
					value = cur[i] - a;
					break;
				case 2:
					value = cur[i] - b;
					break;
				case 3:
					value = cur[i] - ((a + b) >> 1);
					break;
				default:
					value = cur[i] - paethPredictor(a, b, c);
					break;
			}

			value &= 255;
			line[i] = value;
			score += value < 128 ? value : 256 - value;
		}

		if (!best || score < best.score) {
			best = { filterType, line, score };
		}
	}

	return best;
}

function encodePng(width, height, rgba) {
	const bytesPerPixel = 4;
	const stride = width * bytesPerPixel;
	const filtered = Buffer.alloc((stride + 1) * height);

	for (let y = 0; y < height; y++) {
		const cur = rgba.subarray(y * stride, (y + 1) * stride);
		const prev = y > 0 ? rgba.subarray((y - 1) * stride, y * stride) : null;
		const { filterType, line } = filterScanline(cur, prev, stride, bytesPerPixel);
		filtered[y * (stride + 1)] = filterType;
		line.copy(filtered, y * (stride + 1) + 1);
	}

	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header[8] = 8; // bit depth
	header[9] = 6; // color type: RGBA
	header[10] = 0; // compression
	header[11] = 0; // filter
	header[12] = 0; // interlace

	return Buffer.concat([
		PNG_SIGNATURE,
		chunk('IHDR', header),
		chunk('IDAT', zlib.deflateSync(filtered, { level: 9 })),
		chunk('IEND', Buffer.alloc(0)),
	]);
}

// ── Background keying ───────────────────────────────────────────────────────

function backgroundDistance(pixels, channels, index) {
	const i = index * channels;
	return Math.max(
		Math.abs(pixels[i] - BACKGROUND[0]),
		Math.abs(pixels[i + 1] - BACKGROUND[1]),
		Math.abs(pixels[i + 2] - BACKGROUND[2]),
	);
}

function smoothstep(edge0, edge1, value) {
	const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

/**
 * Builds a per-pixel alpha map by flood-filling the background inward from the
 * image border. A global colour key would punch holes through the sprite's own
 * near-white highlights; only background reachable from the edge is cleared.
 */
function buildAlphaMap({ width, height, channels, pixels }) {
	const alpha = new Uint8Array(width * height).fill(255);
	const visited = new Uint8Array(width * height);
	const stack = [];

	const push = (x, y) => {
		if (x < 0 || y < 0 || x >= width || y >= height) return;
		const index = y * width + x;
		if (visited[index]) return;
		if (backgroundDistance(pixels, channels, index) >= KEY_HIGH) return;
		visited[index] = 1;
		stack.push(index);
	};

	for (let x = 0; x < width; x++) {
		push(x, 0);
		push(x, height - 1);
	}
	for (let y = 0; y < height; y++) {
		push(0, y);
		push(width - 1, y);
	}

	while (stack.length > 0) {
		const index = stack.pop();
		const x = index % width;
		const y = (index - x) / width;
		const distance = backgroundDistance(pixels, channels, index);
		alpha[index] = Math.round(255 * smoothstep(KEY_LOW, KEY_HIGH, distance));
		push(x - 1, y);
		push(x + 1, y);
		push(x, y - 1);
		push(x, y + 1);
	}

	return alpha;
}

// ── Frame segmentation ──────────────────────────────────────────────────────

/** Alpha at or above which a pixel counts as frame content. */
const CONTENT_ALPHA = 128;
/** Rows with fewer content pixels than this are treated as empty. */
const ROW_NOISE_FLOOR = 2;
/** Column gaps this narrow are bridged, so thin limbs stay with their frame. */
const COLUMN_MERGE_GAP = 6;
/** Column runs narrower than this are discarded as speckle. */
const MIN_FRAME_WIDTH = 10;

function findRuns(length, isFilled) {
	const runs = [];
	let start = -1;
	for (let i = 0; i < length; i++) {
		if (isFilled(i)) {
			if (start < 0) start = i;
		} else if (start >= 0) {
			runs.push([start, i - 1]);
			start = -1;
		}
	}
	if (start >= 0) runs.push([start, length - 1]);
	return runs;
}

function segmentFrames(alpha, width, height) {
	const bands = findRuns(height, (y) => {
		let count = 0;
		for (let x = 0; x < width; x++) {
			if (alpha[y * width + x] >= CONTENT_ALPHA) count++;
		}
		return count > ROW_NOISE_FLOOR;
	});

	if (bands.length !== BANDS.length) {
		throw new Error(
			`Expected ${BANDS.length} animation bands, found ${bands.length}. Adjust the background key thresholds.`,
		);
	}

	return bands.map(([bandTop, bandBottom], bandIndex) => {
		const spec = BANDS[bandIndex];

		const rawColumns = findRuns(width, (x) => {
			for (let y = bandTop; y <= bandBottom; y++) {
				if (alpha[y * width + x] >= CONTENT_ALPHA) return true;
			}
			return false;
		});

		const merged = [];
		for (const run of rawColumns) {
			const previous = merged[merged.length - 1];
			if (previous && run[0] - previous[1] <= COLUMN_MERGE_GAP) {
				previous[1] = run[1];
			} else {
				merged.push([...run]);
			}
		}

		const columns = merged.filter(([x0, x1]) => x1 - x0 + 1 >= MIN_FRAME_WIDTH);
		if (columns.length !== spec.frames) {
			throw new Error(
				`Band "${spec.name}" should contain ${spec.frames} frames, found ${columns.length}.`,
			);
		}

		const frames = columns.map(([left, right], frameIndex) => {
			let top = bandBottom;
			let bottom = bandTop;
			for (let y = bandTop; y <= bandBottom; y++) {
				for (let x = left; x <= right; x++) {
					if (alpha[y * width + x] >= CONTENT_ALPHA) {
						if (y < top) top = y;
						if (y > bottom) bottom = y;
						break;
					}
				}
			}

			return {
				name: `${spec.name}-${frameIndex}`,
				left,
				right,
				top,
				bottom,
				width: right - left + 1,
				height: bottom - top + 1,
				/** Pixels this frame's lowest content sits above the band baseline. */
				liftOffBaseline: bandBottom - bottom,
			};
		});

		return { ...spec, top: bandTop, bottom: bandBottom, frames };
	});
}

// ── Atlas packing ───────────────────────────────────────────────────────────

function roundUpTo(value, multiple) {
	return Math.ceil(value / multiple) * multiple;
}

function planAtlas(bands) {
	const allFrames = bands.flatMap((band) => band.frames);
	const widest = Math.max(...allFrames.map((frame) => frame.width));
	const tallest = Math.max(
		...allFrames.map((frame) => frame.height + frame.liftOffBaseline),
	);

	const cellWidth = roundUpTo(widest + CELL_PADDING * 2, CELL_ALIGNMENT);
	const cellHeight = roundUpTo(tallest + CELL_PADDING * 2, CELL_ALIGNMENT);
	const columns = Math.max(...bands.map((band) => band.frames.length));
	const rows = bands.length;

	return { cellWidth, cellHeight, columns, rows };
}

function packAtlas(source, alpha, bands, layout) {
	const { cellWidth, cellHeight, columns, rows } = layout;
	const atlasWidth = cellWidth * columns;
	const atlasHeight = cellHeight * rows;
	const atlas = Buffer.alloc(atlasWidth * atlasHeight * 4);
	const names = new Array(columns * rows).fill(null);

	bands.forEach((band, row) => {
		band.frames.forEach((frame, column) => {
			const cellX = column * cellWidth;
			const cellY = row * cellHeight;

			// Centre on the frame's own bounding box, and keep the gap between the
			// frame's lowest pixel and its band baseline so airborne poses stay
			// airborne instead of being snapped down to the shared foot line.
			const originX = cellX + Math.round((cellWidth - frame.width) / 2);
			const originY =
				cellY + cellHeight - CELL_PADDING - frame.liftOffBaseline - frame.height;

			for (let y = 0; y < frame.height; y++) {
				for (let x = 0; x < frame.width; x++) {
					const sourceIndex = (frame.top + y) * source.width + (frame.left + x);
					const a = alpha[sourceIndex];
					if (a === 0) continue;

					const target = ((originY + y) * atlasWidth + (originX + x)) * 4;
					const s = sourceIndex * source.channels;

					if (a === 255) {
						atlas[target] = source.pixels[s];
						atlas[target + 1] = source.pixels[s + 1];
						atlas[target + 2] = source.pixels[s + 2];
					} else {
						// Un-mix the background the keyed edge was blended against,
						// otherwise every silhouette keeps a pale halo.
						const coverage = a / 255;
						for (let c = 0; c < 3; c++) {
							const observed = source.pixels[s + c];
							const unmixed =
								(observed - BACKGROUND[c] * (1 - coverage)) / coverage;
							atlas[target + c] = Math.min(255, Math.max(0, Math.round(unmixed)));
						}
					}

					atlas[target + 3] = a;
				}
			}

			names[row * columns + column] = frame.name;
		});
	});

	return { atlas, atlasWidth, atlasHeight, names };
}

// ── Metadata emission ───────────────────────────────────────────────────────

function formatFrameNames(names, columns) {
	const lines = [];
	for (let row = 0; row < names.length / columns; row++) {
		const cells = names
			.slice(row * columns, (row + 1) * columns)
			.map((name) => (name === null ? 'null' : `'${name}'`));
		lines.push(`\t\t${cells.join(', ')},`);
	}
	return lines.join('\n');
}

function emitMetadata({ layout, names, bands, standingHeight }) {
	const animations = bands
		.map((band) => {
			const frames = band.frames.map((frame) => `'${frame.name}'`).join(', ');
			return `\t{ name: '${band.name}', frames: [${frames}], speed: ${band.speed}, loop: ${band.loop} },`;
		})
		.join('\n');

	return `// Generated by repo-actions/build-sprite-atlas.mjs from zylem-man-sprites.png.
// Do not edit by hand; run \`pnpm build:sprite-atlas\` instead.

import atlasUrl from './zylem-man-atlas.png';

/** Uniform-grid sheet descriptor, consumed by \`createSprite({ sheet })\`. */
export const ZYLEM_MAN_SHEET = {
\tfile: atlasUrl,
\tcolumns: ${layout.columns},
\trows: ${layout.rows},
\tfilter: 'nearest' as const,
\tframes: [
${formatFrameNames(names, layout.columns)}
\t],
};

/** Flipbook clips covering every band in the source sheet. */
export const ZYLEM_MAN_ANIMATIONS = [
${animations}
];

/**
 * Pixel measurements of the packed cells. \`standingHeight\` is the idle pose's
 * content height, which is what a caller should scale against to place the
 * character at a chosen world height; \`baseline\` is the distance from the
 * bottom of a cell to the shared foot line.
 */
export const ZYLEM_MAN_METRICS = {
\tcellWidth: ${layout.cellWidth},
\tcellHeight: ${layout.cellHeight},
\tstandingHeight: ${standingHeight},
\tbaseline: ${CELL_PADDING},
};
`;
}

// ── Entry point ─────────────────────────────────────────────────────────────

function formatBytes(size) {
	return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
}

function main() {
	if (!fs.existsSync(SOURCE_PNG)) {
		throw new Error(
			`Missing source sheet: ${path.relative(PACKAGE_ROOT, SOURCE_PNG)}`,
		);
	}

	const source = decodePng(fs.readFileSync(SOURCE_PNG));
	console.log(
		`Source: ${source.width}x${source.height}, ${source.channels} channels`,
	);

	const alpha = buildAlphaMap(source);
	const bands = segmentFrames(alpha, source.width, source.height);
	for (const band of bands) {
		const sizes = band.frames
			.map((frame) => `${frame.width}x${frame.height}`)
			.join(' ');
		console.log(`  ${band.name.padEnd(5)} ${band.frames.length} frames: ${sizes}`);
	}

	const layout = planAtlas(bands);
	const { atlas, atlasWidth, atlasHeight, names } = packAtlas(
		source,
		alpha,
		bands,
		layout,
	);

	const png = encodePng(atlasWidth, atlasHeight, atlas);
	fs.writeFileSync(OUTPUT_PNG, png);

	const standingHeight = bands.find((band) => band.name === 'idle').frames[0]
		.height;
	fs.writeFileSync(
		OUTPUT_META,
		emitMetadata({ layout, names, bands, standingHeight }),
	);

	console.log(
		`Atlas: ${atlasWidth}x${atlasHeight} (${layout.columns}x${layout.rows} cells of ${layout.cellWidth}x${layout.cellHeight}), ${formatBytes(png.length)}`,
	);
	console.log(`Wrote ${path.relative(PACKAGE_ROOT, OUTPUT_PNG)}`);
	console.log(`Wrote ${path.relative(PACKAGE_ROOT, OUTPUT_META)}`);
}

try {
	main();
} catch (error) {
	console.error(error);
	process.exit(1);
}
