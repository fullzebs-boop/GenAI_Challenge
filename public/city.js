// ================= API & Data Source =================
const api = {
    getDb: async () => { const res = await fetch('/api/data'); return res.json(); },
    getHistory: async () => { const res = await fetch('/api/history'); return res.json(); },
};

// ================= Three.js Setup =================
let camera, scene, renderer;
let clock = new THREE.Clock();

// Character Setup
let characterGroup;
let slimeBody;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const speed = 15;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let isMoving = false;
let bounceTween = null;

// Camera Rig (To separate follow logic from Dashboard look logic)
let cameraRig;

// Interactables
const interactableObjects = [];
let closestObject = null;
let isInteracting = false; 

// UI Elements
const interactionToast = document.getElementById('interaction-toast');
const dialogueContainer = document.getElementById('rpg-dialogue-container');
const dialogueText = document.getElementById('dialogue-text');
const dialogueChoices = document.getElementById('dialogue-choices');
const gachaContainer = document.getElementById('gacha-result-container');
const gachaName = document.getElementById('gacha-restaurant-name');
const tarotContainer = document.getElementById('tarot-result-container');
const tarotImage = document.getElementById('tarot-image');
const tarotTitle = document.getElementById('tarot-title');
const tarotHappiness = document.getElementById('tarot-happiness');
const tarotDesc = document.getElementById('tarot-desc');

// Cozy Materials
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x8bc34a });
const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x795548 });
const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x689f38 });
const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
const slimeMaterial = new THREE.MeshLambertMaterial({ color: 0x81d4fa });
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x212121 });
const blushMaterial = new THREE.MeshBasicMaterial({ color: 0xf48fb1 });

// Audio Setup
let audioCtx;
let audioMuted = true;
const bgm = document.getElementById('bgm');

