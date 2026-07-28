"""Export the reviewed middle-island scene for the Three.js runtime.

Run with the reviewed ``middle-island-v2.blend`` open in Blender 5.2+:

    blender --background art/concepts/middle-island-v1/middle-island-v2.blend \
      --python scripts/blender/export_middle_island.py

The authored render meshes are merged by material for a small draw-call count.
Gameplay collision stays independent and is written as simple box/cylinder
proxies for the deterministic shared WorldGen/Rapier runtime.
"""
from __future__ import annotations

from collections import defaultdict
import json
import math
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "client" / "public" / "assets"
GLB_PATH = PUBLIC / "middle-island.glb"
MANIFEST_PATH = ROOT / "shared" / "src" / "middle-island.json"

SOURCE_COLLECTIONS = (
    "Arena_Base",
    "Arena_Cover",
    "Arena_Central",
    "Arena_Platforms",
    "Arena_Props",
    "Arena_Nature",
)
GROUND_SURFACE_Z = 1.08
GAME_FLOOR_Y = 5.5


def export_excluded(name: str) -> bool:
    """Skip preview-only ground and non-interactive loot stand-ins."""
    return (
        name == "Surrounding_Ground"
        or (name.startswith("LootSpot_Center_") and not name.endswith("_Pad"))
        or (name.startswith("LootNiche_") and "_Crate" in name)
    )


def visible_source_meshes() -> list[bpy.types.Object]:
    meshes: list[bpy.types.Object] = []
    for collection_name in SOURCE_COLLECTIONS:
        collection = bpy.data.collections.get(collection_name)
        if collection is None:
            raise RuntimeError(f"Missing required collection: {collection_name}")
        meshes.extend(
            obj
            for obj in collection.objects
            if obj.type == "MESH" and not obj.hide_render and not export_excluded(obj.name)
        )
    return list(dict.fromkeys(meshes))


def export_glb() -> dict[str, int]:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    sources = visible_source_meshes()
    temporary = bpy.data.collections.new("__MIDDLE_ISLAND_EXPORT__")
    bpy.context.scene.collection.children.link(temporary)
    root = bpy.data.objects.new("middle_island", None)
    temporary.objects.link(root)
    root["asset_id"] = "middle_island"
    root["ground_surface_z"] = GROUND_SURFACE_Z
    root["game_floor_y"] = GAME_FLOOR_Y
    root["game_root_y"] = GAME_FLOOR_Y - GROUND_SURFACE_Z

    merged: list[bpy.types.Object] = []
    try:
        material_groups: dict[str, list[bpy.types.Object]] = defaultdict(list)
        standalone: list[bpy.types.Object] = []
        for source in sources:
            clone = source.copy()
            clone.data = source.data.copy()
            clone.name = f"EXP_{source.name}"
            temporary.objects.link(clone)
            clone.matrix_world = source.matrix_world.copy()
            clone.data.transform(clone.matrix_world)
            clone.matrix_world = Matrix.Identity(4)
            if len(clone.material_slots) == 1:
                material = clone.material_slots[0].material
                material_groups[material.name if material else "__none__"].append(clone)
            else:
                standalone.append(clone)

        for material_name, group in material_groups.items():
            if len(group) > 1:
                bpy.ops.object.select_all(action="DESELECT")
                for obj in group:
                    obj.select_set(True)
                bpy.context.view_layer.objects.active = group[0]
                bpy.ops.object.join()
            joined = group[0]
            joined.name = f"middle_island_{material_name.lower().replace(' ', '_')}"
            joined.parent = root
            merged.append(joined)

        for obj in standalone:
            obj.name = f"middle_island_{obj.name.removeprefix('EXP_').lower()}"
            obj.parent = root
            merged.append(obj)

        bpy.ops.object.select_all(action="DESELECT")
        root.select_set(True)
        for obj in merged:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = root
        bpy.ops.export_scene.gltf(
            filepath=str(GLB_PATH),
            export_format="GLB",
            use_selection=True,
            export_apply=True,
            export_texcoords=True,
            export_normals=True,
            export_materials="EXPORT",
            export_cameras=False,
            export_lights=False,
            export_animations=False,
            export_yup=True,
        )
        triangles = sum(
            max(0, len(polygon.vertices) - 2)
            for obj in merged
            if obj.type == "MESH"
            for polygon in obj.data.polygons
        )
        return {
            "sourceMeshes": len(sources),
            "exportMeshNodes": len(merged),
            "triangles": triangles,
            "bytes": GLB_PATH.stat().st_size,
        }
    finally:
        for obj in list(temporary.objects):
            data = obj.data if obj.type == "MESH" else None
            bpy.data.objects.remove(obj, do_unlink=True)
            if data is not None and data.users == 0:
                bpy.data.meshes.remove(data)
        bpy.data.collections.remove(temporary)


