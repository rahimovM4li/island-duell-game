"""Build textured, skinned game models from the attributed sources in art/source.
Run with Blender --background --python scripts/blender/build_realistic_models.py.
Source downloads and licenses: docs/model-sources.md.
"""
import bpy, json, math, pathlib
from mathutils import Vector, Matrix

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / 'art/source'
MH = SRC / 'makehuman'
OUT = ROOT / 'client/public/assets'
GLOVE_TEXTURE = ROOT / 'art/textures/tactical-glove.png'

def obj_data(path):
    verts, uv, faces, groups = [], [], [], {}
    group = 'body'
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        p = line.split()
        if not p: continue
        if p[0] == 'v': verts.append(Vector(map(float,p[1:4])))
        elif p[0] == 'vt': uv.append(tuple(map(float,p[1:3])))
        elif p[0] == 'g': group = p[1]
        elif p[0] == 'f':
            f = [tuple(int(x)-1 if x else 0 for x in q.split('/')) for q in p[1:]]
            faces.append((f,group))
            groups.setdefault(group,set()).update(q[0] for q in f)
    return verts,uv,faces,groups

BASE,UV,FACES,GROUPS = obj_data(SRC/'human-base.obj')
WEIGHTS = json.loads((SRC/'human-weights.json').read_text())['weights']
RIG = json.loads((SRC/'human-rig.json').read_text())
SHIFT = -min(BASE[i].y*.1 for i in GROUPS['body'])
MODEL_TURN = False
def xyz(v):
    sign = -1 if MODEL_TURN else 1
    return Vector((v.x*.1*sign,-v.z*.1*sign,v.y*.1+SHIFT))
VERT_WEIGHTS = [{} for _ in BASE]
for bone, values in WEIGHTS.items():
    for idx,w in values: VERT_WEIGHTS[idx][bone] = w

def joint(spec):
    ids = GROUPS.get(spec.get('cube_name',''),spec.get('vertex_indices',[]))
    if ids: return sum((xyz(BASE[i]) for i in ids),Vector())/len(ids)
    v = Vector(spec['default_position']); v.z += SHIFT
    if MODEL_TURN: v.x=-v.x; v.y=-v.y
    return v