// Synthesize Audio Effects
function playBoing() {
    if (audioMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

function playPop() {
    if (audioMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playTada() {
    if (audioMuted || !audioCtx) return;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc1.type = 'triangle'; osc2.type = 'sine';
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    osc2.frequency.setValueAtTime(554, audioCtx.currentTime); // C#5
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    osc2.frequency.setValueAtTime(1108, audioCtx.currentTime + 0.15); // C#6
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc1.connect(gainNode); osc2.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc1.start(); osc2.start();
    osc1.stop(audioCtx.currentTime + 0.6); osc2.stop(audioCtx.currentTime + 0.6);
}

function playGachaSFX() {
    if (audioMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
}

function playMagicSFX() {
    if (audioMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
}

document.getElementById('audio-control').addEventListener('click', function() {
    audioMuted = !audioMuted;
    if(audioMuted) {
        this.classList.add('muted');
        this.innerHTML = '<i class="fas fa-volume-mute"></i>';
        bgm.pause();
    } else {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        this.classList.remove('muted');
        this.innerHTML = '<i class="fas fa-volume-up"></i>';
        bgm.volume = 0.4;
        bgm.play().catch(e => console.log("Audio play blocked by browser"));
    }
});

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb3e5fc); // Sky blue
    scene.fog = new THREE.Fog(0xb3e5fc, 40, 100);

    // Camera Rig setup
    cameraRig = new THREE.Group();
    scene.add(cameraRig);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 25, 30);
    camera.lookAt(0, 0, 0);
    cameraRig.add(camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
    sunLight.position.set(30, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    buildCozyEnvironment();
    buildCuteMascot(); 
    buildInteractiveStations();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    animate();
}

// ================= Cute Mascot =================
function buildCuteMascot() {
    characterGroup = new THREE.Group();

    // Soft round slime body
    const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
    slimeBody = new THREE.Mesh(bodyGeo, slimeMaterial);
    slimeBody.scale.y = 0.85; // slightly squished
    slimeBody.position.y = 1.2;
    slimeBody.castShadow = true;

    // Cute Eyes
    const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.5, 0.3, 1.3);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.5, 0.3, 1.3);
    
    // Blush
    const blushGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMaterial);
    leftBlush.rotation.x = Math.PI / 2;
    leftBlush.position.set(-0.8, 0.1, 1.35);
    const rightBlush = leftBlush.clone();
    rightBlush.position.set(0.8, 0.1, 1.35);

    slimeBody.add(leftEye);
    slimeBody.add(rightEye);
    slimeBody.add(leftBlush);
    slimeBody.add(rightBlush);

    characterGroup.add(slimeBody);
    scene.add(characterGroup);
}

function updateMascotAnimation() {
    if (isMoving && !bounceTween) {
        bounceTween = gsap.to(slimeBody.position, {
            y: 2.2, duration: 0.2, yoyo: true, repeat: -1, ease: "power1.inOut",
            onRepeat: playBoing
        });
        gsap.to(slimeBody.scale, {
            y: 0.95, x: 0.8, z: 0.8, duration: 0.2, yoyo: true, repeat: -1, ease: "power1.inOut"
        });
    } else if (!isMoving && bounceTween) {
        bounceTween.kill();
        bounceTween = null;
        gsap.to(slimeBody.position, { y: 1.2, duration: 0.3, ease: "bounce.out" });
        gsap.to(slimeBody.scale, { y: 0.85, x: 1, z: 1, duration: 0.3, ease: "bounce.out" });
    }
}

// ================= Emoji System =================
function spawnEmoji(emoji) {
    const el = document.createElement('div');
    el.className = 'emoji-bubble';
    el.textContent = emoji;
    document.body.appendChild(el);
    
    const vector = characterGroup.position.clone();
    vector.y += 4;
    vector.project(camera);
    
    const x = (vector.x * .5 + .5) * window.innerWidth;
    const y = (-(vector.y * .5) + .5) * window.innerHeight;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    gsap.to(el, { 
        y: y - 80, 
        opacity: 0, 
        duration: 1.5, 
        ease: "power1.out",
        onComplete: () => el.remove()
    });
}

// ================= Cozy Environment =================
function buildCozyEnvironment() {
    const islandGroup = new THREE.Group();
    
    // Lush Green Grass Base
    const grassGeo = new THREE.CylinderGeometry(40, 38, 2, 64);
    const grass = new THREE.Mesh(grassGeo, grassMaterial);
    grass.position.y = -1;
    grass.receiveShadow = true;
    islandGroup.add(grass);

    // Dirt Path Base
    const dirtGeo = new THREE.CylinderGeometry(41, 39, 1.8, 64);
    const dirt = new THREE.Mesh(dirtGeo, dirtMaterial);
    dirt.position.y = -1.1;
    islandGroup.add(dirt);

    // Add some cute low-poly trees
    // 1. Beautiful Spruce Trees
    for(let i=0; i<15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 12;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 2, 8), woodMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        
        // Stacked cones for pine tree look
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(3, 4, 8), leafMaterial); c1.position.y = 3; c1.castShadow = true;
        const c2 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 8), leafMaterial); c2.position.y = 4.5; c2.castShadow = true;
        const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 8), leafMaterial); c3.position.y = 6; c3.castShadow = true;
        
        tree.add(trunk); tree.add(c1); tree.add(c2); tree.add(c3);
        tree.position.set(x, 0, z);
        islandGroup.add(tree);
    }

    // Add some cute rocks
    for(let i=0; i<8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 25;
        const rockGeo = new THREE.DodecahedronGeometry(Math.random() * 0.8 + 0.5);
        const rock = new THREE.Mesh(rockGeo, stoneMaterial);
        rock.position.set(Math.cos(angle)*radius, 0.5, Math.sin(angle)*radius);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        islandGroup.add(rock);
    }

    scene.add(islandGroup);
}

