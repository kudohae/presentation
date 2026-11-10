// 3D "extras": props that fly in, idle, and leave per step. Built from primitives (no external models).
(function(){
if(!window.THREE) return;
const T3=THREE;
if(T3.ColorManagement) T3.ColorManagement.legacyMode=false;
const cvs=document.createElement('canvas'); cvs.id='three'; document.body.appendChild(cvs);
const R=new T3.WebGLRenderer({canvas:cvs,antialias:true,alpha:true});
R.setPixelRatio(Math.min(devicePixelRatio,2)); R.outputEncoding=T3.sRGBEncoding;
const S=new T3.Scene();
const CAM=new T3.PerspectiveCamera(35,1,0.1,300); CAM.position.set(0,0,20);
S.add(new T3.HemisphereLight(0xfff3e0,0x2a2018,1.05));
const key=new T3.DirectionalLight(0xffffff,1.35); key.position.set(-6,10,12); S.add(key);
const rim=new T3.DirectionalLight(0xffc9a0,.55); rim.position.set(9,-3,-8); S.add(rim);
function resize(){R.setSize(innerWidth,innerHeight,false);CAM.aspect=innerWidth/innerHeight;CAM.updateProjectionMatrix();}
resize(); addEventListener('resize',resize);
const TAN=Math.tan(T3.MathUtils.degToRad(17.5));
const HH=(z=0)=>TAN*(20-z), HW=(z=0)=>HH(z)*CAM.aspect;
const V=(x,y,z)=>new T3.Vector3(x,y,z);
const COL={red:0xd6332a,cream:0xf3ece0,ink:0x2a2522,yellow:0xf2b632,wood:0xd9a35a,dark:0x5a3a22,white:0xfaf6ee,gold:0xe0b33a,steel:0xbdb8ae,pink:0xe98a9a,brown:0x8a6a3a,moon:0xf2d44a};
const mat=(c,o)=>new T3.MeshStandardMaterial(Object.assign({color:c,roughness:.6,flatShading:true},o||{}));
function mesh(g,m,p,r,s){const o=new T3.Mesh(g,m);if(p)o.position.set(p[0],p[1],p[2]);if(r)o.rotation.set(r[0],r[1],r[2]);if(s)o.scale.set(s[0],s[1],s[2]);return o;}
const PI=Math.PI;

// ---------- orientation helper for things that fly (forward = +z) ----------
function flyAlong(obj,curve,t,bankK){
  t=Math.min(Math.max(t,0),1);
  const p=curve.getPointAt(t), a=curve.getTangentAt(Math.min(t,.995)), b=curve.getTangentAt(Math.min(t+.02,1));
  obj.position.copy(p); obj.lookAt(p.clone().add(a));
  const turn=a.x*b.z-a.z*b.x;
  obj.rotateZ(T3.MathUtils.clamp(-turn*(bankK||40),-1.1,1.1));
}

// ---------- models ----------
function plane(){
  const g=new T3.Group(), red=mat(COL.red), cream=mat(COL.cream), ink=mat(COL.ink);
  g.add(mesh(new T3.CylinderGeometry(.42,.22,3.2,10),red,[0,0,0],[PI/2,0,0]));
  g.add(mesh(new T3.CylinderGeometry(.5,.5,.35,12),cream,[0,0,1.7],[PI/2,0,0]));
  const prop=new T3.Group(); prop.position.set(0,0,1.92);
  prop.add(mesh(new T3.BoxGeometry(.13,2,.06),ink)); prop.add(mesh(new T3.BoxGeometry(2,.13,.06),ink));
  g.add(prop); g.userData.prop=prop;
  g.add(mesh(new T3.BoxGeometry(4.6,.09,1.0),red,[0,-.3,.5]));
  g.add(mesh(new T3.BoxGeometry(5.0,.09,1.0),red,[0,.78,.6]));
  for(const sx of [-1.7,-.5,.5,1.7]) g.add(mesh(new T3.CylinderGeometry(.04,.04,1.08,6),cream,[sx,.24,.55]));
  g.add(mesh(new T3.BoxGeometry(1.8,.07,.65),red,[0,.05,-1.45]));
  g.add(mesh(new T3.BoxGeometry(.07,.8,.65),cream,[0,.42,-1.45]));
  g.add(mesh(new T3.SphereGeometry(.3,10,8,0,PI*2,0,PI/2),ink,[0,.33,-.15]));
  for(const sx of [-.5,.5]){
    g.add(mesh(new T3.CylinderGeometry(.24,.24,.13,14),ink,[sx,-.88,.72],[0,0,PI/2]));
    g.add(mesh(new T3.CylinderGeometry(.035,.035,.6,5),cream,[sx*.8,-.58,.72],[0,0,sx>0?-.3:.3]));
  }
  return g;
}
function pencil(){
  const g=new T3.Group();
  g.add(mesh(new T3.CylinderGeometry(.3,.3,3.4,6),mat(COL.yellow)));
  g.add(mesh(new T3.ConeGeometry(.3,.75,6),mat(0xe8c99a),[0,-2.07,0],[PI,0,0]));
  g.add(mesh(new T3.ConeGeometry(.1,.26,6),mat(COL.ink),[0,-2.32,0],[PI,0,0]));
  g.add(mesh(new T3.CylinderGeometry(.31,.31,.34,12),mat(COL.steel,{metalness:.5,roughness:.35}),[0,1.87,0]));
  g.add(mesh(new T3.CylinderGeometry(.3,.3,.4,12),mat(COL.pink),[0,2.24,0]));
  return g;
}
function pages(){
  const g=new T3.Group(); g.userData.list=[];
  const sheet=new T3.PlaneGeometry(1.5,1.9), strip=new T3.BoxGeometry(1.5,.32,.03);
  const cm=mat(COL.cream,{side:T3.DoubleSide,flatShading:false}), rm=mat(COL.red), im=mat(COL.ink);
  for(let i=0;i<9;i++){
    const p=new T3.Group(); p.add(new T3.Mesh(sheet,cm)); p.add(mesh(strip,rm,[0,.95,0]));
    for(let k=0;k<3;k++) p.add(mesh(new T3.BoxGeometry(.9-k*.2,.07,.01),im,[-.1,.3-k*.35,.01]));
    g.add(p); g.userData.list.push(p);
  }
  return g;
}
function roll(){
  const g=new T3.Group();
  g.add(mesh(new T3.CylinderGeometry(.95,.95,1.4,28),mat(COL.white,{flatShading:false}),[0,0,0],[PI/2,0,0]));
  g.add(mesh(new T3.CylinderGeometry(.38,.38,1.44,18),mat(0xa77b4f),[0,0,0],[PI/2,0,0]));
  g.add(mesh(new T3.CylinderGeometry(.3,.3,1.46,18),mat(COL.ink),[0,0,0],[PI/2,0,0]));
  const tail=mesh(new T3.BoxGeometry(.03,1.6,1.38),mat(COL.white),[.95,-.75,0],[0,0,.08]); g.add(tail);
  for(let k=0;k<3;k++) g.add(mesh(new T3.BoxGeometry(.035,.02,1.38),mat(0xd8d2c6),[.965,-.3-k*.5,0]));
  return g;
}
function padlock(){
  const g=new T3.Group();
  g.add(mesh(new T3.BoxGeometry(1.5,1.2,.55),mat(COL.gold,{metalness:.45,roughness:.35})));
  g.add(mesh(new T3.TorusGeometry(.5,.13,10,22,PI),mat(COL.steel,{metalness:.7,roughness:.25}),[0,.6,0]));
  g.add(mesh(new T3.CylinderGeometry(.13,.13,.6,10),mat(COL.ink),[0,.05,0],[PI/2,0,0]));
  g.add(mesh(new T3.BoxGeometry(.08,.3,.6),mat(COL.ink),[0,-.2,0]));
  return g;
}
function cigarette(){
  const g=new T3.Group();
  g.add(mesh(new T3.CylinderGeometry(.17,.17,2.4,14),mat(COL.white,{flatShading:false}),[0,.3,0]));
  g.add(mesh(new T3.CylinderGeometry(.175,.175,.8,14),mat(0xd88a3c),[0,-1.3,0]));
  g.add(mesh(new T3.CylinderGeometry(.165,.165,.12,14),mat(0xff5a2a,{emissive:0xff3a10,emissiveIntensity:1.4}),[0,1.56,0]));
  g.add(mesh(new T3.CylinderGeometry(.168,.168,.1,14),mat(0x555050),[0,1.47,0]));
  const puffs=new T3.Group(); g.add(puffs); g.userData.puffs=[];
  for(let i=0;i<9;i++){const m=new T3.Mesh(new T3.IcosahedronGeometry(.3,1),new T3.MeshStandardMaterial({color:0xd8d4cc,transparent:true,opacity:0,roughness:1,flatShading:true}));puffs.add(m);g.userData.puffs.push({m,ph:i/9});}
  return g;
}
function guitar(){
  const g=new T3.Group(), wood=mat(COL.wood), dark=mat(COL.dark), ink=mat(COL.ink);
  g.add(mesh(new T3.SphereGeometry(1.2,20,14),wood,[0,-.75,0],null,[1,1,.32]));
  g.add(mesh(new T3.SphereGeometry(.92,20,14),wood,[0,.55,0],null,[1,1,.32]));
  g.add(mesh(new T3.CylinderGeometry(.34,.34,.05,22),ink,[0,.05,.3],[PI/2,0,0]));
  g.add(mesh(new T3.BoxGeometry(.6,.14,.08),dark,[0,-1.25,.38]));
  g.add(mesh(new T3.BoxGeometry(.3,2.6,.16),dark,[0,2.55,.05]));
  g.add(mesh(new T3.BoxGeometry(.48,.75,.14),dark,[0,4.1,.04],[0,0,0]));
  for(let k=0;k<6;k++){ const x=-.1+k*.04; g.add(mesh(new T3.BoxGeometry(.015,5.3,.015),mat(0xeeeeee,{metalness:.6}),[x,1.42,.42])); }
  for(const s of [-1,1]) for(let k=0;k<3;k++) g.add(mesh(new T3.CylinderGeometry(.05,.05,.18,8),mat(COL.steel,{metalness:.6}),[s*.3,3.85+k*.2,.04],[0,0,PI/2]));
  return g;
}
function note(){
  const g=new T3.Group(), ink=mat(COL.ink);
  g.add(mesh(new T3.SphereGeometry(.28,12,10),ink,[0,0,0],[0,0,.4],[1.25,.9,.9]));
  g.add(mesh(new T3.CylinderGeometry(.045,.045,1.1,6),ink,[.3,.55,0]));
  g.add(mesh(new T3.BoxGeometry(.4,.12,.08),ink,[.48,1.0,0],[0,0,-.5]));
  return g;
}
function notes(){
  const g=new T3.Group(); g.userData.list=[];
  for(let i=0;i<6;i++){const n=note();n.scale.setScalar(.9);g.add(n);g.userData.list.push({n,ph:i/6,side:i%2?1:-1,lane:Math.random()});}
  return g;
}
function mug(){
  const g=new T3.Group();
  g.add(mesh(new T3.CylinderGeometry(.95,.88,2.1,20),mat(COL.yellow,{transparent:true,opacity:.9,flatShading:false,roughness:.25})));
  g.add(mesh(new T3.CylinderGeometry(1.0,1.0,.12,20),mat(0xfff3d0,{transparent:true,opacity:.5}),[0,-1.05,0]));
  g.add(mesh(new T3.TorusGeometry(.6,.15,10,20,PI),mat(0xfff3d0,{transparent:true,opacity:.75,roughness:.25}),[.95,0,0],[0,0,-PI/2]));
  const foam=mat(COL.white);
  [[0,1.1,0,.75],[.55,1.0,.3,.5],[-.5,1.05,-.3,.55],[.2,1.35,-.2,.5],[-.3,1.25,.4,.45],[.6,1.15,-.45,.42]].forEach(f=>g.add(mesh(new T3.IcosahedronGeometry(f[3],1),foam,[f[0],f[1],f[2]])));
  for(let k=0;k<5;k++) g.add(mesh(new T3.SphereGeometry(.06,6,5),mat(0xffffff,{transparent:true,opacity:.7}),[(Math.random()-.5)*1.1,-.6+Math.random()*1.2,.6+Math.random()*.2]));
  return g;
}
function tumbleweed(){
  const g=new T3.Group();
  for(let k=0;k<4;k++){
    const geo=new T3.EdgesGeometry(new T3.IcosahedronGeometry(1.25-k*.18,1));
    const l=new T3.LineSegments(geo,new T3.LineBasicMaterial({color:k%2?0x6e5230:0x9b7a48}));
    l.rotation.set(k*.7,k*1.3,k*.4); g.add(l);
  }
  return g;
}
function book(){
  const g=new T3.Group(), red=mat(COL.red), cream=mat(COL.cream);
  const L=new T3.Group(), Rr=new T3.Group(), P=new T3.Group();
  L.add(mesh(new T3.BoxGeometry(1.42,1.95,.06),red,[-.71,0,-.1])); L.add(mesh(new T3.BoxGeometry(1.3,1.82,.14),cream,[-.68,0,0]));
  Rr.add(mesh(new T3.BoxGeometry(1.42,1.95,.06),red,[.71,0,-.1])); Rr.add(mesh(new T3.BoxGeometry(1.3,1.82,.14),cream,[.68,0,0]));
  for(const grp of [L,Rr]) for(let k=0;k<4;k++) grp.add(mesh(new T3.BoxGeometry(.8,.06,.01),mat(COL.ink),[(grp===L?-.68:.68),.5-k*.3,.075]));
  P.add(mesh(new T3.PlaneGeometry(1.26,1.78),mat(0xfffaf0,{side:T3.DoubleSide,flatShading:false}),[.65,0,.09]));
  g.add(mesh(new T3.BoxGeometry(.14,1.95,.2),red,[0,0,-.06]));
  g.add(L,Rr,P); g.userData={L,R:Rr,P};
  return g;
}
function moon(){
  const g=new T3.Group();
  const m=mesh(new T3.IcosahedronGeometry(1.5,2),mat(COL.moon)); g.add(m); g.userData.ball=m;
  [[.6,.5,1.2,.32],[-.5,-.3,1.3,.26],[.1,-.8,1.2,.22],[-.8,.6,1.1,.2],[1.0,-.3,1.0,.18]].forEach(c=>m.add(mesh(new T3.SphereGeometry(c[3],10,8),mat(0xd9b93a),[c[0],c[1],c[2]],null,[1,1,.4])));
  const stars=new T3.Group(); g.add(stars); g.userData.stars=[];
  for(let i=0;i<7;i++){const s=mesh(new T3.OctahedronGeometry(.22,0),mat(0xfff3b0,{emissive:0xffe680,emissiveIntensity:.6}));stars.add(s);g.userData.stars.push({s,a:i/7*PI*2,r:2.4+(i%3)*.5,y:(i%2?.6:-.5)});}
  return g;
}
function bannerPlane(){
  const g=new T3.Group(); const p=plane(); g.add(p); g.userData.prop=p.userData.prop;
  const c=document.createElement('canvas'); c.width=1024; c.height=200; const x=c.getContext('2d');
  x.fillStyle='#f3ece0'; x.fillRect(0,0,1024,200); x.fillStyle='#d6332a'; x.fillRect(0,0,1024,14); x.fillRect(0,186,1024,14);
  x.font='900 104px Unbounded, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#d6332a'; x.fillText('До свидания!',512,106);
  const tex=new T3.CanvasTexture(c); tex.encoding=T3.sRGBEncoding; tex.anisotropy=4;
  const geo=new T3.PlaneGeometry(6.5,1.3,32,1);
  const ban=new T3.Mesh(geo,new T3.MeshStandardMaterial({map:tex,side:T3.DoubleSide,roughness:.8}));
  ban.rotation.y=-PI/2; ban.position.set(0,0,-6.1); g.add(ban); g.userData.ban=ban; g.userData.base=geo.attributes.position.array.slice();
  const rope=new T3.Mesh(new T3.CylinderGeometry(.02,.02,1.5,4),mat(COL.ink),[0,0,-2.4],[PI/2,0,0]); g.add(rope);
  return g;
}

// ---------- extras definitions ----------
// each: steps, build, enter(x,done), tick(x,dt,t), exit(x,done). x.root = outer group (moved), x.obj = model
const tw=(x,dur,ease,fn,done)=>{x.tw&&x.tw.kill();const o={t:0};x.tw=gsap.to(o,{t:1,duration:dur,ease,onUpdate:()=>fn(o.t),onComplete:done});};
// floating prop: enters along a curve while spinning, then bobs and sways to show its depth
function floater(def){
  return Object.assign({
    enter(x,done){
      const A=def.at(), from=def.from(), mid=def.via?def.via(from,A):from.clone().lerp(A,.5).add(V(0,2,4));
      const c=new T3.CatmullRomCurve3([from,mid,A]); const r0=def.rotFrom, r1=def.rotTo;
      x.anchor=A; x.base=r1;
      tw(x,def.dur||1.8,'power3.out',t=>{x.root.position.copy(c.getPointAt(t));
        x.obj.rotation.set(r0[0]+(r1[0]-r0[0])*t,r0[1]+(r1[1]-r0[1])*t,r0[2]+(r1[2]-r0[2])*t);},()=>{x.idleT0=x.time;done();});
    },
    idle(x,dt,t){
      const k=t-(x.idleT0||0), a=def.amp||.5, b=x.base;
      x.root.position.set(x.anchor.x+Math.sin(k*.7)*.25,x.anchor.y+Math.sin(k*1.3)*.25,x.anchor.z);
      x.obj.rotation.set(b[0]+Math.sin(k*.9)*a*.25,b[1]+Math.sin(k*.6)*a,b[2]+Math.sin(k*.8)*a*.2);
    },
    exit(x,done){
      const from=x.root.position.clone(), to=def.exitTo(from); const r=x.obj.rotation.clone(); const sp=def.exitSpin||[1,3,0];
      tw(x,def.exitDur||1.1,'power2.in',t=>{x.root.position.lerpVectors(from,to,t);x.obj.rotation.set(r.x+sp[0]*t,r.y+sp[1]*t,r.z+sp[2]*t);},done);
    }
  },def);
}

const EX=[];
// 1. biplane: swoops in from far away, then loops beside the title
EX.push({steps:['t0'],build:()=>{const p=plane();p.scale.setScalar(.8);return p;},
  loop(){const cx=HW(-2)*.6,cy=3.2,cz=-2;const pts=[];for(let i=0;i<24;i++){const u=i/24*PI*2;pts.push(V(cx+2.4*Math.sin(u),cy+.5*Math.sin(2*u),cz+2.0*Math.cos(u)));}return new T3.CatmullRomCurve3(pts,true);},
  enter(x,done){
    x.L=this.loop(); const s=x.L.getPointAt(0);
    const c=new T3.CatmullRomCurve3([V(-HW(-40)*1.1,-3,-40),V(-6,-5,-8),V(1,-1,6),V(s.x-3,s.y-.6,s.z+.6),s]);
    tw(x,3.4,'power1.inOut',t=>flyAlong(x.root,c,t,30),()=>{x.u=0;done();});
  },
  idle(x,dt){x.u=(x.u+dt/7)%1;flyAlong(x.root,x.L,x.u,30);},
  tick(x,dt){x.obj.userData.prop.rotation.z+=dt*40;},
  exit(x,done){const p=x.root.position.clone();const fwd=V(0,0,1).applyQuaternion(x.root.quaternion);
    const c=new T3.CatmullRomCurve3([p,p.clone().add(fwd.multiplyScalar(3)),V(HW(0)+4,7,6),V(HW(0)+16,12,10)]);
    tw(x,1.6,'power2.in',t=>flyAlong(x.root,c,t,30),done);}
});
// 2. calendar pages: last weekend's pages tear off and blow away; then rewind back two weeks
function pageFlight(dir){
  return {steps:[dir>0?'b1':'b2'],oneShot:true,build:pages,
    enter(x,done){
      const L=x.obj.userData.list; const W=HW(0);
      x.paths=L.map((p,i)=>({p,d:i*.12,from:V(dir*(W*.75+Math.random()*2),-HH()*.4+Math.random()*2,2+Math.random()*3),
        to:V(-dir*(W+5),HH()*.3+Math.random()*6,-4+Math.random()*8),spin:V((Math.random()-.5)*10,(Math.random()-.5)*12,dir*(4+Math.random()*4))}));
      x.root.position.set(0,0,0);
      tw(x,2.8,'none',t=>{x.paths.forEach(q=>{const u=Math.min(1,Math.max(0,(t*2.8-q.d)/1.9));const e=u*u*(3-2*u);
        q.p.position.lerpVectors(q.from,q.to,e); q.p.position.y+=Math.sin(u*PI)*1.6; q.p.visible=u>0&&u<1;
        q.p.rotation.set(q.spin.x*e,q.spin.y*e,q.spin.z*e);});},done);
    }};
}
EX.push(pageFlight(1),pageFlight(-1));
// 3. pencil for the exam ticket
EX.push(floater({steps:['c1'],build:()=>{const p=pencil();p.scale.setScalar(.95);return p;},
  from:()=>V(HW(0)+5,HH()+3,4), at:()=>V(HW(2)*.72,-1.6,2), rotFrom:[.4,-6,-2.4], rotTo:[.2,.3,-.65], amp:.9, dur:1.9,
  exitTo:p=>V(p.x+8,p.y+8,p.z+2)}));
// 4. toilet paper rolls in and sits in the corner during the toilet saga
EX.push(floater({steps:['e1','e2','e3','e4'],build:roll,
  from:()=>V(-HW(0)-4,-HH()*.62,1), via:(f,a)=>V((f.x+a.x)/2,a.y+.8,1), at:()=>V(-HW(1)*.74,-HH(1)*.58,1),
  rotFrom:[.2,.4,9], rotTo:[.25,.55,0], amp:.35, dur:1.9, exitTo:p=>V(p.x-10,p.y-1,p.z), exitSpin:[0,0,8]}));
// 5. the missing lock flips toward the camera and is gone
EX.push({steps:['e2'],oneShot:true,build:padlock,
  enter(x,done){const c=new T3.CatmullRomCurve3([V(1.5,-HH()-2,3),V(2.5,0,8),V(5,4,4),V(HW(0)+6,HH()+6,-12)]);
    tw(x,2.6,'power1.inOut',t=>{x.root.position.copy(c.getPointAt(t));x.obj.rotation.set(t*7,t*9,t*3);},done);}});
// 6. cigarette with rising smoke
EX.push(floater({steps:['e5'],build:cigarette,
  from:()=>V(HW(0)+4,-2,3), at:()=>V(HW(2)*.7,-HH(2)*.42,2), rotFrom:[1,4,2], rotTo:[.3,.4,-1.15], amp:.4, dur:1.6,
  exitTo:p=>V(p.x+9,p.y-2,p.z), tick(x,dt,t){const tip=V(0,1.62,0);x.obj.userData.puffs.forEach(q=>{const u=(t*.35+q.ph)%1;
    q.m.position.set(tip.x+Math.sin(u*8+q.ph*9)*.25*u,tip.y+u*3.2,tip.z);q.m.scale.setScalar(.35+u*1.6);q.m.material.opacity=Math.sin(u*PI)*.55;q.m.rotation.set(u*3,u*2,0);});}}));
// 7. guitar spins in at the Han river
EX.push(floater({steps:['f1','f2'],build:()=>{const g=guitar();g.scale.setScalar(.72);return g;},
  from:()=>V(HW(0)+6,-HH()-2,2), at:()=>V(HW(2)*.73,-.9,2), rotFrom:[0,-9,-1.4], rotTo:[.1,-.45,-.32], amp:.75, dur:2.0,
  exitTo:p=>V(p.x+9,p.y+3,p.z), exitSpin:[0,6,0]}));
// 8. music notes drifting up the screen edges (also during the video)
EX.push({steps:['f1','f2','f3'],build:notes,
  enter(x,done){x.root.position.set(0,0,0);x.fade=0;tw(x,.8,'none',t=>{x.fade=t;},done);},
  tick(x,dt,t){const W=HW(-1),H=HH(-1);x.obj.userData.list.forEach(q=>{const u=(t*.12+q.ph)%1;
    q.n.position.set(q.side*(W*.86+Math.sin(u*6+q.ph*5)*.6),-H-1+u*(2*H+2),-1+q.lane*2);
    q.n.rotation.set(Math.sin(u*4)*.4,u*PI*2*(q.side),Math.sin(u*5)*.3);q.n.scale.setScalar(.85*Math.min(1,x.fade*1.5));});},
  exit(x,done){tw(x,.6,'none',t=>{x.fade=1-t;},done);}});
// 9. beer mug
EX.push(floater({steps:['g1','g2'],build:mug,
  from:()=>V(HW(0)+5,-HH()-3,3), at:()=>V(HW(2)*.74,-HH(2)*.3,2), rotFrom:[.6,-5,-.8], rotTo:[.2,-.7,.12], amp:.8, dur:1.7,
  exitTo:p=>V(p.x+10,p.y-4,p.z), exitSpin:[0,4,-.6]}));
// 10. tumbleweed rolls past the empty chairs
EX.push({steps:['g3'],oneShot:true,build:tumbleweed,
  enter(x,done){const W=HW(1);tw(x,4.8,'none',t=>{const xx=-W-3+t*(2*W+6);x.root.position.set(xx,-HH(1)*.7+Math.abs(Math.sin(t*PI*4))*1.2,1);
    x.obj.rotation.set(t*2,0,-t*16);},done);}});
// 11. open book flapping, a page flips
EX.push(floater({steps:['h1'],build:book,
  from:()=>V(-HW(0)-5,HH()+2,2), at:()=>V(-HW(2)*.7,HH(2)*.22,2), rotFrom:[1.2,5,.6], rotTo:[.35,.5,.08], amp:.45, dur:2.0,
  exitTo:p=>V(p.x-9,p.y+5,p.z),
  tick(x,dt,t){const u=x.obj.userData;const open=.55+Math.sin(t*2.2)*.45;u.L.rotation.y=open;u.R.rotation.y=-open;
    const f=(t*.45)%1,e0=Math.min(1,f*1.6),e=e0*e0*(3-2*e0);u.P.rotation.y=-open+(-PI+2*open)*e;u.P.visible=f<.62;}}));
// 12. moon and twinkling stars
EX.push(floater({steps:['h3'],build:moon,
  from:()=>V(-HW(0)*.7,-HH()-4,0), via:(f,a)=>V(a.x-1,0,2), at:()=>V(-HW(-1)*.68,HH(-1)*.38,-1), rotFrom:[0,-3,0], rotTo:[.2,0,.15], amp:.3, dur:2.2,
  exitTo:p=>V(p.x,p.y+12,p.z),
  tick(x,dt,t){const u=x.obj.userData;u.ball.rotation.y+=dt*.3;u.stars.forEach((q,i)=>{const a=q.a+t*.25;q.s.position.set(Math.cos(a)*q.r,q.y+Math.sin(a*2)*.3,Math.sin(a)*q.r);
    q.s.scale.setScalar(.7+Math.sin(t*3+i)*.35);q.s.rotation.y=t*2+i;});}}));
// 13. finale: the biplane returns towing a banner
EX.push({steps:['end'],build:()=>{const p=bannerPlane();p.scale.setScalar(.75);return p;},
  loop(){const pts=[];for(let i=0;i<32;i++){const u=i/32*PI*2;pts.push(V(HW(-4)*.62*Math.sin(u),HH()*.55+.4*Math.sin(2*u),-4+3.4*Math.cos(u)));}return new T3.CatmullRomCurve3(pts,true);},
  enter(x,done){x.L=this.loop();const s=x.L.getPointAt(0);const c=new T3.CatmullRomCurve3([V(-HW(0)-14,s.y-1,s.z),V(s.x-6,s.y,s.z),s]);
    tw(x,2.6,'none',t=>flyAlong(x.root,c,t,20),()=>{x.u=0;done();});},
  idle(x,dt){x.u=(x.u+dt/11)%1;flyAlong(x.root,x.L,x.u,20);},
  tick(x,dt,t){const u=x.obj.userData;u.prop.rotation.z+=dt*40;const a=u.ban.geometry.attributes.position,b=u.base;
    for(let i=0;i<a.count;i++){const px=b[i*3];a.array[i*3+2]=Math.sin(px*1.3+t*7)*.18*((px+3.25)/6.5);}a.needsUpdate=true;},
  exit(x,done){const p=x.root.position.clone();const fwd=V(0,0,1).applyQuaternion(x.root.quaternion);
    const c=new T3.CatmullRomCurve3([p,p.clone().add(fwd.multiplyScalar(4)),p.clone().add(fwd.multiplyScalar(30))]);tw(x,1.4,'power2.in',t=>flyAlong(x.root,c,t,20),done);}
});

// ---------- manager ----------
EX.forEach(x=>{x.state='off';x.time=0;});
function show(stepId){
  EX.forEach(x=>{
    const want=x.steps.includes(stepId);
    if(want && (x.state==='off'||x.state==='exit')){
      if(!x.root){x.root=new T3.Group();x.obj=x.build();x.root.add(x.obj);}
      x.tw&&x.tw.kill(); S.add(x.root); x.state='enter';
      x.enter(x,()=>{ if(x.oneShot){S.remove(x.root);x.state='off';} else x.state='idle'; });
    } else if(!want && (x.state==='enter'||x.state==='idle')){
      if(!x.exit){x.tw&&x.tw.kill();S.remove(x.root);x.state='off';return;}
      x.state='exit'; x.exit(x,()=>{S.remove(x.root);x.state='off';});
    }
  });
}
let last=performance.now(), clock=0;
function loop(now){
  const dt=Math.min(.05,(now-last)/1000); last=now; clock+=dt;
  let any=false;
  EX.forEach(x=>{ if(x.state==='off')return; any=true; x.time=clock;
    if(x.state==='idle'&&x.idle) x.idle(x,dt,clock);
    if(x.tick) x.tick(x,dt,clock); });
  R.render(S,CAM);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.EXTRAS={show};
})();