def material(name, color=(1,1,1,1), image=None, normal=None, rough=.7, metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=color; m.use_nodes=True
    n=m.node_tree.nodes; p=n.get('Principled BSDF')
    p.inputs['Base Color'].default_value=color
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    def tex(path, linear=False):
        im=bpy.data.images.load(str(path),check_existing=True)
        if linear: im.colorspace_settings.name='Non-Color'
        if max(im.size)>1024: im.scale(1024,1024)
        _=im.pixels[0]
        processed=SRC/'processed'; processed.mkdir(exist_ok=True)
        im.filepath_raw=str(processed/(path.stem+'.png')); im.file_format='PNG'; im.save(); im.pack()
        t=n.new('ShaderNodeTexImage'); t.image=im; return t
    if image:
        t=tex(image); m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
    if normal:
        t=tex(normal,True); nm=n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value=.6
        m.node_tree.links.new(t.outputs['Color'],nm.inputs['Color']); m.node_tree.links.new(nm.outputs['Normal'],p.inputs['Normal'])
    return m

def mesh(name, verts, uv, faces, mat, weights=None, keep=None):
    selected=[f for f,g in faces if keep is None or keep(f,g)]
    used=sorted(set(v[0] for f in selected for v in f)); mapping={old:i for i,old in enumerate(used)}
    data=bpy.data.meshes.new(name); data.from_pydata([verts[i] for i in used],[],[[mapping[v[0]] for v in f] for f in selected]); data.update()
    ob=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(ob); data.materials.append(mat)
    if uv:
        layer=data.uv_layers.new()
        for poly,f in zip(data.polygons,selected):
            for li,v in zip(poly.loop_indices,f): layer.data[li].uv=uv[v[1]]
    for poly in data.polygons: poly.use_smooth=True
    if weights:
        for old,new in mapping.items():
            top=sorted(weights[old].items(),key=lambda w:-w[1])[:4]; total=sum(w for _,w in top)
            for bone,w in top:
                if w <= 0: continue
                group=ob.vertex_groups.get(bone) or ob.vertex_groups.new(name=bone)
                group.add([new],w/total,'REPLACE')
    return ob

def outfit(kind, name, mat):
    folder=MH/kind/name; path=next(folder.glob('*.mhclo'))
    lines=path.read_text(encoding='utf-8-sig').splitlines(); objfile=next(l.split(maxsplit=1)[1] for l in lines if l.startswith('obj_file '))
    _,uv,faces,_=obj_data(folder/objfile)
    start=next(i for i,l in enumerate(lines) if l.startswith('verts '))+1
    scale=Vector((1,1,1))
    for l in lines[:start]:
        p=l.split()
        if p and p[0] in ['x_scale','y_scale','z_scale']:
            axis='xyz'.index(p[0][0]); scale[axis]=abs(BASE[int(p[1])][axis]-BASE[int(p[2])][axis])/float(p[3])
    vertices=[]; weights=[]; remove=set(); deleting=False
    for l in lines[start:]:
        p=l.split()
        if not p or p[0].startswith('#'): continue
        if p[0]=='delete_verts': deleting=True; continue
        if deleting:
            if not p[0].isdigit(): break
            i=0
            while i<len(p):
                if i+2<len(p) and p[i+1]=='-': remove.update(range(int(p[i]),int(p[i+2])+1)); i+=3
                else: remove.add(int(p[i])); i+=1
            continue
        if not p[0].isdigit(): continue
        if len(p)==1: ids=[int(p[0])]; blends=[1.]; offset=Vector()
        else: ids=list(map(int,p[:3])); blends=list(map(float,p[3:6])); offset=Vector(map(float,p[6:9]))
        v=sum((BASE[i]*w for i,w in zip(ids,blends)),Vector())
        for axis in range(3): v[axis]+=offset[axis]*scale[axis]
        vertices.append(xyz(v)); ws={}
        for idx,blend in zip(ids,blends):
            for b,w in VERT_WEIGHTS[idx].items(): ws[b]=ws.get(b,0)+w*blend
        weights.append({b:max(0,w) for b,w in ws.items()})
    ob=mesh(name,vertices,uv,faces,mat,weights)
    return ob,remove

def rig(name, objects, natural=False):
    data=bpy.data.armatures.new(name); arm=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active=arm; arm.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    for name,spec in RIG.items():
        b=data.edit_bones.new(name); b.head=joint(spec['head'])
        b.tail=joint(spec['tail']) if natural else b.head+Vector((0,0,.08))
        if (b.tail-b.head).length<.0001: b.tail=b.head+Vector((0,0,.01))
        b.roll=spec.get('roll',0) if natural else 0
    for name,spec in RIG.items():
        if spec['parent']: data.edit_bones[name].parent=data.edit_bones[spec['parent']]
    bpy.ops.object.mode_set(mode='OBJECT')
    for ob in objects:
        ob.parent=arm; mod=ob.modifiers.new('Skin','ARMATURE'); mod.object=arm
    arm.select_set(False)
    return arm

def apply_pose(arm, objects):
    bpy.context.view_layer.update()
    for ob in objects:
        bpy.context.view_layer.objects.active=ob
        mod=next(m for m in ob.modifiers if m.type=='ARMATURE')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.context.view_layer.objects.active=arm; arm.select_set(True); bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT'); arm.select_set(False)
    for ob in objects:
        mod=ob.modifiers.new('Skin','ARMATURE'); mod.object=arm

def rotate_world(arm,name,axis,angle):
    b=arm.pose.bones[name]; b.rotation_mode='QUATERNION'
    axis=b.bone.matrix_local.to_quaternion().inverted()@Vector(axis)
    from mathutils import Quaternion
    b.rotation_quaternion=Quaternion(axis,angle)

def reset(): bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def export(name):
    bpy.ops.export_scene.gltf(filepath=str(OUT/name),export_format='GLB',export_animations=False,export_yup=True,export_extras=True,export_image_format='AUTO')

def character():
    global MODEL_TURN
    MODEL_TURN = True
    reset()
    skin=material('survivor-skin',image=MH/'skins/young_caucasian_male/young_lightskinned_male_diffuse.png',rough=.76)
    suitfolder=MH/'clothes/male_casualsuit05'
    suitmat=material('survivor-jacket-denim',image=suitfolder/'male_casualsuit05_diffuse.png',normal=suitfolder/'male_casualsuit05_normal.png',rough=.9)
    suit,hidden=outfit('clothes','male_casualsuit05',suitmat); suit.name='player_body'
    glove,hide=outfit('clothes','toigo_gloves_short',material('survivor-leather',image=GLOVE_TEXTURE,rough=.65)); hidden|=hide
    shoefolder=MH/'clothes/shoes05'; shoetex=next(shoefolder.glob('*diffuse*'))
    shoes,hide=outfit('clothes','shoes05',material('survivor-boots',image=shoetex,rough=.8)); hidden|=hide
    # Only exposed head/neck/forearm skin is needed under the clothing.
    human=mesh('survivor-skin',list(map(xyz,BASE)),UV,FACES,skin,VERT_WEIGHTS,
        lambda f,g:g=='body' and not any(v[0] in hidden for v in f) and all(BASE[v[0]].y>4 or abs(BASE[v[0]].x)>2.2 for v in f))
    eye,_=outfit('eyes','low-poly',material('survivor-eyes',image=MH/'eyes/materials/brown_eye.png',rough=.3))
    objects=[suit,glove,shoes,human,eye]
    # A close-cropped cap mesh avoids flat alpha hair cards and keeps the face readable.
    hair,_=outfit('hair','short01',material('survivor-hair',image=MH/'hair/short01/short01_diffuse.png',rough=.92)); objects.append(hair)
    arm=rig('survivor-skeleton',objects)
    for side,sign in [('l',-1),('r',1)]:
        rotate_world(arm,'upperarm_'+side,(0,1,0),sign*.55)
        across=(joint(RIG[f'index_01_{side}']['head'])-joint(RIG[f'pinky_01_{side}']['head'])).normalized()
        for finger in ['index','middle','ring','pinky']:
            for i,angle in [(1,.85),(2,1.15),(3,.65)]:
                rotate_world(arm,f'{finger}_{i:02d}_{side}',across,-angle*sign)
    apply_pose(arm,objects)
    # Root naming and joint contract used by the animation adapter.
    names={'upperarm_l':'player_arm_l_pivot','upperarm_r':'player_arm_r_pivot','lowerarm_l':'player_forearm_l_pivot','lowerarm_r':'player_forearm_r_pivot','thigh_l':'player_leg_l_pivot','thigh_r':'player_leg_r_pivot','head':'player_head'}
    for old,new in names.items(): arm.data.bones[old].name=new
    root=bpy.data.objects.new('player_survivor',None); bpy.context.collection.objects.link(root)
    orientation=bpy.data.objects.new('survivor-orientation',None); bpy.context.collection.objects.link(orientation)
    orientation.parent=root; arm.parent=orientation
    # Facing is baked into mesh and joint coordinates, keeping gameplay joint
    # rotation axes consistent with the Y-up/-Z-forward animation controller.
    orientation.scale=(1.10,1.10,1.10)
    root['skeletal_character']=True
    socket=bpy.data.objects.new('player_weapon_socket',None); bpy.context.collection.objects.link(socket); socket.parent=root
    # Helmet remains removable; fitted to the actual head rather than the old cubic model.
    head=joint(RIG['head']['head']); head.z+=.12
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=head)
    helmet=bpy.context.object; helmet.name='player_helmet'; helmet.scale=(.108,.12,.12)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    helmet.data.materials.append(material('survivor-helmet',(0.08,.10,.09,1),rough=.8))
    helmet.parent=arm; helmet.parent_type='BONE'; helmet.parent_bone='player_head'
    helmet.matrix_world=Matrix.Translation(head)
    helmet.hide_render=True
    for ob in objects:
        if ob.type=='MESH':
            # One subdivision gives face/finger silhouettes enough curvature for the lobby.
            if ob in [human,glove]:
                sub=ob.modifiers.new('Surface','SUBSURF'); sub.levels=1
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/survivor.blend'))
    export('character.glb')
    print('CHARACTER',json.dumps({'meshes':len(objects),'joints':len(arm.data.bones),'height':max(xyz(BASE[i]).z for i in GROUPS['body']),'ground':SHIFT}))
    MODEL_TURN = False