def collider_box(obj: bpy.types.Object) -> dict[str, object]:
    # Blender XY/Z-up maps to Three.js X,-Z/Y-up through glTF.
    return {
        "name": obj.name,
        "shape": "box",
        "center": [
            round(obj.location.x, 4),
            round(obj.location.z, 4),
            round(-obj.location.y, 4),
        ],
        "size": [
            round(obj.dimensions.x, 4),
            round(obj.dimensions.z, 4),
            round(obj.dimensions.y, 4),
        ],
        "yaw": round(obj.rotation_euler.z, 6),
    }


def ramp_surface(name: str) -> dict[str, object]:
    obj = bpy.data.objects[name]
    points = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
    top_by_xy: dict[tuple[float, float], float] = {}
    for point in points:
        key = (round(point.x, 5), round(point.y, 5))
        top_by_xy[key] = max(top_by_xy.get(key, -math.inf), point.z)
    top = [Vector((x, y, z)) for (x, y), z in top_by_xy.items()]
    low_z = min(point.z for point in top)
    high_z = max(point.z for point in top)
    low = [point for point in top if abs(point.z - low_z) < 0.0001]
    high = [point for point in top if abs(point.z - high_z) < 0.0001]
    if len(low) != 2 or len(high) != 2:
        raise RuntimeError(f"Ramp {name} must have two low and two high top vertices")

    low_center = (low[0] + low[1]) * 0.5
    high_center = (high[0] + high[1]) * 0.5
    width = (low[0] - low[1]).length
    run = Vector((
        high_center.x - low_center.x,
        high_center.y - low_center.y,
        0,
    )).length
    rise = high_z - low_z
    slope_length = math.hypot(run, rise)
    pitch = math.atan2(rise, run)
    thickness = 0.1
    high_to_low = Vector((
        low_center.x - high_center.x,
        -low_center.y + high_center.y,
    ))
    yaw = math.atan2(high_to_low.x, high_to_low.y)
    surface_mid = (low_z + high_z) * 0.5
    center_y = surface_mid - thickness / (2 * math.cos(pitch))
    return {
        "name": name,
        "shape": "box",
        "center": [
            round((low_center.x + high_center.x) * 0.5, 4),
            round(center_y, 4),
            round(-(low_center.y + high_center.y) * 0.5, 4),
        ],
        "size": [round(width, 4), thickness, round(slope_length, 4)],
        "yaw": round(yaw, 6),
        "pitch": round(pitch, 6),
        "walkSurface": True,
    }


def build_manifest() -> dict[str, object]:
    colliders: list[dict[str, object]] = []

    for obj in bpy.data.collections["Arena_Cover"].objects:
        if obj.type == "MESH" and not obj.hide_render:
            colliders.append(collider_box(obj))

    for obj in bpy.data.collections["Arena_Platforms"].objects:
        if obj.type == "MESH" and not obj.hide_render and "_Ramp" not in obj.name:
            colliders.append(collider_box(obj))

    for obj in bpy.data.collections["Arena_Props"].objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        if obj.name.startswith("Prop_Crate_") or (
            obj.name.startswith("Training_Target_") and obj.name.count("_") == 2
        ):
            colliders.append(collider_box(obj))

    for obj in bpy.data.collections["Arena_Nature"].objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        if obj.name.startswith(("Nature_Rock_", "Nature_EdgeRock_", "Nature_EdgeStone_")):
            colliders.append(collider_box(obj))

    for obj in bpy.data.collections["Arena_Central"].objects:
        if obj.type == "MESH" and obj.name.startswith("Central_Ring_Block_"):
            colliders.append(collider_box(obj))

    for name, radius in (
        ("Central_Ring_Base", 3.74),
        ("Central_Ring_Upper", 2.79),
        ("Brazier_StoneBase", 1.29),
    ):
        obj = bpy.data.objects[name]
        colliders.append({
            "name": name,
            "shape": "cylinder",
            "center": [
                round(obj.location.x, 4),
                round(obj.location.z, 4),
                round(-obj.location.y, 4),
            ],
            "radius": radius,
            "height": round(obj.dimensions.z, 4),
        })

    colliders.extend((
        ramp_surface("Platform_NorthWest_Ramp"),
        ramp_surface("Platform_SouthEast_Ramp"),
    ))

    loot_spots = []
    for index in range(1, 4):
        obj = bpy.data.objects[f"LootSpot_Center_0{index}_Pad"]
        loot_spots.append([round(obj.location.x, 4), round(-obj.location.y, 4)])

    return {
        "version": 1,
        "coordinateSystem": "three-y-up",
        "groundSurfaceZ": GROUND_SURFACE_Z,
        "gameFloorY": GAME_FLOOR_Y,
        "rootYOffset": round(GAME_FLOOR_Y - GROUND_SURFACE_Z, 4),
        "colliders": colliders,
        "lootSpots": loot_spots,
    }


def main() -> None:
    stats = export_glb()
    manifest = build_manifest()
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "blend": bpy.data.filepath,
        "glb": str(GLB_PATH),
        "manifest": str(MANIFEST_PATH),
        "colliders": len(manifest["colliders"]),
        "lootSpots": len(manifest["lootSpots"]),
        **stats,
    }, indent=2))


if __name__ == "__main__":
    main()