function buildInteractiveStations() {
    // Helper to build cute stations
    const createStation = (x, z, label, typeId, buildFunc) => {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // A small dirt patch under each station
        const patchGeo = new THREE.CylinderGeometry(4, 4, 0.1, 16);
        const patch = new THREE.Mesh(patchGeo, dirtMaterial);
        patch.position.y = 0.05;
        patch.receiveShadow = true;
        group.add(patch);

        const mesh = buildFunc();
        group.add(mesh);
        scene.add(group);

        group.userData = { id: typeId, name: label, coreMesh: mesh };
        interactableObjects.push(group);
    };

    // 1. Gacha: Highly Detailed 3D Model
    createStation(-18, -12, 'Gacha Machine', 'gacha', () => {
        const group = new THREE.Group();
        
        // Base (Pastel Blue)
        const baseMat = new THREE.MeshLambertMaterial({color: 0xbbdefb});
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.5, 2.8), baseMat);
        base.position.y = 1.75;
        base.castShadow = true;
        
        // Gold Accents
        const goldMat = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.8, roughness: 0.2});
        const trim = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 3), goldMat);
        trim.position.y = 3.5;
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16), goldMat);
        knob.rotation.x = Math.PI/2; knob.position.set(0, 2, 1.45);
        
        // Glass Dome (Pink Tint)
        const glassMat = new THREE.MeshPhysicalMaterial({color: 0xffddf4, transmission: 0.8, opacity: 0.4, transparent: true, roughness: 0});
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.5, 32), glassMat);
        glass.position.y = 4.95;
        const glassTop = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI*2, 0, Math.PI/2), glassMat);
        glassTop.position.y = 6.2;
        
        // Star Topper
        const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), goldMat);
        star.position.y = 7;
        
        // Gacha Balls
        const colors = [0xffb7b2, 0xffdac1, 0xe2f0cb, 0xb5ead7, 0xc7ceea];
        for(let i=0; i<15; i++) {
            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshLambertMaterial({color: colors[i%5]}));
            const r = Math.random() * 0.9; const t = Math.random() * Math.PI * 2;
            ball.position.set(Math.cos(t)*r, 4 + Math.random()*1.8, Math.sin(t)*r);
            group.add(ball);
        }
        
        group.add(base); group.add(trim); group.add(knob); group.add(glass); group.add(glassTop); group.add(star);
        return group;
    });

    // 2. Oracle Quiz Station: Highly Detailed 3D Wizard Slime
    createStation(18, -5, 'Wizard Slime', 'quiz', () => {
        const wizard = new THREE.Group();
        
        // Purple Slime Body
        const bodyMat = new THREE.MeshLambertMaterial({color: 0x9c27b0});
        const body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 32), bodyMat);
        body.position.y = 1.4; body.scale.y = 0.9; body.castShadow = true;
        
        // Eyes & Blush
        const eyeMat = new THREE.MeshBasicMaterial({color: 0x222222});
        const blushMat = new THREE.MeshBasicMaterial({color: 0xff80ab});
        const leye = new THREE.Mesh(new THREE.SphereGeometry(0.15), eyeMat); leye.position.set(-0.4, 1.6, 1.3);
        const reye = new THREE.Mesh(new THREE.SphereGeometry(0.15), eyeMat); reye.position.set(0.4, 1.6, 1.3);
        const lblush = new THREE.Mesh(new THREE.SphereGeometry(0.2), blushMat); lblush.position.set(-0.7, 1.4, 1.25);
        const rblush = new THREE.Mesh(new THREE.SphereGeometry(0.2), blushMat); rblush.position.set(0.7, 1.4, 1.25);
        
        // Wizard Hat
        const hatMat = new THREE.MeshLambertMaterial({color: 0x4a148c});
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.1, 32), hatMat);
        brim.position.set(0, 2.5, 0.2); brim.rotation.x = -0.1;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.5, 32), hatMat);
        cone.position.set(0, 3.7, 0.1); cone.rotation.x = -0.1;
        
        // Magic Staff
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5), new THREE.MeshLambertMaterial({color: 0x5d4037}));
        staff.position.set(-1.2, 1.5, 1); staff.rotation.z = -0.2; staff.rotation.x = 0.2;
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshPhysicalMaterial({color: 0x00bcd4, transmission: 0.8, opacity: 0.8, transparent: true}));
        crystal.position.set(-1.4, 2.8, 1.3);
        
        wizard.add(body); wizard.add(leye); wizard.add(reye); wizard.add(lblush); wizard.add(rblush);
        wizard.add(brim); wizard.add(cone); wizard.add(staff); wizard.add(crystal);
        
        wizard.userData.coreMesh = wizard; // For bobbing
        wizard.userData.isWizard = true;
        return wizard;
    });
    
    // 3. Tarot Station: Cozy Campfire
    createStation(0, 15, 'Tarot Campfire', 'tarot', () => {
        const fireGroup = new THREE.Group();
        
        // Logs
        for(let i=0; i<3; i++){
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.5, 8), woodMaterial);
            log.rotation.z = Math.PI / 2;
            log.rotation.y = (i * Math.PI) / 1.5;
            log.position.y = 0.3;
            log.castShadow = true;
            fireGroup.add(log);
        }

        // Fire flame
        const fireMat = new THREE.MeshBasicMaterial({color: 0xff6600, transparent: true, opacity: 0.8});
        const fire = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 16), fireMat);
        fire.position.y = 1.2;
        fireGroup.add(fire);
        
        const innerFire = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 16), new THREE.MeshBasicMaterial({color: 0xffcc00}));
        innerFire.position.y = 0.8;
        fireGroup.add(innerFire);

        // Add a warm point light above the campfire
        const fireLight = new THREE.PointLight(0xffaa00, 1.5, 15);
        fireLight.position.set(0, 2, 0);
        fireGroup.add(fireLight);
        
        fireGroup.userData.fireMesh = fire;
        fireGroup.userData.fireLight = fireLight;

        return fireGroup;
    });
}

