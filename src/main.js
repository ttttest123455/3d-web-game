import * as THREE from 'three';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05030d);
scene.fog = new THREE.Fog(0x05030d, 18, 90);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 150);
camera.position.set(0, 6.5, 11);
camera.lookAt(0, 1, -12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

scene.add(new THREE.HemisphereLight(0x8f80ff, 0x09050f, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(3, 10, 4); scene.add(sun);

const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 150), new THREE.MeshStandardMaterial({ color: 0x11101a, roughness: .8 }));
road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -35); scene.add(road);

const laneMat = new THREE.MeshBasicMaterial({ color: 0x39334e });
for (const x of [-2.33, 2.33]) {
  for (let z = 5; z > -100; z -= 7) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(.055, .03, 3), laneMat);
    dash.position.set(x, .025, z); scene.add(dash);
  }
}

const stars = new THREE.BufferGeometry();
const positions = [];
for (let i = 0; i < 600; i++) positions.push((Math.random()-.5)*110, Math.random()*45+2, -Math.random()*120);
stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xaaaaff, size: .08 })));

const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, .65, 2), new THREE.MeshStandardMaterial({ color: 0x45eaff, emissive: 0x082d3b, metalness: .5, roughness: .25 }));
body.position.y = .8; player.add(body);
const cockpit = new THREE.Mesh(new THREE.BoxGeometry(.7, .35, .8), new THREE.MeshStandardMaterial({ color: 0x17102c, emissive: 0x35135a }));
cockpit.position.set(0, 1.22, -.15); player.add(cockpit);
const glow = new THREE.PointLight(0x00d9ff, 4, 7); glow.position.set(0, .5, 1); player.add(glow);
player.position.set(0, 0, 5); scene.add(player);

const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xff315a, emissive: 0x4d0718, roughness: .35, metalness: .2 });
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd84a, emissive: 0x7a4200, metalness: .8, roughness: .2 });
const obstacles = [], coins = [];
let lane = 0, targetX = 0, speed = 15, score = 0, coinCount = 0, running = false, last = 0, spawnTimer = 0, coinTimer = 0, dash = 0;
const laneX = [-4.2, -2.1, 0, 2.1, 4.2];

function spawnObstacle() {
  const x = laneX[Math.floor(Math.random()*laneX.length)];
  const h = 1.5 + Math.random()*2;
  const o = new THREE.Mesh(new THREE.BoxGeometry(1.65, h, 1.65), obstacleMat);
  o.position.set(x, h/2, -75); o.rotation.y = Math.random(); scene.add(o); obstacles.push(o);
}
function spawnCoin() {
  const c = new THREE.Mesh(new THREE.TorusGeometry(.38, .12, 8, 20), coinMat);
  c.position.set(laneX[Math.floor(Math.random()*laneX.length)], 1.2, -75); c.rotation.x = Math.PI/2; scene.add(c); coins.push(c);
}
function move(dir) { if (!running) return; lane = THREE.MathUtils.clamp(lane + dir, -2, 2); targetX = laneX[lane+2]; }
function doDash() { if (running && dash <= 0) dash = .65; }
function hitTest(obj, threshold=1.3) { return Math.abs(obj.position.z-player.position.z) < threshold && Math.abs(obj.position.x-player.position.x) < 1.25; }

function endGame() {
  running = false;
  document.querySelector('#finalScore').textContent = Math.floor(score);
  document.querySelector('#gameOver').classList.remove('hidden');
  const best = Math.max(Number(localStorage.neonBest || 0), Math.floor(score));
  localStorage.neonBest = best; document.querySelector('#best').textContent = best;
}
function start() {
  obstacles.forEach(o=>scene.remove(o)); coins.forEach(c=>scene.remove(c)); obstacles.length=0; coins.length=0;
  lane=0; targetX=0; speed=15; score=0; coinCount=0; spawnTimer=.5; coinTimer=1; dash=0; running=true;
  document.querySelector('#message').classList.add('hidden'); document.querySelector('#gameOver').classList.add('hidden');
}

addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key.toLowerCase()==='a') move(-1);
  if (e.key === 'ArrowRight' || e.key.toLowerCase()==='d') move(1);
  if (e.code === 'Space') { e.preventDefault(); doDash(); }
});
document.querySelector('#startBtn').onclick = start;
document.querySelector('#restartBtn').onclick = start;
document.querySelectorAll('#touchControls button').forEach(b => b.addEventListener('pointerdown', () => b.dataset.dir==='left' ? move(-1) : b.dataset.dir==='right' ? move(1) : doDash()));
document.querySelector('#best').textContent = localStorage.neonBest || 0;

function animate(t) {
  requestAnimationFrame(animate);
  const dt = Math.min((t-last)/1000, .05); last=t;
  if (running) {
    dash = Math.max(0, dash-dt);
    const currentSpeed = speed * (dash > 0 ? 2.5 : 1);
    score += dt * currentSpeed;
    speed = Math.min(31, speed + dt*.55);
    player.position.x += (targetX-player.position.x) * Math.min(1, dt*12);
    body.rotation.z = (targetX-player.position.x)*-.045;
    spawnTimer -= dt; coinTimer -= dt;
    if (spawnTimer <= 0) { spawnObstacle(); spawnTimer = Math.max(.38, 1.05 - speed*.018); }
    if (coinTimer <= 0) { spawnCoin(); coinTimer = .5 + Math.random()*.55; }
    for (let i=obstacles.length-1;i>=0;i--) {
      const o=obstacles[i]; o.position.z += currentSpeed*dt; o.rotation.x += dt*1.2;
      if (hitTest(o,1.15)) { endGame(); break; }
      if (o.position.z > 15) { scene.remove(o); obstacles.splice(i,1); }
    }
    for (let i=coins.length-1;i>=0;i--) {
      const c=coins[i]; c.position.z += currentSpeed*dt; c.rotation.z += dt*5;
      if (hitTest(c,1.15)) { coinCount++; score += 100; scene.remove(c); coins.splice(i,1); continue; }
      if (c.position.z > 15) { scene.remove(c); coins.splice(i,1); }
    }
    document.querySelector('#score').textContent = Math.floor(score);
    document.querySelector('#coins').textContent = coinCount;
  }
  camera.position.x += (player.position.x*.18-camera.position.x)*dt*4;
  camera.lookAt(player.position.x*.08, .7, -14);
  renderer.render(scene,camera);
}
animate(0);
addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
