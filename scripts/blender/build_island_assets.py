"""Build Island Duell's low-poly web assets inside Blender.

Run from Blender's scripting workspace or through Blender MCP. The script is
deterministic, saves the editable master .blend, exports raw GLBs, the shared
atlas and the collider manifest consumed by world generation.
"""
from __future__ import annotations

import json
import math
import struct
import zlib
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "client" / "public" / "assets"
ART = ROOT / "art"
COLLIDER_MANIFEST = ROOT / "shared" / "src" / "landmark-colliders.json"
GRID_X, GRID_Y = 8, 4

PALETTE = [
    "26313a", "c4ced5", "7a5030", "171d22", "d9a441", "5a3d28", "b68cff", "ff8c56",
    "7ee0c2", "527b48", "aab5bd", "d7c78e", "8f8a7d", "5d7440", "8a5a3a", "d5c8a7",
    "ffc247", "b89555", "b94739", "0d1216", "d8a878", "e5484d", "2f6d38", "4f9044",
    "6d604d", "397f9f", "c98a2e", "5c9ead", "f1eee7", "817b70", "e8b44a", "ffffff",
]

T = {
    "gun": 0, "steel": 1, "wood": 2, "grip": 3, "brass": 4, "leather": 5,
    "purple": 6, "orange": 7, "teal": 8, "green": 9, "smoke": 10, "flash": 11,
    "stone": 12, "moss": 13, "rust": 14, "sail": 15, "hazard": 16, "rope": 17,
    "signal": 18, "dark": 19, "skin": 20, "player": 31, "leaf_dark": 22,
    "leaf": 23, "crate": 24, "crate_good": 25, "crate_top": 26, "plate": 27,
    "bandage": 28, "plaza": 29, "ammo": 30, "white": 31,
}


def rgb(hex_color: str) -> tuple[float, float, float, float]:
    return tuple(int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def reset_scene() -> None:
    # Data-block removal also clears objects hidden by a previous inspection;
    # operator selection alone intentionally skips hidden viewport objects.
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.images):
        for block in list(datablocks):
            datablocks.remove(block)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    base = bpy.data.collections.get("Collection")
    if base:
        base.name = "00_ASSET_MASTER"
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE"
    scene.world.color = (0.035, 0.05, 0.065)


