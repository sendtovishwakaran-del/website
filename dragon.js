import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/** Mount an original, procedural 3D dragon. No model downloads required. */
export function mountDragon(container, options = {}) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container) throw new Error('Dragon container not found');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.05, 9.7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.className = 'dragon-webgl-canvas';
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xa2c4b0, 2.75));
  const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-4, 7, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x77ffd1, 2.1); rim.position.set(4, 1, -6); scene.add(rim);
  const green = new THREE.MeshStandardMaterial({ color: 0x20bd81, roughness: 0.84, metalness: 0.02 });
  const lighter = new THREE.MeshStandardMaterial({ color: 0x51df9b, roughness: 0.91 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xbdf1a7, roughness: 0.93 });
  const spikes = new THREE.MeshStandardMaterial({ color: 0x0f8e64, roughness: 0.78 });
  const horns = new THREE.MeshStandardMaterial({ color: 0xb7f4aa, roughness: 0.76 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x152a27, roughness: 0.38 });
  const nostril = new THREE.MeshStandardMaterial({ color: 0x0b785b, roughness: 0.9 });
  const blush = new THREE.MeshStandardMaterial({ color: 0xff9e98, roughness: 0.9, transparent: true, opacity: 0.6 });
  const root = new THREE.Group(); scene.add(root);
  const sphereGeo = new THREE.SphereGeometry(1, 44, 32);
  function orb(parent, material, position, scale, rotation) {
    const m = new THREE.Mesh(sphereGeo, material);
    m.position.set(...position); m.scale.set(...scale);
    if (rotation) m.rotation.set(...rotation);
    parent.add(m); return m;
  }
  function cone(parent, material, radius, height, position, rotation, segments=20) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(radius, height, segments), material);
    m.position.set(...position); if(rotation) m.rotation.set(...rotation);
    parent.add(m); return m;
  }
  // Torso, belly, arms and feet.
  const torso = new THREE.Group(); root.add(torso);
  orb(torso, green, [0,-1.4,0], [1.08,1.38,0.81]);
  orb(torso, belly, [0,-1.55,0.68], [0.72,1.02,0.20]);
  orb(torso, green, [-1.01,-1.15,0.12], [0.31,0.62,0.39], [0,0,-0.47]);
  orb(torso, green, [1.01,-1.15,0.12], [0.31,0.62,0.39], [0,0,0.47]);
  orb(torso, green, [-0.7,-2.45,0.5], [0.49,0.25,0.64]);
  orb(torso, green, [0.7,-2.45,0.5], [0.49,0.25,0.64]);
  // A swishing tail behind the body.
  const tail = new THREE.Group(); tail.position.set(0.7,-1.8,-0.54); torso.add(tail);
  orb(tail, green, [0.6,-0.1,-0.21], [0.78,0.25,0.3], [0,0,0.28]);
  cone(tail, green, 0.28, 1.15, [1.35,0.1,-0.15], [0,0,-1.24]);
  // Head is separate so the neck can look around.
  const head = new THREE.Group(); head.position.set(0,0.43,0.05); root.add(head);
  orb(head, green, [0,0.31,0], [1.58,1.36,1.16]);
  // Silhouette: rounded snout & lower jaw.
  orb(head, green, [0,-0.38,0.88], [1.13,0.65,0.93]);
  orb(head, lighter, [0,-0.66,1.14], [0.94,0.28,0.68]);
  // Two brows and two expressive eyes.
  const eyeRig = [];
  [-1,1].forEach(side => {
    orb(head, green, [side*0.73,0.49,0.76], [0.57,0.73,0.45]);
    orb(head, white, [side*0.63,0.39,1.11], [0.42,0.48,0.24]);
    const iris = new THREE.Group(); iris.position.set(side*0.63,0.38,1.33); head.add(iris);
    orb(iris, dark, [0,0,0], [0.21,0.245,0.075]);
    orb(iris, white, [-0.065,0.075,0.060], [0.065,0.075,0.025]);
    eyeRig.push(iris);
    const lid = orb(head, green, [side*0.63,0.39,1.34], [0.47,0.001,0.26]);
    eyeRig[eyeRig.length-1].userData.lid = lid;
    orb(head, blush, [side*1.12,-0.32,0.9], [0.23,0.15,0.07]);
    orb(head, nostril, [side*0.51,-0.23,1.67], [0.083,0.060,0.035]);
    // Soft horns and friendly back spikes.
    cone(head, horns, 0.31, 0.89, [side*0.91,1.5,-0.24], [side*0.14,0,side*-0.32]);
    cone(head, spikes, 0.32, 0.76, [side*1.29,0.70,-0.47], [0,0,side*-0.9]);
  });
  for(let i=0;i<4;i++) cone(head, spikes, 0.27-i*0.028, 0.73-i*0.08, [0,1.52-i*0.31,-0.79-i*0.08],[0.66,0,0]);
  // A smile, drawn as a curve.
  const pts=[]; for(let i=0;i<=24;i++){ const x=-0.55+i*(1.1/24); pts.push(new THREE.Vector3(x,-0.73+0.15*(x*x/0.3025),1.655-0.09*(x*x))); }
  const smile = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:0x17604d})); head.add(smile);
  // Light ground shadow, visually anchors the character.
  const shadowMat = new THREE.MeshBasicMaterial({ color:0x126b55, transparent:true, opacity:0.12, depthWrite:false });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1.4,64), shadowMat); ground.rotation.x=-Math.PI/2; ground.scale.set(1.3,0.6,1); ground.position.set(0,-2.72,0); root.add(ground);

  const pointer={x:0,y:0}; let idleSince=performance.now(); let blinking=false; let blinkStart=0; let nextBlink=performance.now()+1800;
  let raf=0, destroyed=false, last=performance.now();
  const clock=new THREE.Clock();
  function move(e) {
    const rect=container.getBoundingClientRect();
    pointer.x=THREE.MathUtils.clamp(((e.clientX-rect.left)/rect.width)*2-1,-1,1);
    pointer.y=THREE.MathUtils.clamp(-(((e.clientY-rect.top)/rect.height)*2-1),-1,1);
    idleSince=performance.now();
  }
  // Whole-window tracking, including over left-side links.
  window.addEventListener('pointermove',move,{passive:true});
  const onLeave=()=>{ pointer.x=0; pointer.y=0; };
  document.addEventListener('mouseleave',onLeave);
  const observer=new ResizeObserver(()=>resize()); observer.observe(container);
  function resize() { const w=Math.max(1,container.clientWidth), h=Math.max(1,container.clientHeight); camera.aspect=w/h; camera.position.z=w/h<0.85?12.3:9.7; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); }
  resize();
  function tick(now) {
    if(destroyed) return;
    raf=requestAnimationFrame(tick);
    const dt=Math.min((now-last)/1000,0.05); last=now;
    const t=clock.getElapsedTime();
    const active=!reduceMotion.matches && !coarsePointer.matches;
    const desiredX=active?pointer.x:0, desiredY=active?pointer.y:0;
    const a=1-Math.exp(-4.8*dt);
    head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,desiredX*0.35,a);
    head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,-desiredY*0.15,a);
    head.rotation.z=THREE.MathUtils.lerp(head.rotation.z,-desiredX*0.075,a);
    eyeRig.forEach(iris=>{
      iris.position.x=THREE.MathUtils.lerp(iris.position.x,(iris.userData.baseX??(iris.userData.baseX=iris.position.x))+desiredX*0.095,a*1.5);
      iris.position.y=THREE.MathUtils.lerp(iris.position.y,0.38+desiredY*0.075,a*1.5);
    });
    if(active) {
      root.position.y=Math.sin(t*1.55)*0.055;
      torso.scale.y=1+Math.sin(t*2.0)*0.013;
      tail.rotation.y=Math.sin(t*1.8)*0.22;
      head.position.y=0.43+Math.sin(t*1.55+0.4)*0.037;
      if(now>=nextBlink&&!blinking){blinking=true;blinkStart=now;}
      if(blinking && now-blinkStart>160){blinking=false;nextBlink=now+2100+Math.random()*2600;}
    } else { root.position.y=0; torso.scale.y=1; tail.rotation.y=0; head.position.y=0.43; blinking=false; }
    const p=blinking?Math.sin(Math.PI*Math.min(1,(now-blinkStart)/160)):0;
    eyeRig.forEach(iris=>{iris.userData.lid.scale.y=Math.max(0.001,p*0.50); iris.userData.lid.position.y=0.39;});
    renderer.render(scene,camera);
  }
  raf=requestAnimationFrame(tick);
  return function destroy(){ destroyed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('pointermove',move);document.removeEventListener('mouseleave',onLeave);scene.traverse(o=>{if(o.geometry && o.geometry!==sphereGeo)o.geometry.dispose();}); sphereGeo.dispose();[green,lighter,belly,spikes,horns,white,dark,nostril,blush,shadowMat].forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove(); };
}
