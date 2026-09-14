import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** Decode production geometry/skins in Node. Texture rendering is covered in Playwright. */
export async function loadModel(file: string) {
  const buffer = readFileSync(`client/public/assets/${file}`);
  const length = buffer.readUInt32LE(12);
  const json = JSON.parse(buffer.toString('utf8', 20, 20 + length));
  const binary = buffer.subarray(28 + length);
  // Images require browser decoding; keep all model transforms and skin data intact.
  delete json.images;
  delete json.textures;
  for (const m of json.materials ?? []) {
    delete m.normalTexture; delete m.occlusionTexture; delete m.emissiveTexture;
    delete m.pbrMetallicRoughness?.baseColorTexture;
    delete m.pbrMetallicRoughness?.metallicRoughnessTexture;
    delete m.extensions;
  }
  json.extensionsRequired = json.extensionsRequired?.filter((n: string) => n !== 'EXT_texture_webp');
  json.extensionsUsed = json.extensionsUsed?.filter((n: string) => n !== 'EXT_texture_webp');
  const encoded = Buffer.from(JSON.stringify(json));
  const padded = Buffer.alloc(Math.ceil(encoded.length / 4) * 4, 0x20);
  encoded.copy(padded);
  const result = Buffer.alloc(28 + padded.length + binary.length);
  result.write('glTF'); result.writeUInt32LE(2, 4); result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(padded.length, 12); result.write('JSON', 16); padded.copy(result, 20);
  result.writeUInt32LE(binary.length, 20 + padded.length); result.writeUInt32LE(0x004e4942, 24 + padded.length);
  binary.copy(result, 28 + padded.length);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return (await loader.parseAsync(result.buffer.slice(result.byteOffset, result.byteOffset + result.length), '')).scene;
}
