"""Create a standalone middle-island concept and two review renders.

This file deliberately does not export or register anything with the game.
It produces an editable .blend plus perspective and top-down PNG previews.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "art" / "concepts" / "middle-island-v1"
BLEND_PATH = OUTPUT_DIR / "middle-island-v1.blend"
HERO_PATH = OUTPUT_DIR / "middle-island-v1-hero.png"
TOP_PATH = OUTPUT_DIR / "middle-island-v1-top.png"

TAU = math.pi * 2
PLAZA_Z = 1.02


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(datablocks):
            datablocks.remove(block)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_depth = "8"
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.36, 0.60, 0.78, 1.0)
    background.inputs["Strength"].default_value = 0.75


def material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.82,
    metallic: float = 0.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        emission_input = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
        if emission_input:
            emission_input.default_value = emission
        strength_input = bsdf.inputs.get("Emission Strength")
        if strength_input:
            strength_input.default_value = emission_strength
    return mat


def assign(obj: bpy.types.Object, mat: bpy.types.Material) -> bpy.types.Object:
    if obj.type == "MESH":
        obj.data.materials.append(mat)
    return obj


def apply_bevel(obj: bpy.types.Object, width: float = 0.08, segments: int = 2) -> None:
    modifier = obj.modifiers.new("Soft web edge", "BEVEL")
    modifier.width = width
    modifier.segments = segments


def cube(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    mat: bpy.types.Material,
    rotation_z: float = 0.0,
    bevel: float = 0.08,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=(0.0, 0.0, rotation_z))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    if bevel > 0:
        apply_bevel(obj, bevel)
    return obj


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    mat: bpy.types.Material,
    vertices: int = 12,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    return obj


def cone(
    name: str,
    location: tuple[float, float, float],
    radius_bottom: float,
    radius_top: float,
    depth: float,
    mat: bpy.types.Material,
    vertices: int = 10,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius_bottom,
        radius2=radius_top,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    return obj


def irregular_berm(materials: list[bpy.types.Material]) -> bpy.types.Object:
    segments = 32
    rings = [
        (23.3, 0.00),
        (22.1, 0.32),
        (20.4, 0.72),
        (19.2, 0.92),
    ]
    vertices: list[tuple[float, float, float]] = []
    for ring_index, (base_radius, height) in enumerate(rings):
        for i in range(segments):
            angle = i / segments * TAU
            irregularity = (
                math.sin(angle * 5 + 0.7) * 0.24
                + math.sin(angle * 11 - 0.4) * 0.12
            )
            radius = base_radius + irregularity * (1.0 - ring_index * 0.12)
            vertices.append((math.cos(angle) * radius, math.sin(angle) * radius, height))

    faces: list[tuple[int, ...]] = []
    face_materials: list[int] = []
    for ring_index in range(len(rings) - 1):
        current = ring_index * segments
        following = (ring_index + 1) * segments
        for i in range(segments):
            j = (i + 1) % segments
            faces.append((current + i, current + j, following + j, following + i))
            face_materials.append(min(ring_index, 2))
    top_start = (len(rings) - 1) * segments
    faces.append(tuple(top_start + i for i in range(segments)))
    face_materials.append(3)

    mesh = bpy.data.meshes.new("MiddleIsland_BermMesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("MiddleIsland_Berm", mesh)
    bpy.context.collection.objects.link(obj)
    for mat in materials:
        mesh.materials.append(mat)
    for polygon, material_index in zip(mesh.polygons, face_materials):
        polygon.material_index = material_index
        polygon.use_smooth = False
    return obj


def polar(radius: float, angle: float) -> tuple[float, float]:
    return math.cos(angle) * radius, math.sin(angle) * radius


def broken_wall(
    name: str,
    center: tuple[float, float],
    tangent_angle: float,
    lengths: tuple[float, ...],
    heights: tuple[float, ...],
    stone: bpy.types.Material,
    moss: bpy.types.Material,
) -> None:
    cursor = -sum(lengths) / 2
    for index, (length, height) in enumerate(zip(lengths, heights)):
        gap = 0.20 if index else 0.0
        cursor += gap
        offset = cursor + length / 2
        x = center[0] + math.cos(tangent_angle) * offset
        y = center[1] + math.sin(tangent_angle) * offset
        piece = cube(
            f"{name}_Piece_{index + 1}",
            (x, y, PLAZA_Z + height / 2),
            (length, 0.72, height),
            moss if index == 1 and height < 1.6 else stone,
            tangent_angle,
            0.10,
        )
        piece.rotation_euler.z += (index - 1) * 0.018
        cursor += length


def l_cover(
    name: str,
    angle: float,
    radius: float,
    stone: bpy.types.Material,
    moss: bpy.types.Material,
) -> None:
    x, y = polar(radius, angle)
    tangent = angle + math.pi / 2
    broken_wall(
        f"{name}_Outer",
        (x, y),
        tangent,
        (1.8, 2.1, 1.35),
        (2.35, 1.25, 1.85),
        stone,
        moss,
    )
    return_angle = tangent + math.pi / 2
    return_center = (
        x + math.cos(tangent) * 2.35 + math.cos(return_angle) * 1.25,
        y + math.sin(tangent) * 2.35 + math.sin(return_angle) * 1.25,
    )
    broken_wall(
        f"{name}_Return",
        return_center,
        return_angle,
        (1.45, 1.35),
        (1.15, 1.75),
        stone,
        moss,
    )


def stone_path(
    name: str,
    angle: float,
    stone: bpy.types.Material,
    stone_dark: bpy.types.Material,
) -> None:
    for index, radius in enumerate((7.0, 9.1, 11.2, 13.3, 15.4, 17.5)):
        x, y = polar(radius, angle)
        width = 4.35 - (index % 2) * 0.25
        slab = cube(
            f"{name}_Slab_{index + 1}",
            (x, y, PLAZA_Z + 0.055),
            (1.75, width, 0.13),
            stone if index % 2 == 0 else stone_dark,
            angle,
            0.035,
        )
        slab.rotation_euler.z += (-0.018 if index % 2 else 0.015)


def entry_cover(
    name: str,
    angle: float,
    stone: bpy.types.Material,
    moss: bpy.types.Material,
) -> None:
    """Frame an approach without narrowing its clear 4.3 m running lane."""
    center_x, center_y = polar(13.7, angle)
    tangent = angle + math.pi / 2
    for side in (-1, 1):
        x = center_x + math.cos(tangent) * side * 3.35
        y = center_y + math.sin(tangent) * side * 3.35
        height = 1.18 if side < 0 else 1.48
        cube(
            f"{name}_LowWall_{side}",
            (x, y, PLAZA_Z + height / 2),
            (3.25, 0.68, height),
            moss if side < 0 else stone,
            angle,
            0.09,
        )
        inner_x = x - math.cos(angle) * 1.30
        inner_y = y - math.sin(angle) * 1.30
        cube(
            f"{name}_MarkerPillar_{side}",
            (inner_x, inner_y, PLAZA_Z + 0.93),
            (0.78, 0.78, 1.86),
            stone,
            angle,
            0.08,
        )


def rubble_detail(
    name: str,
    center: tuple[float, float],
    angle: float,
    stone: bpy.types.Material,
    moss: bpy.types.Material,
) -> None:
    tangent = angle + math.pi / 2
    pieces = (
        (-0.72, -0.16, 0.62, 0.42),
        (0.05, 0.10, 0.46, 0.30),
        (0.63, -0.22, 0.38, 0.24),
    )
    for index, (along, radial, width, height) in enumerate(pieces, 1):
        x = center[0] + math.cos(tangent) * along + math.cos(angle) * radial
        y = center[1] + math.sin(tangent) * along + math.sin(angle) * radial
        cube(
            f"{name}_Piece_{index}",
            (x, y, PLAZA_Z + height / 2),
            (width, width * 0.76, height),
            moss if index == 2 else stone,
            angle + index * 0.37,
            0.04,
        )


def flag(
    name: str,
    angle: float,
    wood: bpy.types.Material,
    cloth: bpy.types.Material,
    metal: bpy.types.Material,
) -> None:
    x, y = polar(18.0, angle)
    tangent = angle + math.pi / 2
    for side in (-1, 1):
        px = x + math.cos(tangent) * side * 2.65
        py = y + math.sin(tangent) * side * 2.65
        pole = cylinder(
            f"{name}_Pole_{side}",
            (px, py, PLAZA_Z + 1.65),
            0.09,
            3.3,
            wood,
            8,
        )
        pole.rotation_euler.z = angle
        cylinder(
            f"{name}_PoleCap_{side}",
            (px, py, PLAZA_Z + 3.35),
            0.16,
            0.12,
            metal,
            8,
        )
        forward_x, forward_y = math.cos(angle), math.sin(angle)
        tangent_x, tangent_y = math.cos(tangent), math.sin(tangent)
        direction = 1 if side > 0 else -1
        origin = Vector((px, py, PLAZA_Z + 2.85))
        vertices = [
            origin,
            origin + Vector((tangent_x * 1.15 * direction, tangent_y * 1.15 * direction, -0.18)),
            origin + Vector((tangent_x * 0.95 * direction + forward_x * 0.10,
                             tangent_y * 0.95 * direction + forward_y * 0.10, -0.78)),
            origin + Vector((0.0, 0.0, -0.62)),
        ]
        mesh = bpy.data.meshes.new(f"{name}_FlagMesh_{side}")
        mesh.from_pydata([tuple(vertex) for vertex in vertices], [], [(0, 1, 2, 3)])
        mesh.materials.append(cloth)
        flag_obj = bpy.data.objects.new(f"{name}_Flag_{side}", mesh)
        bpy.context.collection.objects.link(flag_obj)


def loot_pad(
    name: str,
    angle: float,
    radius: float,
    pad_mat: bpy.types.Material,
    crate_mat: bpy.types.Material,
    metal: bpy.types.Material,
) -> None:
    x, y = polar(radius, angle)
    cube(
        f"{name}_Pad",
        (x, y, PLAZA_Z + 0.09),
        (3.2, 3.2, 0.18),
        pad_mat,
        angle,
        0.12,
    )
    crate = cube(
        f"{name}_Crate",
        (x, y, PLAZA_Z + 0.64),
        (1.35, 1.05, 0.92),
        crate_mat,
        angle + 0.18,
        0.10,
    )
    for z_offset in (-0.23, 0.23):
        band = cube(
            f"{name}_CrateBand_{z_offset}",
            (x, y, crate.location.z + z_offset),
            (1.40, 1.10, 0.09),
            metal,
            angle + 0.18,
            0.02,
        )
        band.rotation_euler.z = crate.rotation_euler.z


def bush_cluster(
    name: str,
    angle: float,
    radius: float,
    leaf: bpy.types.Material,
    leaf_dark: bpy.types.Material,
    wood: bpy.types.Material,
) -> None:
    x, y = polar(radius, angle)
    cylinder(f"{name}_Stem", (x, y, PLAZA_Z + 0.52), 0.18, 1.0, wood, 7)
    offsets = ((0.0, 0.0, 0.98, 1.0), (-0.55, 0.18, 0.72, 0.78), (0.45, -0.30, 0.75, 0.86))
    for index, (ox, oy, oz, scale) in enumerate(offsets):
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1,
            radius=1.25 * scale,
            location=(x + ox, y + oy, PLAZA_Z + oz),
        )
        crown = bpy.context.object
        crown.name = f"{name}_Crown_{index + 1}"
        crown.scale.z = 0.72
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign(crown, leaf if index != 1 else leaf_dark)


def rock_cluster(
    name: str,
    angle: float,
    radius: float,
    rock: bpy.types.Material,
    moss: bpy.types.Material,
) -> None:
    x, y = polar(radius, angle)
    for index, (ox, oy, size) in enumerate(((0.0, 0.0, 1.0), (0.85, -0.25, 0.65), (-0.6, 0.45, 0.55))):
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1,
            radius=size,
            location=(x + ox, y + oy, PLAZA_Z + size * 0.55),
        )
        rock_obj = bpy.context.object
        rock_obj.name = f"{name}_Rock_{index + 1}"
        rock_obj.scale = (1.15, 0.82, 0.68)
        rock_obj.rotation_euler = (0.16 * index, 0.20, angle + index * 0.7)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign(rock_obj, moss if index == 1 else rock)


def central_brazier(
    stone: bpy.types.Material,
    metal: bpy.types.Material,
    coal: bpy.types.Material,
    flame: bpy.types.Material,
) -> None:
    cylinder("Central_Dais_Base", (0.0, 0.0, PLAZA_Z + 0.18), 3.35, 0.36, stone, 16)
    cylinder("Central_Dais_Upper", (0.0, 0.0, PLAZA_Z + 0.42), 2.55, 0.20, stone, 12)
    for index in range(12):
        angle = index / 12 * TAU
        x, y = polar(2.92, angle)
        cube(
            f"Central_Dais_Block_{index + 1}",
            (x, y, PLAZA_Z + 0.53),
            (1.25, 0.64, 0.34),
            stone,
            angle + math.pi / 2,
            0.06,
        )
    cone("Brazier_StoneBase", (0.0, 0.0, PLAZA_Z + 0.78), 1.38, 1.05, 0.82, stone, 10)
    cone("Brazier_Bowl", (0.0, 0.0, PLAZA_Z + 1.38), 0.78, 1.18, 0.48, metal, 12)
    cylinder("Brazier_Coals", (0.0, 0.0, PLAZA_Z + 1.64), 0.82, 0.15, coal, 12)
    for index, (offset, height, radius) in enumerate((((-0.24, 0.0), 1.25, 0.42), ((0.25, 0.10), 1.55, 0.38), ((0.02, -0.20), 1.05, 0.34))):
        cone(
            f"Brazier_Flame_{index + 1}",
            (offset[0], offset[1], PLAZA_Z + 1.75 + height / 2),
            radius,
            0.04,
            height,
            flame,
            8,
        )


def add_lighting_and_camera() -> bpy.types.Object:
    bpy.ops.object.light_add(type="SUN", location=(8.0, -12.0, 30.0))
    sun = bpy.context.object
    sun.name = "Day_Sun"
    sun.rotation_euler = (math.radians(27), math.radians(-18), math.radians(-32))
    sun.data.energy = 3.0
    sun.data.angle = math.radians(20)

    bpy.ops.object.light_add(type="AREA", location=(-10.0, -6.0, 24.0))
    fill = bpy.context.object
    fill.name = "Soft_Fill"
    fill.data.energy = 900
    fill.data.shape = "DISK"
    fill.data.size = 18.0

    bpy.ops.object.camera_add(location=(35.0, -41.0, 31.0))
    camera = bpy.context.object
    camera.name = "Review_Camera"
    camera.data.lens = 52
    camera.data.sensor_width = 36
    bpy.context.scene.camera = camera
    look_at(camera, Vector((0.0, 0.0, 2.1)))
    return camera


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render(camera: bpy.types.Object, output: Path, top_down: bool = False) -> None:
    scene = bpy.context.scene
    if top_down:
        camera.location = (0.0, 0.0, 49.0)
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = 49.0
        look_at(camera, Vector((0.0, 0.0, 0.0)))
    else:
        camera.location = (35.0, -41.0, 31.0)
        camera.data.type = "PERSP"
        camera.data.lens = 52
        look_at(camera, Vector((0.0, 0.0, 2.1)))
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def build_scene() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reset_scene()

    earth = material("Earth", (0.24, 0.18, 0.12, 1.0), 0.96)
    grass_dark = material("Grass_Dark", (0.20, 0.34, 0.14, 1.0), 0.98)
    grass = material("Grass", (0.29, 0.49, 0.20, 1.0), 0.98)
    plaza = material("Plaza", (0.47, 0.45, 0.40, 1.0), 0.92)
    stone = material("Ruin_Stone", (0.42, 0.43, 0.39, 1.0), 0.90)
    stone_dark = material("Stone_Dark", (0.29, 0.31, 0.29, 1.0), 0.93)
    moss = material("Moss", (0.29, 0.39, 0.20, 1.0), 0.98)
    metal = material("Dark_Metal", (0.11, 0.13, 0.14, 1.0), 0.52, 0.32)
    wood = material("Weathered_Wood", (0.31, 0.21, 0.13, 1.0), 0.90)
    cloth = material("Signal_Amber", (0.91, 0.52, 0.10, 1.0), 0.78)
    crate_mat = material("Loot_Crate", (0.42, 0.25, 0.12, 1.0), 0.84)
    leaf = material("Leaf", (0.15, 0.36, 0.16, 1.0), 0.98)
    leaf_dark = material("Leaf_Dark", (0.08, 0.24, 0.11, 1.0), 0.98)
    coal = material("Coals", (0.08, 0.055, 0.04, 1.0), 0.95)
    flame = material(
        "Flame",
        (1.0, 0.29, 0.04, 1.0),
        0.34,
        emission=(1.0, 0.12, 0.015, 1.0),
        emission_strength=4.0,
    )

    # Surrounding terrain gives an explicit ground contact and prevents a
    # floating-platform silhouette in the review render.
    cube("Surrounding_Ground", (0.0, 0.0, -0.18), (105.0, 105.0, 0.32), grass_dark, bevel=0.0)
    irregular_berm([earth, grass_dark, grass, grass])
    cylinder("Broken_Stone_Plaza", (0.0, 0.0, PLAZA_Z - 0.04), 17.3, 0.22, plaza, 32)

    approach_angles = (math.radians(90), math.radians(210), math.radians(330))
    for index, angle in enumerate(approach_angles, 1):
        stone_path(f"Approach_{index}", angle, plaza, stone_dark)
        entry_cover(f"Approach_{index}", angle, stone, moss)
        flag(f"Approach_{index}", angle, wood, cloth, metal)

    # Three L-shaped high/low cover complexes sit between the open approaches.
    cover_angles = (math.radians(30), math.radians(150), math.radians(270))
    for index, angle in enumerate(cover_angles, 1):
        l_cover(f"CoverComplex_{index}", angle, 10.6, stone, moss)
        rubble_x, rubble_y = polar(8.8, angle + 0.10)
        rubble_detail(
            f"CoverComplex_{index}_Rubble",
            (rubble_x, rubble_y),
            angle,
            stone_dark,
            moss,
        )

    # Secondary low walls stop the central area becoming one open shooting lane.
    for index, angle in enumerate((0.0, math.radians(120), math.radians(240)), 1):
        x, y = polar(6.4, angle)
        broken_wall(
            f"InnerCover_{index}",
            (x, y),
            angle + math.pi / 2,
            (1.55, 1.8, 1.35),
            (1.05, 1.28, 0.92),
            stone,
            moss,
        )

    # Loot is shown only on deliberate clear pads, never inside the cover.
    for index, angle in enumerate((math.radians(30), math.radians(150), math.radians(270)), 1):
        loot_pad(f"LootNiche_{index}", angle, 15.0, stone_dark, crate_mat, metal)

    central_brazier(stone, metal, coal, flame)

    # Dense edge cover is placed between entrances, preserving all three paths.
    for index, angle in enumerate(
        (15, 46, 135, 166, 255, 286),
        1,
    ):
        bush_cluster(
            f"EdgeBush_{index}",
            math.radians(angle),
            19.0 if index % 2 else 18.3,
            leaf,
            leaf_dark,
            wood,
        )
    for index, angle in enumerate((62, 182, 302), 1):
        rock_cluster(f"EdgeRock_{index}", math.radians(angle), 18.3, stone_dark, moss)

    camera = add_lighting_and_camera()

    # Helpful collection-level metadata for a later approved integration pass.
    scene = bpy.context.scene
    scene["concept_only"] = True
    scene["game_integration"] = "none"
    scene["design"] = "three approaches, three loot niches, mixed-height cover, central brazier"

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    render(camera, HERO_PATH, top_down=False)
    render(camera, TOP_PATH, top_down=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    triangles = sum(
        sum(max(1, len(poly.vertices) - 2) for poly in obj.data.polygons)
        for obj in mesh_objects
    )
    print(
        f"MIDDLE_ISLAND_CONCEPT blend={BLEND_PATH} hero={HERO_PATH} "
        f"top={TOP_PATH} meshes={len(mesh_objects)} approx_triangles={triangles}"
    )


def render_existing_top() -> None:
    """Fast truthful layout preview from an already-built concept scene."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    camera = scene.camera or bpy.data.objects.get("Review_Camera")
    if camera is None:
        raise RuntimeError("Review_Camera missing from concept blend")
    scene.camera = camera
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True
    scene.display.shading.show_cavity = True
    camera.location = (0.0, 0.0, 49.0)
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 49.0
    look_at(camera, Vector((0.0, 0.0, 0.0)))
    scene.render.filepath = str(TOP_PATH)
    bpy.ops.render.render(write_still=True)
    print(f"MIDDLE_ISLAND_TOP_PREVIEW top={TOP_PATH}")


if __name__ == "__main__":
    if "--top-only" in sys.argv:
        render_existing_top()
    else:
        build_scene()
