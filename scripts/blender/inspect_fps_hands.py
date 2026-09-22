"""Read-only inventory of a downloaded hand rig; run with --disable-autoexec."""
import bpy
import json
from mathutils import Vector

result = {'objects': [], 'images': []}
for obj in bpy.data.objects:
    entry = {'name': obj.name, 'type': obj.type, 'parent': obj.parent.name if obj.parent else None,
             'location': list(obj.location), 'rotation': list(obj.rotation_euler), 'scale': list(obj.scale)}
    if obj.type == 'MESH':
        corners = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
        entry.update(vertices=len(obj.data.vertices), polygons=len(obj.data.polygons),
                     bounds=[[min(v[i] for v in corners), max(v[i] for v in corners)] for i in range(3)],
                     modifiers=[{'type': m.type, 'object': getattr(getattr(m, 'object', None), 'name', None)} for m in obj.modifiers],
                     groups=[g.name for g in obj.vertex_groups], materials=[m.name for m in obj.data.materials])
    if obj.type == 'ARMATURE':
        entry['bones'] = [{'name': b.name, 'head': list(b.head_local), 'tail': list(b.tail_local),
                           'parent': b.parent.name if b.parent else None, 'deform': b.use_deform,
                           'constraints': [c.type for c in obj.pose.bones[b.name].constraints]}
                          for b in obj.data.bones]
    result['objects'].append(entry)
for image in bpy.data.images:
    result['images'].append({'name': image.name, 'path': image.filepath, 'packed': bool(image.packed_file), 'size': list(image.size)})
print('HAND_INVENTORY=' + json.dumps(result))
