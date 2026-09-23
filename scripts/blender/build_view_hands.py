"""Bake weapon-specific poses from para's CC0 MakeHuman FPS rig.

Run: blender --background --factory-startup --disable-autoexec --python scripts/blender/build_view_hands.py
Source and license: art/source/fps-hands/README.md.
"""
from pathlib import Path
import math
import random
import bpy
from mathutils import Vector, Matrix, Quaternion

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'art/source/fps-hands'
OUT = ROOT / 'client/public/assets/view-hands.glb'
PREVIEW = ROOT / 'test-results/hand-source'

bpy.ops.wm.open_mainfile(filepath=str(SOURCE / 'source.blend'), use_scripts=False)
rig = bpy.data.objects['caucasian_male_1']
body = bpy.data.objects['caucasian_male_1:Body']
for bone in rig.pose.bones:
    for constraint in list(bone.constraints):
        bone.constraints.remove(constraint)
    bone.matrix_basis.identity()
rig.animation_data_clear()

bones = rig.data.bones
wrist = bones['hand.R'].head_local.copy()
direction = (bones['palm_middle.R'].tail_local - wrist).normalized()
across = bones['palm_index.R'].tail_local - bones['palm_pinky.R'].tail_local
across = (across - direction * across.dot(direction)).normalized()
palm = across.cross(direction).normalized()
frame = Matrix((across, direction, palm))
elbow = frame @ (bones['forearm.R'].head_local - wrist) * .22
shoulder = frame @ (bones['upper_arm.R'].head_local - wrist) * .22
print('CANONICAL_FRAME', [list(v) for v in frame], 'WRIST', list(wrist))

skin = bpy.data.materials.new('Skin')
skin.use_nodes = True
shader = skin.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value = .82
tex = skin.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = bpy.data.images.load(str(SOURCE / 'new_diff.png'), check_existing=False)
skin.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
glove = bpy.data.materials.new('Charcoal woven glove')
glove.use_nodes = True
gs = glove.node_tree.nodes.get('Principled BSDF')
gs.inputs['Base Color'].default_value = (.032, .041, .044, 1)
gs.inputs['Roughness'].default_value = .72
leather = bpy.data.materials.new('Supple leather reinforcement')
leather.use_nodes = True
ls = leather.node_tree.nodes.get('Principled BSDF')
ls.inputs['Base Color'].default_value = (.065, .079, .082, 1)
ls.inputs['Roughness'].default_value = .72

def cloth_texture(material, rgb, woven):
    """Small repeatable material grain; no external proprietary textures."""
    rng = random.Random(14)
    image = bpy.data.images.new(material.name + ' grain', width=128, height=128)
    pixels = []
    for y in range(128):
        for x in range(128):
            thread = math.sin(x * math.pi / 8) * math.sin(y * math.pi / 8) if woven else 0
            grain = thread * .012 + rng.uniform(-.015, .015)
            pixels.extend([max(0, c + grain) for c in rgb] + [1])
    image.pixels = pixels
    image.pack()
    nodes = material.node_tree.nodes
    texture = nodes.new('ShaderNodeTexImage'); texture.image = image
    coordinates = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping'); mapping.inputs['Scale'].default_value = (32,32,32)
    links = material.node_tree.links
    links.new(coordinates.outputs['UV'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], texture.inputs['Vector'])
    links.new(texture.outputs['Color'], nodes.get('Principled BSDF').inputs['Base Color'])

cloth_texture(glove, (.24,.265,.275), True)
cloth_texture(leather, (.26,.28,.29), False)