// ================= Movement & Input =================
function onKeyDown(event) {
    if (event.code === 'Escape' && isInteracting) {
        closeModal();
        return;
    }
    
    if (isInteracting) return;

    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward = true; break;
        case 'ArrowRight': case 'KeyD': moveRight = true; break;
        case 'KeyE': if (closestObject) handleInteraction(closestObject); break;
        case 'Digit1': spawnEmoji('❤️'); break;
        case 'Digit2': spawnEmoji('✨'); break;
        case 'Digit3': spawnEmoji('😂'); break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ================= Interaction Logic =================
async function handleInteraction(obj) {
    if (obj.userData.id === 'gacha') playGachaSFX();
    else if (obj.userData.id === 'quiz') playMagicSFX();
    else if (obj.userData.id === 'tarot') playPop();

    isInteracting = true;
    interactionToast.classList.remove('visible');
    
    moveForward = false; moveBackward = false; moveLeft = false; moveRight = false;
    isMoving = false; updateMascotAnimation();

    characterGroup.lookAt(obj.position.x, characterGroup.position.y, obj.position.z);

    const type = obj.userData.id;
    if (type === 'gacha') {
        await playGacha();
    } else if (type === 'quiz') {
        startQuiz();
    } else if (type === 'tarot') {
        await playTarot();
    }
}

// 1. GACHA LOGIC 
async function playGacha() {
    gsap.to(closestObject.userData.coreMesh.scale, { y: 1.2, x: 1.2, z: 1.2, duration: 0.15, yoyo: true, repeat: 5 });
    
    setTimeout(async () => {
        const db = await api.getDb();
        const picked = db.restaurants[Math.floor(Math.random() * db.restaurants.length)];
        showGachaResult({ restaurantName: picked.name });
    }, 1000);
}

function showGachaResult(data) {
    playTada();
    gachaName.innerHTML = `🎉 จักรวาลประทานพร! 🎉<br>${data.restaurantName}`;
    gachaContainer.classList.add('active');
    // Assuming confetti is available globally
    if(typeof confetti === 'function') confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
}

function showTarotResult(data) {
    playTada();
    tarotTitle.innerHTML = `🔮 ไพ่ทำนายความสุขในการกิน 🔮`;
    tarotImage.src = data.imageUrl;
    tarotImage.classList.add('loaded');
    tarotCardName.innerHTML = data.cardName;
    tarotJoy.innerHTML = data.joyPercentage;
    tarotDesc.innerHTML = `"${data.description}"`;
    tarotContainer.classList.add('active');
}

window.closeModal = () => {
    playPop();
    gachaContainer.classList.remove('active');
    tarotContainer.classList.remove('active');
    dialogueContainer.classList.remove('active');
    isInteracting = false;
};

// 2. ORACLE QUIZ LOGIC
let currentQuizIndex = 0;
let quizAnswers = { budget: null, meal: null, category: null };

function startQuiz() {
    currentQuizIndex = 0;
    quizAnswers = { budget: null, meal: null, category: null };
    dialogueContainer.classList.add('active');
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (currentQuizIndex < quizQuestions.office.length) {
        const q = quizQuestions.office[currentQuizIndex];
        dialogueText.textContent = q.question;
        
        dialogueChoices.innerHTML = '';
        q.options.forEach(choice => {
            const btn = document.createElement('div');
            btn.className = 'dialogue-choice';
            btn.innerHTML = `<i class="${choice.icon} mr-2"></i> ${choice.text}`;
            btn.onclick = () => handleQuizAnswer(choice);
            dialogueChoices.appendChild(btn);
        });
    } else {
        finishQuiz();
    }
}

function handleQuizAnswer(choice) {
    if(choice.value === '100-200' || choice.value === 'under_100' || choice.value === 'over_200') quizAnswers.budget = choice.value;
    else if(choice.value === 'lunch' || choice.value === 'dinner' || choice.value === 'breakfast') quizAnswers.meal = choice.value;
    else quizAnswers.category = choice.value;
    
    currentQuizIndex++;
    renderQuizQuestion();
}

async function finishQuiz() {
    dialogueText.textContent = "ตึ๊ง! ฉันหาที่ที่เหมาะกับคุณได้แล้วล่ะ!";
    dialogueChoices.innerHTML = '';
    
    const db = await api.getDb();
    let pool = db.restaurants;
    
    if (quizAnswers.budget) pool = pool.filter(r => r.price_range === quizAnswers.budget);
    if (quizAnswers.category) {
        const catKey = quizAnswers.category.replace('quiz_', '').replace('_', ' ').toLowerCase();
        pool = pool.filter(r => r.food_category.toLowerCase() === catKey);
    }
    
    let picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : db.restaurants[0];
    
    dialogueContainer.classList.remove('active');
    
    setTimeout(() => {
        showGachaResult({ restaurantName: picked.name });
    }, 500);
}

// 3. TAROT CARD LOGIC
async function playTarot() {
    // Crystal Ball glow animation
    const ball = closestObject.userData.coreMesh.children[2];
    gsap.to(ball.material, { emissiveIntensity: 2, duration: 0.5, yoyo: true, repeat: 3 });
    
    setTimeout(() => {
        const cards = [
            { 
                img: '/tarot/fool.png', 
                title: 'The Starving Fool', 
                hap: '10%', 
                desc: '"จะได้กินของอร่อย... แต่ลืมเอากระเป๋าตังค์มา!"',
                color: 'text-purple-600'
            },
            { 
                img: '/tarot/coma.png', 
                title: 'The Food Coma', 
                hap: '90%', 
                desc: '"อิ่มจนขยับตัวไม่ได้... เตรียมตัวหลับในเวลางานได้เลย!"',
                color: 'text-blue-600'
            },
            { 
                img: '/tarot/glutton.png', 
                title: 'The Lucky Glutton', 
                hap: '200%', 
                desc: '"มีคนเลี้ยงข้าวฟรี! สั่งของที่แพงที่สุดในเมนูไปเลยยย!"',
                color: 'text-yellow-500'
            }
        ];
        
        const card = cards[Math.floor(Math.random() * cards.length)];
        
        playTada(); // Fix Tarot audio not playing
        
        tarotImage.src = card.img;
        tarotTitle.textContent = card.title;
        tarotTitle.className = `text-3xl font-black mb-2 ${card.color}`;
        tarotHappiness.textContent = card.hap;
        tarotDesc.textContent = card.desc;
        
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        tarotContainer.classList.add('active');
    }, 1500);
}

// ================= Main Loop =================
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (!isInteracting && characterGroup) {
        direction.set(0, 0, 0);
        if (moveForward) direction.z -= 1;
        if (moveBackward) direction.z += 1;
        if (moveLeft) direction.x -= 1;
        if (moveRight) direction.x += 1;

        const wasMoving = isMoving;
        isMoving = direction.lengthSq() > 0;

        if (isMoving) {
            direction.normalize();
            characterGroup.position.addScaledVector(direction, speed * delta);
            
            const distFromCenter = Math.sqrt(characterGroup.position.x**2 + characterGroup.position.z**2);
            if(distFromCenter > 38) {
                characterGroup.position.x *= 38/distFromCenter;
                characterGroup.position.z *= 38/distFromCenter;
            }

            const targetAngle = Math.atan2(direction.x, direction.z);
            characterGroup.rotation.y = targetAngle;
        }

        if (wasMoving !== isMoving) updateMascotAnimation();

        // Smooth Camera Follow via CameraRig
        const targetRigPos = characterGroup.position.clone();
        cameraRig.position.lerp(targetRigPos, 0.1);
        
        // Default camera angle setup (only if not interacting)
        camera.position.set(0, 25, 30);
        camera.lookAt(0, 0, 0);

        checkProximity();
    }
    
    // Idle animations for stations
    if(interactableObjects.length) {
        interactableObjects.forEach(obj => {
            const coreMesh = obj.userData.coreMesh;
            
            if(obj.userData.id === 'quiz' && coreMesh.userData.isWizard) {
                // Bobbing wizard
                coreMesh.position.y = Math.sin(time * 3) * 0.2;
            } else if (obj.userData.id === 'tarot') {
                // Flicker firelight
                if(coreMesh.userData.fireLight) {
                    coreMesh.userData.fireLight.intensity = 1.2 + Math.random() * 0.6;
                }
                if(coreMesh.userData.fireMesh) {
                    coreMesh.userData.fireMesh.scale.set(1 + Math.random()*0.1, 1 + Math.random()*0.2, 1 + Math.random()*0.1);
                }
            } else if (obj.userData.id === 'gacha') {
                // Bobbing vending machine slightly for fun
                coreMesh.position.y = Math.sin(time * 2) * 0.05;
            }
        });
    }

    renderer.render(scene, camera);
}

function checkProximity() {
    let foundClose = null;
    let minDistance = 6;

    for (let obj of interactableObjects) {
        const dx = obj.position.x - characterGroup.position.x;
        const dz = obj.position.z - characterGroup.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < minDistance) { foundClose = obj; minDistance = dist; }
    }

    if (foundClose) {
        if (closestObject !== foundClose) {
            closestObject = foundClose;
            if(!closestObject.userData.isHovered) {
                closestObject.userData.isHovered = true;
                gsap.to(closestObject.userData.coreMesh.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: "back.out(1.7)" });
            }
            interactionToast.textContent = `[E] ${closestObject.userData.name}`;
            interactionToast.classList.add('visible');
        }
    } else {
        if (closestObject) {
            closestObject.userData.isHovered = false;
            gsap.to(closestObject.userData.coreMesh.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: "bounce.out" });
            interactionToast.classList.remove('visible');
            closestObject = null;
        }
    }
}