def hands():
    reset()
    skin=material('arm-skin',image=MH/'skins/young_caucasian_male/young_lightskinned_male_diffuse.png',rough=.73)
    glove_mat=material('tactical-leather',image=GLOVE_TEXTURE,rough=.64)
    glove,_=outfit('clothes','toigo_gloves_short',glove_mat)
    # Keep the right forearm and hand, preserving their existing UVs and skin weights.
    elbow=joint(RIG['lowerarm_r']['head']); wrist=joint(RIG['hand_r']['head'])
    forearm_axis=elbow-wrist
    def forearm_vertex(index):
        delta=xyz(BASE[index])-wrist
        t=delta.dot(forearm_axis)/forearm_axis.length_squared
        return -.3<t<1.25 and (delta-forearm_axis*t).length<.09
    skinhand=mesh('anatomical-arm',list(map(xyz,BASE)),UV,FACES,skin,VERT_WEIGHTS,
        lambda f,g:g=='body' and all(forearm_vertex(v[0]) for v in f))
    # Clip at the wrist plane so the skin meets the cuff without ragged triangles.
    import bmesh
    bm=bmesh.new(); bm.from_mesh(skinhand.data)
    bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
        plane_co=wrist+forearm_axis.normalized()*.006,plane_no=forearm_axis.normalized(),clear_inner=True)
    bm.to_mesh(skinhand.data); bm.free()
    # Remove the other glove. This is a real sewn glove mesh, not tube fingers.
    bpy.context.view_layer.objects.active=glove; glove.select_set(True)
    import bmesh
    bm=bmesh.new(); bm.from_mesh(glove.data); bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.x>0],context='VERTS'); bm.to_mesh(glove.data); bm.free(); glove.select_set(False)
    along=(joint(RIG['middle_01_r']['head'])-wrist).normalized()
    across=(joint(RIG['index_01_r']['head'])-joint(RIG['pinky_01_r']['head'])).normalized()
    normal=along.cross(across).normalized(); across=normal.cross(along).normalized()
    arm=rig('hand-skeleton',[skinhand,glove])
    for finger in ['index','middle','ring','pinky']:
        for i,angle in [(1,1.05),(2,1.35),(3,.8)]:
            name=f'{finger}_{i:02d}_r'
            if name in arm.pose.bones: rotate_world(arm,name,across,-angle)
    rotate_world(arm,'thumb_01_r',normal,-.92)
    rotate_world(arm,'thumb_02_r',across,-1.1)
    rotate_world(arm,'thumb_03_r',across,-.5)
    apply_pose(arm,[skinhand,glove])
    # New hand-local basis: fingers extend -X, finger row lies along Y, back of hand +Z.
    basis=Matrix((tuple(-along),tuple(across),tuple(-normal))).to_4x4()
    scale=Matrix.Scale(2.1,4)
    transform=Matrix.Rotation(math.pi/2,4,'X')@Matrix.Translation((.12,-.16,.08))@scale@basis@Matrix.Translation(-wrist)
    # Bake the closed glove pose, then bind the forearm to the view rig.
    for ob in [skinhand,glove]:
        bpy.context.view_layer.objects.active=ob
        bpy.ops.object.modifier_apply(modifier=next(m.name for m in ob.modifiers if m.type=='ARMATURE'))
        ob.parent=None; ob.data.transform(transform)
        sub=ob.modifiers.new('Hand surface','SUBSURF'); sub.levels=1
        bpy.ops.object.modifier_apply(modifier=sub.name)
    bpy.data.objects.remove(arm,do_unlink=True)
    root=bpy.data.objects.new('anatomical_hand',None); bpy.context.collection.objects.link(root)
    for ob in [skinhand,glove]: ob.parent=root
    # A separate two-joint forearm keeps the wrist on the weapon and the elbow
    # outside the camera throughout equip, inspection, aiming and both attacks.
    wrist_local=transform@wrist; elbow_local=transform@elbow
    data=bpy.data.armatures.new('view-arm'); arm=bpy.data.objects.new('view-arm',data)
    bpy.context.collection.objects.link(arm); arm.parent=root
    bpy.context.view_layer.objects.active=arm; arm.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    for name,point in [('view-wrist',wrist_local),('view-elbow',elbow_local)]:
        b=data.edit_bones.new(name); b.head=point; b.tail=point+Vector((0,0,.04))
    bpy.ops.object.mode_set(mode='OBJECT'); arm.select_set(False)
    skinhand.vertex_groups.clear()
    wg=skinhand.vertex_groups.new(name='view-wrist'); eg=skinhand.vertex_groups.new(name='view-elbow')
    direction=elbow_local-wrist_local
    for v in skinhand.data.vertices:
        t=max(0,min(1,((v.co-wrist_local).dot(direction)/direction.length_squared-.06)/.59))
        t=t*t*(3-2*t)
        wg.add([v.index],1-t,'REPLACE'); eg.add([v.index],t,'REPLACE')
    mod=skinhand.modifiers.new('Anchored anatomical forearm','ARMATURE'); mod.object=arm
    skinhand.parent=arm
    root['source']='MakeHuman CC0 / Margaret Toigo gloves'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/hands.blend'))
    export('hands.glb')