def create_atlas() -> bpy.types.Image:
    width, height = 512, 256
    rgba = bytearray(width * height * 4)
    tile_w, tile_h = width // GRID_X, height // GRID_Y
    for y in range(height):
        # Image rows are top-down while UV V=0 addresses the bottom row.
        ty = GRID_Y - 1 - min(GRID_Y - 1, y // tile_h)
        for x in range(width):
            tx = min(GRID_X - 1, x // tile_w)
            tile = ty * GRID_X + tx
            base = rgb(PALETTE[tile])
            local_x, local_y = x % tile_w, y % tile_h
            grain = ((x * 13 + y * 7 + tile * 19) % 29) / 28
            factor = 0.93 + grain * 0.07
            # A little authored surface language goes much further than a
            # larger texture on these deliberately compact models. Patterns
            # stay inside their tile and therefore remain atlas-safe.
            if tile in (T["wood"], T["leather"], T["crate"], T["crate_good"], T["crate_top"]):
                wave = math.sin((local_x * .34) + math.sin(local_y * .11) * 1.8)
                factor *= 0.91 if wave > .74 else 1.02
            elif tile in (T["gun"], T["steel"], T["dark"], T["plate"]):
                if local_x in range(8, 11) or local_y in range(tile_h - 11, tile_h - 8):
                    factor *= 1.12
            elif tile in (T["leaf_dark"], T["leaf"], T["moss"]):
                mottled = ((local_x // 8) * 5 + (local_y // 7) * 3 + tile) % 9
                factor *= 0.88 if mottled in (0, 1) else 1.03
            elif tile == T["hazard"]:
                # Dark diagonal warning bands; used sparingly on handles,
                # beacons and POI signage.
                if ((local_x + local_y) // 10) % 2:
                    factor *= .46
            elif tile == T["bandage"]:
                if abs(local_x - tile_w / 2) < 5 or abs(local_y - tile_h / 2) < 5:
                    factor *= .72
            if local_x in (1, tile_w - 2) or local_y in (1, tile_h - 2):
                factor *= 0.88
            idx = (y * width + x) * 4
            rgba[idx:idx + 4] = bytes((
                round(base[0] * factor * 255), round(base[1] * factor * 255),
                round(base[2] * factor * 255), 255,
            ))
    scanlines = bytearray()
    stride = width * 4
    for y in range(height):
        scanlines.append(0)
        scanlines.extend(rgba[y * stride:(y + 1) * stride])

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)

    atlas_path = PUBLIC / "island-atlas.png"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    atlas_path.write_bytes(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(scanlines), 9)) + chunk(b"IEND", b"")
    )
    image = bpy.data.images.load(str(atlas_path), check_existing=False)
    image.name = "island_atlas"
    image.colorspace_settings.name = "sRGB"
    return image


def create_material(image: bpy.types.Image) -> bpy.types.Material:
    material = bpy.data.materials.new("island_atlas")
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bsdf.inputs["Roughness"].default_value = 0.82
    bsdf.inputs["Metallic"].default_value = 0.05
    texture = material.node_tree.nodes.new("ShaderNodeTexImage")
    texture.name = "island_atlas_texture"
    texture.image = image
    texture.interpolation = "Closest"
    material.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
    return material


ATLAS_MATERIAL: bpy.types.Material


def asset_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def root(collection: bpy.types.Collection, name: str) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    collection.objects.link(obj)
    obj.empty_display_type = "PLAIN_AXES"
    obj["asset_id"] = name
    return obj


def map_uv(obj: bpy.types.Object, tile: int) -> None:
    mesh = obj.data
    created = not mesh.uv_layers
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv_layer = mesh.uv_layers.active.data
    if created:
        # Custom silhouette meshes have no primitive UVs. Project every face
        # along its dominant normal and normalize it into the atlas tile.
        for poly in mesh.polygons:
            normal = poly.normal
            axis = max(range(3), key=lambda i: abs(normal[i]))
            projected = []
            for loop_index in poly.loop_indices:
                co = mesh.vertices[mesh.loops[loop_index].vertex_index].co
                projected.append((co.x, co.y) if axis == 2 else ((co.x, co.z) if axis == 1 else (co.y, co.z)))
            min_u = min(p[0] for p in projected); max_u = max(p[0] for p in projected)
            min_v = min(p[1] for p in projected); max_v = max(p[1] for p in projected)
            span_u, span_v = max(max_u - min_u, 1e-5), max(max_v - min_v, 1e-5)
            for loop_index, point in zip(poly.loop_indices, projected):
                uv_layer[loop_index].uv = ((point[0] - min_u) / span_u, (point[1] - min_v) / span_v)
    pad_u, pad_v = 0.004, 0.008
    tile_u, tile_v = 1 / GRID_X, 1 / GRID_Y
    u0 = (tile % GRID_X) * tile_u + pad_u
    v0 = (tile // GRID_X) * tile_v + pad_v
    for loop in mesh.loops:
        uv = uv_layer[loop.index].uv
        uv.x = u0 + (uv.x % 1.0) * (tile_u - 2 * pad_u)
        uv.y = v0 + (uv.y % 1.0) * (tile_v - 2 * pad_v)


def setup_mesh(obj: bpy.types.Object, parent: bpy.types.Object, collection: bpy.types.Collection,
               tile: int, name: str | None = None) -> bpy.types.Object:
    move_to_collection(obj, collection)
    obj.parent = parent
    obj.name = name or f"part_{len(parent.children):03d}"
    if not obj.data.materials:
        obj.data.materials.append(ATLAS_MATERIAL)
    map_uv(obj, tile)
    obj.color = rgb(PALETTE[tile])
    for poly in obj.data.polygons:
        poly.use_smooth = False
    return obj


def box(parent, collection, size, loc, tile, rot=(0, 0, 0), name=None):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    return setup_mesh(obj, parent, collection, tile, name)


def beveled_box(parent, collection, size, loc, tile, rot=(0, 0, 0), name=None, bevel=.045):
    """Web-cheap chamfered box: one bevel segment creates readable highlights."""
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new(name="web_chamfer", type="BEVEL")
    modifier.width = min(bevel, min(size) * .22)
    modifier.segments = 1
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return setup_mesh(obj, parent, collection, tile, name)


def cylinder(parent, collection, radius, depth, loc, tile, rot=(0, 0, 0), vertices=8, name=None,
             radius_top=None):
    kwargs = {"vertices": vertices, "radius1": radius, "radius2": radius if radius_top is None else radius_top,
              "depth": depth, "location": loc, "rotation": rot}
    bpy.ops.mesh.primitive_cone_add(**kwargs)
    return setup_mesh(bpy.context.object, parent, collection, tile, name)


def cone(parent, collection, radius, depth, loc, tile, rot=(0, 0, 0), vertices=7, name=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=0, depth=depth,
                                    location=loc, rotation=rot)
    return setup_mesh(bpy.context.object, parent, collection, tile, name)


def torus(parent, collection, major_radius, minor_radius, loc, tile, rot=(0, 0, 0),
          major_segments=10, minor_segments=4, name=None):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius, minor_radius=minor_radius,
        major_segments=major_segments, minor_segments=minor_segments,
        location=loc, rotation=rot,
    )
    return setup_mesh(bpy.context.object, parent, collection, tile, name)


def custom_mesh(parent, collection, vertices, faces, loc, tile, rot=(0, 0, 0), name=None):
    mesh = bpy.data.meshes.new(f"{name or 'custom'}_mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name or "custom", mesh)
    collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = rot
    return setup_mesh(obj, parent, collection, tile, name)


def triangular_prism(parent, collection, points_xz, thickness, loc, tile, rot=(0, 0, 0), name=None):
    """A thin, solid triangle for sails, blades, fins and readable wedges."""
    return polygon_prism(parent, collection, points_xz, thickness, loc, tile, rot, name)


def polygon_prism(parent, collection, points_xz, thickness, loc, tile, rot=(0, 0, 0), name=None):
    """Extrude a simple X/Z silhouette along local Y."""
    half = thickness / 2
    vertices = [(x, -half, z) for x, z in points_xz] + [(x, half, z) for x, z in points_xz]
    count = len(points_xz)
    faces = [tuple(reversed(range(count))), tuple(range(count, count * 2))]
    for i in range(count):
        j = (i + 1) % count
        faces.append((i, j, count + j, count + i))
    return custom_mesh(parent, collection, vertices, faces, loc, tile, rot, name)


def grass_blade(parent, collection, width, height, loc, tile, rot_z=0.0, lean=.12):
    points = [(-width / 2, 0), (width / 2, 0), (lean, height * .68), (0, height)]
    half = .009
    vertices = [(x, -half, z) for x, z in points] + [(x, half, z) for x, z in points]
    faces = [
        (0, 1, 2, 3), (4, 7, 6, 5),
        (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0),
    ]
    return custom_mesh(parent, collection, vertices, faces, loc, tile, (0, 0, rot_z))


def ico(parent, collection, radius, loc, tile, scale=(1, 1, 1), subdivisions=1, name=None):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=loc)
    obj = bpy.context.object
    obj.scale = scale
    return setup_mesh(obj, parent, collection, tile, name)


def segment(parent, collection, start, end, radius, tile, vertices=6, name=None):
    a, b = Vector(start), Vector(end)
    direction = b - a
    mid = (a + b) / 2
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length, location=mid)
    obj = bpy.context.object
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    return setup_mesh(obj, parent, collection, tile, name)


def finish_mesh(parent: bpy.types.Object, objects: list[bpy.types.Object], name: str) -> bpy.types.Object:
    if not objects:
        raise RuntimeError(f"No geometry for {parent.name}/{name}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if len(objects) > 1:
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        joined = bpy.context.object
    else:
        joined = objects[0]
    joined.name = name
    local = joined.matrix_local.copy()
    joined.data.transform(local)
    joined.matrix_local = Matrix.Identity(4)
    joined.parent = parent
    joined.data.name = f"{parent.name}_{name}_mesh"
    return joined


def collider(parent, collection, name, center_xyz, size_xyz, yaw=0.0, pitch=0.0, walk_surface=False):
    obj = bpy.data.objects.new(f"COL_{name}", None)
    collection.objects.link(obj)
    obj.parent = parent
    # Manifest uses glTF/Three coordinates. Blender +Y becomes glTF -Z.
    x, y, z = center_xyz
    sx, sy, sz = size_xyz
    obj.location = (x, -z, y)
    obj.rotation_euler[0] = pitch
    obj.rotation_euler[2] = -yaw
    obj.empty_display_type = "CUBE"
    obj.empty_display_size = 1.0
    obj.scale = (sx / 2, sz / 2, sy / 2)
    obj["shape"] = "box"
    obj["center"] = list(center_xyz)
    obj["size"] = list(size_xyz)
    obj["yaw"] = yaw
    obj["pitch"] = pitch
    obj["walkSurface"] = walk_surface
    return {"name": name, "shape": "box", "center": list(center_xyz), "size": list(size_xyz), "yaw": yaw, "pitch": pitch, "walkSurface": walk_surface}


def weapon_base(collection, name):
    return root(collection, f"weapon_{name}")


def build_weapons(collection):
    # Every held weapon uses the handle as origin and +Y as forward. Blender's
    # glTF exporter maps that direction to Three.js -Z.
    r = weapon_base(collection, "fists"); p = []
    for x, y in ((-.11, .04), (.11, .01)):
        p.append(ico(r, collection, .13, (x, y, .02), T["skin"], (.9, 1.08, .82), 1))
        for finger in (-.055, 0, .055):
            p.append(beveled_box(r, collection, (.045, .09, .055), (x + finger, y + .08, .015), T["skin"], bevel=.012))
    finish_mesh(r, p, "visual")

    # Machete: the blade rises in local +Z so a first-person camera sees its
    # broad face. The old +Y layout pointed directly away from the camera and
    # reduced the whole weapon to a tiny handle and blade edge.
    r = weapon_base(collection, "machete"); p = [
        beveled_box(r, collection, (.19, .06, .66), (0, .02, .39), T["steel"], (0, -.10, 0), bevel=.018),
        cone(r, collection, .135, .27, (-.078, .02, .82), T["steel"], (0, 0, 0), 4),
        box(r, collection, (.02, .018, .53), (.07, .057, .42), T["gun"], (0, -.10, 0)),
        beveled_box(r, collection, (.31, .14, .07), (0, 0, .025), T["brass"], bevel=.02),
        cylinder(r, collection, .06, .32, (0, 0, -.18), T["leather"], vertices=10, radius_top=.05),
        cylinder(r, collection, .074, .055, (0, 0, -.36), T["brass"], vertices=8),
    ]
    for z in (-.07, -.14, -.21, -.28):
        p.append(torus(r, collection, .052, .009, (0, 0, z), T["grip"], major_segments=8, minor_segments=3))
    for z in (.20, .34, .48):
        p.append(beveled_box(r, collection, (.055, .073, .035), (-.09, .02, z), T["dark"], (0, -.1, 0), bevel=.008))
    for z in (.11, .57):
        p.append(cylinder(r, collection, .024, .075, (.035, .02, z), T["brass"], (math.pi / 2, 0, 0), 8))
    finish_mesh(r, p, "visual")

    r = weapon_base(collection, "spear"); p = [
        cylinder(r, collection, .038, 1.9, (0, .08, 0), T["wood"], (-math.pi / 2, 0, 0), 10, radius_top=.03),
        cone(r, collection, .13, .44, (0, 1.25, 0), T["steel"], (-math.pi / 2, 0, 0), 6),
        cylinder(r, collection, .055, .19, (0, 1.0, 0), T["gun"], (-math.pi / 2, 0, 0), 8),
        cone(r, collection, .062, .16, (0, -.94, 0), T["brass"], (math.pi / 2, 0, 0), 6),
    ]
    for y in (.82, .9, .98):
        p.append(torus(r, collection, .044, .008, (0, y, 0), T["leather"], (math.pi / 2, 0, 0), 8, 3))
    finish_mesh(r, p, "visual")

    # Recurve bow with reinforced grip, string, arrow, fletching and metal tip.
    r = weapon_base(collection, "bow"); p = []
    arc = [(-.01, 0, -.59), (-.17, 0, -.49), (-.27, 0, -.22), (-.29, 0, 0),
           (-.27, 0, .22), (-.17, 0, .49), (-.01, 0, .59)]
    for a, b in zip(arc, arc[1:]):
        p.append(segment(r, collection, a, b, .045, T["wood"], 8))
    p += [
        segment(r, collection, arc[0], (-.15, 0, 0), .012, T["white"], 5),
        segment(r, collection, (-.15, 0, 0), arc[-1], .012, T["white"], 5),
        beveled_box(r, collection, (.09, .11, .28), (-.27, 0, 0), T["leather"], bevel=.018),
        cylinder(r, collection, .024, 1.16, (-.15, .54, 0), T["wood"], (-math.pi / 2, 0, 0), 7),
        cone(r, collection, .065, .18, (-.15, 1.18, 0), T["steel"], (-math.pi / 2, 0, 0), 6),
        triangular_prism(r, collection, [(-.065, 0), (.065, 0), (0, .19)], .024, (-.15, .06, .085), T["signal"], (math.pi / 2, 0, 0)),
        triangular_prism(r, collection, [(-.055, 0), (.055, 0), (0, .17)], .024, (-.15, .075, -.08), T["hazard"], (math.pi / 2, 0, math.pi)),
    ]
    for z in (-.09, 0, .09):
        p.append(torus(r, collection, .047, .009, (-.27, 0, z), T["brass"], major_segments=8, minor_segments=3))
    finish_mesh(r, p, "visual")

    # Service-pistol silhouette: long rectangular slide, flared magazine well,
    # visible trigger guard and strong front/rear sight separation.
    r = weapon_base(collection, "pistol"); p = [
        beveled_box(r, collection, (.205, .70, .16), (0, .22, .075), T["gun"], bevel=.028),
        box(r, collection, (.155, .28, .052), (0, .18, .166), T["dark"]),
        beveled_box(r, collection, (.185, .47, .12), (0, .05, -.035), T["gun"], bevel=.025),
        beveled_box(r, collection, (.175, .34, .25), (0, -.22, -.205), T["grip"], (-.20, 0, 0), bevel=.032),
        beveled_box(r, collection, (.19, .075, .055), (0, -.36, -.34), T["dark"], (-.20,0,0), bevel=.016),
        torus(r, collection, .09, .021, (0, -.015, -.14), T["dark"], (0, math.pi / 2, 0), 12, 3),
        cylinder(r, collection, .052, .15, (0, .61, .075), T["dark"], (-math.pi / 2, 0, 0), 12),
        box(r, collection, (.035, .035, .045), (0, .50, .18), T["steel"]),
        box(r, collection, (.09, .035, .045), (0, -.09, .18), T["steel"]),
        box(r, collection, (.16, .17, .035), (0, .18, .172), T["steel"]),
        beveled_box(r, collection, (.12, .18, .07), (0, .22, -.125), T["dark"], bevel=.018),
    ]
    for y in (-.31, -.255, -.20, .43, .48, .53):
        z = -.20 if y < 0 else .09
        p.append(box(r, collection, (.21, .018, .018), (0, y, z), T["steel"], (-.2 if y < 0 else 0, 0, 0)))
    # Raised reflex sight and under-barrel light separate the pistol from the
    # old block silhouette in both first-person view and ground pickups.
    p += [
        beveled_box(r, collection, (.15, .16, .035), (0, .08, .205), T["dark"], bevel=.012),
        torus(r, collection, .062, .014, (0, .12, .255), T["teal"], (math.pi / 2, 0, 0), 12, 4),
        box(r, collection, (.018, .025, .025), (0, .095, .255), T["signal"]),
        cylinder(r, collection, .042, .25, (0, .35, -.12), T["plate"], (-math.pi / 2, 0, 0), 12),
        torus(r, collection, .041, .008, (0, .48, -.12), T["hazard"], (math.pi / 2, 0, 0), 10, 3),
        beveled_box(r, collection, (.018, .23, .15), (-.095, -.24, -.21), T["leather"], (-.20, 0, 0), bevel=.008),
        beveled_box(r, collection, (.018, .23, .15), (.095, -.24, -.21), T["leather"], (-.20, 0, 0), bevel=.008),
    ]
    finish_mesh(r, p, "visual")

    # Assault rifle: separate upper/lower receiver, curved magazine, rail and
    # flash hider make it readable even at pickup scale.
    r = weapon_base(collection, "rifle"); p = [
        beveled_box(r, collection, (.23, .64, .24), (0, .02, .035), T["gun"], bevel=.035),
        beveled_box(r, collection, (.205, .68, .20), (0, .66, .04), T["grip"], bevel=.03),
        cylinder(r, collection, .038, .72, (0, 1.35, .06), T["steel"], (-math.pi / 2, 0, 0), 12),
        cylinder(r, collection, .065, .16, (0, 1.79, .06), T["dark"], (-math.pi / 2, 0, 0), 8, radius_top=.042),
        beveled_box(r, collection, (.15, .25, .31), (0, -.18, -.21), T["grip"], (-.24, 0, 0), bevel=.028),
        beveled_box(r, collection, (.15, .34, .31), (0, .11, -.245), T["dark"], (.20, 0, 0), bevel=.03),
        box(r, collection, (.075, 1.08, .055), (0, .38, .19), T["steel"]),
        beveled_box(r, collection, (.14, .22, .105), (0, .02, .285), T["teal"], bevel=.025),
        cylinder(r, collection, .05, .04, (0, .15, .29), T["plate"], (-math.pi / 2, 0, 0), 10),
        box(r, collection, (.028, .075, .11), (0, .97, .18), T["steel"]),
        # Compact folding stock: cheek rest, two open struts and butt pad.
        beveled_box(r, collection, (.18, .42, .10), (0, -.52, .12), T["plate"], (.05,0,0), bevel=.025),
        segment(r, collection, (-.075,-.31,.08), (-.075,-.83,.17), .035, T["gun"], 6),
        segment(r, collection, (.075,-.31,.08), (.075,-.83,-.05), .035, T["gun"], 6),
        beveled_box(r, collection, (.22, .09, .38), (0, -.86, .04), T["grip"], bevel=.025),
    ]
    for y in (.35, .48, .61, .74, .87, 1.0):
        p.append(box(r, collection, (.215, .026, .038), (0, y, .15), T["steel"]))
    p += [
        # Open reflex optic with a bright reticle and protected lens frame.
        beveled_box(r, collection, (.17, .23, .045), (0, .31, .25), T["dark"], bevel=.014),
        torus(r, collection, .073, .016, (0, .36, .34), T["teal"], (math.pi / 2, 0, 0), 12, 4),
        box(r, collection, (.018, .025, .035), (0, .33, .34), T["signal"]),
        # Angled foregrip and two barrel collars improve class readability.
        beveled_box(r, collection, (.12, .18, .33), (0, .78, -.19), T["grip"], (-.22, 0, 0), bevel=.025),
        torus(r, collection, .061, .011, (0, 1.19, .06), T["hazard"], (math.pi / 2, 0, 0), 12, 4),
        torus(r, collection, .061, .011, (0, 1.47, .06), T["dark"], (math.pi / 2, 0, 0), 12, 4),
        beveled_box(r, collection, (.17, .20, .035), (-.12, .12, -.24), T["signal"], (.20, 0, 0), bevel=.01),
    ]
    finish_mesh(r, p, "visual")

    r = weapon_base(collection, "shotgun"); p = [
        beveled_box(r, collection, (.22, .50, .25), (0, -.01, .03), T["gun"], bevel=.035),
        cylinder(r, collection, .06, 1.28, (0, .91, .11), T["steel"], (-math.pi / 2, 0, 0), 14),
        # The parallel tubular magazine is the shotgun's dominant cue.
        cylinder(r, collection, .052, 1.02, (0, .78, -.04), T["dark"], (-math.pi / 2, 0, 0), 12),
        cylinder(r, collection, .082, .38, (0, .54, -.025), T["wood"], (-math.pi / 2, 0, 0), 12, radius_top=.073),
        beveled_box(r, collection, (.21, .64, .29), (0, -.52, .04), T["wood"], (.10, 0, 0), bevel=.045),
        beveled_box(r, collection, (.15, .24, .25), (0, -.15, -.19), T["leather"], (-.21, 0, 0), bevel=.028),
        cylinder(r, collection, .068, .11, (0, 1.605, .11), T["dark"], (-math.pi / 2, 0, 0), 12),
        torus(r, collection, .062, .012, (0, .16, .23), T["steel"], (math.pi / 2, 0, 0), 10, 3),
        box(r, collection, (.03, .04, .07), (0, 1.31, .20), T["hazard"]),
        box(r, collection, (.15, .48, .045), (0, .05, .185), T["steel"]),
    ]
    for y in (.39, .48, .57, .66, .75):
        p.append(torus(r, collection, .078, .009, (0, y, -.025), T["grip"], (math.pi / 2, 0, 0), 8, 3))
    # Side saddle with individually readable red shells is the strongest
    # close-range weapon cue, especially at pickup scale.
    for index, y in enumerate((-.20, -.09, .02, .13, .24)):
        p += [
            cylinder(r, collection, .027, .16, (.14, y, .08), T["signal"], vertices=10),
            cylinder(r, collection, .029, .028, (.14, y, .16), T["brass"], vertices=10),
        ]
    p += [
        beveled_box(r, collection, (.035, .58, .22), (.125, .02, .08), T["dark"], bevel=.01),
        torus(r, collection, .06, .012, (0, 1.50, .11), T["hazard"], (math.pi / 2, 0, 0), 12, 4),
    ]
    finish_mesh(r, p, "visual")

    r = weapon_base(collection, "sniper"); p = [
        beveled_box(r, collection, (.24, .78, .23), (0, .02, .035), T["dark"], bevel=.035),
        beveled_box(r, collection, (.21, .70, .17), (0, .69, .05), T["plate"], bevel=.03),
        cylinder(r, collection, .04, 1.28, (0, 1.64, .08), T["steel"], (-math.pi / 2, 0, 0), 14),
        cylinder(r, collection, .078, .20, (0, 2.38, .08), T["dark"], (-math.pi / 2, 0, 0), 10, radius_top=.045),
        beveled_box(r, collection, (.16, .28, .32), (0, -.18, -.22), T["grip"], (-.21, 0, 0), bevel=.03),
        beveled_box(r, collection, (.15, .34, .30), (0, .15, -.25), T["gun"], (.12, 0, 0), bevel=.03),
        # Large optic, objective bell and separate mount blocks.
        cylinder(r, collection, .078, .72, (0, .10, .34), T["teal"], (-math.pi / 2, 0, 0), 14),
        cylinder(r, collection, .108, .14, (0, .53, .34), T["teal"], (-math.pi / 2, 0, 0), 14),
        cylinder(r, collection, .088, .09, (0, -.31, .34), T["dark"], (-math.pi / 2, 0, 0), 14),
        box(r, collection, (.055,.08,.15), (0,-.06,.20), T["gun"]),
        box(r, collection, (.055,.08,.15), (0,.28,.20), T["gun"]),
        cylinder(r, collection, .028, .16, (.15, -.10, .10), T["brass"], (0, math.pi / 2, 0), 8),
        # Adjustable skeleton stock and cheek rest.
        beveled_box(r, collection, (.22, .46, .11), (0, -.59, .20), T["plate"], (.04,0,0), bevel=.028),
        segment(r, collection, (-.08,-.35,.06), (-.08,-1.00,.16), .038, T["gun"], 6),
        segment(r, collection, (.08,-.35,.06), (.08,-1.00,-.10), .038, T["gun"], 6),
        beveled_box(r, collection, (.24,.10,.46), (0,-1.04,.05), T["grip"], bevel=.025),
        segment(r, collection, (-.075, .82, -.02), (-.38, 1.18, -.42), .022, T["gun"], 6),
        segment(r, collection, (.075, .82, -.02), (.38, 1.18, -.42), .022, T["gun"], 6),
        beveled_box(r, collection, (.16,.34,.055), (-.38,1.18,-.44), T["dark"], (0,0,.08), bevel=.015),
        beveled_box(r, collection, (.16,.34,.055), (.38,1.18,-.44), T["dark"], (0,0,-.08), bevel=.015),
    ]
    # Scope rings, adjustment turrets, bolt handle and muzzle collars make the
    # long-range identity unmistakable without relying on texture resolution.
    for y in (-.20, .12, .45):
        p.append(torus(r, collection, .092, .014, (0, y, .34), T["brass"], (math.pi / 2, 0, 0), 14, 4))
    p += [
        cylinder(r, collection, .045, .14, (0, .12, .47), T["teal"], vertices=12, radius_top=.038),
        cylinder(r, collection, .04, .13, (.13, .12, .34), T["teal"], (0, math.pi / 2, 0), 12, radius_top=.034),
        cylinder(r, collection, .026, .22, (.17, -.12, .08), T["brass"], (0, math.pi / 2, 0), 10),
        ico(r, collection, .055, (.29, -.12, .08), T["dark"], (1, 1, 1), 1),
        torus(r, collection, .055, .009, (0, 2.14, .08), T["hazard"], (math.pi / 2, 0, 0), 12, 4),
        torus(r, collection, .055, .009, (0, 2.25, .08), T["dark"], (math.pi / 2, 0, 0), 12, 4),
    ]
    finish_mesh(r, p, "visual")

    for name, body_tile, marker_tile in (("grenade", T["green"], T["brass"]),
                                         ("smoke", T["smoke"], T["white"]),
                                         ("flash", T["flash"], T["hazard"])):
        r = weapon_base(collection, name); p = []
        if name == "grenade":
            p.append(ico(r, collection, .19, (0, 0, 0), body_tile, (1, 1, 1.15), 2))
            for z in (-.11, 0, .11):
                p.append(torus(r, collection, .155, .012, (0, 0, z), T["dark"], major_segments=10, minor_segments=3))
        else:
            p += [cylinder(r, collection, .12, .36, (0, 0, .02), body_tile, vertices=12, radius_top=.105),
                  torus(r, collection, .112, .009, (0, 0, -.13), marker_tile, major_segments=12, minor_segments=3)]
        p += [cylinder(r, collection, .07, .09, (0, 0, .245), T["dark"], vertices=8),
              beveled_box(r, collection, (.055, .045, .19), (.095, 0, .28), marker_tile, (0, -.55, 0), bevel=.01),
              torus(r, collection, .075, .012, (.12, 0, .37), T["steel"], (math.pi / 2, 0, 0), 10, 3)]
        finish_mesh(r, p, "visual")


def build_props(collection):
    def crate(name, tile, care=False):
        r = root(collection, f"prop_{name}"); p = []
        w, d, h = (1.35, 1.08, .9) if care else (1.05, .86, .68)
        frame_tile = T["gun"] if care else T["wood"]
        p += [beveled_box(r, collection, (w, d, h), (0, 0, h / 2), tile, bevel=.045),
              beveled_box(r, collection, (w + .07, d + .07, .12), (0, 0, h + .03), frame_tile, bevel=.025),
              box(r, collection, (w + .04, .065, .085), (0, -d / 2 - .025, h * .22), frame_tile),
              box(r, collection, (w + .04, .065, .085), (0, -d / 2 - .025, h * .78), frame_tile)]
        for sx in (-1, 1):
            for sy in (-1, 1):
                p.append(beveled_box(r, collection, (.105, .105, h + .055), (sx*w*.44, sy*d*.44, h/2), T["dark"], bevel=.016))
        # Cross-braces are the quickest silhouette cue for a supply crate.
        front_y = -d / 2 - .065
        p += [segment(r, collection, (-w*.37, front_y, .12), (w*.37, front_y, h-.12), .035, frame_tile, 5),
              segment(r, collection, (w*.37, front_y, .12), (-w*.37, front_y, h-.12), .035, frame_tile, 5),
              beveled_box(r, collection, (.25, .09, .20), (0, front_y-.015, h*.62), T["hazard"] if care else T["brass"], bevel=.018),
              torus(r, collection, .15, .022, (0, d/2+.055, h*.57), T["dark"], (math.pi/2, 0, 0), 10, 3)]
        if care:
            p += [box(r, collection, (.13, d + .1, h + .11), (-w*.22, 0, h/2), T["hazard"]),
                  box(r, collection, (.13, d + .1, h + .11), (w*.22, 0, h/2), T["hazard"])]
        finish_mesh(r, p, "visual")
    crate("crate_common", T["crate"]); crate("crate_good", T["crate_good"])
    crate("crate_top", T["crate_top"]); crate("care", T["signal"], True)

    r = root(collection, "prop_bandage"); p = [
        cylinder(r, collection, .22, .23, (0, 0, .22), T["bandage"], (-math.pi / 2, 0, 0), 14),
        torus(r, collection, .18, .018, (0, -.125, .22), T["white"], (math.pi / 2, 0, 0), 12, 3),
        box(r, collection, (.055, .025, .22), (0, -.142, .22), T["signal"]),
        box(r, collection, (.22, .025, .055), (0, -.142, .22), T["signal"]),
    ]; finish_mesh(r, p, "visual")
    r = root(collection, "prop_plate"); p = [
        polygon_prism(r, collection, [(-.34,.54), (.34,.54), (.4,.26), (.22,0), (-.22,0), (-.4,.26)],
                      .11, (0, 0, .06), T["plate"]),
        polygon_prism(r, collection, [(-.25,.42), (.25,.42), (.29,.24), (.15,.08), (-.15,.08), (-.29,.24)],
                      .125, (0, -.01, .09), T["teal"]),
        box(r, collection, (.42, .025, .035), (0, -.075, .39), T["white"]),
    ]; finish_mesh(r, p, "visual")
    r = root(collection, "prop_arrow_bundle"); p = []
    for x in (-.09, 0, .09):
        p += [cylinder(r, collection, .025, .9, (x, 0, .45), T["rope"], vertices=5),
              cone(r, collection, .055, .14, (x, 0, .97), T["steel"], vertices=5),
              triangular_prism(r, collection, [(-.045,0),(.045,0),(0,.14)], .025, (x, 0, .05), T["signal"])]
    p += [box(r, collection, (.34, .13, .09), (0, 0, .25), T["wood"]),
          torus(r, collection, .13, .018, (0, 0, .42), T["leather"], major_segments=10, minor_segments=3)]
    finish_mesh(r, p, "visual")

    for name, tile, shells in (("pistol_ammo", T["crate_good"], False), ("rifle_ammo", T["purple"], False),
                               ("shell_ammo", T["orange"], True), ("sniper_ammo", T["teal"], False)):
        r = root(collection, f"prop_{name}"); p = [
            beveled_box(r, collection, (.48, .35, .27), (0, 0, .135), T["gun"], bevel=.035),
            beveled_box(r, collection, (.50, .37, .065), (0, 0, .30), T["dark"], bevel=.018),
            box(r, collection, (.43, .025, .105), (0, -.19, .15), tile),
            beveled_box(r, collection, (.12, .045, .09), (0, -.205, .285), T["brass"], bevel=.012),
            torus(r, collection, .105, .014, (0, .205, .33), T["dark"], (math.pi/2, 0, 0), 10, 3),
        ]
        for x in (-.1, 0, .1):
            p.append(cylinder(r, collection, .032 if not shells else .042, .16, (x, 0, .43), T["brass"], vertices=8))
            p.append(cone(r, collection, .032 if not shells else .042, .07, (x, 0, .545), tile, vertices=8))
        finish_mesh(r, p, "visual")
    r = root(collection, "prop_projectile_arrow"); p = [
        cylinder(r, collection, .02, .72, (0, .36, 0), T["rope"], (-math.pi / 2, 0, 0), 5),
        cone(r, collection, .05, .13, (0, .79, 0), T["steel"], (-math.pi / 2, 0, 0), 5),
    ]; finish_mesh(r, p, "visual")


def build_environment(collection):
    def lod_asset(name, build0, build1=None):
        r = root(collection, f"env_{name}")
        p0 = build0(r); finish_mesh(r, p0, "visual_lod0")
        if build1:
            p1 = build1(r); finish_mesh(r, p1, "visual_lod1")
        return r
    def pine_lod0(r):
        p = [cylinder(r, collection, .38, 3.4, (0, 0, 1.7), T["wood"], vertices=9, radius_top=.19)]
        for angle in (0, math.pi*.5, math.pi, math.pi*1.5):
            p.append(segment(r, collection, (0, 0, .18), (math.cos(angle)*.65, math.sin(angle)*.65, .03), .095, T["wood"], 6))
        for angle, z in ((.4, 2.4), (2.3, 2.85), (4.5, 3.2)):
            p.append(segment(r, collection, (0, 0, z), (math.cos(angle)*.95, math.sin(angle)*.95, z+.34), .095, T["wood"], 6))
        p += [cone(r, collection, 2.25, 2.55, (-.18, .08, 3.55), T["leaf_dark"], (0, .08, .08), 9),
              cone(r, collection, 1.82, 2.85, (.16, -.12, 4.72), T["leaf"], (.06, 0, -.11), 9),
              cone(r, collection, 1.28, 2.55, (-.08, .10, 5.85), T["leaf"], (-.05, .07, .16), 8),
              ico(r, collection, .62, (.78, .18, 3.75), T["leaf_dark"], (1.2,.75,.65), 1),
              ico(r, collection, .55, (-.64, -.25, 4.62), T["leaf"], (1.1,.8,.7), 1)]
        return p
    lod_asset("tree_pine", pine_lod0,
              lambda r: [cylinder(r, collection, .33, 3.2, (0, 0, 1.6), T["wood"], vertices=6, radius_top=.17),
                         cone(r, collection, 2.15, 4.95, (0, 0, 4.25), T["leaf_dark"], vertices=7),
                         cone(r, collection, 1.25, 2.65, (0, 0, 5.7), T["leaf"], vertices=6)])

    def broadleaf_lod0(r):
        p = [cylinder(r, collection, .43, 3.25, (0, 0, 1.625), T["wood"], vertices=9, radius_top=.24)]
        branches = [((0,0,2.25),(-1.15,.18,3.45)), ((0,0,2.45),(1.05,.45,3.62)),
                    ((0,0,2.7),(.2,-1.05,3.75)), ((0,0,1.95),(-.4,.85,3.2))]
        for start, end in branches:
            p.append(segment(r, collection, start, end, .12, T["wood"], 7))
        crowns = [(-1.05,.18,4.0,1.38,T["leaf_dark"]), (.95,.42,4.18,1.46,T["leaf"]),
                  (.12,-.88,4.25,1.34,T["leaf_dark"]), (-.18,.62,4.75,1.48,T["leaf"]),
                  (.15,-.05,5.18,1.12,T["leaf"])]
        for x,y,z,size,tile in crowns:
            p.append(ico(r, collection, size, (x,y,z), tile, (1.15,.92,.78), 1))
        for a in (0, math.pi*.5, math.pi, math.pi*1.5):
            p.append(segment(r, collection, (0,0,.18), (math.cos(a)*.72,math.sin(a)*.72,.04), .085, T["wood"], 6))
        return p
    lod_asset("tree_broadleaf", broadleaf_lod0,
              lambda r: [cylinder(r, collection, .38, 3.25, (0,0,1.625), T["wood"], vertices=7, radius_top=.22),
                         ico(r, collection, 2.15, (0,0,4.3), T["leaf_dark"], (1.18,.96,.78), 1),
                         ico(r, collection, 1.25, (.35,.1,5.15), T["leaf"], (1.05,.9,.75), 1)])

    def palm_lod0(r):
        p = []
        trunk = [(0,0,0), (.10,.02,1.35), (.27,.06,2.7), (.48,.10,4.0), (.62,.14,5.05)]
        for index, (start, end) in enumerate(zip(trunk, trunk[1:])):
            p.append(segment(r, collection, start, end, .29-index*.035, T["wood"], 9))
        crown = trunk[-1]
        for index in range(9):
            angle = index * math.tau / 9 + .2
            mid = (crown[0] + math.cos(angle)*1.05, crown[1] + math.sin(angle)*1.05, crown[2] + .18)
            end = (crown[0] + math.cos(angle)*2.45, crown[1] + math.sin(angle)*2.45, crown[2] - .42 - (index % 2)*.18)
            p.append(segment(r, collection, crown, mid, .075, T["leaf_dark"], 6))
            p.append(segment(r, collection, mid, end, .13, T["leaf"] if index % 3 else T["leaf_dark"], 6))
            p.append(ico(r, collection, .52, end, T["leaf"], (1.65,.52,.18), 1))
        p += [ico(r, collection, .36, (.38,.03,4.84), T["wood"], (1,.9,1.1), 1),
              ico(r, collection, .30, (.72,.18,4.74), T["wood"], (1,.9,1.1), 1)]
        return p
    lod_asset("tree_palm", palm_lod0,
              lambda r: [segment(r, collection, (0,0,0), (.62,.14,5.05), .24, T["wood"], 7)] +
              [segment(r, collection, (.62,.14,5.05),
                       (.62+math.cos(a)*2.25,.14+math.sin(a)*2.25,4.72), .16, T["leaf"], 5)
               for a in (0, math.pi*.25, math.pi*.5, math.pi*.75, math.pi, math.pi*1.25, math.pi*1.5, math.pi*1.75)])

    lod_asset("rock_boulder", lambda r: [ico(r, collection, 1.1, (-.25, 0, .82), T["stone"], (1, .9, .72), 2),
                                          ico(r, collection, .65, (.8, .05, .49), T["plaza"], (1, .8, .72), 1),
                                          triangular_prism(r, collection, [(-.35,0),(.35,0),(.1,.52)], .46, (-.62,.22,.03), T["moss"], (0,0,.16))],
              lambda r: [ico(r, collection, 1.15, (0, 0, .72), T["stone"], (1.1, .9, .62), 1)])
    lod_asset("rock_slab", lambda r: [beveled_box(r, collection, (1.9, 1.28, .52), (0,0,.34), T["plaza"], (.05,.18,.08), bevel=.11),
                                       beveled_box(r, collection, (1.42, 1.02, .46), (-.12,.03,.76), T["stone"], (-.04,-.12,.1), bevel=.10),
                                       box(r, collection, (.95,.55,.035), (.18,-.28,1.02), T["moss"], (0,.12,.08))],
              lambda r: [beveled_box(r, collection, (1.85,1.2,.85), (0,0,.48), T["stone"], (.04,.12,.08), bevel=.12)])
    lod_asset("rock_cluster", lambda r: [ico(r, collection, .78, (-.66,.05,.52), T["stone"], (1,.82,.72), 1),
                                          ico(r, collection, 1.0, (.05,-.08,.74), T["plaza"], (.9,.78,.82), 1),
                                          ico(r, collection, .66, (.82,.18,.46), T["stone"], (1.1,.76,.68), 1),
                                          ico(r, collection, .34, (.2,-.72,.2), T["moss"], (1.1,.7,.55), 1)],
              lambda r: [ico(r, collection, 1.15, (0,0,.62), T["stone"], (1.28,.85,.62), 1)])

    def bush_lod0(r):
        p = []
        for angle in (0, 1.25, 2.5, 3.8, 5.1):
            p.append(segment(r, collection, (0,0,.05), (math.cos(angle)*.55, math.sin(angle)*.55, .72), .035, T["wood"], 5))
        clumps = [(-.55,.04,.65,.78,T["leaf_dark"]), (.48,-.12,.69,.76,T["leaf"]),
                  (0,.24,1.12,.72,T["leaf"]), (.05,-.42,.92,.62,T["leaf_dark"]),
                  (-.2,-.08,1.42,.55,T["leaf"])]
        for x,y,z,size,tile in clumps:
            p.append(ico(r, collection, size, (x,y,z), tile, (1.1,.86,.78), 1))
        return p
    lod_asset("bush", bush_lod0,
              lambda r: [ico(r, collection, 1.08, (0, 0, .84), T["leaf_dark"], (1.2, 1, .78), 1),
                         ico(r, collection, .63, (0, 0, 1.42), T["leaf"], (1,.9,.7), 1)])

    def grass(r):
        p = []
        for i in range(12):
            a = i * 2.399; radius = .06 + (i % 4) * .095
            x, y = math.cos(a) * radius, math.sin(a) * radius
            p.append(grass_blade(r, collection, .075 + (i % 3)*.012, .68 + (i % 5) * .12,
                                 (x, y, 0), T["leaf"] if i % 3 else T["leaf_dark"], a, .08*math.sin(a*1.7)))
        return p
    lod_asset("grass", grass)
    lod_asset("stump", lambda r: [cylinder(r, collection, .38, .38, (0, 0, .19), T["wood"], vertices=9, radius_top=.31),
                                   torus(r, collection, .19, .018, (0,0,.385), T["plaza"], major_segments=9, minor_segments=3),
                                   segment(r, collection, (0,0,.08), (.52,.15,.02), .075, T["wood"], 6),
                                   segment(r, collection, (0,0,.08), (-.42,-.28,.02), .065, T["wood"], 6)])
    lod_asset("rock_chips", lambda r: [ico(r, collection, .31, (-.18,0,.19), T["stone"], (1,.8,.5), 1),
                                        ico(r, collection, .2, (.27,.08,.12), T["plaza"], (1,.7,.45), 1)])
    lod_asset("rubble", lambda r: [ico(r, collection, .38, (-.3, 0, .24), T["stone"], (1, .8, .55), 1),
                                    ico(r, collection, .27, (.28, .1, .17), T["moss"], (1, .8, .48), 1),
                                    beveled_box(r, collection, (.32,.24,.16), (.02,-.28,.1), T["plaza"], (0,.25,.18), bevel=.025)])
    lod_asset("ruin_wall", lambda r: [beveled_box(r, collection, (1, .8, .82), (0, 0, .41), T["stone"], bevel=.055),
                                       beveled_box(r, collection, (.28, .82, .44), (-.33, 0, 1.02), T["moss"], (0,.08,0), bevel=.04),
                                       beveled_box(r, collection, (.23, .8, .24), (.31, 0, .91), T["stone"], (0,-.1,.08), bevel=.035)])
    lod_asset("ruin_cap", lambda r: [beveled_box(r, collection, (1, .84, .4), (0, 0, .2), T["stone"], bevel=.055),
                                      box(r, collection, (.7,.87,.055), (.09,0,.42), T["moss"], (0,.08,0))])
    lod_asset("barrel", lambda r: [cylinder(r, collection, .36, .95, (0, 0, .475), T["rust"], vertices=12, radius_top=.34),
                                    torus(r, collection, .35, .025, (0,0,.18), T["gun"], major_segments=12, minor_segments=4),
                                    torus(r, collection, .35, .025, (0,0,.76), T["gun"], major_segments=12, minor_segments=4),
                                    cylinder(r, collection, .07, .025, (.14,.08,.96), T["brass"], vertices=8)])
    lod_asset("brazier", lambda r: [cylinder(r, collection, 1.3, .8, (0, 0, .4), T["stone"], vertices=10, radius_top=1.05),
                                     torus(r, collection, 1.02, .075, (0,0,.88), T["gun"], major_segments=12, minor_segments=4),
                                     cylinder(r, collection, 1.02, .32, (0, 0, .96), T["dark"], vertices=10, radius_top=.72),
                                     cone(r, collection, .48, 1.45, (-.12, .04, 1.95), T["hazard"], vertices=7),
                                     cone(r, collection, .28, 1.05, (.25, -.1, 1.7), T["orange"], vertices=6)])
    lod_asset("torch", lambda r: [
        cylinder(r, collection, .10, 2.25, (0, 0, 1.125), T["wood"], vertices=8, radius_top=.06),
        cylinder(r, collection, .16, .20, (0, 0, 2.27), T["dark"], vertices=8, radius_top=.12),
        torus(r, collection, .16, .025, (0, 0, 2.34), T["gun"], major_segments=9, minor_segments=3),
        cone(r, collection, .16, .58, (0, 0, 2.68), T["orange"], vertices=7),
        cone(r, collection, .085, .38, (.025, -.02, 2.59), T["hazard"], vertices=6),
    ])
    lod_asset("spawn_marker", lambda r: [cylinder(r, collection, .085, 3.2, (0, 0, 1.6), T["wood"], vertices=8, radius_top=.065),
                                          triangular_prism(r, collection, [(0,0),(1.25,.08),(.18,.72)], .045, (0,0,2.35), T["hazard"]),
                                          torus(r, collection, .13, .025, (0,0,.08), T["rope"], major_segments=9, minor_segments=3)])


def build_landmarks(collection):
    manifest = {"version": 1, "coordinateSystem": "three-y-up", "landmarks": {}}

    def wreck_hull(parent, detailed=True):
        sections = [(-5.0, .08, .9), (-4.3, 1.05, .34), (-2.2, 1.55, .08),
                    (1.4, 1.62, .04), (4.1, 1.1, .28), (5.0, .12, .78)]
        vertices = []
        for x, half_width, keel_z in sections:
            vertices += [(x, -half_width, 1.48), (x, half_width, 1.48), (x, 0, keel_z)]
        faces = []
        for i in range(len(sections)-1):
            a, b = i*3, (i+1)*3
            faces += [(a, b, b+2, a+2), (a+1, a+2, b+2, b+1)]
            if detailed:
                faces.append((a, a+1, b+1, b))
        faces += [(0,2,1), (len(vertices)-3, len(vertices)-2, len(vertices)-1)]
        return custom_mesh(parent, collection, vertices, faces, (0,0,0), T["wood"], (0,.055,0), "wreck_hull_visual")

    # Shipwreck: a faceted V-hull and triangular torn sail replace the former
    # box silhouette while staying cheaper than a single mobile character.
    r = root(collection, "poi_wreck"); p = [wreck_hull(r)]
    for x in (-3.6, -1.8, 0, 1.8, 3.6):
        p.append(beveled_box(r, collection, (1.55, 2.55, .16), (x, 0, 1.43), T["rust"], (0,.04,0), bevel=.035))
    p += [
        cylinder(r, collection, .23, 8.25, (.25, 0, 4.13), T["wood"], vertices=10, radius_top=.16),
        triangular_prism(r, collection, [(0,0),(4.7,.35),(.15,3.75)], .075, (.4,.02,3.45), T["sail"], (0,.05,-.05)),
        segment(r, collection, (.35,0,7.95), (4.95,0,3.72), .035, T["rope"], 5),
        segment(r, collection, (.3,0,7.8), (-4.7,-1.35,1.58), .035, T["rope"], 5),
        segment(r, collection, (-4.6, -1.35, 1.62), (4.5, -1.15, 1.62), .07, T["rope"], 6),
        segment(r, collection, (4.45,0,1.15), (6.15,0,2.0), .11, T["wood"], 7),
        beveled_box(r, collection, (1.0,.8,.65), (-2.4,.28,1.82), T["crate"], (0,0,.12), bevel=.055),
    ]
    for x in (-4.2,-2.2,0,2.2,4.2):
        p += [segment(r, collection, (x,-1.42,1.45), (x,-1.42,2.05), .045, T["wood"], 6),
              segment(r, collection, (x,1.42,1.45), (x,1.42,2.05), .045, T["wood"], 6)]
    finish_mesh(r, p, "visual_lod0")
    q = [wreck_hull(r, False),
         cylinder(r, collection, .21, 8.0, (.25, 0, 4.0), T["wood"], vertices=7),
         triangular_prism(r, collection, [(0,0),(4.6,.3),(.1,3.65)], .055, (.4,0,3.4), T["sail"], (0,.05,-.05))]
    finish_mesh(r, q, "visual_lod1")
    cols = [collider(r, collection, "wreck_hull", (0, .8, 0), (10, 1.6, 3.2)),
            collider(r, collection, "wreck_mast", (0, 4.25, -.8), (.55, 8.5, .55)),
            collider(r, collection, "wreck_side", (3.6, 1.3, 0), (5.5, 2.6, .45), .3)]
    manifest["landmarks"]["wreck"] = {"colliders": cols}

    # Watchtower, stairs enter from +Z (Blender -Y). Deck is split around opening.
    r = root(collection, "poi_watchtower"); p = []
    for x in (-2.1, 2.1):
        for y in (-2.1, 2.1):
            p.append(cylinder(r, collection, .25, 5.5, (x, y, 2.75), T["wood"], vertices=9, radius_top=.2))
    p += [beveled_box(r, collection, (1.55, 5.6, .45), (-2.025, 0, 5.265), T["wood"], bevel=.06),
          beveled_box(r, collection, (1.55, 5.6, .45), (2.025, 0, 5.265), T["wood"], bevel=.06),
          beveled_box(r, collection, (2.5, 2.3, .45), (0, 1.65, 5.265), T["wood"], bevel=.06),
          # Dark hatch rim makes the stair opening readable from below.
          beveled_box(r, collection, (2.45,.12,.14), (0,.44,5.48), T["dark"], bevel=.025)]
    # Structural X-bracing visibly explains why the tower stands.
    for side_y in (-2.12, 2.12):
        p += [segment(r, collection, (-2.1,side_y,.35), (2.1,side_y,4.75), .095, T["rope"], 7),
              segment(r, collection, (2.1,side_y,.35), (-2.1,side_y,4.75), .095, T["rope"], 7)]
    for side_x in (-2.12, 2.12):
        p += [segment(r, collection, (side_x,-2.1,.35), (side_x,2.1,4.75), .095, T["rope"], 7),
              segment(r, collection, (side_x,2.1,.35), (side_x,-2.1,4.75), .095, T["rope"], 7)]
    # Thin treads sit on the invisible physics ramp instead of forming a solid
    # wall. This also makes the route readable from the ground.
    for i in range(13):
        y_pos = -7.5 + i * .58
        step_top = .18 + i * .443
        p.append(beveled_box(r, collection, (1.8, .68, .16), (0, y_pos, step_top-.08), T["wood"], bevel=.025))
    p += [segment(r, collection, (-.76,-7.72,.03), (-.76,-.48,5.38), .10, T["wood"], 7),
          segment(r, collection, (.76,-7.72,.03), (.76,-.48,5.38), .10, T["wood"], 7),
          segment(r, collection, (-.95,-7.55,.7), (-.95,-.48,6.0), .055, T["rope"], 6),
          segment(r, collection, (.95,-7.55,.7), (.95,-.48,6.0), .055, T["rope"], 6)]
    # Platform railings, roof posts and a pitched metal roof.
    for x in (-2.7, 2.7):
        p += [segment(r, collection, (x, -2.7, 5.55), (x, 2.7, 5.55), .075, T["rope"], 6),
              segment(r, collection, (x, -2.7, 6.25), (x, 2.7, 6.25), .07, T["rope"], 6)]
    for x,y in ((-2.55,-2.55),(-2.55,2.55),(2.55,-2.55),(2.55,2.55)):
        p.append(segment(r, collection, (x,y,5.45), (x,y,7.18), .09, T["wood"], 7))
    p += [beveled_box(r, collection, (3.45, 6.5, .22), (-1.55, 0, 7.48), T["gun"], (0,-.16,0), bevel=.04),
          beveled_box(r, collection, (3.45, 6.5, .22), (1.55, 0, 7.48), T["gun"], (0,.16,0), bevel=.04),
          cylinder(r, collection, .07, 1.2, (0, 0, 8.15), T["wood"], vertices=7),
          cone(r, collection, .48, 1.25, (0, 0, 8.95), T["hazard"], vertices=7)]
    finish_mesh(r, p, "visual_lod0")
    q = [box(r, collection, (5.6, 5.6, .45), (0, 0, 5.265), T["wood"]),
         beveled_box(r, collection, (6.4, 6.4, .32), (0, 0, 7.48), T["gun"], bevel=.05)]
    for x in (-2.1, 2.1):
        for y in (-2.1, 2.1): q.append(cylinder(r, collection, .23, 5.5, (x, y, 2.75), T["wood"], vertices=6))
    finish_mesh(r, q, "visual_lod1")
    cols = []
    for sx in (-2.1, 2.1):
        for sz in (-2.1, 2.1): cols.append(collider(r, collection, f"tower_post_{sx}_{sz}", (sx, 2.75, sz), (.45, 5.5, .45)))
    # The custom walk surface begins on the graded construction pad and follows
    # the visible treads. It has no solid front face, so burying it below the
    # terrain would only pull the capsule into the heightfield.
    ramp_start_z, ramp_end_z = 7.75, .25
    ramp_start_y, ramp_end_y = .12, 5.5
    ramp_run, ramp_rise = ramp_start_z - ramp_end_z, ramp_end_y - ramp_start_y
    ramp_pitch = math.atan2(ramp_rise, ramp_run)
    ramp_length = math.hypot(ramp_run, ramp_rise)
    ramp_thickness = .25
    ramp_center_y = (ramp_start_y + ramp_end_y) / 2 - math.cos(ramp_pitch) * ramp_thickness / 2
    cols.append(collider(
        r, collection, "tower_stair_ramp",
        (0, ramp_center_y, (ramp_start_z + ramp_end_z) / 2),
        (1.8, ramp_thickness, ramp_length), pitch=ramp_pitch, walk_surface=True,
    ))
    cols += [collider(r, collection, "tower_deck_left", (-2.025, 5.265, 0), (1.55, .45, 5.6)),
             collider(r, collection, "tower_deck_right", (2.025, 5.265, 0), (1.55, .45, 5.6)),
             collider(r, collection, "tower_deck_back", (0, 5.265, -1.65), (2.5, .45, 2.3))]
    manifest["landmarks"]["watchtower"] = {"colliders": cols}

    # Bunker: readable recessed entrance, roof lip, vents and firing slits.
    r = root(collection, "poi_bunker"); p = [
        beveled_box(r, collection, (8.5, 6.5, .48), (0, 0, 2.64), T["stone"], bevel=.09),
        beveled_box(r, collection, (.72, 6.5, 2.4), (-3.9, 0, 1.2), T["stone"], bevel=.08),
        beveled_box(r, collection, (.72, 6.5, 2.4), (3.9, 0, 1.2), T["stone"], bevel=.08),
        beveled_box(r, collection, (8.5, .72, 2.4), (0, 2.9, 1.2), T["stone"], bevel=.08),
        box(r, collection, (2.9, .2, .7), (0, -3.34, 2.05), T["signal"]),
        beveled_box(r, collection, (.38, .42, 2.1), (-1.65, -3.08, 1.05), T["gun"], bevel=.045),
        beveled_box(r, collection, (.38, .42, 2.1), (1.65, -3.08, 1.05), T["gun"], bevel=.045),
        beveled_box(r, collection, (3.7, 1.15, .24), (0, -3.12, 2.62), T["gun"], (-.08,0,0), bevel=.05),
        box(r, collection, (2.8, .12, 2.0), (0, -2.89, 1.0), T["dark"]),
        beveled_box(r, collection, (3.1, 1.2, .13), (0, -3.12, .07), T["plate"], bevel=.035),
        box(r, collection, (.9, .08, .22), (-3.48, -2.15, 1.35), T["dark"]),
        box(r, collection, (.9, .08, .22), (3.48, -2.15, 1.35), T["dark"]),
        cylinder(r, collection, .32, .72, (-2.4, .65, 3.0), T["gun"], vertices=10, radius_top=.27),
        cylinder(r, collection, .24, .52, (2.65, 1.2, 2.9), T["rust"], vertices=9, radius_top=.20),
    ]; finish_mesh(r, p, "visual_lod0")
    # LOD1 must preserve the doorway silhouette. The previous solid box made
    # the bunker look sealed whenever the camera crossed the 55 m LOD switch.
    q = [beveled_box(r, collection, (8.5, 6.5, .48), (0, 0, 2.64), T["stone"], bevel=.08),
         box(r, collection, (.72, 6.5, 2.4), (-3.9, 0, 1.2), T["stone"]),
         box(r, collection, (.72, 6.5, 2.4), (3.9, 0, 1.2), T["stone"]),
         box(r, collection, (8.5, .72, 2.4), (0, 2.9, 1.2), T["stone"]),
         box(r, collection, (2.8, .08, 2.0), (0, -2.93, 1.0), T["dark"]),
         box(r, collection, (3.0,.12,.55), (0,-3.22,2.08), T["signal"])]
    finish_mesh(r, q, "visual_lod1")
    cols = [collider(r, collection, "bunker_roof", (0, 2.625, 0), (8.5, .45, 6.5)),
            collider(r, collection, "bunker_left", (-3.9, 1.2, 0), (.7, 2.4, 6.5)),
            collider(r, collection, "bunker_right", (3.9, 1.2, 0), (.7, 2.4, 6.5)),
            # Blender's +Y becomes Three.js -Z after the export conversion.
            # Keeping this collider at +Z blocks the visible entrance.
            collider(r, collection, "bunker_back", (0, 1.2, -2.9), (8.5, 2.4, .7))]
    manifest["landmarks"]["bunker"] = {"colliders": cols}

    COLLIDER_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    COLLIDER_MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def build_character(collection):
    r = root(collection, "player_survivor")
    r["forward_axis_blender"] = "+Y"
    r["forward_axis_gltf"] = "-Z"
    r["ground_plane"] = 0.0
    body_parts = [
        beveled_box(r, collection, (.64, .40, .70), (0, 0, 1.14), T["player"], bevel=.065),
        beveled_box(r, collection, (.50, .36, .20), (0, -.01, .74), T["player"], bevel=.045),
    ]; finish_mesh(r, body_parts, "player_body")
    head_parts = [
        cylinder(r, collection, .14, .15, (0, 0, 1.53), T["skin"], vertices=10, radius_top=.12),
        ico(r, collection, .235, (0, .015, 1.72), T["skin"], (1, .94, 1.08), 2),
        ico(r, collection, .255, (0, -.005, 1.82), T["dark"], (1.05, 1.02, .67), 2),
        beveled_box(r, collection, (.36, .065, .075), (0, .235, 1.76), T["teal"], bevel=.018),
        beveled_box(r, collection, (.075, .065, .07), (0, .245, 1.68), T["skin"], bevel=.015),
        segment(r, collection, (-.20,.10,1.78), (-.18,.12,1.58), .018, T["grip"], 5),
        segment(r, collection, (.20,.10,1.78), (.18,.12,1.58), .018, T["grip"], 5),
    ]
    head = finish_mesh(r, head_parts, "player_head")
    # Pitch around the neck, not around the feet or the centre of the helmet.
    head.data.transform(Matrix.Translation((0, 0, -1.54)))
    head.location.z = 1.54
    gear = [
        beveled_box(r, collection, (.53, .43, .49), (0, .015, 1.16), T["gun"], bevel=.055),
        beveled_box(r, collection, (.58, .445, .12), (0, .015, .94), T["plate"], bevel=.03),
        box(r, collection, (.68, .44, .12), (0, 0, .78), T["dark"]),
        beveled_box(r, collection, (.18, .09, .18), (-.18, .245, 1.02), T["ammo"], bevel=.025),
        beveled_box(r, collection, (.18, .09, .18), (.18, .245, 1.02), T["ammo"], bevel=.025),
        beveled_box(r, collection, (.48, .24, .57), (0, -.30, 1.15), T["gun"], bevel=.055),
        box(r, collection, (.055, .42, .62), (-.20, -.10, 1.19), T["dark"], (0,0,-.10)),
        box(r, collection, (.055, .42, .62), (.20, -.10, 1.19), T["dark"], (0,0,.10)),
        cylinder(r, collection, .095, .46, (0, -.43, 1.43), T["player"], (0, math.pi / 2, 0), 10),
    ]; finish_mesh(r, gear, "player_gear")

    def limb_pivot(name, location):
        pivot = bpy.data.objects.new(name, None)
        collection.objects.link(pivot)
        pivot.parent = r
        pivot.location = location
        pivot.empty_display_type = "SPHERE"
        pivot.empty_display_size = .07
        return pivot

    # Named transform pivots keep the static low-poly survivor compatible with
    # later procedural gait/aim animation without paying for a skeletal rig.
    for side, sign in (("l", -1), ("r", 1)):
        arm_pivot = limb_pivot(f"player_arm_{side}_pivot", (sign*.39, 0, 1.39))
        arm_parts = [
            segment(arm_pivot, collection, (0,0,0), (sign*.015,.055,-.31), .10, T["gun"], 9),
            segment(arm_pivot, collection, (sign*.015,.055,-.31), (sign*.035,.17,-.59), .085, T["skin"], 9),
            ico(arm_pivot, collection, .09, (sign*.035,.18,-.64), T["grip"], (1,.9,.85), 1),
            ico(arm_pivot, collection, .135, (0,0,-.02), T["plate"], (1,.9,.7), 1),
        ]
        finish_mesh(arm_pivot, arm_parts, f"player_arm_{side}")

        leg_pivot = limb_pivot(f"player_leg_{side}_pivot", (sign*.18, 0, .74))
        leg_parts = [
            segment(leg_pivot, collection, (0,0,0), (sign*.015,-.01,-.34), .125, T["gun"], 9),
            segment(leg_pivot, collection, (sign*.015,-.01,-.34), (sign*.025,.015,-.65), .105, T["gun"], 9),
            beveled_box(leg_pivot, collection, (.20, .34, .15), (sign*.025,.075,-.665), T["dark"], bevel=.035),
            beveled_box(leg_pivot, collection, (.15,.08,.16), (sign*.12,.12,-.04), T["ammo"], bevel=.02),
        ]
        finish_mesh(leg_pivot, leg_parts, f"player_leg_{side}")

    socket = bpy.data.objects.new("player_weapon_socket", None)
    collection.objects.link(socket); socket.parent = r; socket.location = (.34, .22, 1.24)
    socket.empty_display_type = "ARROWS"
    # Compact second silhouette retained for future distance switching.
    lod = [beveled_box(r, collection, (.68, .42, 1.25), (0, 0, .92), T["player"], bevel=.06),
           ico(r, collection, .25, (0, 0, 1.72), T["skin"], subdivisions=1)]
    lod_mesh = finish_mesh(r, lod, "visual_lod1"); lod_mesh.hide_viewport = True; lod_mesh.hide_render = True


def export_collection(collection: bpy.types.Collection, filename: str) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    objects = list(collection.all_objects)
    for obj in objects:
        obj.hide_set(False)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = next((o for o in objects if o.type == "EMPTY"), objects[0])
    bpy.ops.export_scene.gltf(
        filepath=str(PUBLIC / filename), export_format="GLB", use_selection=True,
        export_yup=True, export_apply=True, export_cameras=False, export_lights=False,
        export_extras=True,
    )


def detach_preview_texture_for_glb_export() -> None:
    """Keep the saved .blend textured, but prevent duplicate/rewritten GLB images."""
    texture = ATLAS_MATERIAL.node_tree.nodes.get("island_atlas_texture")
    if texture:
        texture.image = None


def main() -> None:
    global ATLAS_MATERIAL
    PUBLIC.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)
    reset_scene()
    atlas = create_atlas()
    ATLAS_MATERIAL = create_material(atlas)
    packages = {
        "01_WEAPONS": ("weapons.glb", build_weapons),
        "02_PROPS": ("props.glb", build_props),
        "03_ENVIRONMENT": ("environment.glb", build_environment),
        "04_LANDMARKS": ("landmarks.glb", build_landmarks),
        "05_CHARACTER": ("character.glb", build_character),
    }
    collections = []
    for name, (_, builder) in packages.items():
        collection = asset_collection(name)
        builder(collection)
        collections.append(collection)
    bpy.ops.wm.save_as_mainfile(filepath=str(ART / "island-duell-assets.blend"))
    detach_preview_texture_for_glb_export()
    for collection, (_, (filename, _)) in zip(collections, packages.items()):
        export_collection(collection, filename)
    print(json.dumps({
        "blend": str(ART / "island-duell-assets.blend"),
        "exports": [filename for filename, _ in packages.values()],
        "atlas": str(PUBLIC / "island-atlas.png"),
        "colliders": str(COLLIDER_MANIFEST),
    }))


if __name__ == "__main__":
    main()
