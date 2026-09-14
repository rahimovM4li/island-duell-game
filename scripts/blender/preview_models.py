import bpy, pathlib, sys, math
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2]
kind=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art'/f"{'butterfly' if kind=='knife' else kind}.blend"))
points=[o.matrix_world@Vector(c) for o in bpy.context.scene.objects if o.type=='MESH' and not o.hide_render for c in o.bound_box]
low=Vector([min(p[i] for p in points) for i in range(3)]); high=Vector([max(p[i] for p in points) for i in range(3)])
center=(low+high)*.5; size=(high-low).length
print('BOUNDS',list(low),list(high))
bpy.ops.object.camera_add(location=center+Vector((.4,1,.25)).normalized()*size*1.5)
camera=bpy.context.object; camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=size*1.1
bpy.context.scene.camera=camera
for offset,power,s in [((2,3,4),1200,5),((-3,1,2),900,4),((0,-3,4),1400,3)]:
    bpy.ops.object.light_add(type='AREA',location=center+Vector(offset)*size/2)
    light=bpy.context.object; light.data.energy=power*(size/2)**2; light.data.shape='DISK'; light.data.size=size
    light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.world.color=(.15,.15,.15); scene.render.resolution_x=900; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.filepath=str(ROOT/'art'/f'preview-{kind}.png')
bpy.ops.render.render(write_still=True)
