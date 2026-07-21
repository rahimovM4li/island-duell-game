(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Md="modulepreload",Sd=function(i){return"/"+i},vl={},Ed=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(l){return Promise.all(l.map(h=>Promise.resolve(h).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");s=o(t.map(l=>{if(l=Sd(l),l in vl)return;vl[l]=!0;const h=l.endsWith(".css"),u=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const f=document.createElement("link");if(f.rel=h?"stylesheet":Md,h||(f.as="script"),f.crossOrigin="",f.href=l,c&&f.setAttribute("nonce",c),document.head.appendChild(f),h)return new Promise((m,g)=>{f.addEventListener("load",m),f.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&r(a.reason);return e().catch(r)})};/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Fc="172",bd=0,xl=1,wd=2,Zh=1,Jh=2,Xn=3,pi=0,Jt=1,zt=2,hi=0,vs=1,yl=2,Ml=3,Sl=4,Td=5,Ai=100,Ad=101,Rd=102,Cd=103,Pd=104,Ld=200,Id=201,Dd=202,Ud=203,Fa=204,Oa=205,Nd=206,Fd=207,Od=208,kd=209,Bd=210,zd=211,Hd=212,Vd=213,Gd=214,ka=0,Ba=1,za=2,As=3,Ha=4,Va=5,Ga=6,Wa=7,Oc=0,Wd=1,Xd=2,ui=0,qd=1,Yd=2,$d=3,Qh=4,jd=5,Kd=6,Zd=7,eu=300,Rs=301,Cs=302,Xa=303,qa=304,Uo=306,Ya=1e3,Di=1001,$a=1002,an=1003,Jd=1004,wr=1005,Dn=1006,Xo=1007,Ui=1008,Zn=1009,tu=1010,nu=1011,vr=1012,kc=1013,ki=1014,Un=1015,yr=1016,Bc=1017,zc=1018,Ps=1020,iu=35902,su=1021,ru=1022,An=1023,ou=1024,au=1025,xs=1026,Ls=1027,Hc=1028,Vc=1029,cu=1030,Gc=1031,Wc=1033,so=33776,ro=33777,oo=33778,ao=33779,ja=35840,Ka=35841,Za=35842,Ja=35843,Qa=36196,ec=37492,tc=37496,nc=37808,ic=37809,sc=37810,rc=37811,oc=37812,ac=37813,cc=37814,lc=37815,hc=37816,uc=37817,dc=37818,fc=37819,pc=37820,mc=37821,co=36492,gc=36494,_c=36495,lu=36283,vc=36284,xc=36285,yc=36286,Qd=3200,ef=3201,hu=0,tf=1,ri="",Zt="srgb",Is="srgb-linear",Mo="linear",ht="srgb",Gi=7680,El=519,nf=512,sf=513,rf=514,uu=515,of=516,af=517,cf=518,lf=519,Mc=35044,bl="300 es",$n=2e3,So=2001;class Us{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Gt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let wl=1234567;const lr=Math.PI/180,xr=180/Math.PI;function jn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Gt[i&255]+Gt[i>>8&255]+Gt[i>>16&255]+Gt[i>>24&255]+"-"+Gt[e&255]+Gt[e>>8&255]+"-"+Gt[e>>16&15|64]+Gt[e>>24&255]+"-"+Gt[t&63|128]+Gt[t>>8&255]+"-"+Gt[t>>16&255]+Gt[t>>24&255]+Gt[n&255]+Gt[n>>8&255]+Gt[n>>16&255]+Gt[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function Xc(i,e){return(i%e+e)%e}function hf(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function uf(i,e,t){return i!==e?(t-i)/(e-i):0}function hr(i,e,t){return(1-t)*i+t*e}function df(i,e,t,n){return hr(i,e,1-Math.exp(-t*n))}function ff(i,e=1){return e-Math.abs(Xc(i,e*2)-e)}function pf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function mf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function gf(i,e){return i+Math.floor(Math.random()*(e-i+1))}function _f(i,e){return i+Math.random()*(e-i)}function vf(i){return i*(.5-Math.random())}function xf(i){i!==void 0&&(wl=i);let e=wl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function yf(i){return i*lr}function Mf(i){return i*xr}function Sf(i){return(i&i-1)===0&&i!==0}function Ef(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function bf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function wf(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),f=o((e-n)/2),m=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*h,c*u,c*f,a*l);break;case"YZY":i.set(c*f,a*h,c*u,a*l);break;case"ZXZ":i.set(c*u,c*f,a*h,a*l);break;case"XZX":i.set(a*h,c*g,c*m,a*l);break;case"YXY":i.set(c*m,a*h,c*g,a*l);break;case"ZYZ":i.set(c*g,c*m,a*h,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function bn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function lt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const zs={DEG2RAD:lr,RAD2DEG:xr,generateUUID:jn,clamp:Xe,euclideanModulo:Xc,mapLinear:hf,inverseLerp:uf,lerp:hr,damp:df,pingpong:ff,smoothstep:pf,smootherstep:mf,randInt:gf,randFloat:_f,randFloatSpread:vf,seededRandom:xf,degToRad:yf,radToDeg:Mf,isPowerOfTwo:Sf,ceilPowerOfTwo:Ef,floorPowerOfTwo:bf,setQuaternionFromProperEuler:wf,normalize:lt,denormalize:bn};class ke{constructor(e=0,t=0){ke.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ze{constructor(e,t,n,s,r,o,a,c,l){ze.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],f=n[2],m=n[5],g=n[8],v=s[0],p=s[3],d=s[6],b=s[1],E=s[4],_=s[7],R=s[2],T=s[5],A=s[8];return r[0]=o*v+a*b+c*R,r[3]=o*p+a*E+c*T,r[6]=o*d+a*_+c*A,r[1]=l*v+h*b+u*R,r[4]=l*p+h*E+u*T,r[7]=l*d+h*_+u*A,r[2]=f*v+m*b+g*R,r[5]=f*p+m*E+g*T,r[8]=f*d+m*_+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=h*o-a*l,f=a*c-h*r,m=l*r-o*c,g=t*u+n*f+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=u*v,e[1]=(s*l-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=f*v,e[4]=(h*t-s*c)*v,e[5]=(s*r-a*t)*v,e[6]=m*v,e[7]=(n*c-l*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(qo.makeScale(e,t)),this}rotate(e){return this.premultiply(qo.makeRotation(-e)),this}translate(e,t){return this.premultiply(qo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const qo=new ze;function du(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Eo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Tf(){const i=Eo("canvas");return i.style.display="block",i}const Tl={};function cs(i){i in Tl||(Tl[i]=!0,console.warn(i))}function Af(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function Rf(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Cf(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Al=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Rl=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Pf(){const i={enabled:!0,workingColorSpace:Is,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ht&&(s.r=Kn(s.r),s.g=Kn(s.g),s.b=Kn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ht&&(s.r=ys(s.r),s.g=ys(s.g),s.b=ys(s.b))),s},fromWorkingColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},toWorkingColorSpace:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ri?Mo:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Is]:{primaries:e,whitePoint:n,transfer:Mo,toXYZ:Al,fromXYZ:Rl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Zt},outputColorSpaceConfig:{drawingBufferColorSpace:Zt}},[Zt]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:Al,fromXYZ:Rl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Zt}}}),i}const st=Pf();function Kn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ys(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Wi;class Lf{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Wi===void 0&&(Wi=Eo("canvas")),Wi.width=e.width,Wi.height=e.height;const n=Wi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Wi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Eo("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Kn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Kn(t[n]/255)*255):t[n]=Kn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let If=0;class fu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:If++}),this.uuid=jn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Yo(s[o].image)):r.push(Yo(s[o]))}else r=Yo(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Yo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Lf.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Df=0;class qt extends Us{constructor(e=qt.DEFAULT_IMAGE,t=qt.DEFAULT_MAPPING,n=Di,s=Di,r=Dn,o=Ui,a=An,c=Zn,l=qt.DEFAULT_ANISOTROPY,h=ri){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=jn(),this.name="",this.source=new fu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==eu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ya:e.x=e.x-Math.floor(e.x);break;case Di:e.x=e.x<0?0:1;break;case $a:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ya:e.y=e.y-Math.floor(e.y);break;case Di:e.y=e.y<0?0:1;break;case $a:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=eu;qt.DEFAULT_ANISOTROPY=1;class ut{constructor(e=0,t=0,n=0,s=1){ut.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],h=c[4],u=c[8],f=c[1],m=c[5],g=c[9],v=c[2],p=c[6],d=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(l+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(l+1)/2,_=(m+1)/2,R=(d+1)/2,T=(h+f)/4,A=(u+v)/4,C=(g+p)/4;return E>_&&E>R?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=T/n,r=A/n):_>R?_<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),n=T/s,r=C/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=A/r,s=C/r),this.set(n,s,r,t),this}let b=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(b)<.001&&(b=1),this.x=(p-g)/b,this.y=(u-v)/b,this.z=(f-h)/b,this.w=Math.acos((l+m+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Uf extends Us{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new ut(0,0,e,t),this.scissorTest=!1,this.viewport=new ut(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new qt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;const t=Object.assign({},e.texture.image);return this.texture.source=new fu(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Bi extends Uf{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class pu extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=an,this.minFilter=an,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Nf extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=an,this.minFilter=an,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ns{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3];const f=r[o+0],m=r[o+1],g=r[o+2],v=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=m,e[t+2]=g,e[t+3]=v;return}if(u!==v||c!==f||l!==m||h!==g){let p=1-a;const d=c*f+l*m+h*g+u*v,b=d>=0?1:-1,E=1-d*d;if(E>Number.EPSILON){const R=Math.sqrt(E),T=Math.atan2(R,d*b);p=Math.sin(p*T)/R,a=Math.sin(a*T)/R}const _=a*b;if(c=c*p+f*_,l=l*p+m*_,h=h*p+g*_,u=u*p+v*_,p===1-a){const R=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=R,l*=R,h*=R,u*=R}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[o],f=r[o+1],m=r[o+2],g=r[o+3];return e[t]=a*g+h*u+c*m-l*f,e[t+1]=c*g+h*f+l*u-a*m,e[t+2]=l*g+h*m+a*f-c*u,e[t+3]=h*g-a*u-c*f-l*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),u=a(r/2),f=c(n/2),m=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=f*h*u+l*m*g,this._y=l*m*u-f*h*g,this._z=l*h*g+f*m*u,this._w=l*h*u-f*m*g;break;case"YXZ":this._x=f*h*u+l*m*g,this._y=l*m*u-f*h*g,this._z=l*h*g-f*m*u,this._w=l*h*u+f*m*g;break;case"ZXY":this._x=f*h*u-l*m*g,this._y=l*m*u+f*h*g,this._z=l*h*g+f*m*u,this._w=l*h*u-f*m*g;break;case"ZYX":this._x=f*h*u-l*m*g,this._y=l*m*u+f*h*g,this._z=l*h*g-f*m*u,this._w=l*h*u+f*m*g;break;case"YZX":this._x=f*h*u+l*m*g,this._y=l*m*u+f*h*g,this._z=l*h*g-f*m*u,this._w=l*h*u-f*m*g;break;case"XZY":this._x=f*h*u-l*m*g,this._y=l*m*u-f*h*g,this._z=l*h*g+f*m*u,this._w=l*h*u+f*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(h-c)*m,this._y=(r-l)*m,this._z=(o-s)*m}else if(n>a&&n>u){const m=2*Math.sqrt(1+n-a-u);this._w=(h-c)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+l)/m}else if(a>u){const m=2*Math.sqrt(1+a-n-u);this._w=(r-l)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(c+h)/m}else{const m=2*Math.sqrt(1+u-n-a);this._w=(o-s)/m,this._x=(r+l)/m,this._y=(c+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const m=1-t;return this._w=m*o+t*this._w,this._x=m*n+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,a),u=Math.sin((1-t)*h)/l,f=Math.sin(t*h)/l;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(e=0,t=0,n=0){D.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Cl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Cl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=s+c*u+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return $o.copy(this).projectOnVector(e),this.sub($o)}reflect(e){return this.sub($o.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const $o=new D,Cl=new Ns;class zi{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,vn):vn.fromBufferAttribute(r,o),vn.applyMatrix4(e.matrixWorld),this.expandByPoint(vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Tr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Tr.copy(n.boundingBox)),Tr.applyMatrix4(e.matrixWorld),this.union(Tr)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,vn),vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Hs),Ar.subVectors(this.max,Hs),Xi.subVectors(e.a,Hs),qi.subVectors(e.b,Hs),Yi.subVectors(e.c,Hs),Jn.subVectors(qi,Xi),Qn.subVectors(Yi,qi),vi.subVectors(Xi,Yi);let t=[0,-Jn.z,Jn.y,0,-Qn.z,Qn.y,0,-vi.z,vi.y,Jn.z,0,-Jn.x,Qn.z,0,-Qn.x,vi.z,0,-vi.x,-Jn.y,Jn.x,0,-Qn.y,Qn.x,0,-vi.y,vi.x,0];return!jo(t,Xi,qi,Yi,Ar)||(t=[1,0,0,0,1,0,0,0,1],!jo(t,Xi,qi,Yi,Ar))?!1:(Rr.crossVectors(Jn,Qn),t=[Rr.x,Rr.y,Rr.z],jo(t,Xi,qi,Yi,Ar))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Bn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Bn=[new D,new D,new D,new D,new D,new D,new D,new D],vn=new D,Tr=new zi,Xi=new D,qi=new D,Yi=new D,Jn=new D,Qn=new D,vi=new D,Hs=new D,Ar=new D,Rr=new D,xi=new D;function jo(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){xi.fromArray(i,r);const a=s.x*Math.abs(xi.x)+s.y*Math.abs(xi.y)+s.z*Math.abs(xi.z),c=e.dot(xi),l=t.dot(xi),h=n.dot(xi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Ff=new zi,Vs=new D,Ko=new D;class Fs{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ff.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vs.subVectors(e,this.center);const t=Vs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Vs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ko.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vs.copy(e.center).add(Ko)),this.expandByPoint(Vs.copy(e.center).sub(Ko))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const zn=new D,Zo=new D,Cr=new D,ei=new D,Jo=new D,Pr=new D,Qo=new D;class mu{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zn.copy(this.origin).addScaledVector(this.direction,t),zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Zo.copy(e).add(t).multiplyScalar(.5),Cr.copy(t).sub(e).normalize(),ei.copy(this.origin).sub(Zo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Cr),a=ei.dot(this.direction),c=-ei.dot(Cr),l=ei.lengthSq(),h=Math.abs(1-o*o);let u,f,m,g;if(h>0)if(u=o*c-a,f=o*a-c,g=r*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,m=u*(u+o*f+2*a)+f*(o*u+f+2*c)+l}else f=r,u=Math.max(0,-(o*f+a)),m=-u*u+f*(f+2*c)+l;else f=-r,u=Math.max(0,-(o*f+a)),m=-u*u+f*(f+2*c)+l;else f<=-g?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-c),r),m=-u*u+f*(f+2*c)+l):f<=g?(u=0,f=Math.min(Math.max(-r,-c),r),m=f*(f+2*c)+l):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-c),r),m=-u*u+f*(f+2*c)+l);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),m=-u*u+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Zo).addScaledVector(Cr,f),m}intersectSphere(e,t){zn.subVectors(e.center,this.origin);const n=zn.dot(this.direction),s=zn.dot(zn)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,c=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,c=(e.min.z-f.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,zn)!==null}intersectTriangle(e,t,n,s,r){Jo.subVectors(t,e),Pr.subVectors(n,e),Qo.crossVectors(Jo,Pr);let o=this.direction.dot(Qo),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ei.subVectors(this.origin,e);const c=a*this.direction.dot(Pr.crossVectors(ei,Pr));if(c<0)return null;const l=a*this.direction.dot(Jo.cross(ei));if(l<0||c+l>o)return null;const h=-a*ei.dot(Qo);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class nt{constructor(e,t,n,s,r,o,a,c,l,h,u,f,m,g,v,p){nt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,h,u,f,m,g,v,p)}set(e,t,n,s,r,o,a,c,l,h,u,f,m,g,v,p){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=h,d[10]=u,d[14]=f,d[3]=m,d[7]=g,d[11]=v,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new nt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/$i.setFromMatrixColumn(e,0).length(),r=1/$i.setFromMatrixColumn(e,1).length(),o=1/$i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=o*h,m=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=m+g*l,t[5]=f-v*l,t[9]=-a*c,t[2]=v-f*l,t[6]=g+m*l,t[10]=o*c}else if(e.order==="YXZ"){const f=c*h,m=c*u,g=l*h,v=l*u;t[0]=f+v*a,t[4]=g*a-m,t[8]=o*l,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=m*a-g,t[6]=v+f*a,t[10]=o*c}else if(e.order==="ZXY"){const f=c*h,m=c*u,g=l*h,v=l*u;t[0]=f-v*a,t[4]=-o*u,t[8]=g+m*a,t[1]=m+g*a,t[5]=o*h,t[9]=v-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const f=o*h,m=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=g*l-m,t[8]=f*l+v,t[1]=c*u,t[5]=v*l+f,t[9]=m*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const f=o*c,m=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=v-f*u,t[8]=g*u+m,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=m*u+g,t[10]=f-v*u}else if(e.order==="XZY"){const f=o*c,m=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=f*u+v,t[5]=o*h,t[9]=m*u-g,t[2]=g*u-m,t[6]=a*h,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Of,e,kf)}lookAt(e,t,n){const s=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ti.crossVectors(n,tn),ti.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ti.crossVectors(n,tn)),ti.normalize(),Lr.crossVectors(tn,ti),s[0]=ti.x,s[4]=Lr.x,s[8]=tn.x,s[1]=ti.y,s[5]=Lr.y,s[9]=tn.y,s[2]=ti.z,s[6]=Lr.z,s[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],f=n[9],m=n[13],g=n[2],v=n[6],p=n[10],d=n[14],b=n[3],E=n[7],_=n[11],R=n[15],T=s[0],A=s[4],C=s[8],S=s[12],x=s[1],P=s[5],B=s[9],I=s[13],O=s[2],V=s[6],X=s[10],K=s[14],G=s[3],te=s[7],ce=s[11],Ee=s[15];return r[0]=o*T+a*x+c*O+l*G,r[4]=o*A+a*P+c*V+l*te,r[8]=o*C+a*B+c*X+l*ce,r[12]=o*S+a*I+c*K+l*Ee,r[1]=h*T+u*x+f*O+m*G,r[5]=h*A+u*P+f*V+m*te,r[9]=h*C+u*B+f*X+m*ce,r[13]=h*S+u*I+f*K+m*Ee,r[2]=g*T+v*x+p*O+d*G,r[6]=g*A+v*P+p*V+d*te,r[10]=g*C+v*B+p*X+d*ce,r[14]=g*S+v*I+p*K+d*Ee,r[3]=b*T+E*x+_*O+R*G,r[7]=b*A+E*P+_*V+R*te,r[11]=b*C+E*B+_*X+R*ce,r[15]=b*S+E*I+_*K+R*Ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],u=e[6],f=e[10],m=e[14],g=e[3],v=e[7],p=e[11],d=e[15];return g*(+r*c*u-s*l*u-r*a*f+n*l*f+s*a*m-n*c*m)+v*(+t*c*m-t*l*f+r*o*f-s*o*m+s*l*h-r*c*h)+p*(+t*l*u-t*a*m-r*o*u+n*o*m+r*a*h-n*l*h)+d*(-s*a*h-t*c*u+t*a*f+s*o*u-n*o*f+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=e[9],f=e[10],m=e[11],g=e[12],v=e[13],p=e[14],d=e[15],b=u*p*l-v*f*l+v*c*m-a*p*m-u*c*d+a*f*d,E=g*f*l-h*p*l-g*c*m+o*p*m+h*c*d-o*f*d,_=h*v*l-g*u*l+g*a*m-o*v*m-h*a*d+o*u*d,R=g*u*c-h*v*c-g*a*f+o*v*f+h*a*p-o*u*p,T=t*b+n*E+s*_+r*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/T;return e[0]=b*A,e[1]=(v*f*r-u*p*r-v*s*m+n*p*m+u*s*d-n*f*d)*A,e[2]=(a*p*r-v*c*r+v*s*l-n*p*l-a*s*d+n*c*d)*A,e[3]=(u*c*r-a*f*r-u*s*l+n*f*l+a*s*m-n*c*m)*A,e[4]=E*A,e[5]=(h*p*r-g*f*r+g*s*m-t*p*m-h*s*d+t*f*d)*A,e[6]=(g*c*r-o*p*r-g*s*l+t*p*l+o*s*d-t*c*d)*A,e[7]=(o*f*r-h*c*r+h*s*l-t*f*l-o*s*m+t*c*m)*A,e[8]=_*A,e[9]=(g*u*r-h*v*r-g*n*m+t*v*m+h*n*d-t*u*d)*A,e[10]=(o*v*r-g*a*r+g*n*l-t*v*l-o*n*d+t*a*d)*A,e[11]=(h*a*r-o*u*r-h*n*l+t*u*l+o*n*m-t*a*m)*A,e[12]=R*A,e[13]=(h*v*s-g*u*s+g*n*f-t*v*f-h*n*p+t*u*p)*A,e[14]=(g*a*s-o*v*s-g*n*c+t*v*c+o*n*p-t*a*p)*A,e[15]=(o*u*s-h*a*s+h*n*c-t*u*c-o*n*f+t*a*f)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,u=a+a,f=r*l,m=r*h,g=r*u,v=o*h,p=o*u,d=a*u,b=c*l,E=c*h,_=c*u,R=n.x,T=n.y,A=n.z;return s[0]=(1-(v+d))*R,s[1]=(m+_)*R,s[2]=(g-E)*R,s[3]=0,s[4]=(m-_)*T,s[5]=(1-(f+d))*T,s[6]=(p+b)*T,s[7]=0,s[8]=(g+E)*A,s[9]=(p-b)*A,s[10]=(1-(f+v))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=$i.set(s[0],s[1],s[2]).length();const o=$i.set(s[4],s[5],s[6]).length(),a=$i.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],xn.copy(this);const l=1/r,h=1/o,u=1/a;return xn.elements[0]*=l,xn.elements[1]*=l,xn.elements[2]*=l,xn.elements[4]*=h,xn.elements[5]*=h,xn.elements[6]*=h,xn.elements[8]*=u,xn.elements[9]*=u,xn.elements[10]*=u,t.setFromRotationMatrix(xn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=$n){const c=this.elements,l=2*r/(t-e),h=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s);let m,g;if(a===$n)m=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===So)m=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=$n){const c=this.elements,l=1/(t-e),h=1/(n-s),u=1/(o-r),f=(t+e)*l,m=(n+s)*h;let g,v;if(a===$n)g=(o+r)*u,v=-2*u;else if(a===So)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-m,c[2]=0,c[6]=0,c[10]=v,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const $i=new D,xn=new nt,Of=new D(0,0,0),kf=new D(1,1,1),ti=new D,Lr=new D,tn=new D,Pl=new nt,Ll=new Ns;class Fn{constructor(e=0,t=0,n=0,s=Fn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],u=s[2],f=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Xe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Pl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Pl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ll.setFromEuler(this),this.setFromQuaternion(Ll,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Fn.DEFAULT_ORDER="XYZ";class gu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Bf=0;const Il=new D,ji=new Ns,Hn=new nt,Ir=new D,Gs=new D,zf=new D,Hf=new Ns,Dl=new D(1,0,0),Ul=new D(0,1,0),Nl=new D(0,0,1),Fl={type:"added"},Vf={type:"removed"},Ki={type:"childadded",child:null},ea={type:"childremoved",child:null};class Ct extends Us{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bf++}),this.uuid=jn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ct.DEFAULT_UP.clone();const e=new D,t=new Fn,n=new Ns,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new nt},normalMatrix:{value:new ze}}),this.matrix=new nt,this.matrixWorld=new nt,this.matrixAutoUpdate=Ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ji.setFromAxisAngle(e,t),this.quaternion.multiply(ji),this}rotateOnWorldAxis(e,t){return ji.setFromAxisAngle(e,t),this.quaternion.premultiply(ji),this}rotateX(e){return this.rotateOnAxis(Dl,e)}rotateY(e){return this.rotateOnAxis(Ul,e)}rotateZ(e){return this.rotateOnAxis(Nl,e)}translateOnAxis(e,t){return Il.copy(e).applyQuaternion(this.quaternion),this.position.add(Il.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Dl,e)}translateY(e){return this.translateOnAxis(Ul,e)}translateZ(e){return this.translateOnAxis(Nl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Hn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ir.copy(e):Ir.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Gs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hn.lookAt(Gs,Ir,this.up):Hn.lookAt(Ir,Gs,this.up),this.quaternion.setFromRotationMatrix(Hn),s&&(Hn.extractRotation(s.matrixWorld),ji.setFromRotationMatrix(Hn),this.quaternion.premultiply(ji.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Fl),Ki.child=e,this.dispatchEvent(Ki),Ki.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vf),ea.child=e,this.dispatchEvent(ea),ea.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Hn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Hn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Hn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Fl),Ki.child=e,this.dispatchEvent(Ki),Ki.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,e,zf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,Hf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),m=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}Ct.DEFAULT_UP=new D(0,1,0);Ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const yn=new D,Vn=new D,ta=new D,Gn=new D,Zi=new D,Ji=new D,Ol=new D,na=new D,ia=new D,sa=new D,ra=new ut,oa=new ut,aa=new ut;class pn{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),yn.subVectors(e,t),s.cross(yn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){yn.subVectors(s,t),Vn.subVectors(n,t),ta.subVectors(e,t);const o=yn.dot(yn),a=yn.dot(Vn),c=yn.dot(ta),l=Vn.dot(Vn),h=Vn.dot(ta),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;const f=1/u,m=(l*c-a*h)*f,g=(o*h-a*c)*f;return r.set(1-m-g,g,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Gn)===null?!1:Gn.x>=0&&Gn.y>=0&&Gn.x+Gn.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,Gn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Gn.x),c.addScaledVector(o,Gn.y),c.addScaledVector(a,Gn.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return ra.setScalar(0),oa.setScalar(0),aa.setScalar(0),ra.fromBufferAttribute(e,t),oa.fromBufferAttribute(e,n),aa.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(ra,r.x),o.addScaledVector(oa,r.y),o.addScaledVector(aa,r.z),o}static isFrontFacing(e,t,n,s){return yn.subVectors(n,t),Vn.subVectors(e,t),yn.cross(Vn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),yn.cross(Vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return pn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return pn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return pn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return pn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return pn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;Zi.subVectors(s,n),Ji.subVectors(r,n),na.subVectors(e,n);const c=Zi.dot(na),l=Ji.dot(na);if(c<=0&&l<=0)return t.copy(n);ia.subVectors(e,s);const h=Zi.dot(ia),u=Ji.dot(ia);if(h>=0&&u<=h)return t.copy(s);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(n).addScaledVector(Zi,o);sa.subVectors(e,r);const m=Zi.dot(sa),g=Ji.dot(sa);if(g>=0&&m<=g)return t.copy(r);const v=m*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(Ji,a);const p=h*g-m*u;if(p<=0&&u-h>=0&&m-g>=0)return Ol.subVectors(r,s),a=(u-h)/(u-h+(m-g)),t.copy(s).addScaledVector(Ol,a);const d=1/(p+v+f);return o=v*d,a=f*d,t.copy(n).addScaledVector(Zi,o).addScaledVector(Ji,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const _u={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},Dr={h:0,s:0,l:0};function ca(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ce{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,st.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=st.workingColorSpace){return this.r=e,this.g=t,this.b=n,st.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=st.workingColorSpace){if(e=Xc(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=ca(o,r,e+1/3),this.g=ca(o,r,e),this.b=ca(o,r,e-1/3)}return st.toWorkingColorSpace(this,s),this}setStyle(e,t=Zt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Zt){const n=_u[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Kn(e.r),this.g=Kn(e.g),this.b=Kn(e.b),this}copyLinearToSRGB(e){return this.r=ys(e.r),this.g=ys(e.g),this.b=ys(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Zt){return st.fromWorkingColorSpace(Wt.copy(this),e),Math.round(Xe(Wt.r*255,0,255))*65536+Math.round(Xe(Wt.g*255,0,255))*256+Math.round(Xe(Wt.b*255,0,255))}getHexString(e=Zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=st.workingColorSpace){st.fromWorkingColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=st.workingColorSpace){return st.fromWorkingColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=Zt){st.fromWorkingColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==Zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ni),this.setHSL(ni.h+e,ni.s+t,ni.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ni),e.getHSL(Dr);const n=hr(ni.h,Dr.h,t),s=hr(ni.s,Dr.s,t),r=hr(ni.l,Dr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Ce;Ce.NAMES=_u;let Gf=0;class Hi extends Us{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=jn(),this.name="",this.type="Material",this.blending=vs,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fa,this.blendDst=Oa,this.blendEquation=Ai,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=As,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=El,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Gi,this.stencilZFail=Gi,this.stencilZPass=Gi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==vs&&(n.blending=this.blending),this.side!==pi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Fa&&(n.blendSrc=this.blendSrc),this.blendDst!==Oa&&(n.blendDst=this.blendDst),this.blendEquation!==Ai&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==As&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==El&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Gi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Gi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Gi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class wn extends Hi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Fn,this.combine=Oc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const wt=new D,Ur=new ke;class Qt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Mc,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ur.fromBufferAttribute(this,t),Ur.applyMatrix3(e),this.setXY(t,Ur.x,Ur.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix3(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix4(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyNormalMatrix(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.transformDirection(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=bn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=lt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=bn(t,this.array)),t}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=bn(t,this.array)),t}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=bn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=bn(t,this.array)),t}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),s=lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),s=lt(s,this.array),r=lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Mc&&(e.usage=this.usage),e}}class vu extends Qt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class xu extends Qt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class xt extends Qt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Wf=0;const un=new nt,la=new Ct,Qi=new D,nn=new zi,Ws=new zi,Dt=new D;class Ot extends Us{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wf++}),this.uuid=jn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(du(e)?xu:vu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return un.makeRotationFromQuaternion(e),this.applyMatrix4(un),this}rotateX(e){return un.makeRotationX(e),this.applyMatrix4(un),this}rotateY(e){return un.makeRotationY(e),this.applyMatrix4(un),this}rotateZ(e){return un.makeRotationZ(e),this.applyMatrix4(un),this}translate(e,t,n){return un.makeTranslation(e,t,n),this.applyMatrix4(un),this}scale(e,t,n){return un.makeScale(e,t,n),this.applyMatrix4(un),this}lookAt(e){return la.lookAt(e),la.updateMatrix(),this.applyMatrix4(la.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qi).negate(),this.translate(Qi.x,Qi.y,Qi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new xt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(nn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Ws.setFromBufferAttribute(a),this.morphTargetsRelative?(Dt.addVectors(nn.min,Ws.min),nn.expandByPoint(Dt),Dt.addVectors(nn.max,Ws.max),nn.expandByPoint(Dt)):(nn.expandByPoint(Ws.min),nn.expandByPoint(Ws.max))}nn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Dt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Dt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Dt.fromBufferAttribute(a,l),c&&(Qi.fromBufferAttribute(e,l),Dt.add(Qi)),s=Math.max(s,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Qt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let C=0;C<n.count;C++)a[C]=new D,c[C]=new D;const l=new D,h=new D,u=new D,f=new ke,m=new ke,g=new ke,v=new D,p=new D;function d(C,S,x){l.fromBufferAttribute(n,C),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,x),f.fromBufferAttribute(r,C),m.fromBufferAttribute(r,S),g.fromBufferAttribute(r,x),h.sub(l),u.sub(l),m.sub(f),g.sub(f);const P=1/(m.x*g.y-g.x*m.y);isFinite(P)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-m.y).multiplyScalar(P),p.copy(u).multiplyScalar(m.x).addScaledVector(h,-g.x).multiplyScalar(P),a[C].add(v),a[S].add(v),a[x].add(v),c[C].add(p),c[S].add(p),c[x].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let C=0,S=b.length;C<S;++C){const x=b[C],P=x.start,B=x.count;for(let I=P,O=P+B;I<O;I+=3)d(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const E=new D,_=new D,R=new D,T=new D;function A(C){R.fromBufferAttribute(s,C),T.copy(R);const S=a[C];E.copy(S),E.sub(R.multiplyScalar(R.dot(S))).normalize(),_.crossVectors(T,S);const P=_.dot(c[C])<0?-1:1;o.setXYZW(C,E.x,E.y,E.z,P)}for(let C=0,S=b.length;C<S;++C){const x=b[C],P=x.start,B=x.count;for(let I=P,O=P+B;I<O;I+=3)A(e.getX(I+0)),A(e.getX(I+1)),A(e.getX(I+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Qt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,m=n.count;f<m;f++)n.setXYZ(f,0,0,0);const s=new D,r=new D,o=new D,a=new D,c=new D,l=new D,h=new D,u=new D;if(e)for(let f=0,m=e.count;f<m;f+=3){const g=e.getX(f+0),v=e.getX(f+1),p=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,p),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,p),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(p,l.x,l.y,l.z)}else for(let f=0,m=t.count;f<m;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(a,c){const l=a.array,h=a.itemSize,u=a.normalized,f=new l.constructor(c.length*h);let m=0,g=0;for(let v=0,p=c.length;v<p;v++){a.isInterleavedBufferAttribute?m=c[v]*a.data.stride+a.offset:m=c[v]*h;for(let d=0;d<h;d++)f[g++]=l[m++]}return new Qt(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ot,n=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=e(c,n);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){const f=l[h],m=e(f,n);c.push(m)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const m=l[u];h.push(m.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let f=0,m=u.length;f<m;f++)h.push(u[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,h=o.length;l<h;l++){const u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const kl=new nt,yi=new mu,Nr=new Fs,Bl=new D,Fr=new D,Or=new D,kr=new D,ha=new D,Br=new D,zl=new D,zr=new D;class _e extends Ct{constructor(e=new Ot,t=new wn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Br.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],u=r[c];h!==0&&(ha.fromBufferAttribute(u,e),o?Br.addScaledVector(ha,h):Br.addScaledVector(ha.sub(t),h))}t.add(Br)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Nr.copy(n.boundingSphere),Nr.applyMatrix4(r),yi.copy(e.ray).recast(e.near),!(Nr.containsPoint(yi.origin)===!1&&(yi.intersectSphere(Nr,Bl)===null||yi.origin.distanceToSquared(Bl)>(e.far-e.near)**2))&&(kl.copy(r).invert(),yi.copy(e.ray).applyMatrix4(kl),!(n.boundingBox!==null&&yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,yi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=o[p.materialIndex],b=Math.max(p.start,m.start),E=Math.min(a.count,Math.min(p.start+p.count,m.start+m.count));for(let _=b,R=E;_<R;_+=3){const T=a.getX(_),A=a.getX(_+1),C=a.getX(_+2);s=Hr(this,d,e,n,l,h,u,T,A,C),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(a.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const b=a.getX(p),E=a.getX(p+1),_=a.getX(p+2);s=Hr(this,o,e,n,l,h,u,b,E,_),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=o[p.materialIndex],b=Math.max(p.start,m.start),E=Math.min(c.count,Math.min(p.start+p.count,m.start+m.count));for(let _=b,R=E;_<R;_+=3){const T=_,A=_+1,C=_+2;s=Hr(this,d,e,n,l,h,u,T,A,C),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(c.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const b=p,E=p+1,_=p+2;s=Hr(this,o,e,n,l,h,u,b,E,_),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}}function Xf(i,e,t,n,s,r,o,a){let c;if(e.side===Jt?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===pi,a),c===null)return null;zr.copy(a),zr.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(zr);return l<t.near||l>t.far?null:{distance:l,point:zr.clone(),object:i}}function Hr(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,Fr),i.getVertexPosition(c,Or),i.getVertexPosition(l,kr);const h=Xf(i,e,t,n,Fr,Or,kr,zl);if(h){const u=new D;pn.getBarycoord(zl,Fr,Or,kr,u),s&&(h.uv=pn.getInterpolatedAttribute(s,a,c,l,u,new ke)),r&&(h.uv1=pn.getInterpolatedAttribute(r,a,c,l,u,new ke)),o&&(h.normal=pn.getInterpolatedAttribute(o,a,c,l,u,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new D,materialIndex:0};pn.getNormal(Fr,Or,kr,f.normal),h.face=f,h.barycoord=u}return h}class Ut extends Ot{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],u=[];let f=0,m=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new xt(l,3)),this.setAttribute("normal",new xt(h,3)),this.setAttribute("uv",new xt(u,2));function g(v,p,d,b,E,_,R,T,A,C,S){const x=_/A,P=R/C,B=_/2,I=R/2,O=T/2,V=A+1,X=C+1;let K=0,G=0;const te=new D;for(let ce=0;ce<X;ce++){const Ee=ce*P-I;for(let Ge=0;Ge<V;Ge++){const dt=Ge*x-B;te[v]=dt*b,te[p]=Ee*E,te[d]=O,l.push(te.x,te.y,te.z),te[v]=0,te[p]=0,te[d]=T>0?1:-1,h.push(te.x,te.y,te.z),u.push(Ge/A),u.push(1-ce/C),K+=1}}for(let ce=0;ce<C;ce++)for(let Ee=0;Ee<A;Ee++){const Ge=f+Ee+V*ce,dt=f+Ee+V*(ce+1),Y=f+(Ee+1)+V*(ce+1),ne=f+(Ee+1)+V*ce;c.push(Ge,dt,ne),c.push(dt,Y,ne),G+=6}a.addGroup(m,G,S),m+=G,f+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ut(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ds(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function jt(i){const e={};for(let t=0;t<i.length;t++){const n=Ds(i[t]);for(const s in n)e[s]=n[s]}return e}function qf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function yu(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:st.workingColorSpace}const Yf={clone:Ds,merge:jt};var $f=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class mi extends Hi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=$f,this.fragmentShader=jf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ds(e.uniforms),this.uniformsGroups=qf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Mu extends Ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nt,this.projectionMatrix=new nt,this.projectionMatrixInverse=new nt,this.coordinateSystem=$n}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ii=new D,Hl=new ke,Vl=new ke;class sn extends Mu{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=xr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(lr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xr*2*Math.atan(Math.tan(lr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ii.x,ii.y).multiplyScalar(-e/ii.z),ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ii.x,ii.y).multiplyScalar(-e/ii.z)}getViewSize(e,t){return this.getViewBounds(e,Hl,Vl),t.subVectors(Vl,Hl)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(lr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const es=-90,ts=1;class Kf extends Ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new sn(es,ts,e,t);s.layers=this.layers,this.add(s);const r=new sn(es,ts,e,t);r.layers=this.layers,this.add(r);const o=new sn(es,ts,e,t);o.layers=this.layers,this.add(o);const a=new sn(es,ts,e,t);a.layers=this.layers,this.add(a);const c=new sn(es,ts,e,t);c.layers=this.layers,this.add(c);const l=new sn(es,ts,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===$n)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===So)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Su extends qt{constructor(e,t,n,s,r,o,a,c,l,h){e=e!==void 0?e:[],t=t!==void 0?t:Rs,super(e,t,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Zf extends Bi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Su(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Dn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ut(5,5,5),r=new mi({name:"CubemapFromEquirect",uniforms:Ds(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:hi});r.uniforms.tEquirect.value=t;const o=new _e(s,r),a=t.minFilter;return t.minFilter===Ui&&(t.minFilter=Dn),new Kf(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}class qc{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ce(e),this.near=t,this.far=n}clone(){return new qc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Jf extends Ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Fn,this.environmentIntensity=1,this.environmentRotation=new Fn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Qf{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Mc,this.updateRanges=[],this.version=0,this.uuid=jn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const $t=new D;class bo{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=bn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=lt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=bn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=bn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=bn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=bn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),s=lt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),s=lt(s,this.array),r=lt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Qt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new bo(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Eu extends Hi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ns;const Xs=new D,is=new D,ss=new D,rs=new ke,qs=new ke,bu=new nt,Vr=new D,Ys=new D,Gr=new D,Gl=new ke,ua=new ke,Wl=new ke;class ep extends Ct{constructor(e=new Eu){if(super(),this.isSprite=!0,this.type="Sprite",ns===void 0){ns=new Ot;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Qf(t,5);ns.setIndex([0,1,2,0,2,3]),ns.setAttribute("position",new bo(n,3,0,!1)),ns.setAttribute("uv",new bo(n,2,3,!1))}this.geometry=ns,this.material=e,this.center=new ke(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),is.setFromMatrixScale(this.matrixWorld),bu.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ss.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&is.multiplyScalar(-ss.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;Wr(Vr.set(-.5,-.5,0),ss,o,is,s,r),Wr(Ys.set(.5,-.5,0),ss,o,is,s,r),Wr(Gr.set(.5,.5,0),ss,o,is,s,r),Gl.set(0,0),ua.set(1,0),Wl.set(1,1);let a=e.ray.intersectTriangle(Vr,Ys,Gr,!1,Xs);if(a===null&&(Wr(Ys.set(-.5,.5,0),ss,o,is,s,r),ua.set(0,1),a=e.ray.intersectTriangle(Vr,Gr,Ys,!1,Xs),a===null))return;const c=e.ray.origin.distanceTo(Xs);c<e.near||c>e.far||t.push({distance:c,point:Xs.clone(),uv:pn.getInterpolation(Xs,Vr,Ys,Gr,Gl,ua,Wl,new ke),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Wr(i,e,t,n,s,r){rs.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(qs.x=r*rs.x-s*rs.y,qs.y=s*rs.x+r*rs.y):qs.copy(rs),i.copy(e),i.x+=qs.x,i.y+=qs.y,i.applyMatrix4(bu)}class tp extends qt{constructor(e=null,t=1,n=1,s,r,o,a,c,l=an,h=an,u,f){super(null,o,a,c,l,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Xl extends Qt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const os=new nt,ql=new nt,Xr=[],Yl=new zi,np=new nt,$s=new _e,js=new Fs;class Rn extends _e{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Xl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,np)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new zi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,os),Yl.copy(e.boundingBox).applyMatrix4(os),this.boundingBox.union(Yl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Fs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,os),js.copy(e.boundingSphere).applyMatrix4(os),this.boundingSphere.union(js)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if($s.geometry=this.geometry,$s.material=this.material,$s.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),js.copy(this.boundingSphere),js.applyMatrix4(n),e.ray.intersectsSphere(js)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,os),ql.multiplyMatrices(n,os),$s.matrixWorld=ql,$s.raycast(e,Xr);for(let o=0,a=Xr.length;o<a;o++){const c=Xr[o];c.instanceId=r,c.object=this,t.push(c)}Xr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Xl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new tp(new Float32Array(s*this.count),s,this.count,Hc,Un));const r=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}const da=new D,ip=new D,sp=new ze;class wi{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=da.subVectors(n,t).cross(ip.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(da),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||sp.getNormalMatrix(e),s=this.coplanarPoint(da).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Mi=new Fs,qr=new D;class Yc{constructor(e=new wi,t=new wi,n=new wi,s=new wi,r=new wi,o=new wi){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=$n){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],h=s[5],u=s[6],f=s[7],m=s[8],g=s[9],v=s[10],p=s[11],d=s[12],b=s[13],E=s[14],_=s[15];if(n[0].setComponents(c-r,f-l,p-m,_-d).normalize(),n[1].setComponents(c+r,f+l,p+m,_+d).normalize(),n[2].setComponents(c+o,f+h,p+g,_+b).normalize(),n[3].setComponents(c-o,f-h,p-g,_-b).normalize(),n[4].setComponents(c-a,f-u,p-v,_-E).normalize(),t===$n)n[5].setComponents(c+a,f+u,p+v,_+E).normalize();else if(t===So)n[5].setComponents(a,u,v,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Mi)}intersectsSprite(e){return Mi.center.set(0,0,0),Mi.radius=.7071067811865476,Mi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Mi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(qr.x=s.normal.x>0?e.max.x:e.min.x,qr.y=s.normal.y>0?e.max.y:e.min.y,qr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(qr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class $c extends Hi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const wo=new D,To=new D,$l=new nt,Ks=new mu,Yr=new Fs,fa=new D,jl=new D;class wu extends Ct{constructor(e=new Ot,t=new $c){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)wo.fromBufferAttribute(t,s-1),To.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=wo.distanceTo(To);e.setAttribute("lineDistance",new xt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Yr.copy(n.boundingSphere),Yr.applyMatrix4(s),Yr.radius+=r,e.ray.intersectsSphere(Yr)===!1)return;$l.copy(s).invert(),Ks.copy(e.ray).applyMatrix4($l);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const m=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=m,p=g-1;v<p;v+=l){const d=h.getX(v),b=h.getX(v+1),E=$r(this,e,Ks,c,d,b);E&&t.push(E)}if(this.isLineLoop){const v=h.getX(g-1),p=h.getX(m),d=$r(this,e,Ks,c,v,p);d&&t.push(d)}}else{const m=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let v=m,p=g-1;v<p;v+=l){const d=$r(this,e,Ks,c,v,v+1);d&&t.push(d)}if(this.isLineLoop){const v=$r(this,e,Ks,c,g-1,m);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function $r(i,e,t,n,s,r){const o=i.geometry.attributes.position;if(wo.fromBufferAttribute(o,s),To.fromBufferAttribute(o,r),t.distanceSqToSegment(wo,To,fa,jl)>n)return;fa.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(fa);if(!(c<e.near||c>e.far))return{distance:c,point:jl.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}class Bt extends Ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}class rp extends qt{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Tu extends qt{constructor(e,t,n,s,r,o,a,c,l,h=xs){if(h!==xs&&h!==Ls)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===xs&&(n=ki),n===void 0&&h===Ls&&(n=Ps),super(null,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:an,this.minFilter=c!==void 0?c:an,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class At extends Ot{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],f=[],m=[];let g=0;const v=[],p=n/2;let d=0;b(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new xt(u,3)),this.setAttribute("normal",new xt(f,3)),this.setAttribute("uv",new xt(m,2));function b(){const _=new D,R=new D;let T=0;const A=(t-e)/n;for(let C=0;C<=r;C++){const S=[],x=C/r,P=x*(t-e)+e;for(let B=0;B<=s;B++){const I=B/s,O=I*c+a,V=Math.sin(O),X=Math.cos(O);R.x=P*V,R.y=-x*n+p,R.z=P*X,u.push(R.x,R.y,R.z),_.set(V,A,X).normalize(),f.push(_.x,_.y,_.z),m.push(I,1-x),S.push(g++)}v.push(S)}for(let C=0;C<s;C++)for(let S=0;S<r;S++){const x=v[S][C],P=v[S+1][C],B=v[S+1][C+1],I=v[S][C+1];(e>0||S!==0)&&(h.push(x,P,I),T+=3),(t>0||S!==r-1)&&(h.push(P,B,I),T+=3)}l.addGroup(d,T,0),d+=T}function E(_){const R=g,T=new ke,A=new D;let C=0;const S=_===!0?e:t,x=_===!0?1:-1;for(let B=1;B<=s;B++)u.push(0,p*x,0),f.push(0,x,0),m.push(.5,.5),g++;const P=g;for(let B=0;B<=s;B++){const O=B/s*c+a,V=Math.cos(O),X=Math.sin(O);A.x=S*X,A.y=p*x,A.z=S*V,u.push(A.x,A.y,A.z),f.push(0,x,0),T.x=V*.5+.5,T.y=X*.5*x+.5,m.push(T.x,T.y),g++}for(let B=0;B<s;B++){const I=R+B,O=P+B;_===!0?h.push(O,O+1,I):h.push(O+1,O,I),C+=3}l.addGroup(d,C,_===!0?1:2),d+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new At(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Yn extends At{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Yn(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class No extends Ot{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],o=[];a(s),l(n),h(),this.setAttribute("position",new xt(r,3)),this.setAttribute("normal",new xt(r.slice(),3)),this.setAttribute("uv",new xt(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){const E=new D,_=new D,R=new D;for(let T=0;T<t.length;T+=3)m(t[T+0],E),m(t[T+1],_),m(t[T+2],R),c(E,_,R,b)}function c(b,E,_,R){const T=R+1,A=[];for(let C=0;C<=T;C++){A[C]=[];const S=b.clone().lerp(_,C/T),x=E.clone().lerp(_,C/T),P=T-C;for(let B=0;B<=P;B++)B===0&&C===T?A[C][B]=S:A[C][B]=S.clone().lerp(x,B/P)}for(let C=0;C<T;C++)for(let S=0;S<2*(T-C)-1;S++){const x=Math.floor(S/2);S%2===0?(f(A[C][x+1]),f(A[C+1][x]),f(A[C][x])):(f(A[C][x+1]),f(A[C+1][x+1]),f(A[C+1][x]))}}function l(b){const E=new D;for(let _=0;_<r.length;_+=3)E.x=r[_+0],E.y=r[_+1],E.z=r[_+2],E.normalize().multiplyScalar(b),r[_+0]=E.x,r[_+1]=E.y,r[_+2]=E.z}function h(){const b=new D;for(let E=0;E<r.length;E+=3){b.x=r[E+0],b.y=r[E+1],b.z=r[E+2];const _=p(b)/2/Math.PI+.5,R=d(b)/Math.PI+.5;o.push(_,1-R)}g(),u()}function u(){for(let b=0;b<o.length;b+=6){const E=o[b+0],_=o[b+2],R=o[b+4],T=Math.max(E,_,R),A=Math.min(E,_,R);T>.9&&A<.1&&(E<.2&&(o[b+0]+=1),_<.2&&(o[b+2]+=1),R<.2&&(o[b+4]+=1))}}function f(b){r.push(b.x,b.y,b.z)}function m(b,E){const _=b*3;E.x=e[_+0],E.y=e[_+1],E.z=e[_+2]}function g(){const b=new D,E=new D,_=new D,R=new D,T=new ke,A=new ke,C=new ke;for(let S=0,x=0;S<r.length;S+=9,x+=6){b.set(r[S+0],r[S+1],r[S+2]),E.set(r[S+3],r[S+4],r[S+5]),_.set(r[S+6],r[S+7],r[S+8]),T.set(o[x+0],o[x+1]),A.set(o[x+2],o[x+3]),C.set(o[x+4],o[x+5]),R.copy(b).add(E).add(_).divideScalar(3);const P=p(R);v(T,x+0,b,P),v(A,x+2,E,P),v(C,x+4,_,P)}}function v(b,E,_,R){R<0&&b.x===1&&(o[E]=b.x-1),_.x===0&&_.z===0&&(o[E]=R/2/Math.PI+.5)}function p(b){return Math.atan2(b.z,-b.x)}function d(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new No(e.vertices,e.indices,e.radius,e.details)}}class Ao extends No{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ao(e.radius,e.detail)}}class fs extends No{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new fs(e.radius,e.detail)}}class Ni extends Ot{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,u=e/a,f=t/c,m=[],g=[],v=[],p=[];for(let d=0;d<h;d++){const b=d*f-o;for(let E=0;E<l;E++){const _=E*u-r;g.push(_,-b,0),v.push(0,0,1),p.push(E/a),p.push(1-d/c)}}for(let d=0;d<c;d++)for(let b=0;b<a;b++){const E=b+l*d,_=b+l*(d+1),R=b+1+l*(d+1),T=b+1+l*d;m.push(E,_,T),m.push(_,R,T)}this.setIndex(m),this.setAttribute("position",new xt(g,3)),this.setAttribute("normal",new xt(v,3)),this.setAttribute("uv",new xt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ni(e.width,e.height,e.widthSegments,e.heightSegments)}}class Fo extends Ot{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],c=[],l=[],h=[];let u=e;const f=(t-e)/s,m=new D,g=new ke;for(let v=0;v<=s;v++){for(let p=0;p<=n;p++){const d=r+p/n*o;m.x=u*Math.cos(d),m.y=u*Math.sin(d),c.push(m.x,m.y,m.z),l.push(0,0,1),g.x=(m.x/t+1)/2,g.y=(m.y/t+1)/2,h.push(g.x,g.y)}u+=f}for(let v=0;v<s;v++){const p=v*(n+1);for(let d=0;d<n;d++){const b=d+p,E=b,_=b+n+1,R=b+n+2,T=b+1;a.push(E,_,T),a.push(_,R,T)}}this.setIndex(a),this.setAttribute("position",new xt(c,3)),this.setAttribute("normal",new xt(l,3)),this.setAttribute("uv",new xt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fo(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Ln extends Ot{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const h=[],u=new D,f=new D,m=[],g=[],v=[],p=[];for(let d=0;d<=n;d++){const b=[],E=d/n;let _=0;d===0&&o===0?_=.5/t:d===n&&c===Math.PI&&(_=-.5/t);for(let R=0;R<=t;R++){const T=R/t;u.x=-e*Math.cos(s+T*r)*Math.sin(o+E*a),u.y=e*Math.cos(o+E*a),u.z=e*Math.sin(s+T*r)*Math.sin(o+E*a),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),p.push(T+_,1-E),b.push(l++)}h.push(b)}for(let d=0;d<n;d++)for(let b=0;b<t;b++){const E=h[d][b+1],_=h[d][b],R=h[d+1][b],T=h[d+1][b+1];(d!==0||o>0)&&m.push(E,_,T),(d!==n-1||c<Math.PI)&&m.push(_,R,T)}this.setIndex(m),this.setAttribute("position",new xt(g,3)),this.setAttribute("normal",new xt(v,3)),this.setAttribute("uv",new xt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ln(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Oo extends Ot{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const o=[],a=[],c=[],l=[],h=new D,u=new D,f=new D;for(let m=0;m<=n;m++)for(let g=0;g<=s;g++){const v=g/s*r,p=m/n*Math.PI*2;u.x=(e+t*Math.cos(p))*Math.cos(v),u.y=(e+t*Math.cos(p))*Math.sin(v),u.z=t*Math.sin(p),a.push(u.x,u.y,u.z),h.x=e*Math.cos(v),h.y=e*Math.sin(v),f.subVectors(u,h).normalize(),c.push(f.x,f.y,f.z),l.push(g/s),l.push(m/n)}for(let m=1;m<=n;m++)for(let g=1;g<=s;g++){const v=(s+1)*m+g-1,p=(s+1)*(m-1)+g-1,d=(s+1)*(m-1)+g,b=(s+1)*m+g;o.push(v,p,b),o.push(p,d,b)}this.setIndex(o),this.setAttribute("position",new xt(a,3)),this.setAttribute("normal",new xt(c,3)),this.setAttribute("uv",new xt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Oo(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class qe extends Hi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=hu,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Fn,this.combine=Oc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class op extends Hi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Qd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class ap extends Hi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class jc extends Ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class cp extends jc{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const pa=new nt,Kl=new D,Zl=new D;class Au{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.map=null,this.mapPass=null,this.matrix=new nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Yc,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new ut(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Kl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Kl),Zl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Zl),t.updateMatrixWorld(),pa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(pa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(pa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Jl=new nt,Zs=new D,ma=new D;class lp extends Au{constructor(){super(new sn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ke(4,2),this._viewportCount=6,this._viewports=[new ut(2,1,1,1),new ut(0,1,1,1),new ut(3,1,1,1),new ut(1,1,1,1),new ut(3,0,1,1),new ut(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Zs.setFromMatrixPosition(e.matrixWorld),n.position.copy(Zs),ma.copy(n.position),ma.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ma),n.updateMatrixWorld(),s.makeTranslation(-Zs.x,-Zs.y,-Zs.z),Jl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Jl)}}class Ql extends jc{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new lp}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Ru extends Mu{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class hp extends Au{constructor(){super(new Ru(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class up extends jc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ct.DEFAULT_UP),this.updateMatrix(),this.target=new Ct,this.shadow=new hp}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class dp extends sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}function eh(i,e,t,n){const s=fp(n);switch(t){case su:return i*e;case ou:return i*e;case au:return i*e*2;case Hc:return i*e/s.components*s.byteLength;case Vc:return i*e/s.components*s.byteLength;case cu:return i*e*2/s.components*s.byteLength;case Gc:return i*e*2/s.components*s.byteLength;case ru:return i*e*3/s.components*s.byteLength;case An:return i*e*4/s.components*s.byteLength;case Wc:return i*e*4/s.components*s.byteLength;case so:case ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case oo:case ao:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ka:case Ja:return Math.max(i,16)*Math.max(e,8)/4;case ja:case Za:return Math.max(i,8)*Math.max(e,8)/2;case Qa:case ec:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case tc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case nc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ic:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case sc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case rc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case oc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ac:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case cc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case lc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case hc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case uc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case dc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case fc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case pc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case mc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case co:case gc:case _c:return Math.ceil(i/4)*Math.ceil(e/4)*16;case lu:case vc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case xc:case yc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function fp(i){switch(i){case Zn:case tu:return{byteLength:1,components:1};case vr:case nu:case yr:return{byteLength:2,components:1};case Bc:case zc:return{byteLength:2,components:4};case ki:case kc:case Un:return{byteLength:4,components:1};case iu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Fc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Fc);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Cu(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function pp(i){const e=new WeakMap;function t(a,c){const l=a.array,h=a.usage,u=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,h),a.onUploadCallback();let m;if(l instanceof Float32Array)m=i.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)m=i.SHORT;else if(l instanceof Uint32Array)m=i.UNSIGNED_INT;else if(l instanceof Int32Array)m=i.INT;else if(l instanceof Int8Array)m=i.BYTE;else if(l instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:m,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){const h=c.array,u=c.updateRanges;if(i.bindBuffer(l,a),u.length===0)i.bufferSubData(l,0,h);else{u.sort((m,g)=>m.start-g.start);let f=0;for(let m=1;m<u.length;m++){const g=u[f],v=u[m];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let m=0,g=u.length;m<g;m++){const v=u[m];i.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var mp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,gp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,_p=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,xp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,yp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Mp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Sp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ep=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,bp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,wp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Tp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ap=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Rp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Cp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Dp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Np=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Fp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Op=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,kp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Bp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,zp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Hp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Vp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Xp="gl_FragColor = linearToOutputTexel( gl_FragColor );",qp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Yp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,jp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,em=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,im=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,sm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,om=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,am=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,cm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,um=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,fm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,pm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,mm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,gm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,_m=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ym=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Mm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Em=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,bm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Tm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Am=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Lm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Im=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Dm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Um=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Om=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,km=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Wm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Xm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ym=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,$m=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,jm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Km=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Jm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Qm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,e0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,t0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,n0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,i0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,s0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,r0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,o0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,a0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,c0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,l0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,h0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,f0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const p0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,m0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,v0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,x0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,M0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,S0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,E0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,b0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,w0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,T0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,A0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,R0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,C0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,P0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,L0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,D0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,N0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,F0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,O0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,B0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,z0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,G0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,W0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,q0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Y0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ve={alphahash_fragment:mp,alphahash_pars_fragment:gp,alphamap_fragment:_p,alphamap_pars_fragment:vp,alphatest_fragment:xp,alphatest_pars_fragment:yp,aomap_fragment:Mp,aomap_pars_fragment:Sp,batching_pars_vertex:Ep,batching_vertex:bp,begin_vertex:wp,beginnormal_vertex:Tp,bsdfs:Ap,iridescence_fragment:Rp,bumpmap_pars_fragment:Cp,clipping_planes_fragment:Pp,clipping_planes_pars_fragment:Lp,clipping_planes_pars_vertex:Ip,clipping_planes_vertex:Dp,color_fragment:Up,color_pars_fragment:Np,color_pars_vertex:Fp,color_vertex:Op,common:kp,cube_uv_reflection_fragment:Bp,defaultnormal_vertex:zp,displacementmap_pars_vertex:Hp,displacementmap_vertex:Vp,emissivemap_fragment:Gp,emissivemap_pars_fragment:Wp,colorspace_fragment:Xp,colorspace_pars_fragment:qp,envmap_fragment:Yp,envmap_common_pars_fragment:$p,envmap_pars_fragment:jp,envmap_pars_vertex:Kp,envmap_physical_pars_fragment:am,envmap_vertex:Zp,fog_vertex:Jp,fog_pars_vertex:Qp,fog_fragment:em,fog_pars_fragment:tm,gradientmap_pars_fragment:nm,lightmap_pars_fragment:im,lights_lambert_fragment:sm,lights_lambert_pars_fragment:rm,lights_pars_begin:om,lights_toon_fragment:cm,lights_toon_pars_fragment:lm,lights_phong_fragment:hm,lights_phong_pars_fragment:um,lights_physical_fragment:dm,lights_physical_pars_fragment:fm,lights_fragment_begin:pm,lights_fragment_maps:mm,lights_fragment_end:gm,logdepthbuf_fragment:_m,logdepthbuf_pars_fragment:vm,logdepthbuf_pars_vertex:xm,logdepthbuf_vertex:ym,map_fragment:Mm,map_pars_fragment:Sm,map_particle_fragment:Em,map_particle_pars_fragment:bm,metalnessmap_fragment:wm,metalnessmap_pars_fragment:Tm,morphinstance_vertex:Am,morphcolor_vertex:Rm,morphnormal_vertex:Cm,morphtarget_pars_vertex:Pm,morphtarget_vertex:Lm,normal_fragment_begin:Im,normal_fragment_maps:Dm,normal_pars_fragment:Um,normal_pars_vertex:Nm,normal_vertex:Fm,normalmap_pars_fragment:Om,clearcoat_normal_fragment_begin:km,clearcoat_normal_fragment_maps:Bm,clearcoat_pars_fragment:zm,iridescence_pars_fragment:Hm,opaque_fragment:Vm,packing:Gm,premultiplied_alpha_fragment:Wm,project_vertex:Xm,dithering_fragment:qm,dithering_pars_fragment:Ym,roughnessmap_fragment:$m,roughnessmap_pars_fragment:jm,shadowmap_pars_fragment:Km,shadowmap_pars_vertex:Zm,shadowmap_vertex:Jm,shadowmask_pars_fragment:Qm,skinbase_vertex:e0,skinning_pars_vertex:t0,skinning_vertex:n0,skinnormal_vertex:i0,specularmap_fragment:s0,specularmap_pars_fragment:r0,tonemapping_fragment:o0,tonemapping_pars_fragment:a0,transmission_fragment:c0,transmission_pars_fragment:l0,uv_pars_fragment:h0,uv_pars_vertex:u0,uv_vertex:d0,worldpos_vertex:f0,background_vert:p0,background_frag:m0,backgroundCube_vert:g0,backgroundCube_frag:_0,cube_vert:v0,cube_frag:x0,depth_vert:y0,depth_frag:M0,distanceRGBA_vert:S0,distanceRGBA_frag:E0,equirect_vert:b0,equirect_frag:w0,linedashed_vert:T0,linedashed_frag:A0,meshbasic_vert:R0,meshbasic_frag:C0,meshlambert_vert:P0,meshlambert_frag:L0,meshmatcap_vert:I0,meshmatcap_frag:D0,meshnormal_vert:U0,meshnormal_frag:N0,meshphong_vert:F0,meshphong_frag:O0,meshphysical_vert:k0,meshphysical_frag:B0,meshtoon_vert:z0,meshtoon_frag:H0,points_vert:V0,points_frag:G0,shadow_vert:W0,shadow_frag:X0,sprite_vert:q0,sprite_frag:Y0},ie={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},In={basic:{uniforms:jt([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:jt([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:jt([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:jt([ie.common,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.roughnessmap,ie.metalnessmap,ie.fog,ie.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:jt([ie.common,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.gradientmap,ie.fog,ie.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:jt([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:jt([ie.points,ie.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:jt([ie.common,ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:jt([ie.common,ie.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:jt([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:jt([ie.sprite,ie.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Ve.backgroundCube_vert,fragmentShader:Ve.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:jt([ie.common,ie.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:jt([ie.lights,ie.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};In.physical={uniforms:jt([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};const jr={r:0,b:0,g:0},Si=new Fn,$0=new nt;function j0(i,e,t,n,s,r,o){const a=new Ce(0);let c=r===!0?0:1,l,h,u=null,f=0,m=null;function g(E){let _=E.isScene===!0?E.background:null;return _&&_.isTexture&&(_=(E.backgroundBlurriness>0?t:e).get(_)),_}function v(E){let _=!1;const R=g(E);R===null?d(a,c):R&&R.isColor&&(d(R,1),_=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||_)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(E,_){const R=g(_);R&&(R.isCubeTexture||R.mapping===Uo)?(h===void 0&&(h=new _e(new Ut(1,1,1),new mi({name:"BackgroundCubeMaterial",uniforms:Ds(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(T,A,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Si.copy(_.backgroundRotation),Si.x*=-1,Si.y*=-1,Si.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(Si.y*=-1,Si.z*=-1),h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4($0.makeRotationFromEuler(Si)),h.material.toneMapped=st.getTransfer(R.colorSpace)!==ht,(u!==R||f!==R.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,u=R,f=R.version,m=i.toneMapping),h.layers.enableAll(),E.unshift(h,h.geometry,h.material,0,0,null)):R&&R.isTexture&&(l===void 0&&(l=new _e(new Ni(2,2),new mi({name:"BackgroundMaterial",uniforms:Ds(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=R,l.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,l.material.toneMapped=st.getTransfer(R.colorSpace)!==ht,R.matrixAutoUpdate===!0&&R.updateMatrix(),l.material.uniforms.uvTransform.value.copy(R.matrix),(u!==R||f!==R.version||m!==i.toneMapping)&&(l.material.needsUpdate=!0,u=R,f=R.version,m=i.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function d(E,_){E.getRGB(jr,yu(i)),n.buffers.color.setClear(jr.r,jr.g,jr.b,_,o)}function b(){h!==void 0&&(h.geometry.dispose(),h.material.dispose()),l!==void 0&&(l.geometry.dispose(),l.material.dispose())}return{getClearColor:function(){return a},setClearColor:function(E,_=1){a.set(E),c=_,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(E){c=E,d(a,c)},render:v,addToRenderList:p,dispose:b}}function K0(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,o=!1;function a(x,P,B,I,O){let V=!1;const X=u(I,B,P);r!==X&&(r=X,l(r.object)),V=m(x,I,B,O),V&&g(x,I,B,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(V||o)&&(o=!1,_(x,P,B,I),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function c(){return i.createVertexArray()}function l(x){return i.bindVertexArray(x)}function h(x){return i.deleteVertexArray(x)}function u(x,P,B){const I=B.wireframe===!0;let O=n[x.id];O===void 0&&(O={},n[x.id]=O);let V=O[P.id];V===void 0&&(V={},O[P.id]=V);let X=V[I];return X===void 0&&(X=f(c()),V[I]=X),X}function f(x){const P=[],B=[],I=[];for(let O=0;O<t;O++)P[O]=0,B[O]=0,I[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:B,attributeDivisors:I,object:x,attributes:{},index:null}}function m(x,P,B,I){const O=r.attributes,V=P.attributes;let X=0;const K=B.getAttributes();for(const G in K)if(K[G].location>=0){const ce=O[G];let Ee=V[G];if(Ee===void 0&&(G==="instanceMatrix"&&x.instanceMatrix&&(Ee=x.instanceMatrix),G==="instanceColor"&&x.instanceColor&&(Ee=x.instanceColor)),ce===void 0||ce.attribute!==Ee||Ee&&ce.data!==Ee.data)return!0;X++}return r.attributesNum!==X||r.index!==I}function g(x,P,B,I){const O={},V=P.attributes;let X=0;const K=B.getAttributes();for(const G in K)if(K[G].location>=0){let ce=V[G];ce===void 0&&(G==="instanceMatrix"&&x.instanceMatrix&&(ce=x.instanceMatrix),G==="instanceColor"&&x.instanceColor&&(ce=x.instanceColor));const Ee={};Ee.attribute=ce,ce&&ce.data&&(Ee.data=ce.data),O[G]=Ee,X++}r.attributes=O,r.attributesNum=X,r.index=I}function v(){const x=r.newAttributes;for(let P=0,B=x.length;P<B;P++)x[P]=0}function p(x){d(x,0)}function d(x,P){const B=r.newAttributes,I=r.enabledAttributes,O=r.attributeDivisors;B[x]=1,I[x]===0&&(i.enableVertexAttribArray(x),I[x]=1),O[x]!==P&&(i.vertexAttribDivisor(x,P),O[x]=P)}function b(){const x=r.newAttributes,P=r.enabledAttributes;for(let B=0,I=P.length;B<I;B++)P[B]!==x[B]&&(i.disableVertexAttribArray(B),P[B]=0)}function E(x,P,B,I,O,V,X){X===!0?i.vertexAttribIPointer(x,P,B,O,V):i.vertexAttribPointer(x,P,B,I,O,V)}function _(x,P,B,I){v();const O=I.attributes,V=B.getAttributes(),X=P.defaultAttributeValues;for(const K in V){const G=V[K];if(G.location>=0){let te=O[K];if(te===void 0&&(K==="instanceMatrix"&&x.instanceMatrix&&(te=x.instanceMatrix),K==="instanceColor"&&x.instanceColor&&(te=x.instanceColor)),te!==void 0){const ce=te.normalized,Ee=te.itemSize,Ge=e.get(te);if(Ge===void 0)continue;const dt=Ge.buffer,Y=Ge.type,ne=Ge.bytesPerElement,xe=Y===i.INT||Y===i.UNSIGNED_INT||te.gpuType===kc;if(te.isInterleavedBufferAttribute){const oe=te.data,Re=oe.stride,Fe=te.offset;if(oe.isInstancedInterleavedBuffer){for(let We=0;We<G.locationSize;We++)d(G.location+We,oe.meshPerAttribute);x.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let We=0;We<G.locationSize;We++)p(G.location+We);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let We=0;We<G.locationSize;We++)E(G.location+We,Ee/G.locationSize,Y,ce,Re*ne,(Fe+Ee/G.locationSize*We)*ne,xe)}else{if(te.isInstancedBufferAttribute){for(let oe=0;oe<G.locationSize;oe++)d(G.location+oe,te.meshPerAttribute);x.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let oe=0;oe<G.locationSize;oe++)p(G.location+oe);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let oe=0;oe<G.locationSize;oe++)E(G.location+oe,Ee/G.locationSize,Y,ce,Ee*ne,Ee/G.locationSize*oe*ne,xe)}}else if(X!==void 0){const ce=X[K];if(ce!==void 0)switch(ce.length){case 2:i.vertexAttrib2fv(G.location,ce);break;case 3:i.vertexAttrib3fv(G.location,ce);break;case 4:i.vertexAttrib4fv(G.location,ce);break;default:i.vertexAttrib1fv(G.location,ce)}}}}b()}function R(){C();for(const x in n){const P=n[x];for(const B in P){const I=P[B];for(const O in I)h(I[O].object),delete I[O];delete P[B]}delete n[x]}}function T(x){if(n[x.id]===void 0)return;const P=n[x.id];for(const B in P){const I=P[B];for(const O in I)h(I[O].object),delete I[O];delete P[B]}delete n[x.id]}function A(x){for(const P in n){const B=n[P];if(B[x.id]===void 0)continue;const I=B[x.id];for(const O in I)h(I[O].object),delete I[O];delete B[x.id]}}function C(){S(),o=!0,r!==s&&(r=s,l(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:C,resetDefaultState:S,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:b}}function Z0(i,e,t){let n;function s(l){n=l}function r(l,h){i.drawArrays(n,l,h),t.update(h,n,1)}function o(l,h,u){u!==0&&(i.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function a(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let m=0;for(let g=0;g<u;g++)m+=h[g];t.update(m,n,1)}function c(l,h,u,f){if(u===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<l.length;g++)o(l[g],h[g],f[g]);else{m.multiDrawArraysInstancedWEBGL(n,l,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*f[v];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function J0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==An&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const C=A===yr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Zn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Un&&!C)}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:m,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:b,maxVaryings:E,maxFragmentUniforms:_,vertexTextures:R,maxSamples:T}}function Q0(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new wi,a=new ze,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const m=u.length!==0||f||n!==0||s;return s=f,n=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,m){const g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!p)r?h(null):l();else{const b=r?0:n,E=b*4;let _=d.clippingState||null;c.value=_,_=h(g,f,E,m);for(let R=0;R!==E;++R)_[R]=t[R];d.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,m,g){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=c.value,g!==!0||p===null){const d=m+v*4,b=f.matrixWorldInverse;a.getNormalMatrix(b),(p===null||p.length<d)&&(p=new Float32Array(d));for(let E=0,_=m;E!==v;++E,_+=4)o.copy(u[E]).applyMatrix4(b,a),o.normal.toArray(p,_),p[_+3]=o.constant}c.value=p,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}function eg(i){let e=new WeakMap;function t(o,a){return a===Xa?o.mapping=Rs:a===qa&&(o.mapping=Cs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Xa||a===qa)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new Zf(c.height);return l.fromEquirectangularTexture(i,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const ps=4,th=[.125,.215,.35,.446,.526,.582],Ri=20,ga=new Ru,nh=new Ce;let _a=null,va=0,xa=0,ya=!1;const Ti=(1+Math.sqrt(5))/2,as=1/Ti,ih=[new D(-Ti,as,0),new D(Ti,as,0),new D(-as,0,Ti),new D(as,0,Ti),new D(0,Ti,-as),new D(0,Ti,as),new D(-1,1,-1),new D(1,1,-1),new D(-1,1,1),new D(1,1,1)];class sh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){_a=this._renderer.getRenderTarget(),va=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),ya=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ah(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=oh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(_a,va,xa),this._renderer.xr.enabled=ya,e.scissorTest=!1,Kr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Rs||e.mapping===Cs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),_a=this._renderer.getRenderTarget(),va=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),ya=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Dn,minFilter:Dn,generateMipmaps:!1,type:yr,format:An,colorSpace:Is,depthBuffer:!1},s=rh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=rh(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=tg(r)),this._blurMaterial=ng(r,e,t)}return s}_compileMaterial(e){const t=new _e(this._lodPlanes[0],e);this._renderer.compile(t,ga)}_sceneToCubeUV(e,t,n,s){const a=new sn(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(nh),h.toneMapping=ui,h.autoClear=!1;const m=new wn({name:"PMREM.Background",side:Jt,depthWrite:!1,depthTest:!1}),g=new _e(new Ut,m);let v=!1;const p=e.background;p?p.isColor&&(m.color.copy(p),e.background=null,v=!0):(m.color.copy(nh),v=!0);for(let d=0;d<6;d++){const b=d%3;b===0?(a.up.set(0,c[d],0),a.lookAt(l[d],0,0)):b===1?(a.up.set(0,0,c[d]),a.lookAt(0,l[d],0)):(a.up.set(0,c[d],0),a.lookAt(0,0,l[d]));const E=this._cubeSize;Kr(s,b*E,d>2?E:0,E,E),h.setRenderTarget(s),v&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Rs||e.mapping===Cs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ah()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=oh());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new _e(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;Kr(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,ga)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=ih[(s-r-1)%ih.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new _e(this._lodPlanes[s],l),f=l.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Ri-1),v=r/g,p=isFinite(r)?1+Math.floor(h*v):Ri;p>Ri&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ri}`);const d=[];let b=0;for(let A=0;A<Ri;++A){const C=A/v,S=Math.exp(-C*C/2);d.push(S),A===0?b+=S:A<p&&(b+=2*S)}for(let A=0;A<d.length;A++)d[A]=d[A]/b;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:E}=this;f.dTheta.value=g,f.mipInt.value=E-n;const _=this._sizeLods[s],R=3*_*(s>E-ps?s-E+ps:0),T=4*(this._cubeSize-_);Kr(t,R,T,3*_,2*_),c.setRenderTarget(t),c.render(u,ga)}}function tg(i){const e=[],t=[],n=[];let s=i;const r=i-ps+1+th.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let c=1/a;o>i-ps?c=th[o-i+ps-1]:o===0&&(c=0),n.push(c);const l=1/(a-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,g=6,v=3,p=2,d=1,b=new Float32Array(v*g*m),E=new Float32Array(p*g*m),_=new Float32Array(d*g*m);for(let T=0;T<m;T++){const A=T%3*2/3-1,C=T>2?0:-1,S=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];b.set(S,v*g*T),E.set(f,p*g*T);const x=[T,T,T,T,T,T];_.set(x,d*g*T)}const R=new Ot;R.setAttribute("position",new Qt(b,v)),R.setAttribute("uv",new Qt(E,p)),R.setAttribute("faceIndex",new Qt(_,d)),e.push(R),s>ps&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function rh(i,e,t){const n=new Bi(i,e,t);return n.texture.mapping=Uo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Kr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ng(i,e,t){const n=new Float32Array(Ri),s=new D(0,1,0);return new mi({name:"SphericalGaussianBlur",defines:{n:Ri,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function oh(){return new mi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function ah(){return new mi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Kc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ig(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===Xa||c===qa,h=c===Rs||c===Cs;if(l||h){let u=e.get(a);const f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new sh(i)),u=l?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const m=a.image;return l&&m&&m.height>0||h&&m&&s(m)?(t===null&&(t=new sh(i)),u=l?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function sg(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&cs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function rg(i,e,t,n){const s={},r=new WeakMap;function o(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];const m=r.get(f);m&&(e.remove(m),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function c(u){const f=u.attributes;for(const m in f)e.update(f[m],i.ARRAY_BUFFER)}function l(u){const f=[],m=u.index,g=u.attributes.position;let v=0;if(m!==null){const b=m.array;v=m.version;for(let E=0,_=b.length;E<_;E+=3){const R=b[E+0],T=b[E+1],A=b[E+2];f.push(R,T,T,A,A,R)}}else if(g!==void 0){const b=g.array;v=g.version;for(let E=0,_=b.length/3-1;E<_;E+=3){const R=E+0,T=E+1,A=E+2;f.push(R,T,T,A,A,R)}}else return;const p=new(du(f)?xu:vu)(f,1);p.version=v;const d=r.get(u);d&&e.remove(d),r.set(u,p)}function h(u){const f=r.get(u);if(f){const m=u.index;m!==null&&f.version<m.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function og(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,m){i.drawElements(n,m,r,f*o),t.update(m,n,1)}function l(f,m,g){g!==0&&(i.drawElementsInstanced(n,m,r,f*o,g),t.update(m,n,g))}function h(f,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,r,f,0,g);let p=0;for(let d=0;d<g;d++)p+=m[d];t.update(p,n,1)}function u(f,m,g,v){if(g===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let d=0;d<f.length;d++)l(f[d]/o,m[d],v[d]);else{p.multiDrawElementsInstancedWEBGL(n,m,0,r,f,0,v,0,g);let d=0;for(let b=0;b<g;b++)d+=m[b]*v[b];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function ag(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function cg(i,e,t){const n=new WeakMap,s=new ut;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(a);if(f===void 0||f.count!==u){let x=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",x)};var m=x;f!==void 0&&f.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,d=a.morphAttributes.position||[],b=a.morphAttributes.normal||[],E=a.morphAttributes.color||[];let _=0;g===!0&&(_=1),v===!0&&(_=2),p===!0&&(_=3);let R=a.attributes.position.count*_,T=1;R>e.maxTextureSize&&(T=Math.ceil(R/e.maxTextureSize),R=e.maxTextureSize);const A=new Float32Array(R*T*4*u),C=new pu(A,R,T,u);C.type=Un,C.needsUpdate=!0;const S=_*4;for(let P=0;P<u;P++){const B=d[P],I=b[P],O=E[P],V=R*T*4*P;for(let X=0;X<B.count;X++){const K=X*S;g===!0&&(s.fromBufferAttribute(B,X),A[V+K+0]=s.x,A[V+K+1]=s.y,A[V+K+2]=s.z,A[V+K+3]=0),v===!0&&(s.fromBufferAttribute(I,X),A[V+K+4]=s.x,A[V+K+5]=s.y,A[V+K+6]=s.z,A[V+K+7]=0),p===!0&&(s.fromBufferAttribute(O,X),A[V+K+8]=s.x,A[V+K+9]=s.y,A[V+K+10]=s.z,A[V+K+11]=O.itemSize===4?s.w:1)}}f={count:u,texture:C,size:new ke(R,T)},n.set(a,f),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let p=0;p<l.length;p++)g+=l[p];const v=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(i,"morphTargetBaseInfluence",v),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function lg(i,e,t,n){let s=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(s.get(u)!==l&&(e.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return u}function o(){s=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}const Pu=new qt,ch=new Tu(1,1),Lu=new pu,Iu=new Nf,Du=new Su,lh=[],hh=[],uh=new Float32Array(16),dh=new Float32Array(9),fh=new Float32Array(4);function Os(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=lh[s];if(r===void 0&&(r=new Float32Array(s),lh[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Lt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function It(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ko(i,e){let t=hh[e];t===void 0&&(t=new Int32Array(e),hh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function hg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2fv(this.addr,e),It(t,e)}}function dg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Lt(t,e))return;i.uniform3fv(this.addr,e),It(t,e)}}function fg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4fv(this.addr,e),It(t,e)}}function pg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),It(t,e)}else{if(Lt(t,n))return;fh.set(n),i.uniformMatrix2fv(this.addr,!1,fh),It(t,n)}}function mg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),It(t,e)}else{if(Lt(t,n))return;dh.set(n),i.uniformMatrix3fv(this.addr,!1,dh),It(t,n)}}function gg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),It(t,e)}else{if(Lt(t,n))return;uh.set(n),i.uniformMatrix4fv(this.addr,!1,uh),It(t,n)}}function _g(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function vg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2iv(this.addr,e),It(t,e)}}function xg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3iv(this.addr,e),It(t,e)}}function yg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4iv(this.addr,e),It(t,e)}}function Mg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Sg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2uiv(this.addr,e),It(t,e)}}function Eg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3uiv(this.addr,e),It(t,e)}}function bg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4uiv(this.addr,e),It(t,e)}}function wg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ch.compareFunction=uu,r=ch):r=Pu,t.setTexture2D(e||r,s)}function Tg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Iu,s)}function Ag(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Du,s)}function Rg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Lu,s)}function Cg(i){switch(i){case 5126:return hg;case 35664:return ug;case 35665:return dg;case 35666:return fg;case 35674:return pg;case 35675:return mg;case 35676:return gg;case 5124:case 35670:return _g;case 35667:case 35671:return vg;case 35668:case 35672:return xg;case 35669:case 35673:return yg;case 5125:return Mg;case 36294:return Sg;case 36295:return Eg;case 36296:return bg;case 35678:case 36198:case 36298:case 36306:case 35682:return wg;case 35679:case 36299:case 36307:return Tg;case 35680:case 36300:case 36308:case 36293:return Ag;case 36289:case 36303:case 36311:case 36292:return Rg}}function Pg(i,e){i.uniform1fv(this.addr,e)}function Lg(i,e){const t=Os(e,this.size,2);i.uniform2fv(this.addr,t)}function Ig(i,e){const t=Os(e,this.size,3);i.uniform3fv(this.addr,t)}function Dg(i,e){const t=Os(e,this.size,4);i.uniform4fv(this.addr,t)}function Ug(i,e){const t=Os(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Ng(i,e){const t=Os(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Fg(i,e){const t=Os(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Og(i,e){i.uniform1iv(this.addr,e)}function kg(i,e){i.uniform2iv(this.addr,e)}function Bg(i,e){i.uniform3iv(this.addr,e)}function zg(i,e){i.uniform4iv(this.addr,e)}function Hg(i,e){i.uniform1uiv(this.addr,e)}function Vg(i,e){i.uniform2uiv(this.addr,e)}function Gg(i,e){i.uniform3uiv(this.addr,e)}function Wg(i,e){i.uniform4uiv(this.addr,e)}function Xg(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),It(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Pu,r[o])}function qg(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),It(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Iu,r[o])}function Yg(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),It(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Du,r[o])}function $g(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),It(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Lu,r[o])}function jg(i){switch(i){case 5126:return Pg;case 35664:return Lg;case 35665:return Ig;case 35666:return Dg;case 35674:return Ug;case 35675:return Ng;case 35676:return Fg;case 5124:case 35670:return Og;case 35667:case 35671:return kg;case 35668:case 35672:return Bg;case 35669:case 35673:return zg;case 5125:return Hg;case 36294:return Vg;case 36295:return Gg;case 36296:return Wg;case 35678:case 36198:case 36298:case 36306:case 35682:return Xg;case 35679:case 36299:case 36307:return qg;case 35680:case 36300:case 36308:case 36293:return Yg;case 36289:case 36303:case 36311:case 36292:return $g}}class Kg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Cg(t.type)}}class Zg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=jg(t.type)}}class Jg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const Ma=/(\w+)(\])?(\[|\.)?/g;function ph(i,e){i.seq.push(e),i.map[e.id]=e}function Qg(i,e,t){const n=i.name,s=n.length;for(Ma.lastIndex=0;;){const r=Ma.exec(n),o=Ma.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){ph(t,l===void 0?new Kg(a,i,e):new Zg(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Jg(a),ph(t,u)),t=u}}}class lo{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Qg(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function mh(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const e_=37297;let t_=0;function n_(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const gh=new ze;function i_(i){st._getMatrix(gh,st.workingColorSpace,i);const e=`mat3( ${gh.elements.map(t=>t.toFixed(4))} )`;switch(st.getTransfer(i)){case Mo:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function _h(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+n_(i.getShaderSource(e),o)}else return s}function s_(i,e){const t=i_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function r_(i,e){let t;switch(e){case qd:t="Linear";break;case Yd:t="Reinhard";break;case $d:t="Cineon";break;case Qh:t="ACESFilmic";break;case Kd:t="AgX";break;case Zd:t="Neutral";break;case jd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Zr=new D;function o_(){st.getLuminanceCoefficients(Zr);const i=Zr.x.toFixed(4),e=Zr.y.toFixed(4),t=Zr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function a_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(nr).join(`
`)}function c_(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function l_(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function nr(i){return i!==""}function vh(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xh(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const h_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sc(i){return i.replace(h_,d_)}const u_=new Map;function d_(i,e){let t=Ve[e];if(t===void 0){const n=u_.get(e);if(n!==void 0)t=Ve[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Sc(t)}const f_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yh(i){return i.replace(f_,p_)}function p_(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Mh(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function m_(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Zh?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Jh?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Xn&&(e="SHADOWMAP_TYPE_VSM"),e}function g_(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Rs:case Cs:e="ENVMAP_TYPE_CUBE";break;case Uo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function __(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Cs:e="ENVMAP_MODE_REFRACTION";break}return e}function v_(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Oc:e="ENVMAP_BLENDING_MULTIPLY";break;case Wd:e="ENVMAP_BLENDING_MIX";break;case Xd:e="ENVMAP_BLENDING_ADD";break}return e}function x_(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function y_(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=m_(t),l=g_(t),h=__(t),u=v_(t),f=x_(t),m=a_(t),g=c_(r),v=s.createProgram();let p,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(nr).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(nr).join(`
`),d.length>0&&(d+=`
`)):(p=[Mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(nr).join(`
`),d=[Mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ui?"#define TONE_MAPPING":"",t.toneMapping!==ui?Ve.tonemapping_pars_fragment:"",t.toneMapping!==ui?r_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.colorspace_pars_fragment,s_("linearToOutputTexel",t.outputColorSpace),o_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(nr).join(`
`)),o=Sc(o),o=vh(o,t),o=xh(o,t),a=Sc(a),a=vh(a,t),a=xh(a,t),o=yh(o),a=yh(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",t.glslVersion===bl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===bl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=b+p+o,_=b+d+a,R=mh(s,s.VERTEX_SHADER,E),T=mh(s,s.FRAGMENT_SHADER,_);s.attachShader(v,R),s.attachShader(v,T),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(P){if(i.debug.checkShaderErrors){const B=s.getProgramInfoLog(v).trim(),I=s.getShaderInfoLog(R).trim(),O=s.getShaderInfoLog(T).trim();let V=!0,X=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,R,T);else{const K=_h(s,R,"vertex"),G=_h(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+B+`
`+K+`
`+G)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(I===""||O==="")&&(X=!1);X&&(P.diagnostics={runnable:V,programLog:B,vertexShader:{log:I,prefix:p},fragmentShader:{log:O,prefix:d}})}s.deleteShader(R),s.deleteShader(T),C=new lo(s,v),S=l_(s,v)}let C;this.getUniforms=function(){return C===void 0&&A(this),C};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(v,e_)),x},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=t_++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=R,this.fragmentShader=T,this}let M_=0;class S_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new E_(e),t.set(e,n)),n}}class E_{constructor(e){this.id=M_++,this.code=e,this.usedTimes=0}}function b_(i,e,t,n,s,r,o){const a=new gu,c=new S_,l=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let m=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return l.add(S),S===0?"uv":`uv${S}`}function p(S,x,P,B,I){const O=B.fog,V=I.geometry,X=S.isMeshStandardMaterial?B.environment:null,K=(S.isMeshStandardMaterial?t:e).get(S.envMap||X),G=K&&K.mapping===Uo?K.image.height:null,te=g[S.type];S.precision!==null&&(m=s.getMaxPrecision(S.precision),m!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",m,"instead."));const ce=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Ee=ce!==void 0?ce.length:0;let Ge=0;V.morphAttributes.position!==void 0&&(Ge=1),V.morphAttributes.normal!==void 0&&(Ge=2),V.morphAttributes.color!==void 0&&(Ge=3);let dt,Y,ne,xe;if(te){const ct=In[te];dt=ct.vertexShader,Y=ct.fragmentShader}else dt=S.vertexShader,Y=S.fragmentShader,c.update(S),ne=c.getVertexShaderID(S),xe=c.getFragmentShaderID(S);const oe=i.getRenderTarget(),Re=i.state.buffers.depth.getReversed(),Fe=I.isInstancedMesh===!0,We=I.isBatchedMesh===!0,yt=!!S.map,Je=!!S.matcap,Et=!!K,L=!!S.aoMap,cn=!!S.lightMap,je=!!S.bumpMap,Ke=!!S.normalMap,be=!!S.displacementMap,mt=!!S.emissiveMap,Se=!!S.metalnessMap,w=!!S.roughnessMap,y=S.anisotropy>0,k=S.clearcoat>0,$=S.dispersion>0,Z=S.iridescence>0,q=S.sheen>0,Me=S.transmission>0,ae=y&&!!S.anisotropyMap,fe=k&&!!S.clearcoatMap,Qe=k&&!!S.clearcoatNormalMap,Q=k&&!!S.clearcoatRoughnessMap,pe=Z&&!!S.iridescenceMap,Ae=Z&&!!S.iridescenceThicknessMap,De=q&&!!S.sheenColorMap,me=q&&!!S.sheenRoughnessMap,Ze=!!S.specularMap,He=!!S.specularColorMap,pt=!!S.specularIntensityMap,U=Me&&!!S.transmissionMap,se=Me&&!!S.thicknessMap,W=!!S.gradientMap,j=!!S.alphaMap,he=S.alphaTest>0,le=!!S.alphaHash,Be=!!S.extensions;let Mt=ui;S.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(Mt=i.toneMapping);const Vt={shaderID:te,shaderType:S.type,shaderName:S.name,vertexShader:dt,fragmentShader:Y,defines:S.defines,customVertexShaderID:ne,customFragmentShaderID:xe,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:m,batching:We,batchingColor:We&&I._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&I.instanceColor!==null,instancingMorph:Fe&&I.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:oe===null?i.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:Is,alphaToCoverage:!!S.alphaToCoverage,map:yt,matcap:Je,envMap:Et,envMapMode:Et&&K.mapping,envMapCubeUVHeight:G,aoMap:L,lightMap:cn,bumpMap:je,normalMap:Ke,displacementMap:f&&be,emissiveMap:mt,normalMapObjectSpace:Ke&&S.normalMapType===tf,normalMapTangentSpace:Ke&&S.normalMapType===hu,metalnessMap:Se,roughnessMap:w,anisotropy:y,anisotropyMap:ae,clearcoat:k,clearcoatMap:fe,clearcoatNormalMap:Qe,clearcoatRoughnessMap:Q,dispersion:$,iridescence:Z,iridescenceMap:pe,iridescenceThicknessMap:Ae,sheen:q,sheenColorMap:De,sheenRoughnessMap:me,specularMap:Ze,specularColorMap:He,specularIntensityMap:pt,transmission:Me,transmissionMap:U,thicknessMap:se,gradientMap:W,opaque:S.transparent===!1&&S.blending===vs&&S.alphaToCoverage===!1,alphaMap:j,alphaTest:he,alphaHash:le,combine:S.combine,mapUv:yt&&v(S.map.channel),aoMapUv:L&&v(S.aoMap.channel),lightMapUv:cn&&v(S.lightMap.channel),bumpMapUv:je&&v(S.bumpMap.channel),normalMapUv:Ke&&v(S.normalMap.channel),displacementMapUv:be&&v(S.displacementMap.channel),emissiveMapUv:mt&&v(S.emissiveMap.channel),metalnessMapUv:Se&&v(S.metalnessMap.channel),roughnessMapUv:w&&v(S.roughnessMap.channel),anisotropyMapUv:ae&&v(S.anisotropyMap.channel),clearcoatMapUv:fe&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:Qe&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:pe&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ae&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:De&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:me&&v(S.sheenRoughnessMap.channel),specularMapUv:Ze&&v(S.specularMap.channel),specularColorMapUv:He&&v(S.specularColorMap.channel),specularIntensityMapUv:pt&&v(S.specularIntensityMap.channel),transmissionMapUv:U&&v(S.transmissionMap.channel),thicknessMapUv:se&&v(S.thicknessMap.channel),alphaMapUv:j&&v(S.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Ke||y),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!V.attributes.uv&&(yt||j),fog:!!O,useFog:S.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Re,skinning:I.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:Ge,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Mt,decodeVideoTexture:yt&&S.map.isVideoTexture===!0&&st.getTransfer(S.map.colorSpace)===ht,decodeVideoTextureEmissive:mt&&S.emissiveMap.isVideoTexture===!0&&st.getTransfer(S.emissiveMap.colorSpace)===ht,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===zt,flipSided:S.side===Jt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Be&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Be&&S.extensions.multiDraw===!0||We)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Vt.vertexUv1s=l.has(1),Vt.vertexUv2s=l.has(2),Vt.vertexUv3s=l.has(3),l.clear(),Vt}function d(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)x.push(P),x.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(b(x,S),E(x,S),x.push(i.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function b(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function E(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function _(S){const x=g[S.type];let P;if(x){const B=In[x];P=Yf.clone(B.uniforms)}else P=S.uniforms;return P}function R(S,x){let P;for(let B=0,I=h.length;B<I;B++){const O=h[B];if(O.cacheKey===x){P=O,++P.usedTimes;break}}return P===void 0&&(P=new y_(i,x,S,r),h.push(P)),P}function T(S){if(--S.usedTimes===0){const x=h.indexOf(S);h[x]=h[h.length-1],h.pop(),S.destroy()}}function A(S){c.remove(S)}function C(){c.dispose()}return{getParameters:p,getProgramCacheKey:d,getUniforms:_,acquireProgram:R,releaseProgram:T,releaseShaderCache:A,programs:h,dispose:C}}function w_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function T_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Sh(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Eh(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,f,m,g,v,p){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:m,groupOrder:g,renderOrder:u.renderOrder,z:v,group:p},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=m,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=v,d.group=p),e++,d}function a(u,f,m,g,v,p){const d=o(u,f,m,g,v,p);m.transmission>0?n.push(d):m.transparent===!0?s.push(d):t.push(d)}function c(u,f,m,g,v,p){const d=o(u,f,m,g,v,p);m.transmission>0?n.unshift(d):m.transparent===!0?s.unshift(d):t.unshift(d)}function l(u,f){t.length>1&&t.sort(u||T_),n.length>1&&n.sort(f||Sh),s.length>1&&s.sort(f||Sh)}function h(){for(let u=e,f=i.length;u<f;u++){const m=i[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:h,sort:l}}function A_(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new Eh,i.set(n,[o])):s>=r.length?(o=new Eh,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function R_(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Ce};break;case"SpotLight":t={position:new D,direction:new D,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function C_(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let P_=0;function L_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function I_(i){const e=new R_,t=C_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new D);const s=new D,r=new nt,o=new nt;function a(l){let h=0,u=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let m=0,g=0,v=0,p=0,d=0,b=0,E=0,_=0,R=0,T=0,A=0;l.sort(L_);for(let S=0,x=l.length;S<x;S++){const P=l[S],B=P.color,I=P.intensity,O=P.distance,V=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=B.r*I,u+=B.g*I,f+=B.b*I;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],I);A++}else if(P.isDirectionalLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const K=P.shadow,G=t.get(P);G.shadowIntensity=K.intensity,G.shadowBias=K.bias,G.shadowNormalBias=K.normalBias,G.shadowRadius=K.radius,G.shadowMapSize=K.mapSize,n.directionalShadow[m]=G,n.directionalShadowMap[m]=V,n.directionalShadowMatrix[m]=P.shadow.matrix,b++}n.directional[m]=X,m++}else if(P.isSpotLight){const X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(B).multiplyScalar(I),X.distance=O,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[v]=X;const K=P.shadow;if(P.map&&(n.spotLightMap[R]=P.map,R++,K.updateMatrices(P),P.castShadow&&T++),n.spotLightMatrix[v]=K.matrix,P.castShadow){const G=t.get(P);G.shadowIntensity=K.intensity,G.shadowBias=K.bias,G.shadowNormalBias=K.normalBias,G.shadowRadius=K.radius,G.shadowMapSize=K.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=V,_++}v++}else if(P.isRectAreaLight){const X=e.get(P);X.color.copy(B).multiplyScalar(I),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[p]=X,p++}else if(P.isPointLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){const K=P.shadow,G=t.get(P);G.shadowIntensity=K.intensity,G.shadowBias=K.bias,G.shadowNormalBias=K.normalBias,G.shadowRadius=K.radius,G.shadowMapSize=K.mapSize,G.shadowCameraNear=K.camera.near,G.shadowCameraFar=K.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=P.shadow.matrix,E++}n.point[g]=X,g++}else if(P.isHemisphereLight){const X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(I),X.groundColor.copy(P.groundColor).multiplyScalar(I),n.hemi[d]=X,d++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ie.LTC_FLOAT_1,n.rectAreaLTC2=ie.LTC_FLOAT_2):(n.rectAreaLTC1=ie.LTC_HALF_1,n.rectAreaLTC2=ie.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const C=n.hash;(C.directionalLength!==m||C.pointLength!==g||C.spotLength!==v||C.rectAreaLength!==p||C.hemiLength!==d||C.numDirectionalShadows!==b||C.numPointShadows!==E||C.numSpotShadows!==_||C.numSpotMaps!==R||C.numLightProbes!==A)&&(n.directional.length=m,n.spot.length=v,n.rectArea.length=p,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=_+R-T,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=A,C.directionalLength=m,C.pointLength=g,C.spotLength=v,C.rectAreaLength=p,C.hemiLength=d,C.numDirectionalShadows=b,C.numPointShadows=E,C.numSpotShadows=_,C.numSpotMaps=R,C.numLightProbes=A,n.version=P_++)}function c(l,h){let u=0,f=0,m=0,g=0,v=0;const p=h.matrixWorldInverse;for(let d=0,b=l.length;d<b;d++){const E=l[d];if(E.isDirectionalLight){const _=n.directional[u];_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),u++}else if(E.isSpotLight){const _=n.spot[m];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),_.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(p),m++}else if(E.isRectAreaLight){const _=n.rectArea[g];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),o.identity(),r.copy(E.matrixWorld),r.premultiply(p),o.extractRotation(r),_.halfWidth.set(E.width*.5,0,0),_.halfHeight.set(0,E.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){const _=n.point[f];_.position.setFromMatrixPosition(E.matrixWorld),_.position.applyMatrix4(p),f++}else if(E.isHemisphereLight){const _=n.hemi[v];_.direction.setFromMatrixPosition(E.matrixWorld),_.direction.transformDirection(p),v++}}}return{setup:a,setupView:c,state:n}}function bh(i){const e=new I_(i),t=[],n=[];function s(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function c(h){e.setupView(t,h)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function D_(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new bh(i),e.set(s,[a])):r>=o.length?(a=new bh(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const U_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,N_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function F_(i,e,t){let n=new Yc;const s=new ke,r=new ke,o=new ut,a=new op({depthPacking:ef}),c=new ap,l={},h=t.maxTextureSize,u={[pi]:Jt,[Jt]:pi,[zt]:zt},f=new mi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:U_,fragmentShader:N_}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const g=new Ot;g.setAttribute("position",new Qt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new _e(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zh;let d=this.type;this.render=function(T,A,C){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||T.length===0)return;const S=i.getRenderTarget(),x=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),B=i.state;B.setBlending(hi),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const I=d!==Xn&&this.type===Xn,O=d===Xn&&this.type!==Xn;for(let V=0,X=T.length;V<X;V++){const K=T[V],G=K.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const te=G.getFrameExtents();if(s.multiply(te),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/te.x),s.x=r.x*te.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/te.y),s.y=r.y*te.y,G.mapSize.y=r.y)),G.map===null||I===!0||O===!0){const Ee=this.type!==Xn?{minFilter:an,magFilter:an}:{};G.map!==null&&G.map.dispose(),G.map=new Bi(s.x,s.y,Ee),G.map.texture.name=K.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const ce=G.getViewportCount();for(let Ee=0;Ee<ce;Ee++){const Ge=G.getViewport(Ee);o.set(r.x*Ge.x,r.y*Ge.y,r.x*Ge.z,r.y*Ge.w),B.viewport(o),G.updateMatrices(K,Ee),n=G.getFrustum(),_(A,C,G.camera,K,this.type)}G.isPointLightShadow!==!0&&this.type===Xn&&b(G,C),G.needsUpdate=!1}d=this.type,p.needsUpdate=!1,i.setRenderTarget(S,x,P)};function b(T,A){const C=e.update(v);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,m.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Bi(s.x,s.y)),f.uniforms.shadow_pass.value=T.map.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(A,null,C,f,v,null),m.uniforms.shadow_pass.value=T.mapPass.texture,m.uniforms.resolution.value=T.mapSize,m.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(A,null,C,m,v,null)}function E(T,A,C,S){let x=null;const P=C.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(P!==void 0)x=P;else if(x=C.isPointLight===!0?c:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const B=x.uuid,I=A.uuid;let O=l[B];O===void 0&&(O={},l[B]=O);let V=O[I];V===void 0&&(V=x.clone(),O[I]=V,A.addEventListener("dispose",R)),x=V}if(x.visible=A.visible,x.wireframe=A.wireframe,S===Xn?x.side=A.shadowSide!==null?A.shadowSide:A.side:x.side=A.shadowSide!==null?A.shadowSide:u[A.side],x.alphaMap=A.alphaMap,x.alphaTest=A.alphaTest,x.map=A.map,x.clipShadows=A.clipShadows,x.clippingPlanes=A.clippingPlanes,x.clipIntersection=A.clipIntersection,x.displacementMap=A.displacementMap,x.displacementScale=A.displacementScale,x.displacementBias=A.displacementBias,x.wireframeLinewidth=A.wireframeLinewidth,x.linewidth=A.linewidth,C.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const B=i.properties.get(x);B.light=C}return x}function _(T,A,C,S,x){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&x===Xn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,T.matrixWorld);const I=e.update(T),O=T.material;if(Array.isArray(O)){const V=I.groups;for(let X=0,K=V.length;X<K;X++){const G=V[X],te=O[G.materialIndex];if(te&&te.visible){const ce=E(T,te,S,x);T.onBeforeShadow(i,T,A,C,I,ce,G),i.renderBufferDirect(C,null,I,ce,T,G),T.onAfterShadow(i,T,A,C,I,ce,G)}}}else if(O.visible){const V=E(T,O,S,x);T.onBeforeShadow(i,T,A,C,I,V,null),i.renderBufferDirect(C,null,I,V,T,null),T.onAfterShadow(i,T,A,C,I,V,null)}}const B=T.children;for(let I=0,O=B.length;I<O;I++)_(B[I],A,C,S,x)}function R(T){T.target.removeEventListener("dispose",R);for(const C in l){const S=l[C],x=T.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const O_={[ka]:Ba,[za]:Ga,[Ha]:Wa,[As]:Va,[Ba]:ka,[Ga]:za,[Wa]:Ha,[Va]:As};function k_(i,e){function t(){let U=!1;const se=new ut;let W=null;const j=new ut(0,0,0,0);return{setMask:function(he){W!==he&&!U&&(i.colorMask(he,he,he,he),W=he)},setLocked:function(he){U=he},setClear:function(he,le,Be,Mt,Vt){Vt===!0&&(he*=Mt,le*=Mt,Be*=Mt),se.set(he,le,Be,Mt),j.equals(se)===!1&&(i.clearColor(he,le,Be,Mt),j.copy(se))},reset:function(){U=!1,W=null,j.set(-1,0,0,0)}}}function n(){let U=!1,se=!1,W=null,j=null,he=null;return{setReversed:function(le){if(se!==le){const Be=e.get("EXT_clip_control");se?Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.ZERO_TO_ONE_EXT):Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.NEGATIVE_ONE_TO_ONE_EXT);const Mt=he;he=null,this.setClear(Mt)}se=le},getReversed:function(){return se},setTest:function(le){le?oe(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(le){W!==le&&!U&&(i.depthMask(le),W=le)},setFunc:function(le){if(se&&(le=O_[le]),j!==le){switch(le){case ka:i.depthFunc(i.NEVER);break;case Ba:i.depthFunc(i.ALWAYS);break;case za:i.depthFunc(i.LESS);break;case As:i.depthFunc(i.LEQUAL);break;case Ha:i.depthFunc(i.EQUAL);break;case Va:i.depthFunc(i.GEQUAL);break;case Ga:i.depthFunc(i.GREATER);break;case Wa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}j=le}},setLocked:function(le){U=le},setClear:function(le){he!==le&&(se&&(le=1-le),i.clearDepth(le),he=le)},reset:function(){U=!1,W=null,j=null,he=null,se=!1}}}function s(){let U=!1,se=null,W=null,j=null,he=null,le=null,Be=null,Mt=null,Vt=null;return{setTest:function(ct){U||(ct?oe(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(ct){se!==ct&&!U&&(i.stencilMask(ct),se=ct)},setFunc:function(ct,gn,kn){(W!==ct||j!==gn||he!==kn)&&(i.stencilFunc(ct,gn,kn),W=ct,j=gn,he=kn)},setOp:function(ct,gn,kn){(le!==ct||Be!==gn||Mt!==kn)&&(i.stencilOp(ct,gn,kn),le=ct,Be=gn,Mt=kn)},setLocked:function(ct){U=ct},setClear:function(ct){Vt!==ct&&(i.clearStencil(ct),Vt=ct)},reset:function(){U=!1,se=null,W=null,j=null,he=null,le=null,Be=null,Mt=null,Vt=null}}}const r=new t,o=new n,a=new s,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,m=[],g=null,v=!1,p=null,d=null,b=null,E=null,_=null,R=null,T=null,A=new Ce(0,0,0),C=0,S=!1,x=null,P=null,B=null,I=null,O=null;const V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,K=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(G)[1]),X=K>=1):G.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),X=K>=2);let te=null,ce={};const Ee=i.getParameter(i.SCISSOR_BOX),Ge=i.getParameter(i.VIEWPORT),dt=new ut().fromArray(Ee),Y=new ut().fromArray(Ge);function ne(U,se,W,j){const he=new Uint8Array(4),le=i.createTexture();i.bindTexture(U,le),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Be=0;Be<W;Be++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(se,0,i.RGBA,1,1,j,0,i.RGBA,i.UNSIGNED_BYTE,he):i.texImage2D(se+Be,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,he);return le}const xe={};xe[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),xe[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),xe[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),xe[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(i.DEPTH_TEST),o.setFunc(As),je(!1),Ke(xl),oe(i.CULL_FACE),L(hi);function oe(U){h[U]!==!0&&(i.enable(U),h[U]=!0)}function Re(U){h[U]!==!1&&(i.disable(U),h[U]=!1)}function Fe(U,se){return u[U]!==se?(i.bindFramebuffer(U,se),u[U]=se,U===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=se),U===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=se),!0):!1}function We(U,se){let W=m,j=!1;if(U){W=f.get(se),W===void 0&&(W=[],f.set(se,W));const he=U.textures;if(W.length!==he.length||W[0]!==i.COLOR_ATTACHMENT0){for(let le=0,Be=he.length;le<Be;le++)W[le]=i.COLOR_ATTACHMENT0+le;W.length=he.length,j=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,j=!0);j&&i.drawBuffers(W)}function yt(U){return g!==U?(i.useProgram(U),g=U,!0):!1}const Je={[Ai]:i.FUNC_ADD,[Ad]:i.FUNC_SUBTRACT,[Rd]:i.FUNC_REVERSE_SUBTRACT};Je[Cd]=i.MIN,Je[Pd]=i.MAX;const Et={[Ld]:i.ZERO,[Id]:i.ONE,[Dd]:i.SRC_COLOR,[Fa]:i.SRC_ALPHA,[Bd]:i.SRC_ALPHA_SATURATE,[Od]:i.DST_COLOR,[Nd]:i.DST_ALPHA,[Ud]:i.ONE_MINUS_SRC_COLOR,[Oa]:i.ONE_MINUS_SRC_ALPHA,[kd]:i.ONE_MINUS_DST_COLOR,[Fd]:i.ONE_MINUS_DST_ALPHA,[zd]:i.CONSTANT_COLOR,[Hd]:i.ONE_MINUS_CONSTANT_COLOR,[Vd]:i.CONSTANT_ALPHA,[Gd]:i.ONE_MINUS_CONSTANT_ALPHA};function L(U,se,W,j,he,le,Be,Mt,Vt,ct){if(U===hi){v===!0&&(Re(i.BLEND),v=!1);return}if(v===!1&&(oe(i.BLEND),v=!0),U!==Td){if(U!==p||ct!==S){if((d!==Ai||_!==Ai)&&(i.blendEquation(i.FUNC_ADD),d=Ai,_=Ai),ct)switch(U){case vs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yl:i.blendFunc(i.ONE,i.ONE);break;case Ml:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Sl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case vs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yl:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ml:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Sl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}b=null,E=null,R=null,T=null,A.set(0,0,0),C=0,p=U,S=ct}return}he=he||se,le=le||W,Be=Be||j,(se!==d||he!==_)&&(i.blendEquationSeparate(Je[se],Je[he]),d=se,_=he),(W!==b||j!==E||le!==R||Be!==T)&&(i.blendFuncSeparate(Et[W],Et[j],Et[le],Et[Be]),b=W,E=j,R=le,T=Be),(Mt.equals(A)===!1||Vt!==C)&&(i.blendColor(Mt.r,Mt.g,Mt.b,Vt),A.copy(Mt),C=Vt),p=U,S=!1}function cn(U,se){U.side===zt?Re(i.CULL_FACE):oe(i.CULL_FACE);let W=U.side===Jt;se&&(W=!W),je(W),U.blending===vs&&U.transparent===!1?L(hi):L(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);const j=U.stencilWrite;a.setTest(j),j&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),mt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function je(U){x!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),x=U)}function Ke(U){U!==bd?(oe(i.CULL_FACE),U!==P&&(U===xl?i.cullFace(i.BACK):U===wd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),P=U}function be(U){U!==B&&(X&&i.lineWidth(U),B=U)}function mt(U,se,W){U?(oe(i.POLYGON_OFFSET_FILL),(I!==se||O!==W)&&(i.polygonOffset(se,W),I=se,O=W)):Re(i.POLYGON_OFFSET_FILL)}function Se(U){U?oe(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function w(U){U===void 0&&(U=i.TEXTURE0+V-1),te!==U&&(i.activeTexture(U),te=U)}function y(U,se,W){W===void 0&&(te===null?W=i.TEXTURE0+V-1:W=te);let j=ce[W];j===void 0&&(j={type:void 0,texture:void 0},ce[W]=j),(j.type!==U||j.texture!==se)&&(te!==W&&(i.activeTexture(W),te=W),i.bindTexture(U,se||xe[U]),j.type=U,j.texture=se)}function k(){const U=ce[te];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function $(){try{i.compressedTexImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Me(){try{i.texSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ae(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function fe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Qe(){try{i.texStorage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Q(){try{i.texStorage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function pe(){try{i.texImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ae(){try{i.texImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function De(U){dt.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),dt.copy(U))}function me(U){Y.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),Y.copy(U))}function Ze(U,se){let W=l.get(se);W===void 0&&(W=new WeakMap,l.set(se,W));let j=W.get(U);j===void 0&&(j=i.getUniformBlockIndex(se,U.name),W.set(U,j))}function He(U,se){const j=l.get(se).get(U);c.get(se)!==j&&(i.uniformBlockBinding(se,j,U.__bindingPointIndex),c.set(se,j))}function pt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},te=null,ce={},u={},f=new WeakMap,m=[],g=null,v=!1,p=null,d=null,b=null,E=null,_=null,R=null,T=null,A=new Ce(0,0,0),C=0,S=!1,x=null,P=null,B=null,I=null,O=null,dt.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:oe,disable:Re,bindFramebuffer:Fe,drawBuffers:We,useProgram:yt,setBlending:L,setMaterial:cn,setFlipSided:je,setCullFace:Ke,setLineWidth:be,setPolygonOffset:mt,setScissorTest:Se,activeTexture:w,bindTexture:y,unbindTexture:k,compressedTexImage2D:$,compressedTexImage3D:Z,texImage2D:pe,texImage3D:Ae,updateUBOMapping:Ze,uniformBlockBinding:He,texStorage2D:Qe,texStorage3D:Q,texSubImage2D:q,texSubImage3D:Me,compressedTexSubImage2D:ae,compressedTexSubImage3D:fe,scissor:De,viewport:me,reset:pt}}function B_(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ke,h=new WeakMap;let u;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,y){return m?new OffscreenCanvas(w,y):Eo("canvas")}function v(w,y,k){let $=1;const Z=Se(w);if((Z.width>k||Z.height>k)&&($=k/Math.max(Z.width,Z.height)),$<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const q=Math.floor($*Z.width),Me=Math.floor($*Z.height);u===void 0&&(u=g(q,Me));const ae=y?g(q,Me):u;return ae.width=q,ae.height=Me,ae.getContext("2d").drawImage(w,0,0,q,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+q+"x"+Me+")."),ae}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),w;return w}function p(w){return w.generateMipmaps}function d(w){i.generateMipmap(w)}function b(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(w,y,k,$,Z=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let q=y;if(y===i.RED&&(k===i.FLOAT&&(q=i.R32F),k===i.HALF_FLOAT&&(q=i.R16F),k===i.UNSIGNED_BYTE&&(q=i.R8)),y===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.R8UI),k===i.UNSIGNED_SHORT&&(q=i.R16UI),k===i.UNSIGNED_INT&&(q=i.R32UI),k===i.BYTE&&(q=i.R8I),k===i.SHORT&&(q=i.R16I),k===i.INT&&(q=i.R32I)),y===i.RG&&(k===i.FLOAT&&(q=i.RG32F),k===i.HALF_FLOAT&&(q=i.RG16F),k===i.UNSIGNED_BYTE&&(q=i.RG8)),y===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RG8UI),k===i.UNSIGNED_SHORT&&(q=i.RG16UI),k===i.UNSIGNED_INT&&(q=i.RG32UI),k===i.BYTE&&(q=i.RG8I),k===i.SHORT&&(q=i.RG16I),k===i.INT&&(q=i.RG32I)),y===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RGB8UI),k===i.UNSIGNED_SHORT&&(q=i.RGB16UI),k===i.UNSIGNED_INT&&(q=i.RGB32UI),k===i.BYTE&&(q=i.RGB8I),k===i.SHORT&&(q=i.RGB16I),k===i.INT&&(q=i.RGB32I)),y===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),k===i.UNSIGNED_INT&&(q=i.RGBA32UI),k===i.BYTE&&(q=i.RGBA8I),k===i.SHORT&&(q=i.RGBA16I),k===i.INT&&(q=i.RGBA32I)),y===i.RGB&&k===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),y===i.RGBA){const Me=Z?Mo:st.getTransfer($);k===i.FLOAT&&(q=i.RGBA32F),k===i.HALF_FLOAT&&(q=i.RGBA16F),k===i.UNSIGNED_BYTE&&(q=Me===ht?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function _(w,y){let k;return w?y===null||y===ki||y===Ps?k=i.DEPTH24_STENCIL8:y===Un?k=i.DEPTH32F_STENCIL8:y===vr&&(k=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===ki||y===Ps?k=i.DEPTH_COMPONENT24:y===Un?k=i.DEPTH_COMPONENT32F:y===vr&&(k=i.DEPTH_COMPONENT16),k}function R(w,y){return p(w)===!0||w.isFramebufferTexture&&w.minFilter!==an&&w.minFilter!==Dn?Math.log2(Math.max(y.width,y.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?y.mipmaps.length:1}function T(w){const y=w.target;y.removeEventListener("dispose",T),C(y),y.isVideoTexture&&h.delete(y)}function A(w){const y=w.target;y.removeEventListener("dispose",A),x(y)}function C(w){const y=n.get(w);if(y.__webglInit===void 0)return;const k=w.source,$=f.get(k);if($){const Z=$[y.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&S(w),Object.keys($).length===0&&f.delete(k)}n.remove(w)}function S(w){const y=n.get(w);i.deleteTexture(y.__webglTexture);const k=w.source,$=f.get(k);delete $[y.__cacheKey],o.memory.textures--}function x(w){const y=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(y.__webglFramebuffer[$]))for(let Z=0;Z<y.__webglFramebuffer[$].length;Z++)i.deleteFramebuffer(y.__webglFramebuffer[$][Z]);else i.deleteFramebuffer(y.__webglFramebuffer[$]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[$])}else{if(Array.isArray(y.__webglFramebuffer))for(let $=0;$<y.__webglFramebuffer.length;$++)i.deleteFramebuffer(y.__webglFramebuffer[$]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let $=0;$<y.__webglColorRenderbuffer.length;$++)y.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[$]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const k=w.textures;for(let $=0,Z=k.length;$<Z;$++){const q=n.get(k[$]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(k[$])}n.remove(w)}let P=0;function B(){P=0}function I(){const w=P;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),P+=1,w}function O(w){const y=[];return y.push(w.wrapS),y.push(w.wrapT),y.push(w.wrapR||0),y.push(w.magFilter),y.push(w.minFilter),y.push(w.anisotropy),y.push(w.internalFormat),y.push(w.format),y.push(w.type),y.push(w.generateMipmaps),y.push(w.premultiplyAlpha),y.push(w.flipY),y.push(w.unpackAlignment),y.push(w.colorSpace),y.join()}function V(w,y){const k=n.get(w);if(w.isVideoTexture&&be(w),w.isRenderTargetTexture===!1&&w.version>0&&k.__version!==w.version){const $=w.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(k,w,y);return}}t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+y)}function X(w,y){const k=n.get(w);if(w.version>0&&k.__version!==w.version){Y(k,w,y);return}t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+y)}function K(w,y){const k=n.get(w);if(w.version>0&&k.__version!==w.version){Y(k,w,y);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+y)}function G(w,y){const k=n.get(w);if(w.version>0&&k.__version!==w.version){ne(k,w,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+y)}const te={[Ya]:i.REPEAT,[Di]:i.CLAMP_TO_EDGE,[$a]:i.MIRRORED_REPEAT},ce={[an]:i.NEAREST,[Jd]:i.NEAREST_MIPMAP_NEAREST,[wr]:i.NEAREST_MIPMAP_LINEAR,[Dn]:i.LINEAR,[Xo]:i.LINEAR_MIPMAP_NEAREST,[Ui]:i.LINEAR_MIPMAP_LINEAR},Ee={[nf]:i.NEVER,[lf]:i.ALWAYS,[sf]:i.LESS,[uu]:i.LEQUAL,[rf]:i.EQUAL,[cf]:i.GEQUAL,[of]:i.GREATER,[af]:i.NOTEQUAL};function Ge(w,y){if(y.type===Un&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Dn||y.magFilter===Xo||y.magFilter===wr||y.magFilter===Ui||y.minFilter===Dn||y.minFilter===Xo||y.minFilter===wr||y.minFilter===Ui)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,te[y.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,te[y.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,te[y.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,ce[y.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,ce[y.minFilter]),y.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Ee[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===an||y.minFilter!==wr&&y.minFilter!==Ui||y.type===Un&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function dt(w,y){let k=!1;w.__webglInit===void 0&&(w.__webglInit=!0,y.addEventListener("dispose",T));const $=y.source;let Z=f.get($);Z===void 0&&(Z={},f.set($,Z));const q=O(y);if(q!==w.__cacheKey){Z[q]===void 0&&(Z[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Z[q].usedTimes++;const Me=Z[w.__cacheKey];Me!==void 0&&(Z[w.__cacheKey].usedTimes--,Me.usedTimes===0&&S(y)),w.__cacheKey=q,w.__webglTexture=Z[q].texture}return k}function Y(w,y,k){let $=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&($=i.TEXTURE_3D);const Z=dt(w,y),q=y.source;t.bindTexture($,w.__webglTexture,i.TEXTURE0+k);const Me=n.get(q);if(q.version!==Me.__version||Z===!0){t.activeTexture(i.TEXTURE0+k);const ae=st.getPrimaries(st.workingColorSpace),fe=y.colorSpace===ri?null:st.getPrimaries(y.colorSpace),Qe=y.colorSpace===ri||ae===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Qe);let Q=v(y.image,!1,s.maxTextureSize);Q=mt(y,Q);const pe=r.convert(y.format,y.colorSpace),Ae=r.convert(y.type);let De=E(y.internalFormat,pe,Ae,y.colorSpace,y.isVideoTexture);Ge($,y);let me;const Ze=y.mipmaps,He=y.isVideoTexture!==!0,pt=Me.__version===void 0||Z===!0,U=q.dataReady,se=R(y,Q);if(y.isDepthTexture)De=_(y.format===Ls,y.type),pt&&(He?t.texStorage2D(i.TEXTURE_2D,1,De,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,De,Q.width,Q.height,0,pe,Ae,null));else if(y.isDataTexture)if(Ze.length>0){He&&pt&&t.texStorage2D(i.TEXTURE_2D,se,De,Ze[0].width,Ze[0].height);for(let W=0,j=Ze.length;W<j;W++)me=Ze[W],He?U&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,Ae,me.data):t.texImage2D(i.TEXTURE_2D,W,De,me.width,me.height,0,pe,Ae,me.data);y.generateMipmaps=!1}else He?(pt&&t.texStorage2D(i.TEXTURE_2D,se,De,Q.width,Q.height),U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,pe,Ae,Q.data)):t.texImage2D(i.TEXTURE_2D,0,De,Q.width,Q.height,0,pe,Ae,Q.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){He&&pt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,De,Ze[0].width,Ze[0].height,Q.depth);for(let W=0,j=Ze.length;W<j;W++)if(me=Ze[W],y.format!==An)if(pe!==null)if(He){if(U)if(y.layerUpdates.size>0){const he=eh(me.width,me.height,y.format,y.type);for(const le of y.layerUpdates){const Be=me.data.subarray(le*he/me.data.BYTES_PER_ELEMENT,(le+1)*he/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,le,me.width,me.height,1,pe,Be)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,me.width,me.height,Q.depth,pe,me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,De,me.width,me.height,Q.depth,0,me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else He?U&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,me.width,me.height,Q.depth,pe,Ae,me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,W,De,me.width,me.height,Q.depth,0,pe,Ae,me.data)}else{He&&pt&&t.texStorage2D(i.TEXTURE_2D,se,De,Ze[0].width,Ze[0].height);for(let W=0,j=Ze.length;W<j;W++)me=Ze[W],y.format!==An?pe!==null?He?U&&t.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(i.TEXTURE_2D,W,De,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):He?U&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,Ae,me.data):t.texImage2D(i.TEXTURE_2D,W,De,me.width,me.height,0,pe,Ae,me.data)}else if(y.isDataArrayTexture)if(He){if(pt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,De,Q.width,Q.height,Q.depth),U)if(y.layerUpdates.size>0){const W=eh(Q.width,Q.height,y.format,y.type);for(const j of y.layerUpdates){const he=Q.data.subarray(j*W/Q.data.BYTES_PER_ELEMENT,(j+1)*W/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,j,Q.width,Q.height,1,pe,Ae,he)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,pe,Ae,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,De,Q.width,Q.height,Q.depth,0,pe,Ae,Q.data);else if(y.isData3DTexture)He?(pt&&t.texStorage3D(i.TEXTURE_3D,se,De,Q.width,Q.height,Q.depth),U&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,pe,Ae,Q.data)):t.texImage3D(i.TEXTURE_3D,0,De,Q.width,Q.height,Q.depth,0,pe,Ae,Q.data);else if(y.isFramebufferTexture){if(pt)if(He)t.texStorage2D(i.TEXTURE_2D,se,De,Q.width,Q.height);else{let W=Q.width,j=Q.height;for(let he=0;he<se;he++)t.texImage2D(i.TEXTURE_2D,he,De,W,j,0,pe,Ae,null),W>>=1,j>>=1}}else if(Ze.length>0){if(He&&pt){const W=Se(Ze[0]);t.texStorage2D(i.TEXTURE_2D,se,De,W.width,W.height)}for(let W=0,j=Ze.length;W<j;W++)me=Ze[W],He?U&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,pe,Ae,me):t.texImage2D(i.TEXTURE_2D,W,De,pe,Ae,me);y.generateMipmaps=!1}else if(He){if(pt){const W=Se(Q);t.texStorage2D(i.TEXTURE_2D,se,De,W.width,W.height)}U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,pe,Ae,Q)}else t.texImage2D(i.TEXTURE_2D,0,De,pe,Ae,Q);p(y)&&d($),Me.__version=q.version,y.onUpdate&&y.onUpdate(y)}w.__version=y.version}function ne(w,y,k){if(y.image.length!==6)return;const $=dt(w,y),Z=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+k);const q=n.get(Z);if(Z.version!==q.__version||$===!0){t.activeTexture(i.TEXTURE0+k);const Me=st.getPrimaries(st.workingColorSpace),ae=y.colorSpace===ri?null:st.getPrimaries(y.colorSpace),fe=y.colorSpace===ri||Me===ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe);const Qe=y.isCompressedTexture||y.image[0].isCompressedTexture,Q=y.image[0]&&y.image[0].isDataTexture,pe=[];for(let j=0;j<6;j++)!Qe&&!Q?pe[j]=v(y.image[j],!0,s.maxCubemapSize):pe[j]=Q?y.image[j].image:y.image[j],pe[j]=mt(y,pe[j]);const Ae=pe[0],De=r.convert(y.format,y.colorSpace),me=r.convert(y.type),Ze=E(y.internalFormat,De,me,y.colorSpace),He=y.isVideoTexture!==!0,pt=q.__version===void 0||$===!0,U=Z.dataReady;let se=R(y,Ae);Ge(i.TEXTURE_CUBE_MAP,y);let W;if(Qe){He&&pt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ze,Ae.width,Ae.height);for(let j=0;j<6;j++){W=pe[j].mipmaps;for(let he=0;he<W.length;he++){const le=W[he];y.format!==An?De!==null?He?U&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he,0,0,le.width,le.height,De,le.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he,Ze,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):He?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he,0,0,le.width,le.height,De,me,le.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he,Ze,le.width,le.height,0,De,me,le.data)}}}else{if(W=y.mipmaps,He&&pt){W.length>0&&se++;const j=Se(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ze,j.width,j.height)}for(let j=0;j<6;j++)if(Q){He?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,pe[j].width,pe[j].height,De,me,pe[j].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Ze,pe[j].width,pe[j].height,0,De,me,pe[j].data);for(let he=0;he<W.length;he++){const Be=W[he].image[j].image;He?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he+1,0,0,Be.width,Be.height,De,me,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he+1,Ze,Be.width,Be.height,0,De,me,Be.data)}}else{He?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,De,me,pe[j]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Ze,De,me,pe[j]);for(let he=0;he<W.length;he++){const le=W[he];He?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he+1,0,0,De,me,le.image[j]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,he+1,Ze,De,me,le.image[j])}}}p(y)&&d(i.TEXTURE_CUBE_MAP),q.__version=Z.version,y.onUpdate&&y.onUpdate(y)}w.__version=y.version}function xe(w,y,k,$,Z,q){const Me=r.convert(k.format,k.colorSpace),ae=r.convert(k.type),fe=E(k.internalFormat,Me,ae,k.colorSpace),Qe=n.get(y),Q=n.get(k);if(Q.__renderTarget=y,!Qe.__hasExternalTextures){const pe=Math.max(1,y.width>>q),Ae=Math.max(1,y.height>>q);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,q,fe,pe,Ae,y.depth,0,Me,ae,null):t.texImage2D(Z,q,fe,pe,Ae,0,Me,ae,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),Ke(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,Z,Q.__webglTexture,0,je(y)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,Z,Q.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function oe(w,y,k){if(i.bindRenderbuffer(i.RENDERBUFFER,w),y.depthBuffer){const $=y.depthTexture,Z=$&&$.isDepthTexture?$.type:null,q=_(y.stencilBuffer,Z),Me=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=je(y);Ke(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,q,y.width,y.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,q,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,q,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Me,i.RENDERBUFFER,w)}else{const $=y.textures;for(let Z=0;Z<$.length;Z++){const q=$[Z],Me=r.convert(q.format,q.colorSpace),ae=r.convert(q.type),fe=E(q.internalFormat,Me,ae,q.colorSpace),Qe=je(y);k&&Ke(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Qe,fe,y.width,y.height):Ke(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Qe,fe,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,fe,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(w,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=n.get(y.depthTexture);$.__renderTarget=y,(!$.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),V(y.depthTexture,0);const Z=$.__webglTexture,q=je(y);if(y.depthTexture.format===xs)Ke(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(y.depthTexture.format===Ls)Ke(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Fe(w){const y=n.get(w),k=w.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==w.depthTexture){const $=w.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),$){const Z=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,$.removeEventListener("dispose",Z)};$.addEventListener("dispose",Z),y.__depthDisposeCallback=Z}y.__boundDepthTexture=$}if(w.depthTexture&&!y.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Re(y.__webglFramebuffer,w)}else if(k){y.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[$]),y.__webglDepthbuffer[$]===void 0)y.__webglDepthbuffer[$]=i.createRenderbuffer(),oe(y.__webglDepthbuffer[$],w,!1);else{const Z=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=y.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,q)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),oe(y.__webglDepthbuffer,w,!1);else{const $=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,Z)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function We(w,y,k){const $=n.get(w);y!==void 0&&xe($.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&Fe(w)}function yt(w){const y=w.texture,k=n.get(w),$=n.get(y);w.addEventListener("dispose",A);const Z=w.textures,q=w.isWebGLCubeRenderTarget===!0,Me=Z.length>1;if(Me||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=y.version,o.memory.textures++),q){k.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer[ae]=[];for(let fe=0;fe<y.mipmaps.length;fe++)k.__webglFramebuffer[ae][fe]=i.createFramebuffer()}else k.__webglFramebuffer[ae]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer=[];for(let ae=0;ae<y.mipmaps.length;ae++)k.__webglFramebuffer[ae]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(Me)for(let ae=0,fe=Z.length;ae<fe;ae++){const Qe=n.get(Z[ae]);Qe.__webglTexture===void 0&&(Qe.__webglTexture=i.createTexture(),o.memory.textures++)}if(w.samples>0&&Ke(w)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ae=0;ae<Z.length;ae++){const fe=Z[ae];k.__webglColorRenderbuffer[ae]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[ae]);const Qe=r.convert(fe.format,fe.colorSpace),Q=r.convert(fe.type),pe=E(fe.internalFormat,Qe,Q,fe.colorSpace,w.isXRRenderTarget===!0),Ae=je(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,pe,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,k.__webglColorRenderbuffer[ae])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),oe(k.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,y);for(let ae=0;ae<6;ae++)if(y.mipmaps&&y.mipmaps.length>0)for(let fe=0;fe<y.mipmaps.length;fe++)xe(k.__webglFramebuffer[ae][fe],w,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,fe);else xe(k.__webglFramebuffer[ae],w,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);p(y)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Me){for(let ae=0,fe=Z.length;ae<fe;ae++){const Qe=Z[ae],Q=n.get(Qe);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),Ge(i.TEXTURE_2D,Qe),xe(k.__webglFramebuffer,w,Qe,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,0),p(Qe)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let ae=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ae=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,$.__webglTexture),Ge(ae,y),y.mipmaps&&y.mipmaps.length>0)for(let fe=0;fe<y.mipmaps.length;fe++)xe(k.__webglFramebuffer[fe],w,y,i.COLOR_ATTACHMENT0,ae,fe);else xe(k.__webglFramebuffer,w,y,i.COLOR_ATTACHMENT0,ae,0);p(y)&&d(ae),t.unbindTexture()}w.depthBuffer&&Fe(w)}function Je(w){const y=w.textures;for(let k=0,$=y.length;k<$;k++){const Z=y[k];if(p(Z)){const q=b(w),Me=n.get(Z).__webglTexture;t.bindTexture(q,Me),d(q),t.unbindTexture()}}}const Et=[],L=[];function cn(w){if(w.samples>0){if(Ke(w)===!1){const y=w.textures,k=w.width,$=w.height;let Z=i.COLOR_BUFFER_BIT;const q=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Me=n.get(w),ae=y.length>1;if(ae)for(let fe=0;fe<y.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Me.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let fe=0;fe<y.length;fe++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),ae){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Me.__webglColorRenderbuffer[fe]);const Qe=n.get(y[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Qe,0)}i.blitFramebuffer(0,0,k,$,0,0,k,$,Z,i.NEAREST),c===!0&&(Et.length=0,L.length=0,Et.push(i.COLOR_ATTACHMENT0+fe),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Et.push(q),L.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,L)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Et))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ae)for(let fe=0;fe<y.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,Me.__webglColorRenderbuffer[fe]);const Qe=n.get(y[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Me.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,Qe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&c){const y=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function je(w){return Math.min(s.maxSamples,w.samples)}function Ke(w){const y=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function be(w){const y=o.render.frame;h.get(w)!==y&&(h.set(w,y),w.update())}function mt(w,y){const k=w.colorSpace,$=w.format,Z=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||k!==Is&&k!==ri&&(st.getTransfer(k)===ht?($!==An||Z!==Zn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),y}function Se(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(l.width=w.naturalWidth||w.width,l.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(l.width=w.displayWidth,l.height=w.displayHeight):(l.width=w.width,l.height=w.height),l}this.allocateTextureUnit=I,this.resetTextureUnits=B,this.setTexture2D=V,this.setTexture2DArray=X,this.setTexture3D=K,this.setTextureCube=G,this.rebindTextures=We,this.setupRenderTarget=yt,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=cn,this.setupDepthRenderbuffer=Fe,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Ke}function z_(i,e){function t(n,s=ri){let r;const o=st.getTransfer(s);if(n===Zn)return i.UNSIGNED_BYTE;if(n===Bc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===zc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===iu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===tu)return i.BYTE;if(n===nu)return i.SHORT;if(n===vr)return i.UNSIGNED_SHORT;if(n===kc)return i.INT;if(n===ki)return i.UNSIGNED_INT;if(n===Un)return i.FLOAT;if(n===yr)return i.HALF_FLOAT;if(n===su)return i.ALPHA;if(n===ru)return i.RGB;if(n===An)return i.RGBA;if(n===ou)return i.LUMINANCE;if(n===au)return i.LUMINANCE_ALPHA;if(n===xs)return i.DEPTH_COMPONENT;if(n===Ls)return i.DEPTH_STENCIL;if(n===Hc)return i.RED;if(n===Vc)return i.RED_INTEGER;if(n===cu)return i.RG;if(n===Gc)return i.RG_INTEGER;if(n===Wc)return i.RGBA_INTEGER;if(n===so||n===ro||n===oo||n===ao)if(o===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===so)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===oo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ao)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===so)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ro)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===oo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ao)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ja||n===Ka||n===Za||n===Ja)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ja)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ka)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ja)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Qa||n===ec||n===tc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Qa||n===ec)return o===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===tc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===nc||n===ic||n===sc||n===rc||n===oc||n===ac||n===cc||n===lc||n===hc||n===uc||n===dc||n===fc||n===pc||n===mc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===nc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ic)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===sc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===rc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===oc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ac)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===cc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===lc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===hc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===uc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===dc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===fc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===pc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===mc)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===co||n===gc||n===_c)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===co)return o===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===gc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===_c)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===lu||n===vc||n===xc||n===yc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===co)return r.COMPRESSED_RED_RGTC1_EXT;if(n===vc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===xc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===yc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ps?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const H_={type:"move"};class Sa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Bt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Bt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Bt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const v of e.hand.values()){const p=t.getJointPose(v,n),d=this._getHandJoint(l,v);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),m=.02,g=.005;l.inputState.pinching&&f>m+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=m-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(H_)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Bt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const V_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,G_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class W_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new qt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new mi({vertexShader:V_,fragmentShader:G_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new _e(new Ni(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class X_ extends Us{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,f=null,m=null,g=null;const v=new W_,p=t.getContextAttributes();let d=null,b=null;const E=[],_=[],R=new ke;let T=null;const A=new sn;A.viewport=new ut;const C=new sn;C.viewport=new ut;const S=[A,C],x=new dp;let P=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ne=E[Y];return ne===void 0&&(ne=new Sa,E[Y]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(Y){let ne=E[Y];return ne===void 0&&(ne=new Sa,E[Y]=ne),ne.getGripSpace()},this.getHand=function(Y){let ne=E[Y];return ne===void 0&&(ne=new Sa,E[Y]=ne),ne.getHandSpace()};function I(Y){const ne=_.indexOf(Y.inputSource);if(ne===-1)return;const xe=E[ne];xe!==void 0&&(xe.update(Y.inputSource,Y.frame,l||o),xe.dispatchEvent({type:Y.type,data:Y.inputSource}))}function O(){s.removeEventListener("select",I),s.removeEventListener("selectstart",I),s.removeEventListener("selectend",I),s.removeEventListener("squeeze",I),s.removeEventListener("squeezestart",I),s.removeEventListener("squeezeend",I),s.removeEventListener("end",O),s.removeEventListener("inputsourceschange",V);for(let Y=0;Y<E.length;Y++){const ne=_[Y];ne!==null&&(_[Y]=null,E[Y].disconnect(ne))}P=null,B=null,v.reset(),e.setRenderTarget(d),m=null,f=null,u=null,s=null,b=null,dt.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",I),s.addEventListener("selectstart",I),s.addEventListener("selectend",I),s.addEventListener("squeeze",I),s.addEventListener("squeezestart",I),s.addEventListener("squeezeend",I),s.addEventListener("end",O),s.addEventListener("inputsourceschange",V),p.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(R),s.enabledFeatures!==void 0&&s.enabledFeatures.includes("layers")){let xe=null,oe=null,Re=null;p.depth&&(Re=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=p.stencil?Ls:xs,oe=p.stencil?Ps:ki);const Fe={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:r};u=new XRWebGLBinding(s,t),f=u.createProjectionLayer(Fe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),b=new Bi(f.textureWidth,f.textureHeight,{format:An,type:Zn,depthTexture:new Tu(f.textureWidth,f.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}else{const xe={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,xe),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new Bi(m.framebufferWidth,m.framebufferHeight,{format:An,type:Zn,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}b.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),dt.setContext(s),dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function V(Y){for(let ne=0;ne<Y.removed.length;ne++){const xe=Y.removed[ne],oe=_.indexOf(xe);oe>=0&&(_[oe]=null,E[oe].disconnect(xe))}for(let ne=0;ne<Y.added.length;ne++){const xe=Y.added[ne];let oe=_.indexOf(xe);if(oe===-1){for(let Fe=0;Fe<E.length;Fe++)if(Fe>=_.length){_.push(xe),oe=Fe;break}else if(_[Fe]===null){_[Fe]=xe,oe=Fe;break}if(oe===-1)break}const Re=E[oe];Re&&Re.connect(xe)}}const X=new D,K=new D;function G(Y,ne,xe){X.setFromMatrixPosition(ne.matrixWorld),K.setFromMatrixPosition(xe.matrixWorld);const oe=X.distanceTo(K),Re=ne.projectionMatrix.elements,Fe=xe.projectionMatrix.elements,We=Re[14]/(Re[10]-1),yt=Re[14]/(Re[10]+1),Je=(Re[9]+1)/Re[5],Et=(Re[9]-1)/Re[5],L=(Re[8]-1)/Re[0],cn=(Fe[8]+1)/Fe[0],je=We*L,Ke=We*cn,be=oe/(-L+cn),mt=be*-L;if(ne.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(mt),Y.translateZ(be),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Re[10]===-1)Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const Se=We+be,w=yt+be,y=je-mt,k=Ke+(oe-mt),$=Je*yt/w*Se,Z=Et*yt/w*Se;Y.projectionMatrix.makePerspective(y,k,$,Z,Se,w),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function te(Y,ne){ne===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ne.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let ne=Y.near,xe=Y.far;v.texture!==null&&(v.depthNear>0&&(ne=v.depthNear),v.depthFar>0&&(xe=v.depthFar)),x.near=C.near=A.near=ne,x.far=C.far=A.far=xe,(P!==x.near||B!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),P=x.near,B=x.far),A.layers.mask=Y.layers.mask|2,C.layers.mask=Y.layers.mask|4,x.layers.mask=A.layers.mask|C.layers.mask;const oe=Y.parent,Re=x.cameras;te(x,oe);for(let Fe=0;Fe<Re.length;Fe++)te(Re[Fe],oe);Re.length===2?G(x,A,C):x.projectionMatrix.copy(A.projectionMatrix),ce(Y,x,oe)};function ce(Y,ne,xe){xe===null?Y.matrix.copy(ne.matrixWorld):(Y.matrix.copy(xe.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ne.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=xr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&m===null))return c},this.setFoveation=function(Y){c=Y,f!==null&&(f.fixedFoveation=Y),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(x)};let Ee=null;function Ge(Y,ne){if(h=ne.getViewerPose(l||o),g=ne,h!==null){const xe=h.views;m!==null&&(e.setRenderTargetFramebuffer(b,m.framebuffer),e.setRenderTarget(b));let oe=!1;xe.length!==x.cameras.length&&(x.cameras.length=0,oe=!0);for(let Fe=0;Fe<xe.length;Fe++){const We=xe[Fe];let yt=null;if(m!==null)yt=m.getViewport(We);else{const Et=u.getViewSubImage(f,We);yt=Et.viewport,Fe===0&&(e.setRenderTargetTextures(b,Et.colorTexture,f.ignoreDepthValues?void 0:Et.depthStencilTexture),e.setRenderTarget(b))}let Je=S[Fe];Je===void 0&&(Je=new sn,Je.layers.enable(Fe),Je.viewport=new ut,S[Fe]=Je),Je.matrix.fromArray(We.transform.matrix),Je.matrix.decompose(Je.position,Je.quaternion,Je.scale),Je.projectionMatrix.fromArray(We.projectionMatrix),Je.projectionMatrixInverse.copy(Je.projectionMatrix).invert(),Je.viewport.set(yt.x,yt.y,yt.width,yt.height),Fe===0&&(x.matrix.copy(Je.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),oe===!0&&x.cameras.push(Je)}const Re=s.enabledFeatures;if(Re&&Re.includes("depth-sensing")){const Fe=u.getDepthInformation(xe[0]);Fe&&Fe.isValid&&Fe.texture&&v.init(e,Fe,s.renderState)}}for(let xe=0;xe<E.length;xe++){const oe=_[xe],Re=E[xe];oe!==null&&Re!==void 0&&Re.update(oe,ne,l||o)}Ee&&Ee(Y,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}const dt=new Cu;dt.setAnimationLoop(Ge),this.setAnimationLoop=function(Y){Ee=Y},this.dispose=function(){}}}const Ei=new Fn,q_=new nt;function Y_(i,e){function t(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function n(p,d){d.color.getRGB(p.fogColor.value,yu(i)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function s(p,d,b,E,_){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(p,d):d.isMeshToonMaterial?(r(p,d),u(p,d)):d.isMeshPhongMaterial?(r(p,d),h(p,d)):d.isMeshStandardMaterial?(r(p,d),f(p,d),d.isMeshPhysicalMaterial&&m(p,d,_)):d.isMeshMatcapMaterial?(r(p,d),g(p,d)):d.isMeshDepthMaterial?r(p,d):d.isMeshDistanceMaterial?(r(p,d),v(p,d)):d.isMeshNormalMaterial?r(p,d):d.isLineBasicMaterial?(o(p,d),d.isLineDashedMaterial&&a(p,d)):d.isPointsMaterial?c(p,d,b,E):d.isSpriteMaterial?l(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,t(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Jt&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,t(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Jt&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,t(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,t(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);const b=e.get(d),E=b.envMap,_=b.envMapRotation;E&&(p.envMap.value=E,Ei.copy(_),Ei.x*=-1,Ei.y*=-1,Ei.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Ei.y*=-1,Ei.z*=-1),p.envMapRotation.value.setFromMatrix4(q_.makeRotationFromEuler(Ei)),p.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,p.aoMapTransform))}function o(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform))}function a(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function c(p,d,b,E){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*b,p.scale.value=E*.5,d.map&&(p.map.value=d.map,t(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function l(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function h(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function u(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function f(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,b){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Jt&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=b.texture,p.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,d){d.matcap&&(p.matcap.value=d.matcap)}function v(p,d){const b=e.get(d).light;p.referencePosition.value.setFromMatrixPosition(b.matrixWorld),p.nearDistance.value=b.shadow.camera.near,p.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function $_(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(b,E){const _=E.program;n.uniformBlockBinding(b,_)}function l(b,E){let _=s[b.id];_===void 0&&(g(b),_=h(b),s[b.id]=_,b.addEventListener("dispose",p));const R=E.program;n.updateUBOMapping(b,R);const T=e.render.frame;r[b.id]!==T&&(f(b),r[b.id]=T)}function h(b){const E=u();b.__bindingPointIndex=E;const _=i.createBuffer(),R=b.__size,T=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,_),i.bufferData(i.UNIFORM_BUFFER,R,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,_),_}function u(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){const E=s[b.id],_=b.uniforms,R=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let T=0,A=_.length;T<A;T++){const C=Array.isArray(_[T])?_[T]:[_[T]];for(let S=0,x=C.length;S<x;S++){const P=C[S];if(m(P,T,S,R)===!0){const B=P.__offset,I=Array.isArray(P.value)?P.value:[P.value];let O=0;for(let V=0;V<I.length;V++){const X=I[V],K=v(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,B+O,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,O),O+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,B,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(b,E,_,R){const T=b.value,A=E+"_"+_;if(R[A]===void 0)return typeof T=="number"||typeof T=="boolean"?R[A]=T:R[A]=T.clone(),!0;{const C=R[A];if(typeof T=="number"||typeof T=="boolean"){if(C!==T)return R[A]=T,!0}else if(C.equals(T)===!1)return C.copy(T),!0}return!1}function g(b){const E=b.uniforms;let _=0;const R=16;for(let A=0,C=E.length;A<C;A++){const S=Array.isArray(E[A])?E[A]:[E[A]];for(let x=0,P=S.length;x<P;x++){const B=S[x],I=Array.isArray(B.value)?B.value:[B.value];for(let O=0,V=I.length;O<V;O++){const X=I[O],K=v(X),G=_%R,te=G%K.boundary,ce=G+te;_+=te,ce!==0&&R-ce<K.storage&&(_+=R-ce),B.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=_,_+=K.storage}}}const T=_%R;return T>0&&(_+=R-T),b.__size=_,b.__cache={},this}function v(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function p(b){const E=b.target;E.removeEventListener("dispose",p);const _=o.indexOf(E.__bindingPointIndex);o.splice(_,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function d(){for(const b in s)i.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:c,update:l,dispose:d}}class j_{constructor(e={}){const{canvas:t=Tf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=o;const g=new Uint32Array(4),v=new Int32Array(4);let p=null,d=null;const b=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Zt,this.toneMapping=ui,this.toneMappingExposure=1;const _=this;let R=!1,T=0,A=0,C=null,S=-1,x=null;const P=new ut,B=new ut;let I=null;const O=new Ce(0);let V=0,X=t.width,K=t.height,G=1,te=null,ce=null;const Ee=new ut(0,0,X,K),Ge=new ut(0,0,X,K);let dt=!1;const Y=new Yc;let ne=!1,xe=!1;this.transmissionResolutionScale=1;const oe=new nt,Re=new nt,Fe=new D,We=new ut,yt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function Et(){return C===null?G:1}let L=n;function cn(M,N){return t.getContext(M,N)}try{const M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Fc}`),t.addEventListener("webglcontextlost",j,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",le,!1),L===null){const N="webgl2";if(L=cn(N,M),L===null)throw cn(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let je,Ke,be,mt,Se,w,y,k,$,Z,q,Me,ae,fe,Qe,Q,pe,Ae,De,me,Ze,He,pt,U;function se(){je=new sg(L),je.init(),He=new z_(L,je),Ke=new J0(L,je,e,He),be=new k_(L,je),Ke.reverseDepthBuffer&&f&&be.buffers.depth.setReversed(!0),mt=new ag(L),Se=new w_,w=new B_(L,je,be,Se,Ke,He,mt),y=new eg(_),k=new ig(_),$=new pp(L),pt=new K0(L,$),Z=new rg(L,$,mt,pt),q=new lg(L,Z,$,mt),De=new cg(L,Ke,w),Q=new Q0(Se),Me=new b_(_,y,k,je,Ke,pt,Q),ae=new Y_(_,Se),fe=new A_,Qe=new D_(je),Ae=new j0(_,y,k,be,q,m,c),pe=new F_(_,q,Ke),U=new $_(L,mt,Ke,be),me=new Z0(L,je,mt),Ze=new og(L,je,mt),mt.programs=Me.programs,_.capabilities=Ke,_.extensions=je,_.properties=Se,_.renderLists=fe,_.shadowMap=pe,_.state=be,_.info=mt}se();const W=new X_(_,L);this.xr=W,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const M=je.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=je.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(M){M!==void 0&&(G=M,this.setSize(X,K,!1))},this.getSize=function(M){return M.set(X,K)},this.setSize=function(M,N,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=M,K=N,t.width=Math.floor(M*G),t.height=Math.floor(N*G),z===!0&&(t.style.width=M+"px",t.style.height=N+"px"),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(X*G,K*G).floor()},this.setDrawingBufferSize=function(M,N,z){X=M,K=N,G=z,t.width=Math.floor(M*z),t.height=Math.floor(N*z),this.setViewport(0,0,M,N)},this.getCurrentViewport=function(M){return M.copy(P)},this.getViewport=function(M){return M.copy(Ee)},this.setViewport=function(M,N,z,H){M.isVector4?Ee.set(M.x,M.y,M.z,M.w):Ee.set(M,N,z,H),be.viewport(P.copy(Ee).multiplyScalar(G).round())},this.getScissor=function(M){return M.copy(Ge)},this.setScissor=function(M,N,z,H){M.isVector4?Ge.set(M.x,M.y,M.z,M.w):Ge.set(M,N,z,H),be.scissor(B.copy(Ge).multiplyScalar(G).round())},this.getScissorTest=function(){return dt},this.setScissorTest=function(M){be.setScissorTest(dt=M)},this.setOpaqueSort=function(M){te=M},this.setTransparentSort=function(M){ce=M},this.getClearColor=function(M){return M.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor.apply(Ae,arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha.apply(Ae,arguments)},this.clear=function(M=!0,N=!0,z=!0){let H=0;if(M){let F=!1;if(C!==null){const J=C.texture.format;F=J===Wc||J===Gc||J===Vc}if(F){const J=C.texture.type,re=J===Zn||J===ki||J===vr||J===Ps||J===Bc||J===zc,de=Ae.getClearColor(),ge=Ae.getClearAlpha(),Ue=de.r,Oe=de.g,we=de.b;re?(g[0]=Ue,g[1]=Oe,g[2]=we,g[3]=ge,L.clearBufferuiv(L.COLOR,0,g)):(v[0]=Ue,v[1]=Oe,v[2]=we,v[3]=ge,L.clearBufferiv(L.COLOR,0,v))}else H|=L.COLOR_BUFFER_BIT}N&&(H|=L.DEPTH_BUFFER_BIT),z&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",j,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",le,!1),Ae.dispose(),fe.dispose(),Qe.dispose(),Se.dispose(),y.dispose(),k.dispose(),q.dispose(),pt.dispose(),U.dispose(),Me.dispose(),W.dispose(),W.removeEventListener("sessionstart",ul),W.removeEventListener("sessionend",dl),gi.stop()};function j(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const M=mt.autoReset,N=pe.enabled,z=pe.autoUpdate,H=pe.needsUpdate,F=pe.type;se(),mt.autoReset=M,pe.enabled=N,pe.autoUpdate=z,pe.needsUpdate=H,pe.type=F}function le(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Be(M){const N=M.target;N.removeEventListener("dispose",Be),Mt(N)}function Mt(M){Vt(M),Se.remove(M)}function Vt(M){const N=Se.get(M).programs;N!==void 0&&(N.forEach(function(z){Me.releaseProgram(z)}),M.isShaderMaterial&&Me.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,z,H,F,J){N===null&&(N=yt);const re=F.isMesh&&F.matrixWorld.determinant()<0,de=md(M,N,z,H,F);be.setMaterial(H,re);let ge=z.index,Ue=1;if(H.wireframe===!0){if(ge=Z.getWireframeAttribute(z),ge===void 0)return;Ue=2}const Oe=z.drawRange,we=z.attributes.position;let et=Oe.start*Ue,ot=(Oe.start+Oe.count)*Ue;J!==null&&(et=Math.max(et,J.start*Ue),ot=Math.min(ot,(J.start+J.count)*Ue)),ge!==null?(et=Math.max(et,0),ot=Math.min(ot,ge.count)):we!=null&&(et=Math.max(et,0),ot=Math.min(ot,we.count));const bt=ot-et;if(bt<0||bt===1/0)return;pt.setup(F,H,de,z,ge);let St,it=me;if(ge!==null&&(St=$.get(ge),it=Ze,it.setIndex(St)),F.isMesh)H.wireframe===!0?(be.setLineWidth(H.wireframeLinewidth*Et()),it.setMode(L.LINES)):it.setMode(L.TRIANGLES);else if(F.isLine){let Te=H.linewidth;Te===void 0&&(Te=1),be.setLineWidth(Te*Et()),F.isLineSegments?it.setMode(L.LINES):F.isLineLoop?it.setMode(L.LINE_LOOP):it.setMode(L.LINE_STRIP)}else F.isPoints?it.setMode(L.POINTS):F.isSprite&&it.setMode(L.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)it.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(je.get("WEBGL_multi_draw"))it.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Te=F._multiDrawStarts,kt=F._multiDrawCounts,at=F._multiDrawCount,_n=ge?$.get(ge).bytesPerElement:1,Vi=Se.get(H).currentProgram.getUniforms();for(let en=0;en<at;en++)Vi.setValue(L,"_gl_DrawID",en),it.render(Te[en]/_n,kt[en])}else if(F.isInstancedMesh)it.renderInstances(et,bt,F.count);else if(z.isInstancedBufferGeometry){const Te=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,kt=Math.min(z.instanceCount,Te);it.renderInstances(et,bt,kt)}else it.render(et,bt)};function ct(M,N,z){M.transparent===!0&&M.side===zt&&M.forceSinglePass===!1?(M.side=Jt,M.needsUpdate=!0,br(M,N,z),M.side=pi,M.needsUpdate=!0,br(M,N,z),M.side=zt):br(M,N,z)}this.compile=function(M,N,z=null){z===null&&(z=M),d=Qe.get(z),d.init(N),E.push(d),z.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),M!==z&&M.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),d.setupLights();const H=new Set;return M.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const J=F.material;if(J)if(Array.isArray(J))for(let re=0;re<J.length;re++){const de=J[re];ct(de,z,F),H.add(de)}else ct(J,z,F),H.add(J)}),E.pop(),d=null,H},this.compileAsync=function(M,N,z=null){const H=this.compile(M,N,z);return new Promise(F=>{function J(){if(H.forEach(function(re){Se.get(re).currentProgram.isReady()&&H.delete(re)}),H.size===0){F(M);return}setTimeout(J,10)}je.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let gn=null;function kn(M){gn&&gn(M)}function ul(){gi.stop()}function dl(){gi.start()}const gi=new Cu;gi.setAnimationLoop(kn),typeof self<"u"&&gi.setContext(self),this.setAnimationLoop=function(M){gn=M,W.setAnimationLoop(M),M===null?gi.stop():gi.start()},W.addEventListener("sessionstart",ul),W.addEventListener("sessionend",dl),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(N),N=W.getCamera()),M.isScene===!0&&M.onBeforeRender(_,M,N,C),d=Qe.get(M,E.length),d.init(N),E.push(d),Re.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Y.setFromProjectionMatrix(Re),xe=this.localClippingEnabled,ne=Q.init(this.clippingPlanes,xe),p=fe.get(M,b.length),p.init(),b.push(p),W.enabled===!0&&W.isPresenting===!0){const J=_.xr.getDepthSensingMesh();J!==null&&Go(J,N,-1/0,_.sortObjects)}Go(M,N,0,_.sortObjects),p.finish(),_.sortObjects===!0&&p.sort(te,ce),Je=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Je&&Ae.addToRenderList(p,M),this.info.render.frame++,ne===!0&&Q.beginShadows();const z=d.state.shadowsArray;pe.render(z,M,N),ne===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=p.opaque,F=p.transmissive;if(d.setupLights(),N.isArrayCamera){const J=N.cameras;if(F.length>0)for(let re=0,de=J.length;re<de;re++){const ge=J[re];pl(H,F,M,ge)}Je&&Ae.render(M);for(let re=0,de=J.length;re<de;re++){const ge=J[re];fl(p,M,ge,ge.viewport)}}else F.length>0&&pl(H,F,M,N),Je&&Ae.render(M),fl(p,M,N);C!==null&&A===0&&(w.updateMultisampleRenderTarget(C),w.updateRenderTargetMipmap(C)),M.isScene===!0&&M.onAfterRender(_,M,N),pt.resetDefaultState(),S=-1,x=null,E.pop(),E.length>0?(d=E[E.length-1],ne===!0&&Q.setGlobalState(_.clippingPlanes,d.state.camera)):d=null,b.pop(),b.length>0?p=b[b.length-1]:p=null};function Go(M,N,z,H){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLight)d.pushLight(M),M.castShadow&&d.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Y.intersectsSprite(M)){H&&We.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Re);const re=q.update(M),de=M.material;de.visible&&p.push(M,re,de,z,We.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Y.intersectsObject(M))){const re=q.update(M),de=M.material;if(H&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),We.copy(M.boundingSphere.center)):(re.boundingSphere===null&&re.computeBoundingSphere(),We.copy(re.boundingSphere.center)),We.applyMatrix4(M.matrixWorld).applyMatrix4(Re)),Array.isArray(de)){const ge=re.groups;for(let Ue=0,Oe=ge.length;Ue<Oe;Ue++){const we=ge[Ue],et=de[we.materialIndex];et&&et.visible&&p.push(M,re,et,z,We.z,we)}}else de.visible&&p.push(M,re,de,z,We.z,null)}}const J=M.children;for(let re=0,de=J.length;re<de;re++)Go(J[re],N,z,H)}function fl(M,N,z,H){const F=M.opaque,J=M.transmissive,re=M.transparent;d.setupLightsView(z),ne===!0&&Q.setGlobalState(_.clippingPlanes,z),H&&be.viewport(P.copy(H)),F.length>0&&Er(F,N,z),J.length>0&&Er(J,N,z),re.length>0&&Er(re,N,z),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function pl(M,N,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new Bi(1,1,{generateMipmaps:!0,type:je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float")?yr:Zn,minFilter:Ui,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:st.workingColorSpace}));const J=d.state.transmissionRenderTarget[H.id],re=H.viewport||P;J.setSize(re.z*_.transmissionResolutionScale,re.w*_.transmissionResolutionScale);const de=_.getRenderTarget();_.setRenderTarget(J),_.getClearColor(O),V=_.getClearAlpha(),V<1&&_.setClearColor(16777215,.5),_.clear(),Je&&Ae.render(z);const ge=_.toneMapping;_.toneMapping=ui;const Ue=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),ne===!0&&Q.setGlobalState(_.clippingPlanes,H),Er(M,z,H),w.updateMultisampleRenderTarget(J),w.updateRenderTargetMipmap(J),je.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let we=0,et=N.length;we<et;we++){const ot=N[we],bt=ot.object,St=ot.geometry,it=ot.material,Te=ot.group;if(it.side===zt&&bt.layers.test(H.layers)){const kt=it.side;it.side=Jt,it.needsUpdate=!0,ml(bt,z,H,St,it,Te),it.side=kt,it.needsUpdate=!0,Oe=!0}}Oe===!0&&(w.updateMultisampleRenderTarget(J),w.updateRenderTargetMipmap(J))}_.setRenderTarget(de),_.setClearColor(O,V),Ue!==void 0&&(H.viewport=Ue),_.toneMapping=ge}function Er(M,N,z){const H=N.isScene===!0?N.overrideMaterial:null;for(let F=0,J=M.length;F<J;F++){const re=M[F],de=re.object,ge=re.geometry,Ue=H===null?re.material:H,Oe=re.group;de.layers.test(z.layers)&&ml(de,N,z,ge,Ue,Oe)}}function ml(M,N,z,H,F,J){M.onBeforeRender(_,N,z,H,F,J),M.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),F.onBeforeRender(_,N,z,H,M,J),F.transparent===!0&&F.side===zt&&F.forceSinglePass===!1?(F.side=Jt,F.needsUpdate=!0,_.renderBufferDirect(z,N,H,F,M,J),F.side=pi,F.needsUpdate=!0,_.renderBufferDirect(z,N,H,F,M,J),F.side=zt):_.renderBufferDirect(z,N,H,F,M,J),M.onAfterRender(_,N,z,H,F,J)}function br(M,N,z){N.isScene!==!0&&(N=yt);const H=Se.get(M),F=d.state.lights,J=d.state.shadowsArray,re=F.state.version,de=Me.getParameters(M,F.state,J,N,z),ge=Me.getProgramCacheKey(de);let Ue=H.programs;H.environment=M.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(M.isMeshStandardMaterial?k:y).get(M.envMap||H.environment),H.envMapRotation=H.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,Ue===void 0&&(M.addEventListener("dispose",Be),Ue=new Map,H.programs=Ue);let Oe=Ue.get(ge);if(Oe!==void 0){if(H.currentProgram===Oe&&H.lightsStateVersion===re)return _l(M,de),Oe}else de.uniforms=Me.getUniforms(M),M.onBeforeCompile(de,_),Oe=Me.acquireProgram(de,ge),Ue.set(ge,Oe),H.uniforms=de.uniforms;const we=H.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(we.clippingPlanes=Q.uniform),_l(M,de),H.needsLights=_d(M),H.lightsStateVersion=re,H.needsLights&&(we.ambientLightColor.value=F.state.ambient,we.lightProbe.value=F.state.probe,we.directionalLights.value=F.state.directional,we.directionalLightShadows.value=F.state.directionalShadow,we.spotLights.value=F.state.spot,we.spotLightShadows.value=F.state.spotShadow,we.rectAreaLights.value=F.state.rectArea,we.ltc_1.value=F.state.rectAreaLTC1,we.ltc_2.value=F.state.rectAreaLTC2,we.pointLights.value=F.state.point,we.pointLightShadows.value=F.state.pointShadow,we.hemisphereLights.value=F.state.hemi,we.directionalShadowMap.value=F.state.directionalShadowMap,we.directionalShadowMatrix.value=F.state.directionalShadowMatrix,we.spotShadowMap.value=F.state.spotShadowMap,we.spotLightMatrix.value=F.state.spotLightMatrix,we.spotLightMap.value=F.state.spotLightMap,we.pointShadowMap.value=F.state.pointShadowMap,we.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=Oe,H.uniformsList=null,Oe}function gl(M){if(M.uniformsList===null){const N=M.currentProgram.getUniforms();M.uniformsList=lo.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function _l(M,N){const z=Se.get(M);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.batchingColor=N.batchingColor,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.instancingMorph=N.instancingMorph,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function md(M,N,z,H,F){N.isScene!==!0&&(N=yt),w.resetTextureUnits();const J=N.fog,re=H.isMeshStandardMaterial?N.environment:null,de=C===null?_.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Is,ge=(H.isMeshStandardMaterial?k:y).get(H.envMap||re),Ue=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Oe=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),we=!!z.morphAttributes.position,et=!!z.morphAttributes.normal,ot=!!z.morphAttributes.color;let bt=ui;H.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(bt=_.toneMapping);const St=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,it=St!==void 0?St.length:0,Te=Se.get(H),kt=d.state.lights;if(ne===!0&&(xe===!0||M!==x)){const Yt=M===x&&H.id===S;Q.setState(H,M,Yt)}let at=!1;H.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==kt.state.version||Te.outputColorSpace!==de||F.isBatchedMesh&&Te.batching===!1||!F.isBatchedMesh&&Te.batching===!0||F.isBatchedMesh&&Te.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Te.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Te.instancing===!1||!F.isInstancedMesh&&Te.instancing===!0||F.isSkinnedMesh&&Te.skinning===!1||!F.isSkinnedMesh&&Te.skinning===!0||F.isInstancedMesh&&Te.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Te.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Te.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Te.instancingMorph===!1&&F.morphTexture!==null||Te.envMap!==ge||H.fog===!0&&Te.fog!==J||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==Q.numPlanes||Te.numIntersection!==Q.numIntersection)||Te.vertexAlphas!==Ue||Te.vertexTangents!==Oe||Te.morphTargets!==we||Te.morphNormals!==et||Te.morphColors!==ot||Te.toneMapping!==bt||Te.morphTargetsCount!==it)&&(at=!0):(at=!0,Te.__version=H.version);let _n=Te.currentProgram;at===!0&&(_n=br(H,N,F));let Vi=!1,en=!1,Bs=!1;const _t=_n.getUniforms(),ln=Te.uniforms;if(be.useProgram(_n.program)&&(Vi=!0,en=!0,Bs=!0),H.id!==S&&(S=H.id,en=!0),Vi||x!==M){be.buffers.depth.getReversed()?(oe.copy(M.projectionMatrix),Rf(oe),Cf(oe),_t.setValue(L,"projectionMatrix",oe)):_t.setValue(L,"projectionMatrix",M.projectionMatrix),_t.setValue(L,"viewMatrix",M.matrixWorldInverse);const Kt=_t.map.cameraPosition;Kt!==void 0&&Kt.setValue(L,Fe.setFromMatrixPosition(M.matrixWorld)),Ke.logarithmicDepthBuffer&&_t.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&_t.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),x!==M&&(x=M,en=!0,Bs=!0)}if(F.isSkinnedMesh){_t.setOptional(L,F,"bindMatrix"),_t.setOptional(L,F,"bindMatrixInverse");const Yt=F.skeleton;Yt&&(Yt.boneTexture===null&&Yt.computeBoneTexture(),_t.setValue(L,"boneTexture",Yt.boneTexture,w))}F.isBatchedMesh&&(_t.setOptional(L,F,"batchingTexture"),_t.setValue(L,"batchingTexture",F._matricesTexture,w),_t.setOptional(L,F,"batchingIdTexture"),_t.setValue(L,"batchingIdTexture",F._indirectTexture,w),_t.setOptional(L,F,"batchingColorTexture"),F._colorsTexture!==null&&_t.setValue(L,"batchingColorTexture",F._colorsTexture,w));const hn=z.morphAttributes;if((hn.position!==void 0||hn.normal!==void 0||hn.color!==void 0)&&De.update(F,z,_n),(en||Te.receiveShadow!==F.receiveShadow)&&(Te.receiveShadow=F.receiveShadow,_t.setValue(L,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(ln.envMap.value=ge,ln.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(ln.envMapIntensity.value=N.environmentIntensity),en&&(_t.setValue(L,"toneMappingExposure",_.toneMappingExposure),Te.needsLights&&gd(ln,Bs),J&&H.fog===!0&&ae.refreshFogUniforms(ln,J),ae.refreshMaterialUniforms(ln,H,G,K,d.state.transmissionRenderTarget[M.id]),lo.upload(L,gl(Te),ln,w)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(lo.upload(L,gl(Te),ln,w),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&_t.setValue(L,"center",F.center),_t.setValue(L,"modelViewMatrix",F.modelViewMatrix),_t.setValue(L,"normalMatrix",F.normalMatrix),_t.setValue(L,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Yt=H.uniformsGroups;for(let Kt=0,Wo=Yt.length;Kt<Wo;Kt++){const _i=Yt[Kt];U.update(_i,_n),U.bind(_i,_n)}}return _n}function gd(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function _d(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(M,N,z){Se.get(M.texture).__webglTexture=N,Se.get(M.depthTexture).__webglTexture=z;const H=Se.get(M);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=z===void 0,H.__autoAllocateDepthBuffer||je.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,N){const z=Se.get(M);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0};const vd=L.createFramebuffer();this.setRenderTarget=function(M,N=0,z=0){C=M,T=N,A=z;let H=!0,F=null,J=!1,re=!1;if(M){const ge=Se.get(M);if(ge.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(L.FRAMEBUFFER,null),H=!1;else if(ge.__webglFramebuffer===void 0)w.setupRenderTarget(M);else if(ge.__hasExternalTextures)w.rebindTextures(M,Se.get(M.texture).__webglTexture,Se.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const we=M.depthTexture;if(ge.__boundDepthTexture!==we){if(we!==null&&Se.has(we)&&(M.width!==we.image.width||M.height!==we.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");w.setupDepthRenderbuffer(M)}}const Ue=M.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(re=!0);const Oe=Se.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Oe[N])?F=Oe[N][z]:F=Oe[N],J=!0):M.samples>0&&w.useMultisampledRTT(M)===!1?F=Se.get(M).__webglMultisampledFramebuffer:Array.isArray(Oe)?F=Oe[z]:F=Oe,P.copy(M.viewport),B.copy(M.scissor),I=M.scissorTest}else P.copy(Ee).multiplyScalar(G).floor(),B.copy(Ge).multiplyScalar(G).floor(),I=dt;if(z!==0&&(F=vd),be.bindFramebuffer(L.FRAMEBUFFER,F)&&H&&be.drawBuffers(M,F),be.viewport(P),be.scissor(B),be.setScissorTest(I),J){const ge=Se.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,z)}else if(re){const ge=Se.get(M.texture),Ue=N;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,ge.__webglTexture,z,Ue)}else if(M!==null&&z!==0){const ge=Se.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ge.__webglTexture,z)}S=-1},this.readRenderTargetPixels=function(M,N,z,H,F,J,re){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let de=Se.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&re!==void 0&&(de=de[re]),de){be.bindFramebuffer(L.FRAMEBUFFER,de);try{const ge=M.texture,Ue=ge.format,Oe=ge.type;if(!Ke.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ke.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-H&&z>=0&&z<=M.height-F&&L.readPixels(N,z,H,F,He.convert(Ue),He.convert(Oe),J)}finally{const ge=C!==null?Se.get(C).__webglFramebuffer:null;be.bindFramebuffer(L.FRAMEBUFFER,ge)}}},this.readRenderTargetPixelsAsync=async function(M,N,z,H,F,J,re){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let de=Se.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&re!==void 0&&(de=de[re]),de){const ge=M.texture,Ue=ge.format,Oe=ge.type;if(!Ke.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ke.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=M.width-H&&z>=0&&z<=M.height-F){be.bindFramebuffer(L.FRAMEBUFFER,de);const we=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,we),L.bufferData(L.PIXEL_PACK_BUFFER,J.byteLength,L.STREAM_READ),L.readPixels(N,z,H,F,He.convert(Ue),He.convert(Oe),0);const et=C!==null?Se.get(C).__webglFramebuffer:null;be.bindFramebuffer(L.FRAMEBUFFER,et);const ot=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Af(L,ot,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,we),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,J),L.deleteBuffer(we),L.deleteSync(ot),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,N=null,z=0){M.isTexture!==!0&&(cs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,M=arguments[1]);const H=Math.pow(2,-z),F=Math.floor(M.image.width*H),J=Math.floor(M.image.height*H),re=N!==null?N.x:0,de=N!==null?N.y:0;w.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,z,0,0,re,de,F,J),be.unbindTexture()};const xd=L.createFramebuffer(),yd=L.createFramebuffer();this.copyTextureToTexture=function(M,N,z=null,H=null,F=0,J=null){M.isTexture!==!0&&(cs("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,M=arguments[1],N=arguments[2],J=arguments[3]||0,z=null),J===null&&(F!==0?(cs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),J=F,F=0):J=0);let re,de,ge,Ue,Oe,we,et,ot,bt;const St=M.isCompressedTexture?M.mipmaps[J]:M.image;if(z!==null)re=z.max.x-z.min.x,de=z.max.y-z.min.y,ge=z.isBox3?z.max.z-z.min.z:1,Ue=z.min.x,Oe=z.min.y,we=z.isBox3?z.min.z:0;else{const hn=Math.pow(2,-F);re=Math.floor(St.width*hn),de=Math.floor(St.height*hn),M.isDataArrayTexture?ge=St.depth:M.isData3DTexture?ge=Math.floor(St.depth*hn):ge=1,Ue=0,Oe=0,we=0}H!==null?(et=H.x,ot=H.y,bt=H.z):(et=0,ot=0,bt=0);const it=He.convert(N.format),Te=He.convert(N.type);let kt;N.isData3DTexture?(w.setTexture3D(N,0),kt=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(w.setTexture2DArray(N,0),kt=L.TEXTURE_2D_ARRAY):(w.setTexture2D(N,0),kt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);const at=L.getParameter(L.UNPACK_ROW_LENGTH),_n=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Vi=L.getParameter(L.UNPACK_SKIP_PIXELS),en=L.getParameter(L.UNPACK_SKIP_ROWS),Bs=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,St.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,St.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ue),L.pixelStorei(L.UNPACK_SKIP_ROWS,Oe),L.pixelStorei(L.UNPACK_SKIP_IMAGES,we);const _t=M.isDataArrayTexture||M.isData3DTexture,ln=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){const hn=Se.get(M),Yt=Se.get(N),Kt=Se.get(hn.__renderTarget),Wo=Se.get(Yt.__renderTarget);be.bindFramebuffer(L.READ_FRAMEBUFFER,Kt.__webglFramebuffer),be.bindFramebuffer(L.DRAW_FRAMEBUFFER,Wo.__webglFramebuffer);for(let _i=0;_i<ge;_i++)_t&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Se.get(M).__webglTexture,F,we+_i),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Se.get(N).__webglTexture,J,bt+_i)),L.blitFramebuffer(Ue,Oe,re,de,et,ot,re,de,L.DEPTH_BUFFER_BIT,L.NEAREST);be.bindFramebuffer(L.READ_FRAMEBUFFER,null),be.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(F!==0||M.isRenderTargetTexture||Se.has(M)){const hn=Se.get(M),Yt=Se.get(N);be.bindFramebuffer(L.READ_FRAMEBUFFER,xd),be.bindFramebuffer(L.DRAW_FRAMEBUFFER,yd);for(let Kt=0;Kt<ge;Kt++)_t?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,hn.__webglTexture,F,we+Kt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,hn.__webglTexture,F),ln?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Yt.__webglTexture,J,bt+Kt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Yt.__webglTexture,J),F!==0?L.blitFramebuffer(Ue,Oe,re,de,et,ot,re,de,L.COLOR_BUFFER_BIT,L.NEAREST):ln?L.copyTexSubImage3D(kt,J,et,ot,bt+Kt,Ue,Oe,re,de):L.copyTexSubImage2D(kt,J,et,ot,Ue,Oe,re,de);be.bindFramebuffer(L.READ_FRAMEBUFFER,null),be.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ln?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(kt,J,et,ot,bt,re,de,ge,it,Te,St.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(kt,J,et,ot,bt,re,de,ge,it,St.data):L.texSubImage3D(kt,J,et,ot,bt,re,de,ge,it,Te,St):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,J,et,ot,re,de,it,Te,St.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,J,et,ot,St.width,St.height,it,St.data):L.texSubImage2D(L.TEXTURE_2D,J,et,ot,re,de,it,Te,St);L.pixelStorei(L.UNPACK_ROW_LENGTH,at),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,_n),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Vi),L.pixelStorei(L.UNPACK_SKIP_ROWS,en),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Bs),J===0&&N.generateMipmaps&&L.generateMipmap(kt),be.unbindTexture()},this.copyTextureToTexture3D=function(M,N,z=null,H=null,F=0){return M.isTexture!==!0&&(cs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,H=arguments[1]||null,M=arguments[2],N=arguments[3],F=arguments[4]||0),cs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,N,z,H,F)},this.initRenderTarget=function(M){Se.get(M).__webglFramebuffer===void 0&&w.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?w.setTextureCube(M,0):M.isData3DTexture?w.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?w.setTexture2DArray(M,0):w.setTexture2D(M,0),be.unbindTexture()},this.resetState=function(){T=0,A=0,C=null,be.reset(),pt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return $n}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=st._getDrawingBufferColorSpace(e),t.unpackColorSpace=st._getUnpackColorSpace()}}const En=256,Ms=100,Uu=82,ho=32,wh=En/ho,Ss=2,Ci=En/Ss+1,K_=16,Th=120,Z_=50,J_=100,Q_=6,ev=4.4,tv=3.2,nv=9,iv=36,sv=44,rv=9,ov=6.5,av=22,Mr=.4,cv=1.8,Zc=1.62,lv=1.22,hv=1.02,Jc=6,uv=1.2,Ah=80,Rh=5,dv=12,fv=i=>3*i,pv=180,mv=480,Ch=pv,gv=mv,_v={frag:"grenade",smoke:"smoke",flash:"flash"},Fi={fists:{type:"fists",kind:"melee",damage:8,cooldown:.5,range:1.5,loud:!1},machete:{type:"machete",kind:"melee",damage:35,cooldown:.6,range:2,loud:!1},spear:{type:"spear",kind:"melee",damage:28,cooldown:.8,range:3.5,loud:!1},bow:{type:"bow",kind:"projectile",damage:40,headshotDamage:70,cooldown:1,range:120,ammo:"arrow",projectileSpeed:40,loud:!1},pistol:{type:"pistol",kind:"hitscan",damage:22,cooldown:.25,range:60,ammo:"pistol",magSize:7,falloffStart:30,falloffEnd:60,loud:!0,reloadTime:1.4,hipSpread:.018,aimSpread:.002,moveSpread:.012,recoilPitch:.013,recoilYaw:.006},rifle:{type:"rifle",kind:"hitscan",damage:30,cooldown:.15,range:120,ammo:"rifle",magSize:20,falloffStart:80,falloffEnd:120,loud:!0,reloadTime:2,hipSpread:.012,aimSpread:.0015,moveSpread:.016,recoilPitch:.011,recoilYaw:.005},shotgun:{type:"shotgun",kind:"hitscan",damage:12,cooldown:.9,range:24,pellets:8,ammo:"shell",magSize:5,falloffStart:8,falloffEnd:20,loud:!0,reloadTime:2.2,hipSpread:.065,aimSpread:.038,moveSpread:.015,recoilPitch:.035,recoilYaw:.012},sniper:{type:"sniper",kind:"hitscan",damage:75,cooldown:1.3,range:200,ammo:"sniper",magSize:5,loud:!0,reloadTime:3.2,aimFov:25,hipSpread:.09,aimSpread:6e-4,moveSpread:.05,recoilPitch:.06,recoilYaw:.009},grenade:{type:"grenade",kind:"throwable",damage:60,cooldown:.8,range:5,projectileSpeed:16,loud:!0},smoke:{type:"smoke",kind:"throwable",damage:0,cooldown:.8,range:4.5,projectileSpeed:14,loud:!1},flash:{type:"flash",kind:"throwable",damage:0,cooldown:.8,range:14,projectileSpeed:16,loud:!0}},Ec=3,ur=4,Ph=1.2,vv=1.5,xv=1,yv=100,Mv=.6;function rn(i){let e=i>>>0;return function(){e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function on(i,e){let t=i>>>0;for(let n=0;n<e.length;n++)t=Math.imul(t^e.charCodeAt(n),2654435761),t=t<<13|t>>>19;return t>>>0}const bi=(i,e,t)=>e+i()*(t-e);function Lh(i,e){return e[Math.floor(i()*e.length)]}function Jr(i,e,t){let n=i^Math.imul(e,374761393)^Math.imul(t,668265263)|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}const Ea=i=>i*i*(3-2*i),uo=(i,e,t)=>i+(e-i)*t,dr=(i,e,t)=>Math.min(t,Math.max(e,i));function Qr(i,e,t){const n=dr((t-i)/(e-i),0,1);return n*n*(3-2*n)}function Sv(i,e,t){const n=Math.floor(e),s=Math.floor(t),r=e-n,o=t-s,a=Jr(i,n,s),c=Jr(i,n+1,s),l=Jr(i,n,s+1),h=Jr(i,n+1,s+1);return uo(uo(a,c,Ea(r)),uo(l,h,Ea(r)),Ea(o))}function Ev(i,e,t,n=4){let s=.5,r=1,o=0,a=0;for(let c=0;c<n;c++)o+=s*Sv(i+c*1013,e*r,t*r),a+=s,s*=.5,r*=2;return o/a}function bv(i){const e=on(i,"plateau")/4294967296*Math.PI*2;return{seed:on(i,"terrain"),plateauAngle:e}}function Nu(i){return{x:Math.cos(i.plateauAngle)*55,z:Math.sin(i.plateauAngle)*55}}const ms=20,Ro=5.5,Ih=16,wv=7;function Tt(i,e,t){const n=Math.hypot(e,t);let r=1.5+Ev(i.seed,e/48+100,t/48+100)*(K_-4);const o=1-Qr(Uu,Ms,n),a=Qr(Ms,Ms+14,n);r=r*o+1.1*(1-o),r-=a*8;const c=Nu(i),l=Math.hypot(e-c.x,t-c.z);r+=(1-Qr(Ih*.4,Ih,l))*wv*o;const h=1-Qr(ms*.55,ms,n);return r=uo(r,Ro,h),r}function Tv(i){const e=new Float32Array(Ci*Ci);for(let t=0;t<Ci;t++)for(let n=0;n<Ci;n++){const s=-128+n*Ss,r=-128+t*Ss;e[t*Ci+n]=Tt(i,s,r)}return e}const Av=(i,e,t)=>Tt(i,e,t)>.6&&Math.hypot(e,t)<Ms,bc=(cv-2*Mr)/2,Fu=(lv-2*Mr)/2,Dh=Fu+Mr,ba=bc+Mr;function Rv(i){const e=Ci,t=new Float32Array(e*e);for(let n=0;n<e;n++)for(let s=0;s<e;s++)t[s*e+n]=i[n*e+s];return t}class Cv{R;world;controller;players=new Map;handleToPlayer=new Map;sneakingPlayers=new Set;constructor(e,t,n){this.R=e,this.world=new e.World({x:0,y:-9.81,z:0});const s=Rv(n??Tv(t.params)),r=Ci-1;this.world.createCollider(e.ColliderDesc.heightfield(r,r,s,{x:En,y:1,z:En}).setTranslation(0,0,0));for(const o of t.vegetation){if(o.colliderRadius<=0)continue;const a=o.kind==="tree"?5*o.scale:1.6*o.scale;this.world.createCollider(e.ColliderDesc.cylinder(a/2,o.colliderRadius).setTranslation(o.x,o.y+a/2,o.z))}for(const o of t.ruinWalls){const a=Pv(t.params);this.world.createCollider(e.ColliderDesc.cuboid(o.w/2,o.h/2,o.d/2).setTranslation(o.x,a+o.h/2,o.z).setRotation(Uh(o.rotY)))}for(const o of t.pois)for(const a of o.structures){if(!a.collider)continue;const c=Tt(t.params,a.x,a.z);this.world.createCollider(e.ColliderDesc.cuboid(a.w/2,a.h/2,a.d/2).setTranslation(a.x,c+(a.yOffset??0)+a.h/2,a.z).setRotation(Uh(a.rotY)))}this.controller=this.world.createCharacterController(.05),this.controller.enableAutostep(.6,.3,!0),this.controller.enableSnapToGround(.5),this.controller.setMaxSlopeClimbAngle(60*Math.PI/180),this.controller.setMinSlopeSlideAngle(75*Math.PI/180),this.world.step()}addPlayer(e,t){const n=this.R.ColliderDesc.capsule(bc,Mr).setTranslation(t.x,t.y+ba,t.z),s=this.world.createCollider(n);this.players.set(e,s),this.handleToPlayer.set(s.handle,e)}removePlayer(e){const t=this.players.get(e);t&&(this.handleToPlayer.delete(t.handle),this.world.removeCollider(t,!1),this.players.delete(e),this.sneakingPlayers.delete(e))}setPlayerPos(e,t){const n=this.players.get(e),s=this.sneakingPlayers.has(e)?Dh:ba;n?.setTranslation({x:t.x,y:t.y+s,z:t.z})}setPlayerSneaking(e,t,n){const s=this.players.get(e);!s||t===this.sneakingPlayers.has(e)||(t?this.sneakingPlayers.add(e):this.sneakingPlayers.delete(e),s.setHalfHeight(t?Fu:bc),this.setPlayerPos(e,n))}playerIdForHandle(e){return this.handleToPlayer.get(e)??null}moveCharacter(e,t){const n=this.players.get(e);if(!n)throw new Error(`no collider for ${e}`);this.controller.computeColliderMovement(n,t,void 0,void 0,f=>!this.handleToPlayer.has(f.handle));const s=this.controller.computedMovement(),r=n.translation(),o=this.sneakingPlayers.has(e)?Dh:ba;let a=r.x+s.x,c=r.y+s.y,l=r.z+s.z;const h=Math.hypot(a,l),u=En/2-6;return h>u&&(a*=u/h,l*=u/h),n.setTranslation({x:a,y:c,z:l}),{pos:{x:a,y:c-o,z:l},grounded:this.controller.computedGrounded()}}raycast(e,t,n,s){const r=new this.R.Ray(e,t),o=new Set((s??[]).map(l=>this.players.get(l)?.handle).filter(l=>l!==void 0)),a=this.world.castRay(r,n,!0,void 0,void 0,void 0,void 0,l=>!o.has(l.handle));if(!a)return null;const c=r.pointAt(a.timeOfImpact);return{dist:a.timeOfImpact,point:{x:c.x,y:c.y,z:c.z},playerId:this.handleToPlayer.get(a.collider.handle)??null}}step(){this.world.step()}stats(){return{engine:"Rapier",timestep:this.world.timestep,rigidBodies:this.world.bodies.len(),colliders:this.world.colliders.len(),playerCapsules:this.players.size,ccdBodies:0,sensors:0}}dispose(){this.players.clear(),this.handleToPlayer.clear(),this.sneakingPlayers.clear(),this.world.free()}}function Uh(i){return{x:0,y:Math.sin(i/2),z:0,w:Math.cos(i/2)}}function Pv(i){return Ro-.3}const Ou=.05;function ku(i){return{pos:{...i},velX:0,velY:0,velZ:0,grounded:!1,stamina:Jc,sprinting:!1,sneaking:!1}}function Bu(i,e,t,n){const s=dr(n.dt,.001,Ou);let r=dr(n.mx,-1,1),o=dr(n.mz,-1,1);const a=Math.hypot(r,o);a>1&&(r/=a,o/=a);const c=a>.01;t.sneaking=n.sneak,i.setPlayerSneaking(e,t.sneaking,t.pos);const l=n.sprint&&!n.aim&&!t.sneaking&&c&&t.stamina>0;t.sprinting=l,t.stamina=l?Math.max(0,t.stamina-s):Math.min(Jc,t.stamina+uv*s);const h=t.sneaking?tv:n.aim?ev:l?nv:Q_,u=Math.sin(n.yaw),f=Math.cos(n.yaw),m={x:-u,z:-f},g={x:f,z:-u},v=(g.x*r+m.x*o)*h,p=(g.z*r+m.z*o)*h,d=t.grounded?c?iv:sv:c?rv:0,b=(x,P,B)=>{const I=P-x;return x+Math.sign(I)*Math.min(Math.abs(I),B)};t.velX=b(t.velX,v,d*s),t.velZ=b(t.velZ,p,d*s);const E=t.velX*s,_=t.velZ*s;t.grounded&&n.jump&&!t.sneaking&&(t.velY=ov),t.velY=Math.max(-30,t.velY-av*s);const R=t.velY*s,T=t.pos,A=i.moveCharacter(e,{x:E,y:R,z:_}),C=(A.pos.x-T.x)/s,S=(A.pos.z-T.z)/s;Math.abs(C)<Math.abs(t.velX)*.2&&(t.velX=C),Math.abs(S)<Math.abs(t.velZ)*.2&&(t.velZ=S),t.pos=A.pos,t.grounded=A.grounded,t.grounded&&t.velY<0&&(t.velY=-1)}const Lv=["machete","spear"],Iv=["pistol","bow"];function wa(i,e,t){for(let n=0;n<200;n++){const s=i()*Math.PI*2,r=Math.sqrt(i())*(Ms-6),o=Math.cos(s)*r,a=Math.sin(s)*r;if(Av(e,o,a)&&t(o,a))return{x:o,z:a}}return{x:0,z:40}}function Dv(i,e){const t=bv(i),n=Nu(t),r=rn(on(i,"spawn-ring"))()*Math.PI*2,o=[];for(let I=0;I<Rh;I++){const O=r+I*2*Math.PI/Rh;o.push({index:I,x:Math.cos(O)*Ah,z:Math.sin(O)*Ah,angle:O})}const a=r+Math.PI*.34,c={x:Math.cos(a)*88,z:Math.sin(a)*88},l=a+Math.PI/2,h=r+Math.PI*1.22,u={x:Math.cos(h)*55,z:Math.sin(h)*55},f=h+Math.PI/2,m=[{id:"wreck",name:"Strandwrack",x:c.x,z:c.z,risk:"high",structures:[{x:c.x,z:c.z,w:10,d:3.2,h:1.6,rotY:l,material:"wood",collider:!0},{x:c.x+Math.cos(a)*.8,z:c.z+Math.sin(a)*.8,w:.55,d:.55,h:8.5,rotY:l,material:"wood",collider:!0},{x:c.x+Math.cos(l)*3.6,z:c.z+Math.sin(l)*3.6,w:5.5,d:.45,h:2.6,rotY:l+.3,material:"wood",collider:!0}]},{id:"watchtower",name:"Aussichtsposten",x:n.x,z:n.z,risk:"high",structures:[...[-1,1].flatMap(I=>[-1,1].map(O=>({x:n.x+I*2.1,z:n.z+O*2.1,w:.45,d:.45,h:5.5,rotY:0,material:"wood",collider:!0}))),...Array.from({length:12},(I,O)=>({x:n.x,z:n.z+7.5-O*.58,w:1.8,d:.62,h:(O+1)*.42,rotY:0,material:"wood",collider:!0})),{x:n.x,z:n.z,w:5.6,d:5.6,h:.45,yOffset:5.04,rotY:0,material:"wood",collider:!0},{x:n.x,z:n.z,w:6.4,d:6.4,h:.3,yOffset:7.2,rotY:0,material:"metal",collider:!1}]},{id:"bunker",name:"Waldbunker",x:u.x,z:u.z,risk:"medium",structures:[{x:u.x,z:u.z,w:8.5,d:6.5,h:.45,yOffset:2.4,rotY:f,material:"stone",collider:!1},{x:u.x+Math.cos(f)*3.9,z:u.z+Math.sin(f)*3.9,w:.7,d:6.5,h:2.4,rotY:f,material:"stone",collider:!0},{x:u.x-Math.cos(f)*3.9,z:u.z-Math.sin(f)*3.9,w:.7,d:6.5,h:2.4,rotY:f,material:"stone",collider:!0},{x:u.x+Math.sin(f)*2.9,z:u.z+Math.cos(f)*2.9,w:8.5,d:.7,h:2.4,rotY:f,material:"stone",collider:!0}]}],g=rn(on(i,"ruins")),v=[],p=g()*Math.PI*2;for(let I=0;I<8;I++){const O=p+I/8*Math.PI*2+bi(g,-.15,.15);if(g()<.22)continue;const V=bi(g,8,14);v.push({x:Math.cos(O)*V,z:Math.sin(O)*V,w:bi(g,4,7),d:.8,h:bi(g,2.2,3.6),rotY:O+Math.PI/2})}v.push({x:3,z:0,w:5,d:.8,h:2.6,rotY:p}),v.push({x:-3,z:2,w:4,d:.8,h:2.2,rotY:p+Math.PI/2});const d=rn(on(i,"crates")),b=[];let E=0;const _=(I,O,V,X)=>b.push({id:`crate-${E++}`,x:I,z:O,tier:V,poi:X});for(let I=0;I<3;I++){const O=d()*Math.PI*2,V=bi(d,3,ms*.7);_(Math.cos(O)*V,Math.sin(O)*V,"top","ruins")}for(let I=0;I<3;I++){const O=(I-1)*2.3;_(c.x+Math.cos(l)*O,c.z+Math.sin(l)*O,"top","wreck")}for(let I=0;I<2;I++)_(n.x+(I?3.3:-3.3),n.z+(I?-1.2:1.2),I===0?"top":"good","watchtower");for(let I=0;I<2;I++)_(u.x+Math.cos(f)*(I?1.9:-1.9),u.z+Math.sin(f)*(I?1.9:-1.9),"good","bunker");for(let I=0;I<2;I++){const O=wa(d,t,(V,X)=>Math.hypot(V,X)>ms+8&&Math.hypot(V,X)<Uu-5);_(O.x,O.z,"common","forest")}if(b.length!==dv)throw new Error("fixed crate count mismatch");const R=rn(on(i,"scatter"));for(let I=0;I<fv(e);I++){const O=wa(R,t,(V,X)=>Math.hypot(V,X)>ms);_(O.x,O.z,R()<.3?"good":"common","scatter")}const T=rn(on(i,"floor")),A=[];for(const I of o){const O=Lh(T,Lv),V=Lh(T,Iv);[O,V,"bandageItem","bandageItem"].forEach((K,G)=>{const te=T()*Math.PI*2,ce=bi(T,2,9);A.push({id:`spawn${I.index}-item${G}`,item:K,x:I.x+Math.cos(te)*ce,z:I.z+Math.sin(te)*ce})})}const C=rn(on(i,"veg")),S=[];let x=0;const P=(I,O)=>{if(Math.hypot(I,O)<ms+4)return!1;for(const V of o)if(Math.hypot(I-V.x,O-V.z)<5)return!1;for(const V of b)if(Math.hypot(I-V.x,O-V.z)<2.5)return!1;for(const V of m)if(Math.hypot(I-V.x,O-V.z)<(V.id==="wreck"?8:7))return!1;return!0},B=(I,O,V,X,K)=>{for(let G=0;G<O;G++){const te=wa(C,t,P),ce=bi(C,X,K);S.push({id:x++,kind:I,x:te.x,z:te.z,y:Tt(t,te.x,te.z),scale:ce,rot:C()*Math.PI*2,colliderRadius:V*ce})}};return B("tree",220,.35,.8,1.5),B("rock",70,.9,.7,1.6),B("bush",190,0,.8,1.45),{seed:i,n:e,params:t,spawns:o,plateau:n,pois:m,ruinWalls:v,vegetation:S,crates:b,spawnFloorItems:A,carePackagePos:{x:0,z:0}}}function Qc(i,e,t){let n=null,s=1/0;for(const r of i.vegetation){if(r.kind!=="bush")continue;const o=Math.hypot(e-r.x,t-r.z);o<=.95*r.scale&&o<s&&(n=r,s=o)}return n}const Uv=25;function Js(){return{version:1,career:{matches:0,wins:0,kills:0,deaths:0,damageDealt:0,damageTaken:0,headshots:0,shotsFired:0,hits:0,roundsPlayed:0,bestPlacement:0},history:[]}}function Nv(i,e){const t={date:e.date??new Date().toISOString(),seed:e.seed,placement:e.placement,points:e.points,kills:e.stats.kills,deaths:e.deaths,headshots:e.stats.headshots,damageDealt:e.stats.damageDealt,players:e.players,practice:e.practice},n={...i.career};return e.practice||(n.matches+=1,e.placement===1&&(n.wins+=1),n.kills+=e.stats.kills,n.deaths+=e.deaths,n.damageDealt+=e.stats.damageDealt,n.damageTaken+=e.stats.damageTaken,n.headshots+=e.stats.headshots,n.shotsFired+=e.stats.shotsFired,n.hits+=e.stats.hits,n.roundsPlayed+=e.rounds,n.bestPlacement=n.bestPlacement===0?e.placement:Math.min(n.bestPlacement,e.placement)),{version:1,career:n,history:[t,...i.history].slice(0,Uv)}}function Fv(i){return i.shotsFired>0?Math.round(i.hits/i.shotsFired*100):null}function Ov(i){return i.deaths===0?i.kills>0?`${i.kills.toFixed(1)}`:"—":(i.kills/i.deaths).toFixed(2)}const zu=i=>`islandProfile:${i.trim().toLocaleLowerCase()}`;function Hu(i){try{const e=localStorage.getItem(zu(i));if(!e)return Js();const t=JSON.parse(e);return t?.version!==1||!t.career||!Array.isArray(t.history)?Js():{...Js(),...t,career:{...Js().career,...t.career}}}catch{return Js()}}function kv(i,e){try{localStorage.setItem(zu(i),JSON.stringify(e))}catch{}}const On=Object.create(null);On.open="0";On.close="1";On.ping="2";On.pong="3";On.message="4";On.upgrade="5";On.noop="6";const fo=Object.create(null);Object.keys(On).forEach(i=>{fo[On[i]]=i});const wc={type:"error",data:"parser error"},Vu=typeof Blob=="function"||typeof Blob<"u"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",Gu=typeof ArrayBuffer=="function",Wu=i=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(i):i&&i.buffer instanceof ArrayBuffer,el=({type:i,data:e},t,n)=>Vu&&e instanceof Blob?t?n(e):Nh(e,n):Gu&&(e instanceof ArrayBuffer||Wu(e))?t?n(e):Nh(new Blob([e]),n):n(On[i]+(e||"")),Nh=(i,e)=>{const t=new FileReader;return t.onload=function(){const n=t.result.split(",")[1];e("b"+(n||""))},t.readAsDataURL(i)};function Fh(i){return i instanceof Uint8Array?i:i instanceof ArrayBuffer?new Uint8Array(i):new Uint8Array(i.buffer,i.byteOffset,i.byteLength)}let Ta;function Bv(i,e){if(Vu&&i.data instanceof Blob)return i.data.arrayBuffer().then(Fh).then(e);if(Gu&&(i.data instanceof ArrayBuffer||Wu(i.data)))return e(Fh(i.data));el(i,!1,t=>{Ta||(Ta=new TextEncoder),e(Ta.encode(t))})}const Oh="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",ir=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(let i=0;i<Oh.length;i++)ir[Oh.charCodeAt(i)]=i;const zv=i=>{let e=i.length*.75,t=i.length,n,s=0,r,o,a,c;i[i.length-1]==="="&&(e--,i[i.length-2]==="="&&e--);const l=new ArrayBuffer(e),h=new Uint8Array(l);for(n=0;n<t;n+=4)r=ir[i.charCodeAt(n)],o=ir[i.charCodeAt(n+1)],a=ir[i.charCodeAt(n+2)],c=ir[i.charCodeAt(n+3)],h[s++]=r<<2|o>>4,h[s++]=(o&15)<<4|a>>2,h[s++]=(a&3)<<6|c&63;return l},Hv=typeof ArrayBuffer=="function",tl=(i,e)=>{if(typeof i!="string")return{type:"message",data:Xu(i,e)};const t=i.charAt(0);return t==="b"?{type:"message",data:Vv(i.substring(1),e)}:fo[t]?i.length>1?{type:fo[t],data:i.substring(1)}:{type:fo[t]}:wc},Vv=(i,e)=>{if(Hv){const t=zv(i);return Xu(t,e)}else return{base64:!0,data:i}},Xu=(i,e)=>{switch(e){case"blob":return i instanceof Blob?i:new Blob([i]);case"arraybuffer":default:return i instanceof ArrayBuffer?i:i.buffer}},qu="",Gv=(i,e)=>{const t=i.length,n=new Array(t);let s=0;i.forEach((r,o)=>{el(r,!1,a=>{n[o]=a,++s===t&&e(n.join(qu))})})},Wv=(i,e)=>{const t=i.split(qu),n=[];for(let s=0;s<t.length;s++){const r=tl(t[s],e);if(n.push(r),r.type==="error")break}return n};function Xv(){return new TransformStream({transform(i,e){Bv(i,t=>{const n=t.length;let s;if(n<126)s=new Uint8Array(1),new DataView(s.buffer).setUint8(0,n);else if(n<65536){s=new Uint8Array(3);const r=new DataView(s.buffer);r.setUint8(0,126),r.setUint16(1,n)}else{s=new Uint8Array(9);const r=new DataView(s.buffer);r.setUint8(0,127),r.setBigUint64(1,BigInt(n))}i.data&&typeof i.data!="string"&&(s[0]|=128),e.enqueue(s),e.enqueue(t)})}})}let Aa;function eo(i){return i.reduce((e,t)=>e+t.length,0)}function to(i,e){if(i[0].length===e)return i.shift();const t=new Uint8Array(e);let n=0;for(let s=0;s<e;s++)t[s]=i[0][n++],n===i[0].length&&(i.shift(),n=0);return i.length&&n<i[0].length&&(i[0]=i[0].slice(n)),t}function qv(i,e){Aa||(Aa=new TextDecoder);const t=[];let n=0,s=-1,r=!1;return new TransformStream({transform(o,a){for(t.push(o);;){if(n===0){if(eo(t)<1)break;const c=to(t,1);r=(c[0]&128)===128,s=c[0]&127,s<126?n=3:s===126?n=1:n=2}else if(n===1){if(eo(t)<2)break;const c=to(t,2);s=new DataView(c.buffer,c.byteOffset,c.length).getUint16(0),n=3}else if(n===2){if(eo(t)<8)break;const c=to(t,8),l=new DataView(c.buffer,c.byteOffset,c.length),h=l.getUint32(0);if(h>Math.pow(2,21)-1){a.enqueue(wc);break}s=h*Math.pow(2,32)+l.getUint32(4),n=3}else{if(eo(t)<s)break;const c=to(t,s);a.enqueue(tl(r?c:Aa.decode(c),e)),n=0}if(s===0||s>i){a.enqueue(wc);break}}}})}const Yu=4;function Rt(i){if(i)return Yv(i)}function Yv(i){for(var e in Rt.prototype)i[e]=Rt.prototype[e];return i}Rt.prototype.on=Rt.prototype.addEventListener=function(i,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+i]=this._callbacks["$"+i]||[]).push(e),this};Rt.prototype.once=function(i,e){function t(){this.off(i,t),e.apply(this,arguments)}return t.fn=e,this.on(i,t),this};Rt.prototype.off=Rt.prototype.removeListener=Rt.prototype.removeAllListeners=Rt.prototype.removeEventListener=function(i,e){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var t=this._callbacks["$"+i];if(!t)return this;if(arguments.length==1)return delete this._callbacks["$"+i],this;for(var n,s=0;s<t.length;s++)if(n=t[s],n===e||n.fn===e){t.splice(s,1);break}return t.length===0&&delete this._callbacks["$"+i],this};Rt.prototype.emit=function(i){this._callbacks=this._callbacks||{};for(var e=new Array(arguments.length-1),t=this._callbacks["$"+i],n=1;n<arguments.length;n++)e[n-1]=arguments[n];if(t){t=t.slice(0);for(var n=0,s=t.length;n<s;++n)t[n].apply(this,e)}return this};Rt.prototype.emitReserved=Rt.prototype.emit;Rt.prototype.listeners=function(i){return this._callbacks=this._callbacks||{},this._callbacks["$"+i]||[]};Rt.prototype.hasListeners=function(i){return!!this.listeners(i).length};const Bo=typeof Promise=="function"&&typeof Promise.resolve=="function"?e=>Promise.resolve().then(e):(e,t)=>t(e,0),fn=typeof self<"u"?self:typeof window<"u"?window:Function("return this")(),$v="arraybuffer";function $u(i,...e){return e.reduce((t,n)=>(i.hasOwnProperty(n)&&(t[n]=i[n]),t),{})}const jv=fn.setTimeout,Kv=fn.clearTimeout;function zo(i,e){e.useNativeTimers?(i.setTimeoutFn=jv.bind(fn),i.clearTimeoutFn=Kv.bind(fn)):(i.setTimeoutFn=fn.setTimeout.bind(fn),i.clearTimeoutFn=fn.clearTimeout.bind(fn))}const Zv=1.33;function Jv(i){return typeof i=="string"?Qv(i):Math.ceil((i.byteLength||i.size)*Zv)}function Qv(i){let e=0,t=0;for(let n=0,s=i.length;n<s;n++)e=i.charCodeAt(n),e<128?t+=1:e<2048?t+=2:e<55296||e>=57344?t+=3:(n++,t+=4);return t}function ju(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function ex(i){let e="";for(let t in i)i.hasOwnProperty(t)&&(e.length&&(e+="&"),e+=encodeURIComponent(t)+"="+encodeURIComponent(i[t]));return e}function tx(i){let e={},t=i.split("&");for(let n=0,s=t.length;n<s;n++){let r=t[n].split("=");e[decodeURIComponent(r[0])]=decodeURIComponent(r[1])}return e}class nx extends Error{constructor(e,t,n){super(e),this.description=t,this.context=n,this.type="TransportError"}}class nl extends Rt{constructor(e){super(),this.writable=!1,zo(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,t,n){return super.emitReserved("error",new nx(e,t,n)),this}open(){return this.readyState="opening",this.doOpen(),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(e){this.readyState==="open"&&this.write(e)}onOpen(){this.readyState="open",this.writable=!0,super.emitReserved("open")}onData(e){const t=tl(e,this.socket.binaryType);this.onPacket(t)}onPacket(e){super.emitReserved("packet",e)}onClose(e){this.readyState="closed",super.emitReserved("close",e)}pause(e){}createUri(e,t={}){return e+"://"+this._hostname()+this._port()+this.opts.path+this._query(t)}_hostname(){const e=this.opts.hostname;return e.indexOf(":")===-1?e:"["+e+"]"}_port(){return this.opts.port&&(this.opts.secure&&Number(this.opts.port)!==443||!this.opts.secure&&Number(this.opts.port)!==80)?":"+this.opts.port:""}_query(e){const t=ex(e);return t.length?"?"+t:""}}class ix extends nl{constructor(){super(...arguments),this._polling=!1}get name(){return"polling"}doOpen(){this._poll()}pause(e){this.readyState="pausing";const t=()=>{this.readyState="paused",e()};if(this._polling||!this.writable){let n=0;this._polling&&(n++,this.once("pollComplete",function(){--n||t()})),this.writable||(n++,this.once("drain",function(){--n||t()}))}else t()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved("poll")}onData(e){const t=n=>{if(this.readyState==="opening"&&n.type==="open"&&this.onOpen(),n.type==="close")return this.onClose({description:"transport closed by the server"}),!1;this.onPacket(n)};Wv(e,this.socket.binaryType).forEach(t),this.readyState!=="closed"&&(this._polling=!1,this.emitReserved("pollComplete"),this.readyState==="open"&&this._poll())}doClose(){const e=()=>{this.write([{type:"close"}])};this.readyState==="open"?e():this.once("open",e)}write(e){this.writable=!1,Gv(e,t=>{this.doWrite(t,()=>{this.writable=!0,this.emitReserved("drain")})})}uri(){const e=this.opts.secure?"https":"http",t=this.query||{};return this.opts.timestampRequests!==!1&&(t[this.opts.timestampParam]=ju()),!this.supportsBinary&&!t.sid&&(t.b64=1),this.createUri(e,t)}}let Ku=!1;try{Ku=typeof XMLHttpRequest<"u"&&"withCredentials"in new XMLHttpRequest}catch{}const sx=Ku;function rx(){}class ox extends ix{constructor(e){if(super(e),typeof location<"u"){const t=location.protocol==="https:";let n=location.port;n||(n=t?"443":"80"),this.xd=typeof location<"u"&&e.hostname!==location.hostname||n!==e.port}}doWrite(e,t){const n=this.request({method:"POST",data:e});n.on("success",t),n.on("error",(s,r)=>{this.onError("xhr post error",s,r)})}doPoll(){const e=this.request();e.on("data",this.onData.bind(this)),e.on("error",(t,n)=>{this.onError("xhr poll error",t,n)}),this.pollXhr=e}}let Es=class po extends Rt{constructor(e,t,n){super(),this.createRequest=e,zo(this,n),this._opts=n,this._method=n.method||"GET",this._uri=t,this._data=n.data!==void 0?n.data:null,this._create()}_create(){var e;const t=$u(this._opts,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");t.xdomain=!!this._opts.xd;const n=this._xhr=this.createRequest(t);try{n.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){n.setDisableHeaderCheck&&n.setDisableHeaderCheck(!0);for(let s in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(s)&&n.setRequestHeader(s,this._opts.extraHeaders[s])}}catch{}if(this._method==="POST")try{n.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{n.setRequestHeader("Accept","*/*")}catch{}(e=this._opts.cookieJar)===null||e===void 0||e.addCookies(n),"withCredentials"in n&&(n.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(n.timeout=this._opts.requestTimeout),n.onreadystatechange=()=>{var s;n.readyState===3&&((s=this._opts.cookieJar)===null||s===void 0||s.parseCookies(n.getResponseHeader("set-cookie"))),n.readyState===4&&(n.status===200||n.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof n.status=="number"?n.status:0)},0))},n.send(this._data)}catch(s){this.setTimeoutFn(()=>{this._onError(s)},0);return}typeof document<"u"&&(this._index=po.requestsCount++,po.requests[this._index]=this)}_onError(e){this.emitReserved("error",e,this._xhr),this._cleanup(!0)}_cleanup(e){if(!(typeof this._xhr>"u"||this._xhr===null)){if(this._xhr.onreadystatechange=rx,e)try{this._xhr.abort()}catch{}typeof document<"u"&&delete po.requests[this._index],this._xhr=null}}_onLoad(){const e=this._xhr.responseText;e!==null&&(this.emitReserved("data",e),this.emitReserved("success"),this._cleanup())}abort(){this._cleanup()}};Es.requestsCount=0;Es.requests={};if(typeof document<"u"){if(typeof attachEvent=="function")attachEvent("onunload",kh);else if(typeof addEventListener=="function"){const i="onpagehide"in fn?"pagehide":"unload";addEventListener(i,kh,!1)}}function kh(){for(let i in Es.requests)Es.requests.hasOwnProperty(i)&&Es.requests[i].abort()}const ax=(function(){const i=Zu({xdomain:!1});return i&&i.responseType!==null})();class cx extends ox{constructor(e){super(e);const t=e&&e.forceBase64;this.supportsBinary=ax&&!t}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new Es(Zu,this.uri(),e)}}function Zu(i){const e=i.xdomain;try{if(typeof XMLHttpRequest<"u"&&(!e||sx))return new XMLHttpRequest}catch{}if(!e)try{return new fn[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}const Ju=typeof navigator<"u"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class lx extends nl{get name(){return"websocket"}doOpen(){const e=this.uri(),t=this.opts.protocols,n=Ju?{}:$u(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(n.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,t,n)}catch(s){return this.emitReserved("error",s)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:"websocket connection closed",context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError("websocket error",e)}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const n=e[t],s=t===e.length-1;el(n,this.supportsBinary,r=>{try{this.doWrite(n,r)}catch{}s&&Bo(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){typeof this.ws<"u"&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){const e=this.opts.secure?"wss":"ws",t=this.query||{};return this.opts.timestampRequests&&(t[this.opts.timestampParam]=ju()),this.supportsBinary||(t.b64=1),this.createUri(e,t)}}const Ra=fn.WebSocket||fn.MozWebSocket;class hx extends lx{createSocket(e,t,n){return Ju?new Ra(e,t,n):t?new Ra(e,t):new Ra(e)}doWrite(e,t){this.ws.send(t)}}class ux extends nl{get name(){return"webtransport"}doOpen(){try{this._transport=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved("error",e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError("webtransport error",e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{const t=qv(Number.MAX_SAFE_INTEGER,this.socket.binaryType),n=e.readable.pipeThrough(t).getReader(),s=Xv();s.readable.pipeTo(e.writable),this._writer=s.writable.getWriter();const r=()=>{n.read().then(({done:a,value:c})=>{a||(this.onPacket(c),r())}).catch(a=>{})};r();const o={type:"open"};this.query.sid&&(o.data=`{"sid":"${this.query.sid}"}`),this._writer.write(o).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const n=e[t],s=t===e.length-1;this._writer.write(n).then(()=>{s&&Bo(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)===null||e===void 0||e.close()}}const dx={websocket:hx,webtransport:ux,polling:cx},fx=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,px=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function Tc(i){if(i.length>8e3)throw"URI too long";const e=i,t=i.indexOf("["),n=i.indexOf("]");t!=-1&&n!=-1&&(i=i.substring(0,t)+i.substring(t,n).replace(/:/g,";")+i.substring(n,i.length));let s=fx.exec(i||""),r={},o=14;for(;o--;)r[px[o]]=s[o]||"";return t!=-1&&n!=-1&&(r.source=e,r.host=r.host.substring(1,r.host.length-1).replace(/;/g,":"),r.authority=r.authority.replace("[","").replace("]","").replace(/;/g,":"),r.ipv6uri=!0),r.pathNames=mx(r,r.path),r.queryKey=gx(r,r.query),r}function mx(i,e){const t=/\/{2,9}/g,n=e.replace(t,"/").split("/");return(e.slice(0,1)=="/"||e.length===0)&&n.splice(0,1),e.slice(-1)=="/"&&n.splice(n.length-1,1),n}function gx(i,e){const t={};return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(n,s,r){s&&(t[s]=r)}),t}const Ac=typeof addEventListener=="function"&&typeof removeEventListener=="function",mo=[];Ac&&addEventListener("offline",()=>{mo.forEach(i=>i())},!1);class di extends Rt{constructor(e,t){if(super(),this.binaryType=$v,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e=="object"&&(t=e,e=null),e){const n=Tc(e);t.hostname=n.host,t.secure=n.protocol==="https"||n.protocol==="wss",t.port=n.port,n.query&&(t.query=n.query)}else t.host&&(t.hostname=Tc(t.host).host);zo(this,t),this.secure=t.secure!=null?t.secure:typeof location<"u"&&location.protocol==="https:",t.hostname&&!t.port&&(t.port=this.secure?"443":"80"),this.hostname=t.hostname||(typeof location<"u"?location.hostname:"localhost"),this.port=t.port||(typeof location<"u"&&location.port?location.port:this.secure?"443":"80"),this.transports=[],this._transportsByName={},t.transports.forEach(n=>{const s=n.prototype.name;this.transports.push(s),this._transportsByName[s]=n}),this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},t),this.opts.path=this.opts.path.replace(/\/$/,"")+(this.opts.addTrailingSlash?"/":""),typeof this.opts.query=="string"&&(this.opts.query=tx(this.opts.query)),Ac&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener("beforeunload",this._beforeunloadEventListener,!1)),this.hostname!=="localhost"&&(this._offlineEventListener=()=>{this._onClose("transport close",{description:"network connection lost"})},mo.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){const t=Object.assign({},this.opts.query);t.EIO=Yu,t.transport=e,this.id&&(t.sid=this.id);const n=Object.assign({},this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](n)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved("error","No transports available")},0);return}const e=this.opts.rememberUpgrade&&di.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1?"websocket":this.transports[0];this.readyState="opening";const t=this.createTransport(e);t.open(),this.setTransport(t)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on("drain",this._onDrain.bind(this)).on("packet",this._onPacket.bind(this)).on("error",this._onError.bind(this)).on("close",t=>this._onClose("transport close",t))}onOpen(){this.readyState="open",di.priorWebsocketSuccess=this.transport.name==="websocket",this.emitReserved("open"),this.flush()}_onPacket(e){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(this.emitReserved("packet",e),this.emitReserved("heartbeat"),e.type){case"open":this.onHandshake(JSON.parse(e.data));break;case"ping":this._sendPacket("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this._resetPingTimeout();break;case"error":const t=new Error("server error");t.code=e.data,this._onError(t);break;case"message":this.emitReserved("data",e.data),this.emitReserved("message",e.data);break}}onHandshake(e){this.emitReserved("handshake",e),this.id=e.sid,this.transport.query.sid=e.sid,this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!=="closed"&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);const e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose("ping timeout")},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved("drain"):this.flush()}flush(){if(this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){const e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved("flush")}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name==="polling"&&this.writeBuffer.length>1))return this.writeBuffer;let t=1;for(let n=0;n<this.writeBuffer.length;n++){const s=this.writeBuffer[n].data;if(s&&(t+=Jv(s)),n>0&&t>this._maxPayload)return this.writeBuffer.slice(0,n);t+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;const e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,Bo(()=>{this._onClose("ping timeout")},this.setTimeoutFn)),e}write(e,t,n){return this._sendPacket("message",e,t,n),this}send(e,t,n){return this._sendPacket("message",e,t,n),this}_sendPacket(e,t,n,s){if(typeof t=="function"&&(s=t,t=void 0),typeof n=="function"&&(s=n,n=null),this.readyState==="closing"||this.readyState==="closed")return;n=n||{},n.compress=n.compress!==!1;const r={type:e,data:t,options:n};this.emitReserved("packetCreate",r),this.writeBuffer.push(r),s&&this.once("flush",s),this.flush()}close(){const e=()=>{this._onClose("forced close"),this.transport.close()},t=()=>{this.off("upgrade",t),this.off("upgradeError",t),e()},n=()=>{this.once("upgrade",t),this.once("upgradeError",t)};return(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",()=>{this.upgrading?n():e()}):this.upgrading?n():e()),this}_onError(e){if(di.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState==="opening")return this.transports.shift(),this._open();this.emitReserved("error",e),this._onClose("transport error",e)}_onClose(e,t){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),Ac&&(this._beforeunloadEventListener&&removeEventListener("beforeunload",this._beforeunloadEventListener,!1),this._offlineEventListener)){const n=mo.indexOf(this._offlineEventListener);n!==-1&&mo.splice(n,1)}this.readyState="closed",this.id=null,this.emitReserved("close",e,t),this.writeBuffer=[],this._prevBufferLen=0}}}di.protocol=Yu;class _x extends di{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState==="open"&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_probe(e){let t=this.createTransport(e),n=!1;di.priorWebsocketSuccess=!1;const s=()=>{n||(t.send([{type:"ping",data:"probe"}]),t.once("packet",u=>{if(!n)if(u.type==="pong"&&u.data==="probe"){if(this.upgrading=!0,this.emitReserved("upgrading",t),!t)return;di.priorWebsocketSuccess=t.name==="websocket",this.transport.pause(()=>{n||this.readyState!=="closed"&&(h(),this.setTransport(t),t.send([{type:"upgrade"}]),this.emitReserved("upgrade",t),t=null,this.upgrading=!1,this.flush())})}else{const f=new Error("probe error");f.transport=t.name,this.emitReserved("upgradeError",f)}}))};function r(){n||(n=!0,h(),t.close(),t=null)}const o=u=>{const f=new Error("probe error: "+u);f.transport=t.name,r(),this.emitReserved("upgradeError",f)};function a(){o("transport closed")}function c(){o("socket closed")}function l(u){t&&u.name!==t.name&&r()}const h=()=>{t.removeListener("open",s),t.removeListener("error",o),t.removeListener("close",a),this.off("close",c),this.off("upgrading",l)};t.once("open",s),t.once("error",o),t.once("close",a),this.once("close",c),this.once("upgrading",l),this._upgrades.indexOf("webtransport")!==-1&&e!=="webtransport"?this.setTimeoutFn(()=>{n||t.open()},200):t.open()}onHandshake(e){this._upgrades=this._filterUpgrades(e.upgrades),super.onHandshake(e)}_filterUpgrades(e){const t=[];for(let n=0;n<e.length;n++)~this.transports.indexOf(e[n])&&t.push(e[n]);return t}}let vx=class extends _x{constructor(e,t={}){const n=typeof e=="object",s=n?{...e}:{...t};(!s.transports||s.transports&&typeof s.transports[0]=="string")&&(s.transports=(s.transports||["polling","websocket","webtransport"]).map(r=>dx[r]).filter(r=>!!r)),super(n?s:e,s)}};function xx(i,e="",t){let n=i;t=t||typeof location<"u"&&location,i==null&&(i=t.protocol+"//"+t.host),typeof i=="string"&&(i.charAt(0)==="/"&&(i.charAt(1)==="/"?i=t.protocol+i:i=t.host+i),/^(https?|wss?):\/\//.test(i)||(typeof t<"u"?i=t.protocol+"//"+i:i="https://"+i),n=Tc(i)),n.port||(/^(http|ws)$/.test(n.protocol)?n.port="80":/^(http|ws)s$/.test(n.protocol)&&(n.port="443")),n.path=n.path||"/";const r=n.host.indexOf(":")!==-1?"["+n.host+"]":n.host;return n.id=n.protocol+"://"+r+":"+n.port+e,n.href=n.protocol+"://"+r+(t&&t.port===n.port?"":":"+n.port),n}const yx=typeof ArrayBuffer=="function",Mx=i=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(i):i.buffer instanceof ArrayBuffer,Qu=Object.prototype.toString,Sx=typeof Blob=="function"||typeof Blob<"u"&&Qu.call(Blob)==="[object BlobConstructor]",Ex=typeof File=="function"||typeof File<"u"&&Qu.call(File)==="[object FileConstructor]";function il(i){return yx&&(i instanceof ArrayBuffer||Mx(i))||Sx&&i instanceof Blob||Ex&&i instanceof File}function go(i,e){if(!i||typeof i!="object")return!1;if(Array.isArray(i)){for(let t=0,n=i.length;t<n;t++)if(go(i[t]))return!0;return!1}if(il(i))return!0;if(i.toJSON&&typeof i.toJSON=="function"&&arguments.length===1)return go(i.toJSON(),!0);for(const t in i)if(Object.prototype.hasOwnProperty.call(i,t)&&go(i[t]))return!0;return!1}function bx(i){const e=[],t=i.data,n=i;return n.data=Rc(t,e),n.attachments=e.length,{packet:n,buffers:e}}function Rc(i,e){if(!i)return i;if(il(i)){const t={_placeholder:!0,num:e.length};return e.push(i),t}else if(Array.isArray(i)){const t=new Array(i.length);for(let n=0;n<i.length;n++)t[n]=Rc(i[n],e);return t}else if(typeof i=="object"&&!(i instanceof Date)){const t={};for(const n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=Rc(i[n],e));return t}return i}function wx(i,e){return i.data=Cc(i.data,e),delete i.attachments,i}function Cc(i,e){if(!i)return i;if(i&&i._placeholder===!0){if(typeof i.num=="number"&&i.num>=0&&i.num<e.length)return e[i.num];throw new Error("illegal attachments")}else if(Array.isArray(i))for(let t=0;t<i.length;t++)i[t]=Cc(i[t],e);else if(typeof i=="object")for(const t in i)Object.prototype.hasOwnProperty.call(i,t)&&(i[t]=Cc(i[t],e));return i}const Tx=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"];var Ye;(function(i){i[i.CONNECT=0]="CONNECT",i[i.DISCONNECT=1]="DISCONNECT",i[i.EVENT=2]="EVENT",i[i.ACK=3]="ACK",i[i.CONNECT_ERROR=4]="CONNECT_ERROR",i[i.BINARY_EVENT=5]="BINARY_EVENT",i[i.BINARY_ACK=6]="BINARY_ACK"})(Ye||(Ye={}));class Ax{constructor(e){this.replacer=e}encode(e){return(e.type===Ye.EVENT||e.type===Ye.ACK)&&go(e)?this.encodeAsBinary({type:e.type===Ye.EVENT?Ye.BINARY_EVENT:Ye.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let t=""+e.type;return(e.type===Ye.BINARY_EVENT||e.type===Ye.BINARY_ACK)&&(t+=e.attachments+"-"),e.nsp&&e.nsp!=="/"&&(t+=e.nsp+","),e.id!=null&&(t+=e.id),e.data!=null&&(t+=JSON.stringify(e.data,this.replacer)),t}encodeAsBinary(e){const t=bx(e),n=this.encodeAsString(t.packet),s=t.buffers;return s.unshift(n),s}}class sl extends Rt{constructor(e){super(),this.opts=Object.assign({reviver:void 0,maxAttachments:10},typeof e=="function"?{reviver:e}:e)}add(e){let t;if(typeof e=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");t=this.decodeString(e);const n=t.type===Ye.BINARY_EVENT;n||t.type===Ye.BINARY_ACK?(t.type=n?Ye.EVENT:Ye.ACK,this.reconstructor=new Rx(t),t.attachments===0&&super.emitReserved("decoded",t)):super.emitReserved("decoded",t)}else if(il(e)||e.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(e),t&&(this.reconstructor=null,super.emitReserved("decoded",t));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+e)}decodeString(e){let t=0;const n={type:Number(e.charAt(0))};if(Ye[n.type]===void 0)throw new Error("unknown packet type "+n.type);if(n.type===Ye.BINARY_EVENT||n.type===Ye.BINARY_ACK){const r=t+1;for(;e.charAt(++t)!=="-"&&t!=e.length;);const o=e.substring(r,t);if(o!=Number(o)||e.charAt(t)!=="-")throw new Error("Illegal attachments");const a=Number(o);if(!Cx(a)||a<0)throw new Error("Illegal attachments");if(a>this.opts.maxAttachments)throw new Error("too many attachments");n.attachments=a}if(e.charAt(t+1)==="/"){const r=t+1;for(;++t&&!(e.charAt(t)===","||t===e.length););n.nsp=e.substring(r,t)}else n.nsp="/";const s=e.charAt(t+1);if(s!==""&&Number(s)==s){const r=t+1;for(;++t;){const o=e.charAt(t);if(o==null||Number(o)!=o){--t;break}if(t===e.length)break}n.id=Number(e.substring(r,t+1))}if(e.charAt(++t)){const r=this.tryParse(e.substr(t));if(sl.isPayloadValid(n.type,r))n.data=r;else throw new Error("invalid payload")}return n}tryParse(e){try{return JSON.parse(e,this.opts.reviver)}catch{return!1}}static isPayloadValid(e,t){switch(e){case Ye.CONNECT:return Bh(t);case Ye.DISCONNECT:return t===void 0;case Ye.CONNECT_ERROR:return typeof t=="string"||Bh(t);case Ye.EVENT:case Ye.BINARY_EVENT:return Array.isArray(t)&&(typeof t[0]=="number"||typeof t[0]=="string"&&Tx.indexOf(t[0])===-1);case Ye.ACK:case Ye.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class Rx{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){const t=wx(this.reconPack,this.buffers);return this.finishedReconstruction(),t}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}const Cx=Number.isInteger||function(i){return typeof i=="number"&&isFinite(i)&&Math.floor(i)===i};function Bh(i){return Object.prototype.toString.call(i)==="[object Object]"}const Px=Object.freeze(Object.defineProperty({__proto__:null,Decoder:sl,Encoder:Ax,get PacketType(){return Ye}},Symbol.toStringTag,{value:"Module"}));function Sn(i,e,t){return i.on(e,t),function(){i.off(e,t)}}const Lx=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class ed extends Rt{constructor(e,t,n){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=t,n&&n.auth&&(this.auth=n.auth),this._opts=Object.assign({},n),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const e=this.io;this.subs=[Sn(e,"open",this.onopen.bind(this)),Sn(e,"packet",this.onpacket.bind(this)),Sn(e,"error",this.onerror.bind(this)),Sn(e,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift("message"),this.emit.apply(this,e),this}emit(e,...t){var n,s,r;if(Lx.hasOwnProperty(e))throw new Error('"'+e.toString()+'" is a reserved event name');if(t.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(t),this;const o={type:Ye.EVENT,data:t};if(o.options={},o.options.compress=this.flags.compress!==!1,typeof t[t.length-1]=="function"){const h=this.ids++,u=t.pop();this._registerAckCallback(h,u),o.id=h}const a=(s=(n=this.io.engine)===null||n===void 0?void 0:n.transport)===null||s===void 0?void 0:s.writable,c=this.connected&&!(!((r=this.io.engine)===null||r===void 0)&&r._hasPingExpired());return this.flags.volatile&&!a||(c?(this.notifyOutgoingListeners(o),this.packet(o)):this.sendBuffer.push(o)),this.flags={},this}_registerAckCallback(e,t){var n;const s=(n=this.flags.timeout)!==null&&n!==void 0?n:this._opts.ackTimeout;if(s===void 0){this.acks[e]=t;return}const r=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let a=0;a<this.sendBuffer.length;a++)this.sendBuffer[a].id===e&&this.sendBuffer.splice(a,1);t.call(this,new Error("operation has timed out"))},s),o=(...a)=>{this.io.clearTimeoutFn(r),t.apply(this,a)};o.withError=!0,this.acks[e]=o}emitWithAck(e,...t){return new Promise((n,s)=>{const r=(o,a)=>o?s(o):n(a);r.withError=!0,t.push(r),this.emit(e,...t)})}_addToQueue(e){let t;typeof e[e.length-1]=="function"&&(t=e.pop());const n={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((s,...r)=>(this._queue[0],s!==null?n.tryCount>this._opts.retries&&(this._queue.shift(),t&&t(s)):(this._queue.shift(),t&&t(null,...r)),n.pending=!1,this._drainQueue())),this._queue.push(n),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;const t=this._queue[0];t.pending&&!e||(t.pending=!0,t.tryCount++,this.flags=t.flags,this.emit.apply(this,t.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth=="function"?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:Ye.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved("connect_error",e)}onclose(e,t){this.connected=!1,delete this.id,this.emitReserved("disconnect",e,t),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(n=>String(n.id)===e)){const n=this.acks[e];delete this.acks[e],n.withError&&n.call(this,new Error("socket has been disconnected"))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case Ye.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case Ye.EVENT:case Ye.BINARY_EVENT:this.onevent(e);break;case Ye.ACK:case Ye.BINARY_ACK:this.onack(e);break;case Ye.DISCONNECT:this.ondisconnect();break;case Ye.CONNECT_ERROR:this.destroy();const n=new Error(e.data.message);n.data=e.data.data,this.emitReserved("connect_error",n);break}}onevent(e){const t=e.data||[];e.id!=null&&t.push(this.ack(e.id)),this.connected?this.emitEvent(t):this.receiveBuffer.push(Object.freeze(t))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){const t=this._anyListeners.slice();for(const n of t)n.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]=="string"&&(this._lastOffset=e[e.length-1])}ack(e){const t=this;let n=!1;return function(...s){n||(n=!0,t.packet({type:Ye.ACK,id:e,data:s}))}}onack(e){const t=this.acks[e.id];typeof t=="function"&&(delete this.acks[e.id],t.withError&&e.data.unshift(null),t.apply(this,e.data))}onconnect(e,t){this.id=e,this.recovered=t&&this._pid===t,this._pid=t,this.connected=!0,this.emitBuffered(),this._drainQueue(!0),this.emitReserved("connect")}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(e=>e()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:Ye.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){const t=this._anyListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){const t=this._anyOutgoingListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const t=this._anyOutgoingListeners.slice();for(const n of t)n.apply(this,e.data)}}}function ks(i){i=i||{},this.ms=i.min||100,this.max=i.max||1e4,this.factor=i.factor||2,this.jitter=i.jitter>0&&i.jitter<=1?i.jitter:0,this.attempts=0}ks.prototype.duration=function(){var i=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random(),t=Math.floor(e*this.jitter*i);i=(Math.floor(e*10)&1)==0?i-t:i+t}return Math.min(i,this.max)|0};ks.prototype.reset=function(){this.attempts=0};ks.prototype.setMin=function(i){this.ms=i};ks.prototype.setMax=function(i){this.max=i};ks.prototype.setJitter=function(i){this.jitter=i};class Pc extends Rt{constructor(e,t){var n;super(),this.nsps={},this.subs=[],e&&typeof e=="object"&&(t=e,e=void 0),t=t||{},t.path=t.path||"/socket.io",this.opts=t,zo(this,t),this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor((n=t.randomizationFactor)!==null&&n!==void 0?n:.5),this.backoff=new ks({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState="closed",this.uri=e;const s=t.parser||Px;this.encoder=new s.Encoder,this.decoder=new s.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var t;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(t=this.backoff)===null||t===void 0||t.setMin(e),this)}randomizationFactor(e){var t;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(t=this.backoff)===null||t===void 0||t.setJitter(e),this)}reconnectionDelayMax(e){var t;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(t=this.backoff)===null||t===void 0||t.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf("open"))return this;this.engine=new vx(this.uri,this.opts);const t=this.engine,n=this;this._readyState="opening",this.skipReconnect=!1;const s=Sn(t,"open",function(){n.onopen(),e&&e()}),r=a=>{this.cleanup(),this._readyState="closed",this.emitReserved("error",a),e?e(a):this.maybeReconnectOnOpen()},o=Sn(t,"error",r);if(this._timeout!==!1){const a=this._timeout,c=this.setTimeoutFn(()=>{s(),r(new Error("timeout")),t.close()},a);this.opts.autoUnref&&c.unref(),this.subs.push(()=>{this.clearTimeoutFn(c)})}return this.subs.push(s),this.subs.push(o),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState="open",this.emitReserved("open");const e=this.engine;this.subs.push(Sn(e,"ping",this.onping.bind(this)),Sn(e,"data",this.ondata.bind(this)),Sn(e,"error",this.onerror.bind(this)),Sn(e,"close",this.onclose.bind(this)),Sn(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(e){try{this.decoder.add(e)}catch(t){this.onclose("parse error",t)}}ondecoded(e){Bo(()=>{this.emitReserved("packet",e)},this.setTimeoutFn)}onerror(e){this.emitReserved("error",e)}socket(e,t){let n=this.nsps[e];return n?this._autoConnect&&!n.active&&n.connect():(n=new ed(this,e,t),this.nsps[e]=n),n}_destroy(e){const t=Object.keys(this.nsps);for(const n of t)if(this.nsps[n].active)return;this._close()}_packet(e){const t=this.encoder.encode(e);for(let n=0;n<t.length;n++)this.engine.write(t[n],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose("forced close")}disconnect(){return this._close()}onclose(e,t){var n;this.cleanup(),(n=this.engine)===null||n===void 0||n.close(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",e,t),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const t=this.backoff.duration();this._reconnecting=!0;const n=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved("reconnect_attempt",e.backoff.attempts),!e.skipReconnect&&e.open(s=>{s?(e._reconnecting=!1,e.reconnect(),this.emitReserved("reconnect_error",s)):e.onreconnect()}))},t);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}}onreconnect(){const e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",e)}}const Qs={};function fr(i,e){typeof i=="object"&&(e=i,i=void 0),e=e||{};const t=xx(i,e.path||"/socket.io"),n=t.source,s=t.id,r=t.path,o=Qs[s]&&r in Qs[s].nsps,a=e.forceNew||e["force new connection"]||e.multiplex===!1||o;let c;return a?c=new Pc(n,e):(Qs[s]||(Qs[s]=new Pc(n,e)),c=Qs[s]),t.query&&!e.query&&(e.query=t.queryKey),c.socket(t.path,e)}Object.assign(fr,{Manager:Pc,Socket:ed,io:fr,connect:fr});const Ix=4,Wn={join:"join",setReady:"setReady",startMatch:"startMatch",startPractice:"startPractice",input:"input",craft:"craft",useBandage:"useBandage",rematch:"rematch",pingProbe:"pingProbe"},Cn={lobbyState:"lobbyState",session:"session",connectionNotice:"connectionNotice",joinError:"joinError",matchStart:"matchStart",roundStart:"roundStart",snapshot:"snapshot",event:"event",roundEnd:"roundEnd",matchEnd:"matchEnd"};class Dx{socket;bytesIn=0;playerId="";rttMs=0;jitterMs=0;lossPct=0;sentProbes=0;lostProbes=0;pendingProbes=new Map;probeSeq=0;constructor(e,t){const n={transports:["websocket"],reconnection:!0,reconnectionDelay:500,reconnectionDelayMax:2500};this.socket=e?fr(e,n):fr(n),this.socket.on(Cn.lobbyState,s=>t.onLobby(s)),this.socket.on(Cn.session,s=>{this.playerId=s.playerId,t.onSession(s)}),this.socket.on(Cn.connectionNotice,s=>t.onConnectionNotice(s)),this.socket.on(Cn.joinError,s=>t.onJoinError(typeof s=="string"?s:s?.reason??"Beitritt abgelehnt")),this.socket.on(Cn.matchStart,s=>t.onMatchStart(s)),this.socket.on(Cn.roundStart,s=>t.onRoundStart(s)),this.socket.on(Cn.snapshot,s=>{this.bytesIn+=JSON.stringify(s).length,t.onSnapshot(s)}),this.socket.on(Cn.event,s=>t.onEvents(Array.isArray(s)?s:[s])),this.socket.on(Cn.roundEnd,s=>t.onRoundEnd(s)),this.socket.on(Cn.matchEnd,s=>t.onMatchEnd(s)),this.socket.on("connect",()=>t.onConnectionState("connected")),this.socket.on("disconnect",s=>t.onConnectionState("disconnected",s)),this.socket.on("connect_error",s=>t.onConnectionState("error",s.message)),setInterval(()=>this.probe(),2e3)}get id(){return this.playerId}join(e,t){this.socket.emit(Wn.join,{v:Ix,name:e,...t?{resumeToken:t}:{}})}setReady(e){this.socket.emit(Wn.setReady,{ready:e})}startMatch(){this.socket.emit(Wn.startMatch)}startPractice(e,t){this.socket.emit(Wn.startPractice,{bots:e,difficulty:t})}sendInput(e){this.socket.emit(Wn.input,e)}craft(e){this.socket.emit(Wn.craft,{recipe:e})}useBandage(){this.socket.emit(Wn.useBandage)}rematch(){this.socket.emit(Wn.rematch)}probe(){const e=performance.now();for(const[n,s]of this.pendingProbes)e-s>4500&&(this.pendingProbes.delete(n),this.lostProbes+=1);if(!this.socket.connected){this.updateLoss();return}const t=++this.probeSeq;this.pendingProbes.set(t,e),this.sentProbes+=1,this.socket.emit(Wn.pingProbe,t,()=>{const n=this.pendingProbes.get(t);if(n===void 0)return;this.pendingProbes.delete(t);const s=performance.now()-n;this.jitterMs=this.rttMs?this.jitterMs*.75+Math.abs(s-this.rttMs)*.25:0,this.rttMs=this.rttMs?this.rttMs*.72+s*.28:s,this.updateLoss()})}updateLoss(){this.lossPct=this.sentProbes>0?this.lostProbes/this.sentProbes*100:0,this.sentProbes>50&&(this.sentProbes=Math.ceil(this.sentProbes/2),this.lostProbes=Math.ceil(this.lostProbes/2))}}const zh=.0023,no=Math.PI/2-.02;class Ux{constructor(e,t){this.canvas=e,this.settings=t,document.addEventListener("keydown",n=>{if(n.repeat)return;const s=n.code;this.keys.add(s),s==="Digit1"?this.slotPressed=1:s==="Digit2"?this.slotPressed=2:s==="Digit3"?this.slotPressed=3:s===this.settings.keybinds.reload?this.reloadPressed=!0:s===this.settings.keybinds.jump?(this.jumpPressed=!0,n.preventDefault()):s==="Digit4"?this.craftPressed="arrows":s==="Digit5"?this.craftPressed="bandage":s==="Digit6"?this.craftPressed="plate":s===this.settings.keybinds.heal?this.bandagePressed=!0:s==="F3"&&(this.debugToggled=!0,n.preventDefault())}),document.addEventListener("keyup",n=>this.keys.delete(n.code)),window.addEventListener("blur",()=>{this.keys.clear(),this.fireHeld=!1,this.aimHeld=!1}),document.addEventListener("mousedown",n=>{this.pointerLocked&&(n.button===0&&(this.fireHeld=!0),n.button===2&&(this.aimHeld=!0))}),document.addEventListener("mouseup",n=>{n.button===0&&(this.fireHeld=!1),n.button===2&&(this.aimHeld=!1)}),e.addEventListener("contextmenu",n=>n.preventDefault()),document.addEventListener("mousemove",n=>{this.pointerLocked&&(this.yaw-=n.movementX*zh*this.settings.mouseSensitivity,this.pitch-=n.movementY*zh*this.settings.mouseSensitivity,this.pitch=Math.max(-no,Math.min(no,this.pitch)))}),document.addEventListener("pointerlockchange",()=>{this.pointerLocked=document.pointerLockElement===this.canvas,this.pointerLocked||(this.fireHeld=!1,this.aimHeld=!1)})}yaw=0;pitch=0;keys=new Set;fireHeld=!1;aimHeld=!1;pointerLocked=!1;slotPressed=null;reloadPressed=!1;jumpPressed=!1;craftPressed=null;bandagePressed=!1;debugToggled=!1;requestLock(){try{const e=this.canvas.requestPointerLock?.();e&&typeof e.catch=="function"&&e.catch(()=>{})}catch{}}setSettings(e){this.settings=e}applyRecoil(e,t){this.pitch=Math.max(-no,Math.min(no,this.pitch+e)),this.yaw+=t}get moveX(){return(this.keys.has(this.settings.keybinds.right)?1:0)-(this.keys.has(this.settings.keybinds.left)?1:0)}get moveZ(){return(this.keys.has(this.settings.keybinds.forward)?1:0)-(this.keys.has(this.settings.keybinds.back)?1:0)}get sprint(){return this.keys.has(this.settings.keybinds.sprint)}get sneak(){return this.keys.has(this.settings.keybinds.sneak)}get jumpHeld(){return this.keys.has(this.settings.keybinds.jump)}get fire(){return this.fireHeld&&this.pointerLocked}get aim(){return this.aimHeld&&this.pointerLocked}get interact(){return this.keys.has(this.settings.keybinds.interact)}clearEdges(){this.slotPressed=null,this.reloadPressed=!1,this.jumpPressed=!1,this.craftPressed=null,this.bandagePressed=!1,this.debugToggled=!1}}function td(i){return dr((i-Ch)/(gv-Ch),0,1)}function Nx(i){return Th+(Z_-Th)*td(i)}const Hh=new Ce(8894684),Fx=new Ce(659488),Vh=new Ce(11061468),Ox=new Ce(791588);function Gh(i){const e=new Set,t=new Set,n=new Set;i.traverse(s=>{const r=s;!r.isSprite&&r.geometry&&e.add(r.geometry);const o=Array.isArray(r.material)?r.material:r.material?[r.material]:[];for(const a of o){t.add(a);const c=a;c.map&&n.add(c.map)}}),n.forEach(s=>s.dispose()),t.forEach(s=>s.dispose()),e.forEach(s=>s.dispose())}function kx(i,e){const t=new Ce;return i<1.4?t.setHex(14205317):i<2.2?t.lerpColors(new Ce(14205317),new Ce(6130244),(i-1.4)/.8):i<9?t.setHex(6130244):t.lerpColors(new Ce(6130244),new Ce(9078136),Math.min(1,(i-9)/5)),e>.55&&t.lerp(new Ce(8222056),Math.min(1,(e-.55)*2)),t}function Bx(){const i=[];for(let t=0;t<9;t++){const n=t*2.399,s=.08+t%3*.13,r=Math.cos(n)*s,o=Math.sin(n)*s,a=.09+t%2*.035,c=.9+t%4*.17,l=Math.cos(n+Math.PI/2)*a,h=Math.sin(n+Math.PI/2)*a;i.push(r-l,0,o-h,r+l,0,o+h,r+Math.cos(n)*.08,c,o+Math.sin(n)*.08)}const e=new Ot;return e.setAttribute("position",new xt(i,3)),e.computeVertexNormals(),e}class zx{constructor(e){this.gen=e,this.fog=new qc(Vh.clone(),10,120),this.scene.fog=this.fog,this.scene.background=Hh.clone(),this.hemi=new cp(13625599,4873530,.9),this.scene.add(this.hemi),this.sun=new up(16773848,1.4),this.sun.position.set(60,90,40),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048),this.sun.shadow.camera.left=-115,this.sun.shadow.camera.right=115,this.sun.shadow.camera.top=115,this.sun.shadow.camera.bottom=-115,this.sun.shadow.camera.near=8,this.sun.shadow.camera.far=220,this.sun.shadow.bias=-45e-5,this.scene.add(this.sun),this.buildTerrain(),this.water=this.buildWater(),this.buildVegetation(),this.buildRuins(),this.buildLandmarks(),this.buildSpawnMarkers(),this.zoneMesh=this.buildZoneCylinder(6541567,.16),this.zoneTargetMesh=this.buildZoneCylinder(16777215,.05),this.scene.add(this.zoneMesh,this.zoneTargetMesh)}scene=new Jf;sun;hemi;water;zoneMesh;zoneTargetMesh;fog;resourceInstances=new Map;depletedNodes=new Set;resourceRemnants=new Map;grassMesh=null;localFadedBush=null;buildTerrain(){const e=this.gen.params,t=new qe({vertexColors:!0}),n=ho/Ss;for(let s=0;s<wh;s++)for(let r=0;r<wh;r++){const o=-128+r*ho,a=-128+s*ho,c=n+1,l=new Float32Array(c*c*3),h=new Float32Array(c*c*3),u=[];for(let g=0;g<c;g++)for(let v=0;v<c;v++){const p=o+v*Ss,d=a+g*Ss,b=Tt(e,p,d),E=(g*c+v)*3;l[E]=p,l[E+1]=b,l[E+2]=d;const _=Tt(e,p+1,d)-Tt(e,p-1,d),R=Tt(e,p,d+1)-Tt(e,p,d-1),T=Math.min(1,Math.hypot(_,R)/2),A=kx(b,T);h[E]=A.r,h[E+1]=A.g,h[E+2]=A.b}for(let g=0;g<c-1;g++)for(let v=0;v<c-1;v++){const p=g*c+v,d=p+1,b=p+c,E=b+1;u.push(p,b,d,d,b,E)}const f=new Ot;f.setAttribute("position",new Qt(l,3)),f.setAttribute("color",new Qt(h,3)),f.setIndex(u),f.computeVertexNormals();const m=new _e(f,t);m.receiveShadow=!0,this.scene.add(m)}}buildWater(){const e=new Ni(900,900,1,1),t=new qe({color:2780574,transparent:!0,opacity:.82}),n=new _e(e,t);return n.rotation.x=-Math.PI/2,n.position.y=.02,this.scene.add(n),n}buildVegetation(){const e=this.gen.vegetation.filter(_=>_.kind==="tree"),t=this.gen.vegetation.filter(_=>_.kind==="rock"),n=this.gen.vegetation.filter(_=>_.kind==="bush"),s=new Ct,r=new At(.2,.44,3.3,8),o=new qe({color:6045480,flatShading:!0}),a=new Rn(r,o,e.length),c=new Rn(new Yn(2.35,2.9,8),new qe({color:2579501,flatShading:!0}),e.length),l=new Rn(new Yn(1.85,3.4,8),new qe({color:3042100,flatShading:!0}),e.length),h=new Rn(new Yn(1.2,2.9,8),new qe({color:4161346,flatShading:!0}),e.length);e.forEach((_,R)=>{s.position.set(_.x,_.y+1.65*_.scale,_.z),s.scale.setScalar(_.scale),s.rotation.set(0,_.rot,0),s.updateMatrix(),a.setMatrixAt(R,s.matrix),s.position.y=_.y+3.5*_.scale,s.updateMatrix(),c.setMatrixAt(R,s.matrix),s.position.y=_.y+4.7*_.scale,s.rotation.y=_.rot+.5,s.updateMatrix(),l.setMatrixAt(R,s.matrix),s.position.y=_.y+5.8*_.scale,s.scale.setScalar(_.scale*.9),s.rotation.y=_.rot+1,s.updateMatrix(),h.setMatrixAt(R,s.matrix);const T=[a,c,l,h],A=T.map(C=>{const S=new nt;return C.getMatrixAt(R,S),S});this.resourceInstances.set(_.id,{meshes:T,matrices:A,index:R})});const u=new fs(1.1,1),f=new qe({color:9078138,flatShading:!0}),m=new Rn(u,f,t.length),g=new Rn(new fs(.62,0),new qe({color:8157037,flatShading:!0}),t.length);t.forEach((_,R)=>{s.position.set(_.x,_.y+.55*_.scale,_.z),s.scale.set(_.scale,_.scale*.78,_.scale),s.rotation.set(.12,_.rot,.08),s.updateMatrix(),m.setMatrixAt(R,s.matrix);const T=Math.cos(_.rot),A=Math.sin(_.rot);s.position.set(_.x+T*.95*_.scale,_.y+.32*_.scale,_.z+A*.95*_.scale),s.scale.set(_.scale,_.scale*.7,_.scale),s.rotation.set(.1,_.rot+1.3,.15),s.updateMatrix(),g.setMatrixAt(R,s.matrix);const C=[m,g],S=C.map(x=>{const P=new nt;return x.getMatrixAt(R,P),P});this.resourceInstances.set(_.id,{meshes:C,matrices:S,index:R})});const v=new Ln(.74,8,6),p=[new Rn(v,new qe({color:2906670,flatShading:!0}),n.length),new Rn(v,new qe({color:3963447,flatShading:!0}),n.length),new Rn(v,new qe({color:5214276,flatShading:!0}),n.length)];n.forEach((_,R)=>{const T=[{x:-.42,y:.7,z:.05,sx:1.05,sy:.84,sz:.92},{x:.4,y:.74,z:-.08,sx:1,sy:.88,sz:1.02},{x:0,y:1.18,z:.02,sx:.88,sy:.76,sz:.86}],A=[];T.forEach((C,S)=>{const x=Math.cos(_.rot),P=Math.sin(_.rot),B=(C.x*x-C.z*P)*_.scale,I=(C.x*P+C.z*x)*_.scale;s.position.set(_.x+B,_.y+C.y*_.scale,_.z+I),s.scale.set(_.scale*C.sx,_.scale*C.sy,_.scale*C.sz),s.rotation.set(0,_.rot+S*.7,0),s.updateMatrix(),p[S].setMatrixAt(R,s.matrix);const O=new nt;p[S].getMatrixAt(R,O),A.push(O)}),this.resourceInstances.set(_.id,{meshes:p,matrices:A,index:R})});const d=rn(on(this.gen.seed,"cover-grass")),b=[];for(let _=0;_<7e3&&b.length<760;_++){const R=d()*Math.PI*2,T=Math.sqrt(d())*(Ms-4);if(T<20)continue;const A=Math.cos(R)*T,C=Math.sin(R)*T;if(this.gen.spawns.some(x=>Math.hypot(A-x.x,C-x.z)<3.5))continue;const S=Tt(this.gen.params,A,C);S<.75||b.push({x:A,y:S,z:C,scale:.72+d()*.48,rot:d()*Math.PI*2})}const E=new Rn(Bx(),new qe({color:6458176,emissive:1386254,emissiveIntensity:.38,side:zt}),b.length);b.forEach((_,R)=>{s.position.set(_.x,_.y+.02,_.z),s.scale.set(_.scale,_.scale,_.scale),s.rotation.set(0,_.rot,0),s.updateMatrix(),E.setMatrixAt(R,s.matrix)}),E.receiveShadow=!0,this.grassMesh=E;for(const _ of[a,c,l,h,m,g,...p])_.castShadow=!0,_.receiveShadow=!0;this.scene.add(a,c,l,h,m,g,...p,E)}buildRuins(){const e=new qe({color:10984584,flatShading:!0}),t=new qe({color:9076588,flatShading:!0}),n=new qe({color:6124608,flatShading:!0}),s=Ro-.3,r=new _e(new At(17,18,.35,18),new qe({color:8485744,flatShading:!0}));r.position.y=Ro-.12,r.receiveShadow=!0,this.scene.add(r);const o=rn(on(this.gen.seed,"ruin-detail"));for(const u of this.gen.ruinWalls){const f=new _e(new Ut(u.w,u.h,u.d),e);f.position.set(u.x,s+u.h/2,u.z),f.rotation.y=u.rotY,f.castShadow=!0,f.receiveShadow=!0,this.scene.add(f);const m=1+Math.floor(o()*2);for(let g=0;g<m;g++){const v=u.w*(.18+o()*.22),p=new _e(new Ut(v,.4,u.d*1.05),o()<.4?n:t),d=(o()-.5)*(u.w-v);p.position.set(u.x+Math.cos(u.rotY)*d,s+u.h+.2,u.z+Math.sin(u.rotY)*d),p.rotation.y=u.rotY+(o()-.5)*.3,p.castShadow=!0,this.scene.add(p)}}for(let u=0;u<14;u++){const f=o()*Math.PI*2,m=6+o()*10,g=Math.cos(f)*m,v=Math.sin(f)*m,p=new _e(new fs(.3+o()*.4,0),o()<.3?n:t);p.scale.y=.6,p.position.set(g,Tt(this.gen.params,g,v)+.15,v),p.rotation.set(o(),o()*Math.PI,o()),p.castShadow=!0,this.scene.add(p)}const a=new Bt,c=new _e(new At(1.3,1.7,.8,8),e);c.position.y=.4;const l=new _e(new At(.7,1.1,.5,8),new qe({color:3225659}));l.position.y=1.05;const h=new _e(new Yn(.45,1.5,7),new wn({color:16752194,transparent:!0,opacity:.88}));h.position.y=2,a.position.set(0,s+.2,0),a.add(c,l,h),this.scene.add(a)}buildLandmarks(){const e={wood:new qe({color:8214328,flatShading:!0}),metal:new qe({color:5925489,flatShading:!0}),stone:new qe({color:7436143,flatShading:!0})},t=new qe({color:9067066,flatShading:!0}),n=rn(on(this.gen.seed,"poi-props"));for(const s of this.gen.pois){const r=new Bt;r.name=`poi-${s.id}`;for(const o of s.structures){const a=new _e(new Ut(o.w,o.h,o.d),e[o.material]),c=Tt(this.gen.params,o.x,o.z);a.position.set(o.x,c+(o.yOffset??0)+o.h/2,o.z),a.rotation.y=o.rotY,a.castShadow=!0,a.receiveShadow=!0,r.add(a)}for(let o=0;o<2+Math.floor(n()*2);o++){const a=n()*Math.PI*2,c=3.2+n()*1.6,l=s.x+Math.cos(a)*c,h=s.z+Math.sin(a)*c,u=new _e(new At(.36,.36,.95,10),n()<.5?t:e.metal);u.position.set(l,Tt(this.gen.params,l,h)+.48,h),u.castShadow=!0,u.receiveShadow=!0,r.add(u);const f=new _e(new Oo(.37,.03,6,12),e.metal);f.rotation.x=Math.PI/2,f.position.set(l,u.position.y+.28,h),r.add(f)}if(s.id==="wreck"){const o=new _e(new Ni(5.2,4.4),new qe({color:14010535,side:zt}));o.position.set(s.x,Tt(this.gen.params,s.x,s.z)+5.8,s.z),o.rotation.y=s.structures[0].rotY,r.add(o)}else if(s.id==="watchtower"){const o=new _e(new Yn(.65,1.8,6),new wn({color:16753229}));o.position.set(s.x,Tt(this.gen.params,s.x,s.z)+8.25,s.z),r.add(o)}else if(s.id==="bunker"){const o=new _e(new Ut(2.7,.65,.16),new qe({color:11686975}));o.position.set(s.x,Tt(this.gen.params,s.x,s.z)+2.1,s.z),o.rotation.y=s.structures[0].rotY,r.add(o)}this.scene.add(r)}}buildSpawnMarkers(){for(const e of this.gen.spawns){const t=Tt(this.gen.params,e.x,e.z),n=new Bt,s=new _e(new Fo(1.7,2.05,28),new wn({color:15842648,side:zt,transparent:!0,opacity:.78}));s.rotation.x=-Math.PI/2,s.position.y=.04;const r=new _e(new At(.07,.09,3.2,7),new qe({color:4929574}));r.position.y=1.6;const o=new _e(new Ni(1.2,.65),new qe({color:14722620,side:zt}));o.position.set(.62,2.55,0),n.rotation.y=-e.angle,n.position.set(e.x,t,e.z),n.add(s,r,o),this.scene.add(n)}}depleteResourceNode(e){if(this.depletedNodes.has(e))return;const t=this.resourceInstances.get(e),n=this.gen.vegetation.find(r=>r.id===e);if(!t||!n)return;const s=new nt().makeScale(0,0,0);for(const r of t.meshes)r.setMatrixAt(t.index,s),r.instanceMatrix.needsUpdate=!0;if(n.kind==="tree"){const r=new _e(new At(.3*n.scale,.38*n.scale,.35,7),new qe({color:7557174}));r.position.set(n.x,n.y+.17,n.z),r.castShadow=!0,this.scene.add(r),this.resourceRemnants.set(e,r)}else if(n.kind==="rock"){const r=new _e(new fs(.35*n.scale,0),new qe({color:7828331,flatShading:!0}));r.scale.y=.35,r.position.set(n.x,n.y+.12,n.z),this.scene.add(r),this.resourceRemnants.set(e,r)}this.depletedNodes.add(e)}resetResourceNodes(){for(const e of this.resourceInstances.values())e.meshes.forEach((t,n)=>{t.setMatrixAt(e.index,e.matrices[n]),t.instanceMatrix.needsUpdate=!0});for(const e of this.resourceRemnants.values())this.scene.remove(e),Gh(e);this.resourceRemnants.clear(),this.depletedNodes.clear(),this.localFadedBush=null}updateLocalCover(e,t){const n=Qc(this.gen,e,t)?.id??null;return n===this.localFadedBush||(this.localFadedBush!==null&&!this.depletedNodes.has(this.localFadedBush)&&this.setBushScale(this.localFadedBush,1),this.localFadedBush=n,n!==null&&!this.depletedNodes.has(n)&&this.setBushScale(n,.34)),n!==null}setBushScale(e,t){const n=this.resourceInstances.get(e),s=this.gen.vegetation.find(r=>r.id===e);!n||s?.kind!=="bush"||n.meshes.forEach((r,o)=>{const a=new D,c=new Ns,l=new D;n.matrices[o].decompose(a,c,l),l.multiplyScalar(t),r.setMatrixAt(n.index,new nt().compose(a,c,l)),r.instanceMatrix.needsUpdate=!0})}setGraphicsQuality(e){this.grassMesh&&(this.grassMesh.visible=e!=="low"),this.sun.castShadow=e!=="low";const t=e==="high"?2048:1024;this.sun.shadow.mapSize.x!==t&&(this.sun.shadow.mapSize.set(t,t),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null),this.scene.traverse(n=>{const s=n;s.isMesh&&(s.castShadow=e==="high")})}buildZoneCylinder(e,t){const n=new At(1,1,70,96,1,!0),s=new wn({color:e,transparent:!0,opacity:t,side:zt,depthWrite:!1}),r=new _e(n,s);return r.position.y=25,r}update(e,t,n){const s=td(e),r=Nx(e);this.fog.near=r*.25,this.fog.far=r,this.fog.color.lerpColors(Vh,Ox,s),this.scene.background.lerpColors(Hh,Fx,s),this.sun.intensity=1.4*(1-s)+.12,this.sun.color.setHex(s>.5?10336488:16773848),this.hemi.intensity=.9*(1-s)+.18;const o=Math.PI*.4*(1-s)+.12;this.sun.position.set(Math.cos(o)*80,Math.sin(o)*90+8,40),this.zoneMesh.scale.set(t,1,t),this.zoneTargetMesh.scale.set(n,1,n),this.zoneTargetMesh.visible=n<t-.5}dispose(){Gh(this.scene),this.sun.shadow.map?.dispose(),this.scene.clear(),this.resourceInstances.clear(),this.resourceRemnants.clear(),this.depletedNodes.clear(),this.grassMesh=null,this.localFadedBush=null}}const Wh=[15026253,4038130,4637806,14201914,11693792],Hx=new Ce(16777215),Vx=new Ce(16770979),Gx={machete:{label:"Machete",color:14279400,glyph:"M"},spear:{label:"Speer",color:14279400,glyph:"S"},bow:{label:"Bogen",color:14263361,glyph:"B"},pistol:{label:"Pistole",color:6666222,glyph:"P"},rifle:{label:"Gewehr",color:11963647,glyph:"G"},shotgun:{label:"Schrotflinte",color:16747606,glyph:"S"},sniper:{label:"Scharfschützengewehr",color:8315074,glyph:"◎"},grenade:{label:"Granate",color:8636011,glyph:"!"},smokeGrenade:{label:"Rauchgranate",color:12174540,glyph:"◌"},flashGrenade:{label:"Blendgranate",color:16771496,glyph:"✳"},bandageItem:{label:"Verband",color:16739183,glyph:"+"},plateItem:{label:"Panzerplatte",color:7395304,glyph:"A"},arrowBundle:{label:"Pfeile",color:14263361,glyph:"↟"},pistolAmmo:{label:"Pistolen-Munition",color:6666222,glyph:"•"},rifleAmmo:{label:"Gewehr-Munition",color:11963647,glyph:"•"},shellAmmo:{label:"Schrot-Munition",color:16747606,glyph:"•"},sniperAmmo:{label:"Sniper-Munition",color:8315074,glyph:"•"},care:{label:"Versorgungspaket",color:16761415,glyph:"★"}},fi=(i,e=0)=>new qe({color:i,emissive:e,emissiveIntensity:e?.18:0});function Pe(i,e,t,n,s=[0,0,0]){const r=new _e(new Ut(...e),fi(n));return r.position.set(...t),r.rotation.set(...s),r.castShadow=!0,i.add(r),r}function tt(i,e,t,n,s,r=[0,0,0],o=8){const a=new _e(new At(e,e,t,o),fi(s));return a.position.set(...n),a.rotation.set(...r),a.castShadow=!0,i.add(a),a}function Ca(i,e,t,n,s,r,o=[0,0,0],a=8){const c=new _e(new At(e,t,n,a),fi(r));return c.position.set(...s),c.rotation.set(...o),c.castShadow=!0,i.add(c),c}function gs(i,e,t,n,s,r=[0,0,0],o=6){const a=new _e(new Yn(e,t,o),fi(s));return a.position.set(...n),a.rotation.set(...r),a.castShadow=!0,i.add(a),a}function pr(i){const e=new Bt,t=2502970,n=12898005,s=8015920,r=1514786,o=3818573,a=14263361,c=5913896;switch(i){case"machete":{Ca(e,.02,.13,.66,[0,.3,-.03],n,[0,0,0],4),gs(e,.09,.2,[0,.72,-.03],n,[0,Math.PI/4,0],4),Pe(e,[.015,.5,.02],[.02,.32,-.08],10134700),Pe(e,[.24,.05,.13],[0,0,0],a),tt(e,.05,.26,[0,-.16,.01],c,[0,0,0],8);for(let l=0;l<3;l++)tt(e,.052,.02,[0,-.08-l*.07,.01],3811354,[0,0,0],8);tt(e,.062,.05,[0,-.3,.01],a,[0,0,0],8),e.rotation.z=-.12;break}case"spear":{Ca(e,.028,.036,1.74,[0,0,-.5],s,[Math.PI/2,0,0],8),gs(e,.11,.42,[0,0,-1.55],n,[-Math.PI/2,0,0],6),Pe(e,[.02,.02,.24],[0,0,-1.42],10134700);for(let l=0;l<4;l++)tt(e,.04,.02,[0,0,-1.28+l*.09],c,[Math.PI/2,0,0],8);gs(e,.05,.14,[0,0,.63],9075290,[Math.PI/2,0,0],6);break}case"bow":{const l=new _e(new Oo(.48,.032,8,26,Math.PI*1.42),fi(10118959));l.rotation.set(0,0,-Math.PI*.71),l.castShadow=!0,e.add(l),tt(e,.02,.12,[.02,.5,0],7293474,[0,0,.25],6),tt(e,.02,.12,[.02,-.5,0],7293474,[0,0,-.25],6);const h=[new D(.02,-.52,0),new D(-.14,0,0),new D(.02,.52,0)];e.add(new wu(new Ot().setFromPoints(h),new $c({color:15262420}))),tt(e,.03,.24,[-.02,0,0],c,[0,0,0],8),tt(e,.016,.9,[-.02,.02,-.08],13218690,[0,0,0],5),gs(e,.035,.1,[-.02,.02,-.55],n,[-Math.PI/2,0,0],5);break}case"pistol":Pe(e,[.14,.14,.52],[0,.05,-.15],o),Pe(e,[.145,.05,.5],[0,.115,-.15],t);for(let l=0;l<4;l++)Pe(e,[.15,.09,.012],[0,.05,.02+l*.03],1844267);Pe(e,[.12,.1,.4],[0,-.02,-.13],2107182),Pe(e,[.125,.28,.15],[0,-.2,.02],r,[-.22,0,0]),Pe(e,[.09,.24,.02],[0,-.2,.1],988184,[-.22,0,0]),Pe(e,[.05,.11,.13],[0,-.11,-.06],t),tt(e,.045,.12,[0,.05,-.44],856598,[Math.PI/2,0,0],8),Pe(e,[.02,.03,.02],[0,.15,-.36],n),Pe(e,[.06,.03,.02],[0,.15,.08],n);break;case"rifle":Pe(e,[.13,.16,.86],[0,0,-.24],o),Pe(e,[.11,.1,.5],[0,.02,-.62],3160127),tt(e,.028,.62,[0,.04,-.98],n,[Math.PI/2,0,0],8),tt(e,.04,.1,[0,.04,-1.26],856598,[Math.PI/2,0,0],8),Pe(e,[.13,.2,.4],[0,-.03,.4],s,[.09,0,0]),Pe(e,[.11,.26,.15],[0,-.2,-.2],r,[-.2,0,0]),Ca(e,.05,.075,.26,[0,-.24,-.02],2765370,[.28,0,0],6),Pe(e,[.05,.06,.34],[0,.15,-.24],11963647),tt(e,.032,.05,[0,.15,-.42],14140671,[Math.PI/2,0,0],10);break;case"shotgun":tt(e,.05,1.18,[0,.08,-.36],o,[Math.PI/2,0,0],10),tt(e,.038,1,[0,.005,-.32],2107182,[Math.PI/2,0,0],8),Pe(e,[.11,.13,.32],[0,.02,-.02],t),tt(e,.06,.2,[0,.005,-.5],4863264,[Math.PI/2,0,0],8);for(let l=0;l<3;l++)tt(e,.062,.02,[0,.005,-.58+l*.07],3680282,[Math.PI/2,0,0],8);Pe(e,[.15,.18,.46],[0,-.02,.36],s,[.1,0,0]),Pe(e,[.13,.2,.14],[0,-.14,.02],4863264,[-.2,0,0]),tt(e,.02,.03,[0,.135,-.92],16764779,[Math.PI/2,0,0],6);break;case"sniper":Pe(e,[.14,.17,.78],[0,0,-.14],t),tt(e,.03,.95,[0,.03,-1.02],n,[Math.PI/2,0,0],8),tt(e,.05,.12,[0,.03,-1.46],t,[Math.PI/2,0,0],8),Pe(e,[.13,.2,.42],[0,-.03,.42],s,[.07,0,0]),Pe(e,[.1,.26,.15],[0,-.2,-.1],r,[-.18,0,0]),tt(e,.055,.34,[0,.19,-.18],2838342,[Math.PI/2,0,0],10),tt(e,.065,.04,[0,.19,-.36],8315074,[Math.PI/2,0,0],10),Pe(e,[.035,.09,.03],[.08,.06,.06],n,[0,0,-.9]);break;case"smoke":{tt(e,.11,.34,[0,.02,0],9279907,[0,0,0],10),tt(e,.06,.08,[0,.22,0],t,[0,0,0],7),Pe(e,[.05,.15,.04],[.1,.24,0],13818334,[0,0,-.55]);break}case"flash":{tt(e,.1,.3,[0,.02,0],13616026,[0,0,0],10),tt(e,.055,.08,[0,.2,0],t,[0,0,0],7),Pe(e,[.05,.15,.04],[.09,.22,0],16771496,[0,0,-.55]);break}case"grenade":{const l=new _e(new Ao(.19,0),fi(5405512));l.castShadow=!0,e.add(l),tt(e,.07,.1,[0,.2,0],t,[0,0,0],7),Pe(e,[.05,.17,.04],[.09,.25,0],13809246,[0,0,-.55]);break}default:{const l=new _e(new Ao(.12,0),fi(14198904));l.scale.set(.9,.75,1.1),l.position.set(0,.03,-.07),l.castShadow=!0,e.add(l),tt(e,.075,.25,[0,-.13,.03],13209189,[0,0,-.14],8)}}return e}function Xh(i,e=!1){const t=new Bt,n=e?1.35:1.05,s=e?.9:.68,r=e?1.08:.86,o=e?3752778:7491631,a=2963776;Pe(t,[n,s,r],[0,s/2,0],i),Pe(t,[n+.06,.12,r+.06],[0,s+.03,0],o);for(const c of[-1,1])for(const l of[-1,1])Pe(t,[.1,s+.04,.1],[c*n*.44,s/2,l*r*.44],a);if(Pe(t,[n+.03,.07,r+.03],[0,s*.32,0],o),Pe(t,[n+.03,.07,r+.03],[0,s*.72,0],o),Pe(t,[.22,.2,.08],[0,s*.62,r/2+.05],e?16761415:14199393),e){for(let c=-1;c<=1;c++)Pe(t,[.16,.16,.02],[c*.34,s+.14,r/2-.3],c%2===0?16761415:1843752,[0,0,Math.PI/4]);Pe(t,[.14,.14,.14],[0,s+.22,0],13386803)}else gs(t,.12,.14,[0,s+.16,0],1843752,[0,Math.PI/4,0],4);return t}function Wx(i,e=!1){const t=new Bt;if(Pe(t,[.46,.26,.34],[0,.13,0],2765883),Pe(t,[.48,.06,.36],[0,.27,0],3489607),Pe(t,[.5,.05,.05],[0,.32,0],1844267),Pe(t,[.42,.1,.02],[0,.14,.18],i),e)for(let n=-1;n<=1;n++)tt(t,.038,.3,[n*.11,.44,0],12928825,[Math.PI/2,0,0],8),tt(t,.04,.06,[n*.11,.44,.13],15250506,[Math.PI/2,0,0],8);else for(let n=-1;n<=1;n++)tt(t,.028,.14,[n*.1,.35,-.06],15250506,[0,0,0],8),gs(t,.028,.06,[n*.1,.45,-.06],i,[0,0,0],8);return t}function Xx(i){if(i.item==="crate"){const t=i.tier==="top"?13208110:i.tier==="good"?3768223:7168077;return Xh(t)}if(i.item==="care")return Xh(12142393,!0);if(i.item in nd)return pr(i.item);const e=new Bt;if(i.item==="bandageItem")tt(e,.22,.2,[0,.13,0],15855335,[Math.PI/2,0,0],12),tt(e,.1,.21,[0,.13,0],15130062,[Math.PI/2,0,0],12),Pe(e,[.16,.05,.06],[0,.13,.02],14175314),Pe(e,[.05,.16,.06],[0,.13,.02],14175314);else if(i.item==="plateItem")Pe(e,[.34,.54,.1],[0,.32,0],6069933),Pe(e,[.12,.5,.08],[-.22,.32,.03],4882315,[0,.4,0]),Pe(e,[.12,.5,.08],[.22,.32,.03],4882315,[0,-.4,0]),Pe(e,[.5,.12,.14],[0,.55,0],10282990),Pe(e,[.24,.24,.02],[0,.34,.08],3165787);else if(i.item==="arrowBundle"){for(let t=-1;t<=1;t++){tt(e,.025,.92,[t*.09,.28,0],13218690,[0,0,.08*t],5);const n=new _e(new Yn(.06,.16,5),fi(12898005));n.position.set(t*.09,.82,0),e.add(n)}Pe(e,[.34,.09,.12],[0,.25,0],9131312)}else return i.item==="smokeGrenade"?pr("smoke"):i.item==="flashGrenade"?pr("flash"):Wx(i.item==="pistolAmmo"?6666222:i.item==="rifleAmmo"?11963647:i.item==="sniperAmmo"?8315074:16747606,i.item==="shellAmmo");return e}const nd={fists:!0,machete:!0,spear:!0,bow:!0,pistol:!0,rifle:!0,shotgun:!0,sniper:!0,grenade:!0,smoke:!0,flash:!0};function id(i){if(i.item==="crate")return i.tier==="top"?{label:"Top-Loot-Kiste",color:16760149,glyph:"★"}:i.tier==="good"?{label:"Gute Kiste",color:6472936,glyph:"◆"}:{label:"Loot-Kiste",color:12823944,glyph:"□"};const e=Gx[i.item]??{label:String(i.item),color:16777215,glyph:"•"};if(i.weaponMag!==void 0&&i.item in nd){const t=Fi[i.item].magSize;if(t)return{...e,label:`${e.label} · ${i.weaponMag}/${t}`}}return e}function qx(i){const e=id(i),t=document.createElement("canvas");t.width=512,t.height=112;const n=t.getContext("2d");n.fillStyle="rgba(8, 15, 20, 0.92)",n.beginPath(),n.roundRect(8,8,496,96,18),n.fill(),n.strokeStyle=`#${e.color.toString(16).padStart(6,"0")}`,n.lineWidth=5,n.stroke(),n.fillStyle=n.strokeStyle,n.font="800 42px system-ui, sans-serif",n.textAlign="center",n.fillText(e.glyph,58,72),n.fillStyle="#f4f7f8",n.font="700 34px system-ui, sans-serif",n.textAlign="left",n.fillText(e.label,102,70);const s=new rp(t);s.colorSpace=Zt;const r=new ep(new Eu({map:s,transparent:!0,depthTest:!1}));return r.scale.set(1.35,.3,1),r}function Yx(i){const e=pr(i),t=i==="rifle"||i==="shotgun"||i==="spear"||i==="sniper"?.36:i==="bow"||i==="machete"?.46:.54;return e.scale.setScalar(t),e.rotation.y=-.08,e}function dn(i){i.traverse(e=>{const t=e;t.isSprite||t.geometry?.dispose();const n=Array.isArray(t.material)?t.material:t.material?[t.material]:[];for(const s of n)s.map?.dispose(),s.dispose()})}function qh(i,e){i.traverse(t=>{const n=t,s=Array.isArray(n.material)?n.material:n.material?[n.material]:[];for(const r of s)r.transparent=!0,r.depthWrite=!1,r.opacity=e})}class $x{constructor(e,t,n=1){this.scene=e,this.camera=t,this.rng=rn(on(n,"client-entity-fx")),t.add(this.viewRoot),this.viewRoot.position.set(.38,-.38,-.72)}players=new Map;pickups=new Map;projectiles=new Map;fx=[];careBeacon=null;rng;viewRoot=new Bt;viewWeapon=null;viewWeaponType=null;swingT=1;kickT=1;aiming=!1;aimBlend=0;reloadT=-1;reloadDuration=1;ensurePlayer(e,t){if(this.players.has(e))return;const n=Wh[t%Wh.length],s=new Bt,r=new qe({color:n}),o=new qe({color:new Ce(n).multiplyScalar(.62)}),a=new qe({color:2831163}),c=new qe({color:14198904}),l=new _e(new Ut(.62,.78,.38),r);l.position.y=1.08;const h=new _e(new Ut(.5,.5,.42),a);h.position.set(0,1.12,0);const u=new _e(new Ut(.66,.12,.42),a);u.position.set(0,.78,0);const f=new _e(new At(.16,.19,.14,8),a);f.position.set(0,1.44,0);const m=new _e(new Ln(.13,8,6),o);m.position.set(-.36,1.4,0),m.scale.set(1,.8,1);const g=m.clone();g.position.x=.36;const v=new _e(new Ut(.5,.2,.32),o);v.position.y=.64;const p=new _e(new At(.105,.12,.64,8),o);p.position.set(-.17,.31,0);const d=p.clone();d.position.x=.17;const b=new _e(new Ut(.19,.14,.3),a);b.position.set(-.17,.05,.04);const E=b.clone();E.position.x=.17;const _=new _e(new At(.085,.095,.62,8),r);_.position.set(-.39,1.08,0),_.rotation.z=-.12;const R=_.clone();R.position.x=.39,R.rotation.z=.12;const T=new _e(new Ln(.075,7,6),a);T.position.set(-.42,.79,0);const A=T.clone();A.position.x=.42;const C=new _e(new Ln(.24,12,10),c);C.position.y=1.67;const S=new _e(new Ln(.255,12,8,0,Math.PI*2,0,Math.PI*.62),o);S.position.y=1.7;const x=new _e(new Ut(.4,.08,.06),a);x.position.set(0,1.7,-.22);const P=new _e(new Ut(.46,.56,.22),a);P.position.set(0,1.12,.3);const B=new _e(new At(.09,.09,.44,8),r);B.rotation.z=Math.PI/2,B.position.set(0,1.4,.34);const I=new Bt;I.position.set(.34,1.22,-.18),I.scale.setScalar(.48);const O=[h,u,f,m,g,v,p,d,b,E,_,R,T,A,S,x,P,B];for(const V of[l,C,...O])V.castShadow=!0,V.receiveShadow=!0;s.add(l,C,I,...O),this.scene.add(s),this.players.set(e,{group:s,body:l,head:C,weapon:I,currentWeapon:null,crouchTarget:0,crouchBlend:0,aiming:!1,flashT:0,bodyBaseEmissive:l.material.emissive.clone(),headBaseEmissive:C.material.emissive.clone()})}updatePlayer(e,t,n,s,r,o,a,c,l,h){const u=this.players.get(e);if(u){if(u.group.visible=a,u.group.position.set(t,n,s),u.group.rotation.y=r,u.crouchTarget=l?1:0,u.aiming=h,u.head.rotation.x=-o*.8,u.currentWeapon!==c){for(const f of[...u.weapon.children])dn(f);u.weapon.clear(),c!=="fists"&&u.weapon.add(pr(c)),u.currentWeapon=c}u.weapon.visible=c!=="fists",u.weapon.rotation.x=-o,u.weapon.position.z=h?-.28:-.18}}removePlayer(e){const t=this.players.get(e);t&&(this.scene.remove(t.group),dn(t.group),this.players.delete(e))}clearPlayers(){for(const e of[...this.players.keys()])this.removePlayer(e)}flashPlayer(e,t){const n=this.players.get(e);n&&(n.flashT=t?.16:.11)}addPickup(e){if(this.pickups.has(e.id))return;const t=id(e),n=Xx(e),s=new Bt;s.add(n);const r=e.item==="crate"||e.item==="care";if(!r){const o=new _e(new Fo(.46,.62,28),new wn({color:t.color,transparent:!0,opacity:.48,side:zt,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=-.34,s.add(o);const a=qx(e);a.position.y=1.14,a.userData.pickupLabel=!0,s.add(a)}if(s.position.set(e.x,e.y+(r?.02:.58),e.z),s.userData.baseY=s.position.y,s.userData.spin=e.item!=="crate"&&e.item!=="care",s.userData.phase=(e.x*.17+e.z*.11)%(Math.PI*2),e.item==="care"){const o=new _e(new At(.5,.5,60,10,1,!0),new wn({color:16737860,transparent:!0,opacity:.25,depthWrite:!1,side:zt}));o.position.y=30,s.add(o)}this.scene.add(s),this.pickups.set(e.id,s)}removePickup(e,t=!1){const n=this.pickups.get(e);n&&(this.pickups.delete(e),t?(qh(n,1),this.fx.push({obj:n,life:.28,maxLife:.28,velocity:new D(0,1.35,0),spin:7,volumePop:!0,fadeChildren:!0})):(this.scene.remove(n),dn(n)))}clearPickups(){for(const e of[...this.pickups.keys()])this.removePickup(e,!1)}setCareIncoming(e,t,n){n&&!this.careBeacon?(this.careBeacon=new _e(new At(1.2,1.2,80,12,1,!0),new wn({color:16763972,transparent:!0,opacity:.18,depthWrite:!1,side:zt})),this.careBeacon.position.set(e,40,t),this.scene.add(this.careBeacon)):!n&&this.careBeacon&&(this.scene.remove(this.careBeacon),dn(this.careBeacon),this.careBeacon=null)}syncProjectiles(e){const t=new Set;for(const n of e){t.add(n.id);let s=this.projectiles.get(n.id);if(!s){if(n.kind==="arrow"){const r=new _e(new At(.02,.02,.7,4),new qe({color:13218690}));r.rotation.x=Math.PI/2;const o=new Bt;o.add(r),s=o}else{const r=n.kind==="smoke"?9279907:n.kind==="flash"?13616026:4880970;s=new _e(new Ln(.13,8,6),new qe({color:r}))}this.scene.add(s),this.projectiles.set(n.id,s)}if(s.position.set(n.x,n.y,n.z),n.kind==="arrow"){const r=new D(n.vx,n.vy,n.vz);r.lengthSq()>.01&&s.lookAt(s.position.clone().add(r))}}for(const[n,s]of this.projectiles)t.has(n)||(this.scene.remove(s),dn(s),this.projectiles.delete(n))}smokeClouds=new Map;syncSmokes(e,t){const n=new Set;for(const s of e){n.add(s.id);let r=this.smokeClouds.get(s.id);if(!r){const h=new Bt,u=[],f=rn(s.id+77);for(let m=0;m<7;m++){const g=s.radius*(.42+f()*.3),v=new _e(new Ln(g,10,8),new qe({color:12174025,transparent:!0,opacity:0,depthWrite:!1}));v.position.set((f()-.5)*s.radius*1.1,(f()-.35)*s.radius*.75,(f()-.5)*s.radius*1.1),h.add(v),u.push(v)}h.position.set(s.x,s.y,s.z),this.scene.add(h),r={group:h,puffs:u},this.smokeClouds.set(s.id,r)}const o=t-s.bornAt,a=s.expiresAt-t,c=Math.min(1,o/.6),l=Math.min(1,Math.max(0,a/1.6));r.group.scale.setScalar(.25+.75*c),r.group.rotation.y=o*.14;for(const h of r.puffs)h.material.opacity=.82*c*l}for(const[s,r]of this.smokeClouds)n.has(s)||(this.scene.remove(r.group),dn(r.group),this.smokeClouds.delete(s))}clearSmokes(){this.syncSmokes([],0)}addTracer(e,t){const n=new Ot().setFromPoints([e,t]),s=new wu(n,new $c({color:16769696,transparent:!0,opacity:.85}));this.scene.add(s),this.fx.push({obj:s,life:.09,maxLife:.09})}addExplosion(e,t,n,s){const r=new _e(new Ln(s*.55,12,10),new wn({color:16752688,transparent:!0,opacity:.85}));r.position.set(e,t,n),this.scene.add(r),r.scale.setScalar(.25),this.fx.push({obj:r,life:.35,maxLife:.35,expand:5.5});const o=new Ql(16752688,30,s*4);o.position.set(e,t+1,n),this.scene.add(o),this.fx.push({obj:o,life:.25,maxLife:.25,lightIntensity:30})}addImpact(e,t,n,s){const r=s==="rifle"?13083903:s==="shotgun"?16754287:16769696;for(let o=0;o<5;o++){const a=new _e(new Ut(.035,.035,.09),new wn({color:r,transparent:!0,opacity:.95}));a.position.set(e,t,n);const c=new D((this.rng()-.5)*2.8,.5+this.rng()*1.9,(this.rng()-.5)*2.8);a.lookAt(a.position.clone().add(c)),this.scene.add(a),this.fx.push({obj:a,life:.18,maxLife:.18,velocity:c})}}clearProjectiles(){for(const e of this.projectiles.values())this.scene.remove(e),dn(e);this.projectiles.clear()}addMuzzleFlash(e){const t=new Ql(16767120,8,10),n=new D;e.getWorldPosition(n),t.position.copy(n),this.scene.add(t),this.fx.push({obj:t,life:.06,maxLife:.06,lightIntensity:8}),this.kickT=0}meleeSwing(){this.swingT=0}setViewWeapon(e){e!==this.viewWeaponType&&(this.viewWeapon&&(this.viewRoot.remove(this.viewWeapon),dn(this.viewWeapon)),this.viewWeapon=Yx(e),this.viewWeaponType=e,this.reloadT=-1,this.viewRoot.add(this.viewWeapon))}setAiming(e){this.aiming=e}setReloading(e,t=1){e?(this.reloadT<0&&(this.reloadT=0),this.reloadDuration=Math.max(.2,t)):this.reloadT=-1}setViewVisible(e){this.viewRoot.visible=e}update(e,t){const n=new D;this.camera.getWorldPosition(n);for(const[,s]of this.pickups)if(s.userData.spin){s.rotation.y+=e*1.6,s.position.y=s.userData.baseY+Math.sin(t*2+s.userData.phase)*.1;const r=n.distanceTo(s.position),o=s.children.find(a=>a.userData.pickupLabel);o&&(o.visible=r>2.1&&r<14,o.material.opacity=Math.min(1,Math.max(0,(14-r)/3)))}for(const s of this.players.values()){const r=1-Math.exp(-e*12);s.crouchBlend+=(s.crouchTarget-s.crouchBlend)*r,s.group.scale.y=zs.lerp(1,.68,s.crouchBlend),s.weapon.position.y=zs.lerp(1.22,1.3,s.aiming?1:0),s.flashT=Math.max(0,s.flashT-e);const o=Math.min(1,s.flashT/.08),a=s.body.material,c=s.head.material;a.emissive.copy(s.bodyBaseEmissive).lerp(Hx,o*.72),c.emissive.copy(s.headBaseEmissive).lerp(Vx,o*.78)}if(this.swingT=Math.min(1,this.swingT+e*3.2),this.kickT=Math.min(1,this.kickT+e*7),this.aimBlend+=((this.aiming?1:0)-this.aimBlend)*(1-Math.exp(-e*14)),this.viewRoot.position.set(zs.lerp(.38,0,this.aimBlend),zs.lerp(-.38,-.255,this.aimBlend),zs.lerp(-.72,-.57,this.aimBlend)),this.viewWeapon){const s=Math.sin(this.swingT*Math.PI)*1.1,r=Math.sin(this.kickT*Math.PI)*.06;let o=0,a=0;if(this.reloadT>=0){this.reloadT+=e;const c=Math.min(1,this.reloadT/this.reloadDuration);o=Math.sin(c*Math.PI),a=Math.sin(c*Math.PI*2)*.18-o*.55,c>=1&&(this.reloadT=-1)}this.viewWeapon.rotation.x=-s*.9+o*.35,this.viewWeapon.rotation.z=a,this.viewWeapon.position.x=o*.08,this.viewWeapon.position.z=s*-.25+r+o*.04,this.viewWeapon.position.y=Math.sin(t*1.7)*.008-o*.16}for(let s=this.fx.length-1;s>=0;s--){const r=this.fx[s];r.life-=e,r.velocity&&(r.obj.position.addScaledVector(r.velocity,e),r.velocity.y-=8*e),r.expand&&r.obj.scale.addScalar(r.expand*e),r.spin&&(r.obj.rotation.y+=r.spin*e);const o=Math.max(0,r.life/r.maxLife);if(r.volumePop){const c=1+Math.sin((1-o)*Math.PI)*.24;r.obj.scale.set(c,1/(c*c),c)}const a=r.obj;a.isPointLight?a.intensity=(r.lightIntensity??1)*o:r.fadeChildren?qh(r.obj,o):a.material&&(a.material.opacity=o*.85),r.life<=0&&(this.scene.remove(r.obj),dn(r.obj),this.fx.splice(s,1))}}stats(){return{players:this.players.size,pickups:this.pickups.size,projectiles:this.projectiles.size,effects:this.fx.length}}dispose(){this.clearPlayers(),this.clearPickups(),this.clearProjectiles(),this.clearSmokes();for(const e of this.fx)this.scene.remove(e.obj),dn(e.obj);this.fx.length=0,this.careBeacon&&(this.scene.remove(this.careBeacon),dn(this.careBeacon)),this.careBeacon=null,this.camera.remove(this.viewRoot),dn(this.viewRoot),this.viewRoot.clear(),this.viewWeapon=null,this.viewWeaponType=null}}const ye=i=>document.getElementById(i),sd={fists:"Fäuste",machete:"Machete",spear:"Speer",bow:"Bogen",pistol:"Pistole",rifle:"Gewehr",shotgun:"Schrotflinte",sniper:"Scharfschütze",grenade:"Granate",smoke:"Rauch",flash:"Blend"},jx={fists:"✦",machete:"╱",spear:"↑",bow:"◖",pistol:"P",rifle:"G",shotgun:"S",sniper:"◎",grenade:"●",smoke:"◌",flash:"✳"},Kx={frag:"Granate",smoke:"Rauch",flash:"Blend"},Yh={frag:"●",smoke:"◌",flash:"✳"},$h=i=>sd[i];class Zx{mini=ye("minimap");miniCtx=this.mini.getContext("2d");islandImg=null;announceTimer=null;damageDirectionTimer=null;spawns=[];pois=[];reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;show(){ye("hud").classList.add("active")}hide(){ye("hud").classList.remove("active")}setTimer(e,t){const n=Math.floor(e/60),s=Math.floor(e%60);ye("round-timer").textContent=`${n}:${s.toString().padStart(2,"0")}`,ye("phase-label").textContent=t==="loot"?"Loot-Phase":t==="closing"?"Zone schließt":"Endkampf"}setZoneInfo(e,t){const n=ye("zone-info");if(e.shrinking)n.textContent="⚠ Zone schrumpft!";else if(e.nextShrinkAt!==null){const s=Math.max(0,Math.ceil(e.nextShrinkAt-t));n.textContent=`Zone schrumpft in ${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`}else n.textContent="Letzte Zone"}setAlive(e){ye("alive-count").textContent=`${e} übrig`}setWeapon(e){ye("hud").dataset.weapon=e}setCrosshairSpread(e){ye("crosshair").style.setProperty("--crosshair-gap",`${Math.max(2,Math.min(22,e)).toFixed(1)}px`)}setCompass(e){const t=(-e*180/Math.PI%360+360)%360,n=["N","NO","O","SO","S","SW","W","NW"],s=n[Math.round(t/45)%n.length];ye("compass").textContent=`${s} · ${Math.round(t).toString().padStart(3,"0")}°`}setHp(e){ye("hp-bar").style.transform=`scaleX(${Math.max(0,e)/J_})`,ye("hp-num").textContent=`${Math.ceil(Math.max(0,e))}`}setStamina(e){ye("stamina-bar").style.transform=`scaleX(${e/Jc})`}setInventory(e){const t=[{el:ye("slot1"),w:e.primary},{el:ye("slot2"),w:e.secondary}];for(const{el:o,w:a}of t){o.querySelector(".slot-icon").textContent=a?jx[a.type]:"—",o.querySelector(".wname").textContent=a?sd[a.type]:"Leer";const c=a?Fi[a.type]:null;o.querySelector(".ammo").textContent=c?.ammo?`${a.mag}/${e.ammo[c.ammo]}${e.reloading?" ⟳":""}`:a?"Nahkampf":"Waffe aufnehmen"}const n=e.throwables[e.activeThrow];ye("slot3").querySelector(".slot-icon").textContent=Yh[e.activeThrow],ye("slot3").querySelector(".wname").textContent=Kx[e.activeThrow];const s=["frag","smoke","flash"].filter(o=>o!==e.activeThrow&&e.throwables[o]>0).map(o=>`${Yh[o]}${e.throwables[o]}`).join(" ");ye("slot3").querySelector(".ammo").textContent=`×${n}${s?`  ${s}`:""}`;for(const o of[1,2,3])ye(`slot${o}`).classList.toggle("active",e.active===o);ye("plates-row").textContent=e.plates>0?`Panzerung ${"■".repeat(e.plates)} · nächster Treffer −20%`:"Keine Panzerung",ye("mats-row").textContent=`Holz ${e.mats.wood}  ·  Stein ${e.mats.stone}  ·  Fasern ${e.mats.fiber}`;const r={arrows:e.mats.wood>=2,bandage:e.mats.fiber>=2,plate:e.mats.stone>=3};for(const[o,a]of Object.entries(r))document.querySelector(`[data-recipe="${o}"]`)?.classList.toggle("affordable",a);ye("consumables").innerHTML=`<strong>${e.bandages}</strong> Verbände <span style="color:#ffc45c">[H]</span><br><strong>${e.ammo.arrow}</strong> Pfeile`}killfeed(e,t){const n=ye("killfeed"),s=document.createElement("div");for(s.textContent=e,t&&s.classList.add("me"),n.prepend(s);n.children.length>6;)n.lastChild?.remove();setTimeout(()=>s.remove(),7e3)}announce(e,t=2600){const n=ye("announce");n.textContent=e,n.style.opacity="1",this.announceTimer&&clearTimeout(this.announceTimer),this.announceTimer=setTimeout(()=>{n.style.opacity="0"},t)}hitmarker(e){const t=ye("hitmarker");t.classList.toggle("head",e),t.style.opacity="1",setTimeout(()=>{t.style.opacity="0"},130)}damageFlash(){const e=ye("damage-flash");e.style.opacity="1",setTimeout(()=>{e.style.opacity="0"},120)}punchPickup(){if(this.reduceMotion)return;const e=[ye("bottombar"),document.querySelector(".slot.active")];for(const t of e)t?.animate([{transform:"translateY(0) scale(1)",filter:"brightness(1)"},{transform:"translateY(-4px) scale(1.025)",filter:"brightness(1.35)",offset:.42},{transform:"translateY(0) scale(1)",filter:"brightness(1)"}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"})}damageDirection(e){if(e===null)return;const t=ye("damage-direction");t.style.setProperty("--damage-angle",`${e}rad`),t.style.opacity="1",this.damageDirectionTimer&&clearTimeout(this.damageDirectionTimer),this.damageDirectionTimer=setTimeout(()=>{t.style.opacity="0"},520)}setInZone(e){ye("zone-warn").style.opacity=e?"1":"0"}setInteract(e,t){const n=ye("interact-hint");if(!e){n.style.display="none";return}n.style.display="block",ye("interact-text").textContent=e,ye("interact-progress").firstElementChild.style.width=`${t*100}%`}setHealProgress(e){const t=ye("heal-progress");t.style.display=e===null?"none":"block",e!==null&&(t.firstElementChild.style.width=`${e*100}%`)}setScoped(e){ye("hud").classList.toggle("scoped",e),ye("scope-overlay").style.display=e?"block":"none"}setBreath(e,t){const n=ye("breath-wrap");if(n.style.display=e===null?"none":"block",e!==null){const s=ye("breath-bar");s.style.transform=`scaleX(${Math.max(0,Math.min(1,e))})`,s.classList.toggle("holding",t)}}setCooking(e,t){const n=ye("cook-timer");if(e===null){n.style.display="none";return}n.style.display="block";const s=Math.max(0,e);ye("cook-num").textContent=s.toFixed(1),n.style.setProperty("--cook-frac",`${s/t*100}`),n.classList.toggle("danger",s<1)}setFlashWhiteout(e){ye("flash-overlay").style.opacity=e<=.005?"0":String(Math.min(1,e))}setSpectating(e){ye("spectate-label").style.display=e?"block":"none"}showDeathRecap(e){const t=ye("death-recap");t.textContent=e,t.style.display="block"}hideDeathRecap(){ye("death-recap").style.display="none"}setNetworkStatus(e,t=!0){const n=ye("network-banner");n.textContent=e??"",n.style.background=t?"#5e3020":"#23533d",n.classList.toggle("visible",!!e)}setDebug(e){const t=ye("debug");t.style.display=e?"block":"none",e&&(t.textContent=e)}initIsland(e,t,n){this.spawns=t,this.pois=n;const s=320,r=document.createElement("canvas");r.width=r.height=s;const o=r.getContext("2d"),a=o.createImageData(s,s);for(let c=0;c<s;c++)for(let l=0;l<s;l++){const h=(l/s-.5)*En,u=(c/s-.5)*En,f=Tt(e,h,u);let m=10,g=24,v=38;f>1.6?(m=74,g=112,v=56):f>.5&&(m=190,g=168,v=116),f>9&&(m=128,g=124,v=110);const p=(c*s+l)*4;a.data[p]=m,a.data[p+1]=g,a.data[p+2]=v,a.data[p+3]=255}o.putImageData(a,0,0),this.islandImg=r}toMap(e,t){const n=this.mini.width/En;return[(e+En/2)*n,(t+En/2)*n]}drawMinimap(e,t,n,s,r,o,a){const c=this.miniCtx,l=this.mini.width;c.clearRect(0,0,l,l),this.islandImg&&c.drawImage(this.islandImg,0,0);const h=l/En;c.fillStyle="rgba(230,200,120,0.8)";for(const m of this.spawns){const[g,v]=this.toMap(m.x,m.z);c.fillRect(g-2,v-2,4,4)}c.strokeStyle="rgba(220,220,220,0.6)",c.strokeRect(l/2-3,l/2-3,6,6);for(const m of this.pois){if(m.id==="ruins")continue;const[g,v]=this.toMap(m.x,m.z);c.fillStyle=m.id==="wreck"?"#d6b06c":m.id==="watchtower"?"#ef8f48":"#9aa79b",c.beginPath(),c.arc(g,v,4,0,Math.PI*2),c.fill()}c.strokeStyle="#63d0ff",c.lineWidth=2,c.beginPath(),c.arc(l/2,l/2,s.radius*h,0,Math.PI*2),c.stroke(),s.targetRadius<s.radius-.5&&(c.strokeStyle="rgba(255,255,255,0.7)",c.lineWidth=1,c.beginPath(),c.arc(l/2,l/2,s.targetRadius*h,0,Math.PI*2),c.stroke()),c.fillStyle="#ff5533";for(const m of r){if(m.until<a)continue;const[g,v]=this.toMap(m.x,m.z);c.beginPath(),c.arc(g,v,5,0,Math.PI*2),c.fill()}if(o.state!=="none"){const[m,g]=this.toMap(o.x,o.z);c.fillStyle=o.state==="landed"?"#ffcc44":"rgba(255,204,68,0.6)",c.fillRect(m-4,g-4,8,8),c.strokeStyle="#000",c.strokeRect(m-4,g-4,8,8)}const[u,f]=this.toMap(e,t);c.save(),c.translate(u,f),c.rotate(-n),c.fillStyle="#fff",c.beginPath(),c.moveTo(0,-7),c.lineTo(4.5,5),c.lineTo(-4.5,5),c.closePath(),c.fill(),c.restore()}showRoundEnd(e,t,n,s,r,o,a){ye("scoreboard-title").textContent=`Runde ${e} beendet`,ye("scoreboard-sub").textContent="Platzierungspunkte: 3 / 2 / 1 / 0 / 0",this.fillScores(t,n,r,!0,a),ye("rematch-btn").style.display="none";const c=o?"SUDDEN DEATH":"Nächste Runde";ye("next-round-in").textContent=`${c} in ${Math.round(s)} s …`,ye("scoreboard-screen").classList.remove("hidden")}showMatchEnd(e,t,n,s,r,o){ye("scoreboard-title").textContent=r?"🏆 SIEG!":`Match vorbei — ${n} gewinnt`,ye("scoreboard-sub").textContent="Endstand nach 3 Runden",this.fillScores(e,t,s,!1,o),ye("next-round-in").textContent="",ye("rematch-btn").style.display="block",ye("scoreboard-screen").classList.remove("hidden")}hideScoreboard(){ye("scoreboard-screen").classList.add("hidden")}fillScores(e,t,n,s,r){const o=ye("scoreboard-body");o.innerHTML="";const a=[...e].sort((c,l)=>c.place-l.place);for(const c of a){const l=document.createElement("tr");c.id===n&&l.classList.add("me");const h=r[c.id]??{kills:0,damageDealt:0,shotsFired:0,hits:0,pickups:0},u=h.shotsFired>0?`${Math.round(h.hits/h.shotsFired*100)}%`:"—";l.innerHTML=`<td>${c.place}.</td><td></td><td>${s?`+${c.points}`:""}</td><td>${t[c.id]??0}</td><td>${h.kills}</td><td>${h.damageDealt}</td><td>${u}</td><td>${h.pickups}</td>`,l.children[1].textContent=c.name,o.appendChild(l)}}}class Jx{ctx=null;master=null;effectsBus=null;footstepsBus=null;rng=rn(1);volumes={master:.72,effects:.8,footsteps:.9};setSeed(e){this.rng=rn(on(e,"client-audio"))}unlock(){if(this.ctx){this.ctx.resume();return}try{this.ctx=new AudioContext,this.master=this.ctx.createGain(),this.effectsBus=this.ctx.createGain(),this.footstepsBus=this.ctx.createGain(),this.effectsBus.connect(this.master),this.footstepsBus.connect(this.master),this.master.connect(this.ctx.destination),this.applyVolumes()}catch{}}setVolumes(e,t,n){this.volumes={master:e,effects:t,footsteps:n},this.applyVolumes()}applyVolumes(){this.master&&(this.master.gain.value=.5*Math.max(0,Math.min(1,this.volumes.master))),this.effectsBus&&(this.effectsBus.gain.value=Math.max(0,Math.min(1,this.volumes.effects))),this.footstepsBus&&(this.footstepsBus.gain.value=Math.max(0,Math.min(1,this.volumes.footsteps)))}connectSpatial(e,t,n){if(!this.ctx)return;const s=t?this.footstepsBus:this.effectsBus;if(!s)return;const r=this.ctx.createStereoPanner();r.pan.value=Math.max(-1,Math.min(1,n)),e.connect(r).connect(s)}noiseBurst(e,t,n,s,r,o){if(!this.ctx||!this.master)return;const a=this.ctx,c=Math.floor(a.sampleRate*e),l=a.createBuffer(1,c,a.sampleRate),h=l.getChannelData(0);for(let g=0;g<c;g++)h[g]=(this.rng()*2-1)*Math.pow(1-g/c,s);const u=a.createBufferSource();u.buffer=l;const f=a.createBiquadFilter();f.type="lowpass",f.frequency.value=t;const m=a.createGain();m.gain.value=n,u.connect(f).connect(m),this.connectSpatial(m,r,o),u.start()}tone(e,t,n,s,r,o,a){if(!this.ctx||!this.master)return;const c=this.ctx,l=c.createOscillator();l.type=s,l.frequency.setValueAtTime(e,c.currentTime),r&&l.frequency.exponentialRampToValueAtTime(Math.max(30,e+r),c.currentTime+t);const h=c.createGain();h.gain.setValueAtTime(n,c.currentTime),h.gain.exponentialRampToValueAtTime(1e-4,c.currentTime+t),l.connect(h),this.connectSpatial(h,o,a),l.start(),l.stop(c.currentTime+t)}play(e,t=0,n=1,s=0){if(!this.ctx)return;const r=Math.max(.025,1-t/90)*Math.max(0,n),o=.94+this.rng()*.12,a=u=>u*o,c=e.startsWith("step")||e==="bushRustle",l=(u,f,m,g=.9)=>this.noiseBurst(u,f,m,g,c,s),h=(u,f,m,g="sine",v=0)=>this.tone(u,f,m,g,v,c,s);switch(e){case"pistol":l(.12,a(2400),.7*r);break;case"rifle":l(.09,a(3200),.65*r);break;case"shotgun":l(.28,a(1500),.95*r),h(a(90),.2,.4*r,"square",-40);break;case"sniper":l(.16,a(2600),1.05*r,.7),h(a(70),.42,.5*r,"square",-35),l(.5,a(500),.3*r,.5);break;case"smokePop":l(.35,a(600),.4*r,.7),h(a(180),.28,.14*r,"sine",-70);break;case"flashBang":l(.1,a(5200),1.1*r,1.4),h(a(2900),.7,.4*r,"sine",60);break;case"grenadeBeep":h(a(1350),.05,.22*r,"square");break;case"bow":l(.07,a(900),.3*r),h(a(220),.1,.15*r,"triangle",120);break;case"melee":l(.06,a(700),.4*r);break;case"explosion":l(.7,a(700),1.2*r,.6),h(a(55),.5,.6*r,"square",-25);break;case"hit":h(a(1100),.06,.3*r,"square");break;case"headshot":h(a(1450),.06,.3*r,"square"),h(a(1900),.09,.18*r,"sine",180);break;case"hurt":h(a(200),.18,.4*r,"sawtooth",-90);break;case"pickup":h(a(660),.09,.25*r,"triangle",220);break;case"pickupWeapon":h(a(290),.08,.22*r,"square",90),h(a(580),.12,.16*r,"triangle",160);break;case"pickupAmmo":l(.035,a(2100),.12*r),h(a(820),.045,.12*r,"square",110);break;case"pickupHeal":h(a(520),.12,.18*r,"sine",120),h(a(760),.16,.12*r,"sine",80);break;case"pickupArmor":l(.07,a(1200),.2*r),h(a(240),.13,.18*r,"triangle",-40);break;case"reload":l(.045,a(1600),.16*r),h(a(360),.07,.11*r,"square",80);break;case"heal":h(a(520),.25,.2*r,"sine",180);break;case"craft":h(a(440),.1,.25*r,"square"),h(a(660),.12,.2*r,"square");break;case"zone":h(a(140),.6,.3*r,"sawtooth",40);break;case"click":h(a(880),.04,.15*r,"square");break;case"care":h(a(330),.4,.3*r,"triangle",110),h(a(495),.5,.2*r,"triangle",110);break;case"stepGrass":l(.05,a(520),.15*r,1.5);break;case"stepSand":l(.065,a(880),.12*r,1.35);break;case"stepStone":l(.035,a(1900),.13*r,1.8),h(a(175),.045,.05*r,"triangle",-20);break;case"bushRustle":l(.16,a(1250),.18*r,1.2);break;case"death":l(.22,a(600),.2*r),h(a(260),.45,.32*r,"sawtooth",-170);break;case"elimination":h(a(720),.08,.22*r,"square",130),h(a(1080),.15,.18*r,"triangle",180);break;case"roundWin":h(440,.14,.2*r,"triangle",110),h(660,.2,.18*r,"triangle",165),h(880,.28,.15*r,"sine",110);break;case"roundLose":h(300,.22,.22*r,"triangle",-80),h(190,.38,.16*r,"sine",-60);break}}}const rd={forward:"KeyW",back:"KeyS",left:"KeyA",right:"KeyD",sprint:"ShiftLeft",sneak:"ControlLeft",jump:"Space",reload:"KeyR",interact:"KeyE",heal:"KeyH"},sr={mouseSensitivity:1,masterVolume:.7,effectsVolume:.8,footstepsVolume:.9,cameraShake:!0,graphics:"high",keybinds:{...rd}},od="islandDuellSettingsV1",io=(i,e)=>typeof i=="number"&&Number.isFinite(i)?Math.max(0,Math.min(2,i)):e;function Qx(){try{const i=JSON.parse(localStorage.getItem(od)??"{}");return{mouseSensitivity:Math.max(.25,io(i.mouseSensitivity,1)),masterVolume:Math.min(1,io(i.masterVolume,sr.masterVolume)),effectsVolume:Math.min(1,io(i.effectsVolume,sr.effectsVolume)),footstepsVolume:Math.min(1,io(i.footstepsVolume,sr.footstepsVolume)),cameraShake:typeof i.cameraShake=="boolean"?i.cameraShake:!0,graphics:i.graphics==="low"||i.graphics==="medium"||i.graphics==="high"?i.graphics:"high",keybinds:{...rd,...i.keybinds??{}}}}catch{return structuredClone(sr)}}function ad(i){localStorage.setItem(od,JSON.stringify(i))}function Pn(i){return{Space:"Leertaste",ShiftLeft:"Links ⇧",ShiftRight:"Rechts ⇧",ControlLeft:"Links Strg",ControlRight:"Rechts Strg",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→"}[i]??i.replace(/^Key/,"").replace(/^Digit/,"")}const Ie=i=>document.getElementById(i),ft=new j_({antialias:!0});ft.setPixelRatio(Math.min(window.devicePixelRatio,2));ft.setSize(window.innerWidth,window.innerHeight);ft.outputColorSpace=Zt;ft.toneMapping=Qh;ft.toneMappingExposure=1.08;ft.shadowMap.enabled=!0;ft.shadowMap.type=Jh;ft.domElement.classList.add("game");Ie("app").appendChild(ft.domElement);const gt=new sn(75,window.innerWidth/window.innerHeight,.08,400);window.addEventListener("resize",()=>{gt.aspect=window.innerWidth/window.innerHeight,gt.updateProjectionMatrix(),ft.setSize(window.innerWidth,window.innerHeight)});let Le=Qx();const ve=new Ux(ft.domElement,Le),ue=new Zx,rt=new Jx,_s=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let vt=null,mr=null,Pa=null,Ne="",oi="",La=!1,mn=!1,gr=new Map,Co=new Map,Nt=null,Ht=null,Ft=null,$e=null,ee=ku({x:0,y:10,z:0}),ey=0,ai=[],Pi=new Map,Xt=!1,Nn=!1,Lc=!1,Pt=null,Ic={t:0,at:0},bs=new Map,Po=new Map,_o=0,Mn="fists",ls=null,Li=null,rl=new Set,Lo=!1,Tn=0,Oi=0,vo=Zc,Ia=!1,er=0,Da=0,jh=0,Dc=0,hs=0,ol=null,tr="",_r=!1,xo=!1,ws=0,cd=0,Uc=null,rr=0,Ua="",Ho=null,us=0,or=0,ar=0,si=ur,ci=0,al=0,yo=0,ld=!1,cl=0,ll=0;const qn=new D;function hd(){Ht&&Ht.scene.remove(gt),$e?.dispose(),Ft?.dispose(),Ht?.dispose(),$e=null,Ft=null,Ht=null,Nt=null,Pt=null,bs.clear(),Po.clear(),ft.renderLists.dispose()}function ds(i,e=.5,t=.25){const s=navigator.getGamepads?.().find(r=>r?.connected)?.vibrationActuator;s?.playEffect?s.playEffect("dual-rumble",{duration:i,strongMagnitude:e,weakMagnitude:t}):s?.pulse&&s.pulse(Math.max(e,t),i)}function ud(i,e){return Math.hypot(i,e)<19?"stepStone":Nt&&Tt(Nt.params,i,e)<2.15?"stepSand":"stepGrass"}function ty(i,e){const t=i-ee.pos.x,n=e-ee.pos.z,s=Math.hypot(t,n)||1;return Math.max(-1,Math.min(1,(t*Math.cos(ve.yaw)-n*Math.sin(ve.yaw))/s))}function Ii(i,e,t,n,s=1){rt.play(i,Nc(e,t,n),s,ty(e,n))}function ny(i){if(!Xt||!ee.grounded)return;const e=Math.hypot(ee.velX,ee.velZ);if(e<.45)return;_o+=e*i;const t=ee.sprinting?2.05:ee.sneaking?1.65:1.8;if(_o<t)return;_o%=t,rt.play(ud(ee.pos.x,ee.pos.z),0,ee.sneaking?.16:ee.sprinting?.9:.55);const n=Nt?Qc(Nt,ee.pos.x,ee.pos.z):null;n?.id!==Uc&&(Uc=n?.id??null,rr=0),n&&(rr+=t,rr>=1.15&&(rr=0,rt.play("bushRustle",0,ee.sneaking?.12:ee.sprinting?.9:.5)))}function iy(i,e,t,n){const s=Po.get(i);if(!s){Po.set(i,{x:e,z:t,distance:0,bushId:null,bushDistance:0});return}const r=Math.hypot(e-s.x,t-s.z);if(s.x=e,s.z=t,!n.alive||!n.grounded||r>2){s.distance=0;return}s.distance+=r;const o=n.sprinting?2.05:n.sneaking?1.65:1.8;if(s.distance<o)return;s.distance%=o,Ii(ud(e,t),e,ee.pos.y,t,n.sneaking?.13:n.sprinting?.82:.48);const a=Nt?Qc(Nt,e,t):null;a?.id!==s.bushId&&(s.bushId=a?.id??null,s.bushDistance=0),a&&(s.bushDistance+=o,s.bushDistance>=1.15&&(s.bushDistance=0,Ii("bushRustle",e,ee.pos.y,t,n.sneaking?.1:n.sprinting?.82:.44)))}const sy={snapshot:()=>({seed:ol,state:{inMatch:mn,roundRunning:Nn,alive:Xt,pointerLocked:ve.pointerLocked},player:{position:{...ee.pos},velocity:{x:ee.velX,y:ee.velY,z:ee.velZ},grounded:ee.grounded,sprinting:ee.sprinting,sneaking:ee.sneaking},input:{moveX:ve.moveX,moveZ:ve.moveZ,fire:ve.fire,aim:ve.aim,sprint:ve.sprint,sneak:ve.sneak,interact:ve.interact},renderer:{calls:ft.info.render.calls,triangles:ft.info.render.triangles,points:ft.info.render.points,lines:ft.info.render.lines,geometries:ft.info.memory.geometries,textures:ft.info.memory.textures},entities:$e?.stats()??null,physics:Ft?.stats()??null,network:{pendingInputs:ai.length,inboundKbPerSec:Dc,rttMs:vt?.rttMs??0,jitterMs:vt?.jitterMs??0,lossPct:vt?.lossPct??0}})};window.__ISLAND_DUELL_DIAGNOSTICS__=sy;const Io=Ie("settings-dialog"),li=i=>Ie(i);function hl(){ve.setSettings(Le),rt.setVolumes(Le.masterVolume,Le.effectsVolume,Le.footstepsVolume);const i=Le.graphics==="low"?1:Le.graphics==="medium"?1.5:2;ft.setPixelRatio(Math.min(window.devicePixelRatio,i)),ft.setSize(window.innerWidth,window.innerHeight),ft.shadowMap.enabled=Le.graphics!=="low",Ht?.setGraphicsQuality(Le.graphics),Le.cameraShake||(Tn=0,Oi=0),Ie("controls-hint").textContent=`${Pn(Le.keybinds.forward)}/${Pn(Le.keybinds.left)}/${Pn(Le.keybinds.back)}/${Pn(Le.keybinds.right)} Bewegen · ${Pn(Le.keybinds.sneak)} Schleichen · ${Pn(Le.keybinds.sprint)} Sprint/Atem · RMB Zielen · ${Pn(Le.keybinds.reload)} Nachladen · ${Pn(Le.keybinds.interact)} Sammeln · ${Pn(Le.keybinds.heal)} Heilen · 3×2 Wurf wechseln`}function Do(){li("mouse-sensitivity").value=String(Le.mouseSensitivity),Ie("mouse-sensitivity-value").textContent=`${Le.mouseSensitivity.toFixed(2)}×`,li("master-volume").value=String(Le.masterVolume),li("effects-volume").value=String(Le.effectsVolume),li("footsteps-volume").value=String(Le.footstepsVolume),Ie("graphics-quality").value=Le.graphics,Ie("camera-shake").checked=Le.cameraShake;for(const i of document.querySelectorAll("[data-bind]"))i.textContent=Pn(Le.keybinds[i.dataset.bind]),i.classList.remove("listening")}function dd(){Le.mouseSensitivity=Number(li("mouse-sensitivity").value),Le.masterVolume=Number(li("master-volume").value),Le.effectsVolume=Number(li("effects-volume").value),Le.footstepsVolume=Number(li("footsteps-volume").value),Le.graphics=Ie("graphics-quality").value,Le.cameraShake=Ie("camera-shake").checked,Ie("mouse-sensitivity-value").textContent=`${Le.mouseSensitivity.toFixed(2)}×`,ad(Le),hl()}function ry(){document.exitPointerLock?.(),Do(),Io.open||Io.showModal()}for(const i of["mouse-sensitivity","master-volume","effects-volume","footsteps-volume","graphics-quality","camera-shake"])Ie(i).addEventListener("input",dd);for(const i of["menu-settings-btn","pause-settings-btn"])Ie(i).addEventListener("click",e=>{e.stopPropagation(),ry()});Ie("reset-settings-btn").addEventListener("click",()=>{Le=structuredClone(sr),Do(),dd()});for(const i of document.querySelectorAll("[data-bind]"))i.addEventListener("click",()=>{const e=i.dataset.bind;i.textContent="Taste drücken …",i.classList.add("listening");const t=n=>{if(n.preventDefault(),n.stopPropagation(),n.code==="Escape"){Do();return}const s=Le.keybinds[e],r=Object.keys(Le.keybinds).find(o=>o!==e&&Le.keybinds[o]===n.code);r&&(Le.keybinds[r]=s),Le.keybinds[e]=n.code,ad(Le),hl(),Do()};window.addEventListener("keydown",t,{capture:!0,once:!0})});Io.addEventListener("close",()=>{mn&&Nn&&_r&&ve.requestLock()});hl();const Vo=Ie("name-input"),oy=Ie("server-input"),Na=Ie("join-btn");Vo.value=localStorage.getItem("islandName")??"";Ie("join-btn").addEventListener("click",()=>{fd()});Vo.addEventListener("keydown",i=>{i.key==="Enter"&&fd()});function ay(){return mr?Promise.resolve(mr):(Pa||(Pa=Ed(()=>import("./rapier.es-DVCvfZ9g.js"),[]).then(async({default:i})=>(await i.init(),mr=i,i))),Pa)}function cr(i){Na.disabled=i,Na.setAttribute("aria-busy",String(i)),Na.textContent=i?"Spiel wird geladen…":"Beitreten"}async function fd(){const i=Vo.value.trim();if(!i){Ie("menu-error").textContent="Bitte einen Namen eingeben.";return}localStorage.setItem("islandName",i),oi=i,tr=localStorage.getItem(`islandResumeToken:${i.toLocaleLowerCase()}`)??"",rt.unlock(),Ie("menu-error").textContent="Lade Physik und verbinde…",cr(!0);try{await ay()}catch{Ie("menu-error").textContent="Die Spielphysik konnte nicht geladen werden. Bitte Seite neu laden.",cr(!1);return}let e;const t=oy.value.trim();t?e=t.startsWith("http")?t:`http://${t}`:location.port==="5173"&&(e="http://localhost:3000"),vt=new Dx(e,{onLobby:n=>hy(n),onJoinError:n=>{Ie("menu-error").textContent=n,Ie("lobby-error").textContent=n,cr(!1)},onMatchStart:n=>uy(n),onRoundStart:n=>dy(n),onSnapshot:n=>fy(n),onEvents:n=>{for(const s of n)vy(s)},onRoundEnd:n=>{Nn=!1,ll=n.round;const s=n.placements.find(r=>r.id===Ne);rt.play(s?.place===1?"roundWin":"roundLose"),s?.place===1&&ds(180,.35,.55),ue.showRoundEnd(n.round,n.placements,n.totals,n.nextRoundIn,Ne,n.matchOver===!1&&n.round>=3,n.stats)},onMatchEnd:n=>{Nn=!1,mn=!1,ue.showMatchEnd(n.standings,n.totals,n.winnerName,Ne,n.winnerId===Ne,n.stats),document.exitPointerLock?.(),cy(n.standings,n.stats,ld||!!n.practice),hd()},onSession:n=>{Ne=n.playerId,tr=n.resumeToken,localStorage.setItem(`islandResumeToken:${oi.toLocaleLowerCase()}`,tr),xo=n.resumed,n.resumed&&(ue.setNetworkStatus("Verbindung wiederhergestellt",!1),setTimeout(()=>ue.setNetworkStatus(null),1800))},onConnectionState:(n,s)=>{if(n==="connected"){_r=!0;const r=vt?.socket.id??"";vt&&r&&r!==Ua&&(Ua=r,vt.join(oi,tr||void 0))}else n==="disconnected"?(_r=!1,document.exitPointerLock?.(),ue.setNetworkStatus(mn?"Verbindung unterbrochen — Wiederverbindung läuft …":"Serververbindung getrennt — neuer Versuch läuft …")):(mn||(Ie("menu-error").textContent=`Server nicht erreichbar${s?` (${s})`:""}.`),ue.setNetworkStatus("Host/Server nicht erreichbar — neuer Versuch läuft …"),cr(!1))},onConnectionNotice:n=>{n.type==="lost"&&n.playerId!==Ne?ue.setNetworkStatus("Ein Spieler hat die Verbindung verloren — Reconnect-Fenster aktiv"):n.type==="reconnected"&&n.playerId!==Ne?(ue.setNetworkStatus("Spieler wieder verbunden",!1),setTimeout(()=>ue.setNetworkStatus(null),1800)):n.type==="hostChanged"&&(ue.setNetworkStatus(n.playerId===Ne?"Du bist jetzt Host":"Host wurde automatisch übertragen",!1),setTimeout(()=>ue.setNetworkStatus(null),2400))}}),vt.socket.connected&&(_r=!0,Ua=vt.socket.id??"",vt.join(oi,tr||void 0))}function cy(i,e,t){const n=i.find(o=>o.id===Ne);if(!n||!oi)return;const s=e[Ne]??{kills:0,damageDealt:0,damageTaken:0,shotsFired:0,hits:0,headshots:0,pickups:0},r=Nv(Hu(oi),{seed:ol??0,placement:n.place,points:n.points,players:i.length,rounds:ll,deaths:cl,stats:s,practice:t});kv(oi,r)}function ly(i){const e=Hu(i),t=e.career;Ie("profile-name").textContent=i?`Karriere von ${i} (nur echte Matches)`:"Bitte zuerst einen Namen eingeben.";const n=t.matches>0?`${Math.round(t.wins/t.matches*100)}%`:"—",s=Fv(t),r=t.hits>0?`${Math.round(t.headshots/t.hits*100)}%`:"—",o=[["Matches",String(t.matches)],["Siege",`${t.wins} (${n})`],["K/D",Ov(t)],["Kills",String(t.kills)],["Präzision",s===null?"—":`${s}%`],["Kopftreffer",r],["Schaden",String(t.damageDealt)],["Beste Platzierung",t.bestPlacement>0?`${t.bestPlacement}.`:"—"]];Ie("profile-tiles").innerHTML="";for(const[c,l]of o){const h=document.createElement("div");h.className="profile-tile";const u=document.createElement("strong");u.textContent=l;const f=document.createElement("span");f.textContent=c,h.append(u,f),Ie("profile-tiles").appendChild(h)}const a=Ie("profile-history-body");if(a.innerHTML="",e.history.length===0){const c=document.createElement("tr");c.innerHTML='<td colspan="6" style="color:#9fb3c4">Noch keine Matches gespielt.</td>',a.appendChild(c)}for(const c of e.history){const l=document.createElement("tr"),h=new Date(c.date),u=`${h.getDate().toString().padStart(2,"0")}.${(h.getMonth()+1).toString().padStart(2,"0")}. ${h.getHours().toString().padStart(2,"0")}:${h.getMinutes().toString().padStart(2,"0")}`;l.innerHTML=`<td></td><td>${c.placement}. / ${c.players}</td><td>${c.kills}</td><td>${c.damageDealt}</td><td>${c.points}</td><td>${c.practice?'<span class="practice-badge">Übung</span>':""}</td>`,l.children[0].textContent=u,a.appendChild(l)}}Ie("profile-btn").addEventListener("click",()=>{ly(Vo.value.trim()||oi),Sr("profile-screen"),rt.play("click")});Ie("profile-back-btn").addEventListener("click",()=>{Sr(vt?"lobby-screen":"menu-screen"),rt.play("click")});Ie("practice-btn").addEventListener("click",()=>{const i=Number(Ie("practice-bots").value),e=Ie("practice-difficulty").value;vt?.startPractice(i,e),rt.play("click")});let Ts=!1;Ie("ready-btn").addEventListener("click",()=>{Ts=!Ts,vt?.setReady(Ts),rt.play("click")});Ie("start-btn").addEventListener("click",()=>{vt?.startMatch(),rt.play("click")});Ie("rematch-btn").addEventListener("click",()=>{vt?.rematch(),ue.hideScoreboard(),ue.hide(),Ts=!0,Sr("lobby-screen")});function Sr(i){for(const e of["menu-screen","lobby-screen","scoreboard-screen","profile-screen"])Ie(e).classList.toggle("hidden",e!==i)}function hy(i){cr(!1),mn||ue.setNetworkStatus(null),gr=new Map(i.players.map(r=>[r.id,r.name])),i.players.forEach((r,o)=>Co.set(r.id,o));const e=i.players.find(r=>r.id===Ne);if(!e||(La=!!e?.isHost,e&&(Ts=e.ready),mn))return;Sr("lobby-screen");const t=Ie("lobby-players");t.innerHTML="";for(const r of i.players){const o=document.createElement("li"),a=document.createElement("span");a.textContent=r.name+(r.id===Ne?" (du)":"");const c=document.createElement("span");c.className="tag"+(r.ready?" ready":""),c.textContent=(r.isHost?"👑 Host · ":"")+(r.ready?"bereit ✓":"wartet…"),o.append(a,c),t.appendChild(o)}Ie("ready-btn").textContent=Ts?"Bereit ✓ (klicken zum Ändern)":"Bereit";const n=Ie("start-btn");n.style.display=La?"block":"none",n.disabled=!i.canStart,Ie("practice-block").style.display=La?"block":"none";const s=Math.max(1,5-i.players.length);for(const r of Ie("practice-bots").options)r.disabled=Number(r.value)>s;Ie("lobby-error").textContent=i.players.length<2?"Warte auf weitere Spieler (min. 2) — oder starte Solo-Training…":""}function uy(i){if(!mr){Ie("lobby-error").textContent="Spielphysik lädt noch — bitte erneut starten.";return}hd(),mn=!0,ol=i.seed,hs=0,rt.setSeed(i.seed),Lc=!1,ld=!!i.practice,cl=0,ll=0,Ho=null,i.players.forEach((e,t)=>{gr.set(e.id,e.name),Co.set(e.id,t)}),Nt=Dv(i.seed,i.n),Ht=new zx(Nt),Ht.setGraphicsQuality(Le.graphics),Ht.scene.add(gt),$e=new $x(Ht.scene,gt,i.seed),Ft=new Cv(mr,Nt),Ft.addPlayer(Ne,{x:0,y:20,z:0}),ue.initIsland(Nt.params,Nt.spawns,Nt.pois);for(const e of i.players)e.id!==Ne&&$e.ensurePlayer(e.id,Co.get(e.id)??0);Sr(null),ue.show(),ve.requestLock()}function dy(i){if(!Nt||!Ht||!Ft||!$e)return;ue.hideScoreboard(),ue.show(),Nn=!0,Xt=!0,Mn="fists",ai=[],Pi.clear(),bs.clear(),Po.clear(),_o=0,Uc=null,rr=0,rl.clear(),Ht.resetResourceNodes(),ls=null,Li=null,Lo=!1,Tn=0,Oi=0,ws=0,cd=0,vo=Zc,Pt=null,Ho=null,us=0,or=0,ar=0,si=ur,ci=0,al=0,yo=0,ue.setFlashWhiteout(0),ue.setCooking(null,Ec),ue.setScoped(!1),ue.setBreath(null,!1),$e.clearSmokes();const e=i.spawns[Ne]??0,t=Nt.spawns[e],n=Tt(Nt.params,t.x,t.z);ee=ku({x:t.x,y:n+.1,z:t.z}),Ft.setPlayerSneaking(Ne,!1,ee.pos),Ft.setPlayerPos(Ne,ee.pos),ve.yaw=Math.atan2(- -t.x,- -t.z),ve.pitch=0,$e.clearPickups(),$e.clearProjectiles();for(const s of i.pickups)$e.addPickup(s);$e.setViewWeapon("fists"),$e.setAiming(!1),$e.setReloading(!1),$e.setViewVisible(!0),gt.fov=75,gt.updateProjectionMatrix(),ue.setSpectating(!1),ue.hideDeathRecap(),i.suddenDeath&&!Lc?(Lc=!0,ue.announce("⚔ SUDDEN DEATH — eine Runde entscheidet!",4e3)):ue.announce(`Runde ${Math.min(i.round,3)}${i.suddenDeath?" (Sudden Death)":""}`,2200),ve.requestLock()}function fy(i){Pt=i,Ic={t:i.t,at:performance.now()};const e=performance.now();for(const t of i.players){if(t.id===Ne){py(t);continue}bs.has(t.id)||(bs.set(t.id,[]),$e?.ensurePlayer(t.id,Co.get(t.id)??0));const n=bs.get(t.id);for(n.push({at:e,x:t.x,y:t.y,z:t.z,yaw:t.yaw,pitch:t.pitch});n.length>30;)n.shift();$e?.updatePlayer(t.id,t.x,t.y,t.z,t.yaw,t.pitch,t.alive,t.weapon,t.sneaking,t.aiming)}$e?.syncProjectiles(i.projectiles),$e?.setCareIncoming(i.care.x,i.care.z,i.care.state==="incoming")}function py(i){if(!Ft)return;const e=Xt;Xt=i.alive,e&&!Xt&&my(),ue.setHp(i.hp),ue.setWeapon(i.weapon),Mn=i.weapon,ai=ai.filter(s=>s.seq>i.lastSeq);for(const s of[...Pi.keys()])s<i.lastSeq&&Pi.delete(s);const t=Pi.get(i.lastSeq);if(!t&&!xo)return;if(xo){ee.pos={x:i.x,y:i.y,z:i.z},ee.velX=i.vx,ee.velY=i.vy,ee.velZ=i.vz,ee.grounded=i.grounded,ee.stamina=i.stamina,ee.sprinting=i.sprinting,ee.sneaking=i.sneaking,Ft.setPlayerSneaking(Ne,ee.sneaking,ee.pos),Ft.setPlayerPos(Ne,ee.pos),ai=[],Pi.clear(),xo=!1;return}if(!t)return;if(Math.hypot(t.x-i.x,t.y-i.y,t.z-i.z)>Mv){ee.pos={x:i.x,y:i.y,z:i.z},ee.velX=i.vx,ee.velY=i.vy,ee.velZ=i.vz,ee.grounded=i.grounded,ee.stamina=i.stamina,ee.sprinting=i.sprinting,ee.sneaking=i.sneaking,Ft.setPlayerSneaking(Ne,ee.sneaking,ee.pos),Ft.setPlayerPos(Ne,ee.pos);for(const s of ai)Bu(Ft,Ne,ee,s)}Pi.delete(i.lastSeq)}function my(){ue.setSpectating(!0),$e?.setViewVisible(!1),qn.set(ee.pos.x,ee.pos.y+14,ee.pos.z+10)}function Nc(i,e,t){return Math.hypot(i-ee.pos.x,e-ee.pos.y,t-ee.pos.z)}function gy(i){if(!i||i===Ne)return null;const e=Pt?.players.find(o=>o.id===i);if(!e)return null;const t=e.x-ee.pos.x,n=e.z-ee.pos.z,s=Math.atan2(-t,-n);let r=ve.yaw-s;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;return r}function _y(i){i.item==="bandageItem"?rt.play("pickupHeal"):i.item==="plateItem"?rt.play("pickupArmor"):i.item==="arrowBundle"||i.item==="pistolAmmo"||i.item==="rifleAmmo"||i.item==="shellAmmo"||i.item==="grenade"?rt.play("pickupAmmo"):i.item in Fi?rt.play("pickupWeapon"):rt.play("pickup")}function vy(i){switch(i.type){case"shot":{const e=i.by===Ne?0:Nc(i.ox,i.oy,i.oz),t=i.weapon,n=t==="bow"?"bow":t==="shotgun"?"shotgun":t==="rifle"?"rifle":"pistol";if(i.by===Ne?rt.play(n,e):Ii(n,i.ox,i.oy,i.oz),Fi[t].kind==="hitscan"&&i.hx!==void 0&&i.hy!==void 0&&i.hz!==void 0&&($e?.addTracer(new D(i.ox,i.oy,i.oz),new D(i.hx,i.hy,i.hz)),$e?.addImpact(i.hx,i.hy,i.hz,t)),i.by===Ne&&i.primary!==!1&&$e?.addMuzzleFlash(gt),i.by===Ne&&i.primary!==!1){const s=Fi[t],r=(cd++%5-2)/2;ve.applyRecoil((s.recoilPitch??0)*(ve.aim?.72:1),(s.recoilYaw??0)*r),ws=Math.min(14,ws+(t==="shotgun"?8:t==="rifle"?3.2:2.4))}i.by===Ne&&i.primary!==!1&&!_s&&Le.cameraShake&&(Oi=Math.min(2.4,Oi+(t==="shotgun"?1.8:t==="rifle"?1.05:t==="pistol"?.7:.35)));break}case"melee":if(i.by===Ne)rt.play("melee");else{const e=Pt?.players.find(t=>t.id===i.by);e&&Ii("melee",e.x,e.y,e.z)}i.by===Ne&&$e?.meleeSwing();break;case"explosion":$e?.addExplosion(i.x,i.y,i.z,i.radius);{const e=Nc(i.x,i.y,i.z);Ii("explosion",i.x,i.y,i.z),e<i.radius*3&&(!_s&&Le.cameraShake&&(Tn=Math.min(1,Tn+Math.max(0,1-e/(i.radius*3))*.8)),ds(160,Math.max(.15,1-e/(i.radius*3)),.3))}break;case"damage":i.target===Ne&&(ue.damageFlash(),ue.damageDirection(gy(i.attacker)),rt.play("hurt"),ue.setHp(i.hp),!_s&&Le.cameraShake&&(Tn=Math.min(1,Tn+.72)),ds(95,.35,.22));break;case"hitmarker":ue.hitmarker(i.headshot),rt.play(i.headshot?"headshot":"hit"),$e?.flashPlayer(i.target,i.headshot);break;case"death":{if(i.target===Ne){cl+=1,ue.announce("☠ Du bist raus — Zuschauermodus",3e3);const e=i.attacker?gr.get(i.attacker)??"Unbekannt":null,t=i.cause==="zone"?"die Zone":i.weapon?$h(i.weapon):"einen Treffer",n=[e?`${e} · ${t}`:t,i.finalDamage?`${i.finalDamage} letzter Schaden`:"",i.distance!==void 0?`${Math.round(i.distance)} m`:"",i.headshot?"Kopftreffer":"",i.attackerHp!==void 0?`Gegner: ${Math.ceil(i.attackerHp)} HP`:""].filter(Boolean).join(" · ");ue.showDeathRecap(`Eliminiert durch ${n}`),rt.play("death"),ds(280,.85,.5)}else i.attacker===Ne&&(rt.play("elimination"),ds(120,.2,.45));break}case"kill":{const e=i.killer?gr.get(i.killer)??"???":null,t=gr.get(i.victim)??"???",n=i.weapon==="zone"?e?`${t} von der Zone erledigt (letzter Treffer: ${e})`:`☣ ${t} stirbt in der Zone`:`${e} ⚔ ${t} (${$h(i.weapon)})`;ue.killfeed(n,i.killer===Ne||i.victim===Ne);break}case"pickupSpawn":$e?.addPickup(i.pickup);break;case"pickupRemove":$e?.removePickup(i.id,!0),i.by===Ne&&(_y(i),ue.punchPickup());break;case"resource":i.depleted&&(rl.add(i.nodeId),Ht?.depleteResourceNode(i.nodeId)),i.by===Ne&&(rt.play("craft"),Li=null);break;case"inventory":{Ho=i.inv;const e=xy(i.inv.active,i.inv);i.inv.reloading&&!Lo&&rt.play("reload");const t=e==="none"?1:Fi[e].reloadTime??1;$e?.setReloading(i.inv.reloading,t)}Lo=i.inv.reloading,ue.setInventory(i.inv);break;case"craft":i.by===Ne&&(i.ok?(rt.play("craft"),ue.announce(`Hergestellt: ${i.recipe==="arrows"?"Pfeile":i.recipe==="bandage"?"Verband":"Panzerplatte"}`,1400)):ue.announce(i.reason??"Nicht genug Material",1400));break;case"heal":i.target===Ne&&(ue.setHp(i.hp),rt.play("heal"));break;case"care":i.state==="incoming"?(ue.announce("📦 Versorgungspaket im Anflug (Inselmitte)!",3500),rt.play("care")):i.state==="landed"&&(ue.announce("📦 Versorgungspaket gelandet!",2500),rt.play("care"));break;case"zoneStep":ue.announce(`☣ Zone schrumpft! (Schaden ${i.dot} HP/s)`,3e3),rt.play("zone");break;case"smoke":Ii("smokePop",i.x,i.y,i.z);break;case"flash":Ii("flashBang",i.x,i.y,i.z);break;case"flashed":i.target===Ne&&(ci=Math.max(ci,_s?i.intensity*.6:i.intensity),al=ci/Math.max(.25,i.duration),ds(140,.4,.3));break;case"cookout":i.by===Ne&&ue.announce("💥 Zu lange gehalten — Granate in der Hand explodiert!",2600);break}}function xy(i,e){let t="none";if(i===3)t=_v[e.activeThrow];else{const n=i===1?e.primary:e.secondary;t=n?n.type:"none"}return $e?.setViewWeapon(t),t}function yy(i){if(!Nt||!Xt){ue.setInteract(null,0);return}let e=null;for(const t of Nt.vegetation){if(rl.has(t.id))continue;const n=t.kind==="tree"?3.4:2.8,s=Math.hypot(t.x-ee.pos.x,t.z-ee.pos.z);s<n&&(!e||s<e.d)&&(e={kind:t.kind,d:s})}if(e)if(ve.interact){Li=Li??performance.now();const t=Math.min(1,(performance.now()-Li)/(vv*1e3)),n=e.kind==="tree"?"Holz hacken":e.kind==="rock"?"Stein abbauen":"Fasern sammeln";ue.setInteract(`${n}…`,t)}else{Li=null;const t=e.kind==="tree"?"🪵 Holz":e.kind==="rock"?"🪨 Stein":"🌿 Fasern";ue.setInteract(`[E halten] ${t} sammeln`,0)}else Li=null,ue.setInteract(null,0)}let Kh=performance.now();function pd(){requestAnimationFrame(pd);const i=performance.now();let e=(i-Kh)/1e3;if(Kh=i,e=Math.min(e,.1),hs+=e,!Ht||!$e||!Ft||!vt){ft.clear();return}const t=Pt?Ic.t+(i-Ic.at)/1e3:0,n=Mn==="bow"||Mn==="pistol"||Mn==="rifle"||Mn==="shotgun"||Mn==="sniper",s=Nn&&Xt&&ve.aim&&n&&!Lo;$e.setAiming(s),Ie("hud").classList.toggle("aiming",s);const r=s&&Mn==="sniper",o=r&&ve.sprint&&si>0;if(r){us+=e,si=o?Math.max(0,si-e):Math.min(ur,si+Ph*e*.35);const g=Math.hypot(ee.velX,ee.velZ)*.0016,v=(o?6e-4:.0034+g)*(ee.sneaking?.6:1);or=Math.sin(us*1.9)*v+Math.sin(us*3.1+1.3)*v*.5,ar=Math.cos(us*1.55)*v*.8+Math.sin(us*2.6)*v*.35,ue.setBreath(si/ur,o)}else si=Math.min(ur,si+Ph*e),or=0,ar=0,ue.setBreath(null,!1);ue.setScoped(r);const a=(s?Fi[Mn].aimFov??55:75)+Oi,c=_s?1:1-Math.exp(-e*14),l=gt.fov+(a-gt.fov)*c;Math.abs(l-gt.fov)>.01&&(gt.fov=l,gt.updateProjectionMatrix()),Oi=Math.max(0,Oi-e*8.5),ws=Math.max(0,ws-e*9.5);const h=s?2.4:Mn==="shotgun"?9:Mn==="bow"?4:5;if(ue.setCrosshairSpread(h+Math.hypot(ee.velX,ee.velZ)*(s?.18:.55)+ws),Nn&&Xt&&mn&&_r){const g={seq:++ey,dt:Math.min(e,Ou),mx:ve.pointerLocked?ve.moveX:0,mz:ve.pointerLocked?ve.moveZ:0,yaw:ve.yaw+or,pitch:ve.pitch+ar,sprint:ve.sprint&&!s,sneak:ve.pointerLocked&&ve.sneak,aim:s,jump:ve.pointerLocked&&ve.jumpHeld,fire:ve.fire,interact:ve.interact};ve.slotPressed&&(ve.slotPressed===3&&Ho?.active===3?g.throwCycle=!0:g.slot=ve.slotPressed),ve.reloadPressed&&(g.reload=!0),Bu(Ft,Ne,ee,g),Pi.set(g.seq,{...ee.pos}),ai.push(g),vt.sendInput(g),Ft.step(),ny(e),ve.craftPressed&&vt.craft(ve.craftPressed),ve.bandagePressed&&(vt.useBandage(),ls=i);const v=ee.sneaking?hv:Zc,p=_s?1:1-Math.exp(-e*13);vo+=(v-vo)*p,gt.position.set(ee.pos.x,ee.pos.y+vo,ee.pos.z),gt.rotation.set(0,0,0),gt.rotateY(ve.yaw+or),gt.rotateX(ve.pitch+ar),Ht.updateLocalCover(ee.pos.x,ee.pos.z)}else if(Nn&&!Xt){const g=22*e,v=Math.sin(ve.yaw),p=Math.cos(ve.yaw),d=new D(-v*Math.cos(ve.pitch),Math.sin(ve.pitch),-p*Math.cos(ve.pitch)),b=new D(p,0,-v);qn.addScaledVector(d,ve.moveZ*g),qn.addScaledVector(b,ve.moveX*g),ve.jumpHeld&&(qn.y+=g),qn.y=Math.max(2,Math.min(120,qn.y)),gt.position.copy(qn),gt.rotation.set(0,0,0),gt.rotateY(ve.yaw),gt.rotateX(ve.pitch),Ht.updateLocalCover(9999,9999)}if(Tn>0&&Xt){const g=Tn*Tn;gt.position.x+=Math.sin(hs*61)*g*.025,gt.position.y+=Math.cos(hs*73)*g*.018,gt.rotateZ(Math.sin(hs*47)*g*.012),Tn=Math.max(0,Tn-e*3.4)}const u=i-yv;for(const[g,v]of bs){if(g===Ne||v.length===0)continue;let p=v[0],d=v[v.length-1];for(let x=0;x<v.length-1;x++)if(v[x].at<=u&&v[x+1].at>=u){p=v[x],d=v[x+1];break}const b=d.at-p.at,E=b>0?Math.max(0,Math.min(1,(u-p.at)/b)):1,_=(x,P)=>x+(P-x)*E;let R=d.yaw-p.yaw;R>Math.PI&&(R-=2*Math.PI),R<-Math.PI&&(R+=2*Math.PI);const T=Pt?.players.find(x=>x.id===g),A=_(p.x,d.x),C=_(p.y,d.y),S=_(p.z,d.z);$e.updatePlayer(g,A,C,S,p.yaw+R*E,_(p.pitch,d.pitch),T?.alive??!0,T?.weapon??"fists",T?.sneaking??!1,T?.aiming??!1),iy(g,A,S,{alive:T?.alive??!0,grounded:T?.grounded??!1,sneaking:T?.sneaking??!1,sprinting:T?.sprinting??!1})}if(ue.setCompass(ve.yaw),ci>0&&(ci=Math.max(0,ci-al*e),ue.setFlashWhiteout(ci)),Pt){Ht.update(t,Pt.zone.radius,Pt.zone.targetRadius),$e.syncSmokes(Pt.smokes,t),ue.setTimer(t,Pt.phase),ue.setZoneInfo(Pt.zone,t),ue.setAlive(Pt.aliveCount);const g=Pt.players.find(v=>v.id===Ne);if(Xt&&g?.cookingUntil!==void 0){const v=Math.max(0,g.cookingUntil-t);ue.setCooking(v,Ec),i>=yo&&(rt.play("grenadeBeep",0,v<1?1:.65),yo=i+Math.max(95,v*260))}else ue.setCooking(null,Ec),yo=0;if(g){ue.setStamina(Xt?ee.stamina:0);const v=Math.hypot(ee.pos.x,ee.pos.z)>Pt.zone.radius;ue.setInZone(Xt&&v),g.bandaging?(ls=ls??i,ue.setHealProgress(Math.min(1,(i-ls)/(xv*1e3)))):(ls=null,ue.setHealProgress(null))}ue.drawMinimap(Xt?ee.pos.x:qn.x,Xt?ee.pos.z:qn.z,ve.yaw,Pt.zone,Pt.pings,Pt.care,t)}yy(),$e.update(e,hs),ve.debugToggled&&(Ia=!Ia),er+=e,Da++,er>=.5&&(jh=Math.round(Da/er),Dc=Math.round(vt.bytesIn/er/1024*10)/10,vt.bytesIn=0,er=0,Da=0);const f=$e.stats(),m=Ft.stats();ue.setDebug(Ia?`FPS ${jh} · calls ${ft.info.render.calls} · tris ${ft.info.render.triangles}
pos ${ee.pos.x.toFixed(1)} ${ee.pos.y.toFixed(1)} ${ee.pos.z.toFixed(1)} · vel ${Math.hypot(ee.velX,ee.velZ).toFixed(1)}
entities P${f.players} L${f.pickups} J${f.projectiles} FX${f.effects}
Rapier bodies ${m.rigidBodies} · colliders ${m.colliders} · capsules ${m.playerCapsules}
net ↓ ${Dc} kB/s · ${vt.rttMs.toFixed(0)} ms ±${vt.jitterMs.toFixed(0)} · loss ${vt.lossPct.toFixed(1)}% · pending ${ai.length}`:null),ve.clearEdges(),ft.render(Ht.scene,gt)}document.addEventListener("pointerlockchange",()=>{const i=document.pointerLockElement===ft.domElement;Ie("pause-hint").style.display=!i&&mn&&Nn?"block":"none"});Ie("pause-hint").addEventListener("click",i=>{i.target.closest("button")||mn&&Nn&&!Io.open&&ve.requestLock()});ft.domElement.addEventListener("click",()=>{mn&&!ve.pointerLocked&&ve.requestLock()});requestAnimationFrame(pd);