def posed_mesh(name, curls):
    for pb in rig.pose.bones:
        pb.matrix_basis.identity()
    for finger, angles in curls.items():
        for segment, angle in enumerate(angles, 1):
            bone_name = f'f_{finger}.{segment:02}.R' if finger != 'thumb' else f'thumb.{segment:02}.R'
            pb = rig.pose.bones[bone_name]
            # Curl in the anatomical palm plane, independent of source bone roll.
            local_axis = pb.bone.matrix_local.to_3x3().inverted() @ across
            pb.rotation_mode = 'QUATERNION'
            pb.rotation_quaternion = Quaternion(local_axis.normalized(), math.radians(angle))
    for segment, angle in enumerate((48, 42, 28), 1):
        pb = rig.pose.bones[f'thumb.{segment:02}.R']
        local_axis = pb.bone.matrix_local.to_3x3().inverted() @ direction
        pb.rotation_quaternion = Quaternion(local_axis.normalized(), math.radians(-angle))
    bpy.context.view_layer.update()
    evaluated = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = bpy.data.meshes.new_from_object(evaluated)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj['grip_center'] = [0, .31, .08] if name == 'hand_support' else [0, .30, .055]
    # Rigid bone transforms preserve the source forearm length and cross-section.
    # Only the wrist/ elbow skin weights blend the two adjoining bone transforms.
    is_knife = name.startswith('hand_knife')
    elbow_target = Vector((-.08,-.58,-.06)) if is_knife else Vector(
        (-.17,-.58,-.18) if name == 'hand_trigger' else (-.30,-.55,-.10))
    elbow_target.normalize(); elbow_target *= elbow.length
    forearm_rotation = elbow.rotation_difference(elbow_target)
    upper_direction = Vector((-.10,-.43,-.30) if is_knife else
        ((-.28,-.42,-.30) if name == 'hand_trigger' else (-.50,-.10,-.25)))
    upper_rotation = (shoulder-elbow).rotation_difference(upper_direction)
    removed = {v.index for v in mesh.vertices if v.co.x > -1.5}
    for vert in mesh.vertices:
        p = frame @ (vert.co - wrist) * .22
        forearm_weight = sum(g.weight for g in vert.groups if body.vertex_groups[g.group].name == 'forearm.R')
        upper_weight = sum(g.weight for g in vert.groups if body.vertex_groups[g.group].name in ('upper_arm.R', 'deltoid.R', 'clavicle.R'))
        vert.co = p + forearm_weight * (forearm_rotation @ p - p) + upper_weight * (elbow_target + upper_rotation @ (p-elbow) - p)
    print('ARM_POSE', name, 'forearm_length', round(elbow_target.length,5),
          'wrist_bend_degrees', round(math.degrees(forearm_rotation.angle),2))
    # Keep the real elbow and upper arm so a cropped forearm never floats in view.
    import bmesh
    bm = bmesh.new(); bm.from_mesh(mesh)
    remove = [v for v in bm.verts if v.index in removed]
    bmesh.ops.delete(bm, geom=remove, context='VERTS')
    boundary = [e for e in bm.edges if e.is_boundary]
    bmesh.ops.holes_fill(bm, edges=boundary, sides=0)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh); bm.free()
    for vert in mesh.vertices: vert.co *= 1.35
    mesh.update()
    # Cut the cuff boundary through faces so its edge is a continuous seam.
    bm = bmesh.new(); bm.from_mesh(mesh)
    for y in (-.055, .02):
        bmesh.ops.bisect_plane(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
            plane_co=(0,y,0), plane_no=(0,1,0))
    bm.to_mesh(mesh); bm.free(); mesh.update()
    mesh.materials.clear(); mesh.materials.append(skin); mesh.materials.append(glove); mesh.materials.append(leather)
    for poly in mesh.polygons:
        poly.use_smooth = True
        # Material panels follow existing anatomy instead of floating box pads.
        poly.material_index = 0 if poly.center.y < -.055 else 1
        if -.055 <= poly.center.y < .02:
            poly.material_index = 2
    return obj

grip = {'index': (65, 80, 45), 'middle': (70, 80, 45), 'ring': (75, 80, 45), 'pinky': (80, 80, 45), 'thumb': (10, 30, 25)}
models = [posed_mesh('hand_knife', grip)]
release = posed_mesh('hand_knife_release', {**grip, 'middle': (55,65,35), 'ring': (35,40,25), 'pinky': (25,35,20)})
assert len(models[0].data.vertices) == len(release.data.vertices), 'Morph topology changed'
models[0].shape_key_add(name='Basis')
release_key = models[0].shape_key_add(name='release')
for point, vertex in zip(release_key.data, release.data.vertices):
    point.co = vertex.co
bpy.data.objects.remove(release, do_unlink=True)
models.append(posed_mesh('hand_trigger', {**grip, 'index': (12, 45, 30)}))
models.append(posed_mesh('hand_support', {**grip, 'index': (50, 65, 35), 'middle': (55, 65, 35), 'ring': (60, 70, 35), 'pinky': (65, 70, 35)}))

for obj in list(bpy.data.objects):
    if obj not in models:
        bpy.data.objects.remove(obj, do_unlink=True)

# Three.js receives these same canonical axes (disable the automatic axis conversion).
bpy.ops.object.select_all(action='DESELECT')
for obj in models: obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT), export_format='GLB', use_selection=True,
    export_yup=False, export_apply=True, export_animations=False, export_extras=True)
for obj in models[1:]: obj.hide_render=True

# Orthographic inspection of the actual baked mesh, with a grip-sized reference cylinder.
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.05, depth=.55, location=(0,.30,.055), rotation=(0,math.pi/2,0))
handle = bpy.context.object
mat = bpy.data.materials.new('Grip reference'); mat.diffuse_color=(.04,.055,.065,1)
handle.data.materials.append(mat)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 24
scene.world.color = (.35,.35,.35)
scene.render.resolution_x = 900; scene.render.resolution_y = 900; scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
target = Vector((0,.03,0))
for loc, power, size in [((1,1,2),120,2), ((-1,-1,1),80,2), ((0,1,-2),100,2)]:
    bpy.ops.object.light_add(type='AREA', location=loc)
    lamp=bpy.context.object; lamp.data.energy=power; lamp.data.shape='DISK'; lamp.data.size=size
    lamp.rotation_euler=(target-lamp.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1,.7,-1.4))
camera=bpy.context.object; camera.data.type='ORTHO'; camera.data.ortho_scale=1.15
scene.camera=camera
PREVIEW.mkdir(parents=True,exist_ok=True)
for name, loc in [('back',(1,.7,-1.4)),('palm',(-1,.7,1.4)),('side',(1,0,0))]:
    camera.location=loc; camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(PREVIEW / f'{name}.png')
    bpy.ops.render.render(write_still=True)
