import * as T from 'three';
type Control={paused:boolean;angle:number;dragging:boolean};
export function createCostumeScene(host:HTMLDivElement,control:Control,onLost:()=>void){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,100);camera.position.set(0,.5,8.8);camera.lookAt(0,.05,0);
 scene.add(new T.HemisphereLight(0xe9e2ff,0x30233e,2.7));const key=new T.DirectionalLight(0xffffff,4);key.position.set(3,4,5);scene.add(key);const rim=new T.DirectionalLight(0x9f75ff,5);rim.position.set(-3,2,-3);scene.add(rim);const fill=new T.DirectionalLight(0xd7ff9a,1.3);fill.position.set(-3,0,3);scene.add(fill);
 const garment=new T.Group();scene.add(garment);
 const silver=new T.MeshStandardMaterial({color:0xe4dcf2,metalness:.18,roughness:.62,side:T.DoubleSide});const violet=new T.MeshStandardMaterial({color:0x604290,roughness:.78,side:T.DoubleSide});const dark=new T.MeshStandardMaterial({color:0x241d3c,roughness:.7,side:T.DoubleSide});const gold=new T.MeshStandardMaterial({color:0xe4d58b,metalness:.72,roughness:.3});const glow=new T.MeshStandardMaterial({color:0xd7ff77,emissive:0x91ca3f,emissiveIntensity:.45,metalness:.3,roughness:.18});
 function mesh(g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);garment.add(o);return o}
 function shell(rows:number[][],material:T.Material,start=0,end=Math.PI*2,folds=0){const vertices:number[]=[],indices:number[]=[],n=64;rows.forEach(([y,rx,rz],j)=>{for(let i=0;i<=n;i++){const a=start+(end-start)*i/n;const ripple=1+folds*Math.cos(a*12)*(1-j/(rows.length+1));vertices.push(Math.sin(a)*rx*ripple,y,Math.cos(a)*rz*ripple)}});for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,material)}
 function line(points:number[][],material:T.Material,r=.018){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number]))),50,r,6,false),material)}
 // Elliptical, open garment surfaces provide visible front, back and sleeve volume.
 shell([[.05,.39,.25],[.45,.47,.3],[.95,.67,.32],[1.25,.55,.28],[1.36,.24,.21]],silver);
 shell([[1.32,.235,.205],[1.57,.25,.22]],dark);shell([[1.55,.251,.221],[1.59,.255,.224]],gold);
 shell([[-1.67,1.01,.67],[-1.3,.86,.57],[-.75,.62,.43],[.05,.4,.26]],dark,0,Math.PI*2,.035);
 shell([[-1.57,1.04,.7],[-1,.79,.52],[-.4,.53,.36],[.08,.405,.27]],silver,.19,Math.PI*2-.19,.03);
 shell([[-1.64,1.15,.74],[-.9,1,.68],[0,.77,.48],[1.19,.68,.34]],violet,Math.PI*.42,Math.PI*1.58,.045);
 for(const side of [-1,1]){
 const sleeve=mesh(new T.CylinderGeometry(.245,.32,.98,24,1,true),silver,side*.85,.68,0);sleeve.rotation.z=side*.4;sleeve.scale.z=.85;
 const cuff=mesh(new T.CylinderGeometry(.31,.33,.2,24,1,true),dark,side*1.035,.22,0);cuff.rotation.z=side*.4;cuff.scale.z=.85;
 const trim=mesh(new T.CylinderGeometry(.331,.331,.037,24,1,true),gold,side*1.07,.13,0);trim.rotation.z=side*.4;trim.scale.z=.85;
 const shoulder=mesh(new T.SphereGeometry(.3,24,12,0,Math.PI*2,0,Math.PI/2),violet,side*.64,1.04,0);shoulder.scale.set(1.2,.65,1);
 line([[side*.23,1.35,.225],[side*.43,1.08,.29],[side*.25,.63,.31],[side*.08,.36,.29]],gold,.023);
 line([[side*.075,.02,.286],[side*.15,-.6,.45],[side*.28,-1.2,.63],[side*.38,-1.57,.69]],gold,.018);
 line([[side*.65,1.18,0],[side*.8,.4,-.11],[side*1.01,-.7,-.15],[side*1.14,-1.63,-.15]],gold,.021);
 }
 shell([[-.03,.421,.29],[.11,.417,.29]],dark);const buckle=mesh(new T.TorusGeometry(.1,.023,8,4),gold,0,.04,.305);buckle.rotation.z=Math.PI/4;
 mesh(new T.OctahedronGeometry(.145),glow,0,1.04,.38).scale.set(.65,1.25,.4);line([[-.4,1.23,.27],[0,.89,.37],[.4,1.23,.27]],gold,.012);
 for(let i=0;i<4;i++)mesh(new T.SphereGeometry(.026,10,8),gold,0,.31+i*.14,.312);
 // Upright C, opening to the viewer’s right when seen from behind the cape.
 const moon=mesh(new T.TorusGeometry(.2,.035,10,40,Math.PI*1.5),gold,0,.65,-.437);moon.rotation.z=-3*Math.PI/4;
 mesh(new T.OctahedronGeometry(.065),glow,0,.22,-.495);
 const floor=new T.Mesh(new T.CylinderGeometry(1.48,1.6,.09,80),new T.MeshStandardMaterial({color:0x2c233e,metalness:.5,roughness:.45}));floor.position.y=-1.95;scene.add(floor);
 const ring=new T.Mesh(new T.TorusGeometry(1.46,.015,8,100),glow);ring.rotation.x=Math.PI/2;ring.position.y=-1.89;scene.add(ring);
 let frame=0,last=0,visible=true,lastX=0;const canvas=renderer.domElement;canvas.style.touchAction='pan-y';
 const down=(e:PointerEvent)=>{control.dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId)};const move=(e:PointerEvent)=>{if(control.dragging){control.angle+=(e.clientX-lastX)*.012;lastX=e.clientX}};const up=()=>{control.dragging=false};const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);onLost()};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('webglcontextlost',lost);
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.85?10:8.8;camera.updateProjectionMatrix()});resize.observe(host);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting});observer.observe(host);
 function tick(now:number){frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;if(!control.paused&&!control.dragging)control.angle+=dt*.32;garment.rotation.y=control.angle;renderer.render(scene,camera)}frame=requestAnimationFrame(tick);
 return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}});renderer.dispose();canvas.remove()}
}
