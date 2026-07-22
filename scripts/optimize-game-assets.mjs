import { execFileSync } from 'node:child_process';
import { readFile, rename, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetDir = join(root, 'client', 'public', 'assets');
const files = ['weapons.glb', 'props.glb', 'environment.glb', 'landmarks.glb', 'character.glb'];
const requiredRoots = {
  'weapons.glb': ['weapon_fists', 'weapon_machete', 'weapon_spear', 'weapon_bow', 'weapon_pistol', 'weapon_rifle', 'weapon_shotgun', 'weapon_sniper', 'weapon_grenade', 'weapon_smoke', 'weapon_flash'],
  'props.glb': ['prop_crate_common', 'prop_crate_good', 'prop_crate_top', 'prop_care', 'prop_bandage', 'prop_plate', 'prop_arrow_bundle', 'prop_pistol_ammo', 'prop_rifle_ammo', 'prop_shell_ammo', 'prop_sniper_ammo', 'prop_projectile_arrow'],
  'environment.glb': ['env_tree_pine', 'env_tree_broadleaf', 'env_tree_palm', 'env_rock_boulder', 'env_rock_slab', 'env_rock_cluster', 'env_bush', 'env_grass', 'env_stump', 'env_rock_chips', 'env_rubble', 'env_barrel', 'env_brazier', 'env_torch', 'env_spawn_marker', 'env_ruin_wall', 'env_ruin_cap'],
  'landmarks.glb': ['poi_wreck', 'poi_watchtower', 'poi_bunker'],
  'character.glb': ['player_survivor', 'player_body', 'player_head', 'player_gear', 'player_weapon_socket'],
};
const triangleBudgets = {
  'weapons.glb': 20_000,
  'props.glb': 20_000,
  'environment.glb': 20_000,
  'landmarks.glb': 25_000,
  'character.glb': 5_000,
};

function glbJson(buffer) {
  if (buffer.toString('utf8', 0, 4) !== 'glTF') throw new Error('Not a GLB file');
  const jsonLength = buffer.readUInt32LE(12);
  const jsonType = buffer.toString('utf8', 16, 20);
  if (jsonType !== 'JSON') throw new Error('GLB has no JSON chunk');
  return JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
}

async function validate() {
  const atlas = await readFile(join(assetDir, 'island-atlas.png'));
  if (atlas.readUInt32BE(16) !== 512 || atlas.readUInt32BE(20) !== 256) {
    throw new Error('island-atlas.png must be 512×256');
  }
  let bytes = (await stat(join(assetDir, 'island-atlas.png'))).size;
  const report = [];
  for (const file of files) {
    const path = join(assetDir, file);
    const buffer = await readFile(path);
    const json = glbJson(buffer);
    const names = new Set((json.nodes ?? []).map((node) => node.name));
    const missing = requiredRoots[file].filter((name) => !names.has(name));
    if (missing.length) throw new Error(`${file}: missing nodes ${missing.join(', ')}`);
    const meshes = json.meshes ?? [];
    const triangles = meshes.reduce((sum, mesh) => sum + (mesh.primitives ?? []).reduce((meshSum, primitive) => {
      const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
      return meshSum + Math.floor((json.accessors?.[accessorIndex]?.count ?? 0) / 3);
    }, 0), 0);
    if (triangles > triangleBudgets[file]) {
      throw new Error(`${file}: ${triangles} triangles exceed budget ${triangleBudgets[file]}`);
    }
    if (!json.extensionsRequired?.includes('EXT_meshopt_compression')) {
      throw new Error(`${file}: Meshopt compression is required`);
    }
    const missingUvs = meshes.filter((mesh) => mesh.primitives?.some((p) => p.attributes?.TEXCOORD_0 === undefined));
    if (missingUvs.length) throw new Error(`${file}: ${missingUvs.length} meshes lack TEXCOORD_0`);
    bytes += buffer.byteLength;
    report.push({ file, bytes: buffer.byteLength, nodes: names.size, meshes: meshes.length, triangles });
  }
  if (bytes > 1_000_000) throw new Error(`Asset payload ${bytes} exceeds the 1 MB browser budget`);
  console.table(report);
  console.log(`Validated complete asset payload: ${(bytes / 1024).toFixed(1)} KiB`);
}

if (!process.argv.includes('--validate-only')) {
  const cli = join(root, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');
  for (const file of files) {
    const output = join(assetDir, file);
    const raw = join(assetDir, file.replace('.glb', '.blender.glb'));
    const welded = join(assetDir, file.replace('.glb', '.weld.glb'));
    await rm(raw, { force: true });
    await rm(welded, { force: true });
    await rename(output, raw);
    execFileSync(process.execPath, [cli, 'weld', raw, welded], { cwd: root, stdio: 'inherit' });
    execFileSync(process.execPath, [cli, 'meshopt', welded, output, '--level', 'high'], { cwd: root, stdio: 'inherit' });
    await rm(raw, { force: true });
    await rm(welded, { force: true });
  }
}

await validate();