def knife():
    reset(); bpy.ops.import_scene.gltf(filepath=str(SRC/'balisong.glb'))
    source=[o for o in bpy.context.scene.objects if o.type=='MESH']
    steel=material('knife-brushed-steel',(.22,.32,.4,1),rough=.26,metal=.85)
    carbon=material('knife-carbon-titanium',(.055,.075,.085,1),rough=.34,metal=.65)
    inlay=material('knife-inlay',(.12,.6,.65,1),rough=.25,metal=.5)
    root=bpy.data.objects.new('butterfly-knife',None); bpy.context.collection.objects.link(root)
    root.scale=(.75,.75,.75)
    def pivot(name,parent,x=0):
        o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); o.parent=parent; o.location.x=x; return o
    safe=pivot('knife-safe-handle',root,-.055)
    blade=pivot('knife-blade-pivot',root,-.055)
    bite=pivot('knife-bite-pivot',blade,.11)
    import numpy as np
    convert=Matrix.Rotation(math.pi/2,4,'X')
    for ob in source:
        points=[ob.matrix_world@v.co for v in ob.data.vertices]
        if 'Handle' in ob.name:
            a=np.array([[v.x,v.y] for v in points]); _,vec=np.linalg.eigh(np.cov(a.T)); axis=Vector((float(vec[0,-1]),float(vec[1,-1]),0))
            if axis.y<0: axis=-axis
            rot=Matrix.Rotation(math.atan2(axis.x,axis.y),4,'Z')
            points=[rot@v for v in points]
            low=min(v.y for v in points); first=[v for v in points if v.y<low+.6]
            center=sum(first,Vector())/len(first); center.y=low+.28
            points=[convert@Vector(((v.x-center.x)*.1,-(v.y-center.y)*.1,(v.z-center.z)*.1)) for v in points]
            parent=safe if 'Top' in ob.name else bite; mat=carbon
        else:
            points=[convert@Vector((v.x*.1+.055,(.45-v.y)*.1,(v.z+.08)*.1)) for v in points]
            parent=blade; mat=inlay if '001' in ob.name else steel
        ob.parent=None; ob.matrix_world=Matrix.Identity(4)
        for v,p in zip(ob.data.vertices,points): v.co=p
        ob.data.materials.clear(); ob.data.materials.append(mat)
        for p in ob.data.polygons: p.material_index=0
        ob.parent=parent
        ob.name='knife-blade' if parent==blade and mat==steel else ob.name
    for ob in list(bpy.context.scene.objects):
        if ob not in source and ob not in [root,safe,blade,bite]: bpy.data.objects.remove(ob,do_unlink=True)
    # Hinge rotation is authored around Three.js Z, i.e. Blender -Y.
    # Neutralize exporter axis conversion on the pivot nodes, geometry remains Y-up after import.
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/butterfly.blend'))
    export('butterfly.glb')

character()
hands()
knife()
