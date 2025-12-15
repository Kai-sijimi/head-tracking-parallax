// ===== Three.js Scene Setup =====
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(640, 480);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

// Camera setup for head-coupled perspective
const aspect = 640 / 480;
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(0, 0, 10);

// Track head position (smoothed values)
let headX = 0;
let headY = 0;
let headZ = 1;

// Target values from face detection
let targetHeadX = 0;
let targetHeadY = 0;
let targetHeadZ = 1;

// Current model type
let currentModel = 'cube';
let modelGroup = new THREE.Group();
scene.add(modelGroup);

// ===== Lighting =====
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.5);
fillLight.position.set(-5, 0, 5);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0x7b2cbf, 0.3);
backLight.position.set(0, -5, -5);
scene.add(backLight);

// ===== Create Different 3D Models =====
function clearModel() {
    while(modelGroup.children.length > 0) {
        const child = modelGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
        modelGroup.remove(child);
    }
}

function createCubeModel() {
    clearModel();
    
    // Main cube
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0x7b2cbf, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0xff006e, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0xffbe0b, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0xff5400, metalness: 0.3, roughness: 0.4 }),
    ];
    const cube = new THREE.Mesh(geometry, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.userData.isMainObject = true;
    modelGroup.add(cube);
    
    // Wireframe overlay
    const wireGeometry = new THREE.BoxGeometry(2.55, 2.55, 2.55);
    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    wireframe.userData.isMainObject = true;
    modelGroup.add(wireframe);
    
    // Floating smaller cubes
    for (let i = 0; i < 6; i++) {
        const smallGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
        const smallMat = new THREE.MeshStandardMaterial({
            color: [0x00d4ff, 0x7b2cbf, 0xff006e, 0x00ff88][i % 4],
            emissive: [0x00d4ff, 0x7b2cbf, 0xff006e, 0x00ff88][i % 4],
            emissiveIntensity: 0.2,
            metalness: 0.5,
            roughness: 0.3
        });
        const smallCube = new THREE.Mesh(smallGeo, smallMat);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 2.5;
        smallCube.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 1,
            Math.sin(angle) * radius
        );
        smallCube.userData.angle = angle;
        smallCube.userData.isFloating = true;
        smallCube.userData.baseY = smallCube.position.y;
        modelGroup.add(smallCube);
    }
}

function createCharacterModel() {
    clearModel();
    
    const bodyGroup = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x00d4ff, 
        metalness: 0.1, 
        roughness: 0.8 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.y = 1.1;
    bodyGroup.add(body);
    
    // Face
    const faceGeo = new THREE.CircleGeometry(0.95, 32);
    const faceMat = new THREE.MeshStandardMaterial({ 
        color: 0xfff0db,
        metalness: 0,
        roughness: 0.9
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.95;
    bodyGroup.add(face);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.3, 0.25, 1.05);
    bodyGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.3, 0.25, 1.05);
    bodyGroup.add(rightEye);
    
    // Eye highlights
    const highlightGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    leftHighlight.position.set(-0.26, 0.32, 1.18);
    bodyGroup.add(leftHighlight);
    
    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    rightHighlight.position.set(0.34, 0.32, 1.18);
    bodyGroup.add(rightHighlight);
    
    // Blush
    const blushGeo = new THREE.CircleGeometry(0.12, 16);
    const blushMat = new THREE.MeshBasicMaterial({ 
        color: 0xff9999,
        transparent: true,
        opacity: 0.6
    });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.55, -0.05, 1);
    bodyGroup.add(leftBlush);
    
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.55, -0.05, 1);
    bodyGroup.add(rightBlush);
    
    // Mouth (smile)
    const mouthShape = new THREE.Shape();
    mouthShape.arc(0, 0, 0.2, 0, Math.PI, false);
    const mouthGeo = new THREE.ShapeGeometry(mouthShape);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.25, 1);
    mouth.rotation.z = Math.PI;
    bodyGroup.add(mouth);
    
    // Ears
    const earGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, bodyMat);
    leftEar.position.set(-0.9, 1, 0);
    leftEar.scale.set(1, 1.3, 0.5);
    bodyGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, bodyMat);
    rightEar.position.set(0.9, 1, 0);
    rightEar.scale.set(1, 1.3, 0.5);
    bodyGroup.add(rightEar);
    
    // Inner ears
    const innerEarGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xff9999 });
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    leftInnerEar.position.set(-0.9, 1, 0.15);
    leftInnerEar.scale.set(1, 1.3, 0.5);
    bodyGroup.add(leftInnerEar);
    
    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    rightInnerEar.position.set(0.9, 1, 0.15);
    rightInnerEar.scale.set(1, 1.3, 0.5);
    bodyGroup.add(rightInnerEar);
    
    // Feet
    const footGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const leftFoot = new THREE.Mesh(footGeo, bodyMat);
    leftFoot.position.set(-0.45, -1.3, 0.2);
    leftFoot.scale.set(1, 0.6, 1.2);
    bodyGroup.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeo, bodyMat);
    rightFoot.position.set(0.45, -1.3, 0.2);
    rightFoot.scale.set(1, 0.6, 1.2);
    bodyGroup.add(rightFoot);
    
    bodyGroup.userData.isCharacter = true;
    modelGroup.add(bodyGroup);
    
    // Add floating stars
    for (let i = 0; i < 5; i++) {
        const starShape = new THREE.Shape();
        const outerRadius = 0.2;
        const innerRadius = 0.1;
        for (let j = 0; j < 10; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j / 10) * Math.PI * 2 - Math.PI / 2;
            if (j === 0) {
                starShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            } else {
                starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
        }
        starShape.closePath();
        const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: false });
        const starMat = new THREE.MeshStandardMaterial({
            color: 0xffbe0b,
            emissive: 0xffbe0b,
            emissiveIntensity: 0.5
        });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3 - 1
        );
        star.userData.isFloating = true;
        star.userData.angle = Math.random() * Math.PI * 2;
        star.userData.speed = 0.5 + Math.random() * 0.5;
        star.userData.baseY = star.position.y;
        modelGroup.add(star);
    }
}

function createRoomModel() {
    clearModel();
    
    const roomSize = 6;
    const roomDepth = 10;
    
    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(roomSize, roomSize);
    const backWallMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a4a,
        side: THREE.DoubleSide
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.z = -roomDepth / 2;
    modelGroup.add(backWall);
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomSize, roomDepth);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -roomSize / 2;
    modelGroup.add(floor);
    
    // Left wall
    const sideWallGeo = new THREE.PlaneGeometry(roomDepth, roomSize);
    const leftWallMat = new THREE.MeshStandardMaterial({ 
        color: 0x252545,
        side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(sideWallGeo, leftWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -roomSize / 2;
    modelGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo, leftWallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = roomSize / 2;
    modelGroup.add(rightWall);
    
    // Ceiling
    const ceilingMat = new THREE.MeshStandardMaterial({ 
        color: 0x202040,
        side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
    ceiling.rotation.x = -Math.PI / 2;
    ceiling.position.y = roomSize / 2;
    modelGroup.add(ceiling);
    
    // Window glow
    const windowSize = 2;
    const windowGlowGeo = new THREE.PlaneGeometry(windowSize, windowSize);
    const windowGlowMat = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.8
    });
    const windowGlow = new THREE.Mesh(windowGlowGeo, windowGlowMat);
    windowGlow.position.set(0, 0.5, -roomDepth / 2 + 0.1);
    modelGroup.add(windowGlow);
    
    // Window frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a6a });
    const frameThickness = 0.15;
    
    const frameGeo1 = new THREE.BoxGeometry(windowSize + frameThickness * 2, frameThickness, 0.1);
    const topFrame = new THREE.Mesh(frameGeo1, frameMat);
    topFrame.position.set(0, 0.5 + windowSize / 2 + frameThickness / 2, -roomDepth / 2 + 0.15);
    modelGroup.add(topFrame);
    
    const bottomFrame = new THREE.Mesh(frameGeo1, frameMat);
    bottomFrame.position.set(0, 0.5 - windowSize / 2 - frameThickness / 2, -roomDepth / 2 + 0.15);
    modelGroup.add(bottomFrame);
    
    // Desk
    const deskTopGeo = new THREE.BoxGeometry(2.5, 0.12, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
    deskTop.position.set(0, -1.5, -2.5);
    modelGroup.add(deskTop);
    
    // Monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.8, 0.08);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, -0.95, -2.8);
    modelGroup.add(monitor);
    
    // Monitor screen glow
    const screenGeo = new THREE.PlaneGeometry(1, 0.65);
    const screenMat = new THREE.MeshBasicMaterial({ 
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.8
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, -0.95, -2.75);
    modelGroup.add(screen);
    
    // Lamp
    const lampBaseGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.08, 16);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const lampBase = new THREE.Mesh(lampBaseGeo, lampMat);
    lampBase.position.set(1.5, -1.4, -2.6);
    modelGroup.add(lampBase);
    
    const lampShadeGeo = new THREE.ConeGeometry(0.2, 0.3, 16, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({ 
        color: 0xffbe0b,
        emissive: 0xffbe0b,
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide
    });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(1.5, -0.9, -2.6);
    lampShade.rotation.x = Math.PI;
    modelGroup.add(lampShade);
    
    // Lamp light
    const lampLight = new THREE.PointLight(0xffbe0b, 0.6, 4);
    lampLight.position.set(1.5, -0.9, -2.6);
    modelGroup.add(lampLight);
    
    // Books
    const bookColors = [0xff006e, 0x7b2cbf, 0x00d4ff];
    bookColors.forEach((color, i) => {
        const bookGeo = new THREE.BoxGeometry(0.25, 0.3, 0.12);
        const bookMat = new THREE.MeshStandardMaterial({ color });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(-0.8 + i * 0.3, -1.3, -2.5);
        book.rotation.z = (Math.random() - 0.5) * 0.15;
        modelGroup.add(book);
    });
    
    // Plant
    const potGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(-2, -2.65, -3);
    modelGroup.add(pot);
    
    // Plant leaves
    const leafGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
            -2 + (Math.random() - 0.5) * 0.2,
            -2.3 + i * 0.12,
            -3 + (Math.random() - 0.5) * 0.2
        );
        leaf.scale.set(0.7, 1, 0.7);
        modelGroup.add(leaf);
    }
}

// Initialize with cube model
createCubeModel();

// ===== Face Detection Setup =====
const videoElement = document.getElementById('webcam');
const faceCanvas = document.getElementById('faceCanvas');
const faceCtx = faceCanvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');

let faceDetection;
let cameraInstance;
let isTracking = false;
let isCameraStarted = false;

// Initialize MediaPipe Face Detection
async function initFaceDetection() {
    try {
        faceDetection = new FaceDetection({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            }
        });
        
        faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5
        });
        
        faceDetection.onResults(onFaceResults);
        
        loadingOverlay.classList.add('hidden');
        console.log('MediaPipe Face Detection initialized');
    } catch (error) {
        console.error('Failed to initialize face detection:', error);
        loadingOverlay.classList.add('hidden');
        statusText.textContent = '初期化エラー';
    }
}

function onFaceResults(results) {
    // Clear canvas
    faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    
    if (results.detections && results.detections.length > 0) {
        const detection = results.detections[0];
        const bbox = detection.boundingBox;
        
        // Draw bounding box
        faceCtx.strokeStyle = '#00d4ff';
        faceCtx.lineWidth = 3;
        faceCtx.strokeRect(
            bbox.xCenter * faceCanvas.width - bbox.width * faceCanvas.width / 2,
            bbox.yCenter * faceCanvas.height - bbox.height * faceCanvas.height / 2,
            bbox.width * faceCanvas.width,
            bbox.height * faceCanvas.height
        );
        
        // Calculate head position (normalized -1 to 1)
        // Mirrored because webcam is mirrored
        targetHeadX = -(bbox.xCenter - 0.5) * 2;
        targetHeadY = -(bbox.yCenter - 0.5) * 2;
        
        // Z based on face size (larger face = closer = smaller Z value)
        const faceSize = bbox.width * bbox.height;
        targetHeadZ = Math.max(0.5, Math.min(1.5, 0.8 / Math.sqrt(faceSize)));
        
        // Update tracking data display
        document.getElementById('trackX').textContent = targetHeadX.toFixed(2);
        document.getElementById('trackY').textContent = targetHeadY.toFixed(2);
        document.getElementById('trackZ').textContent = targetHeadZ.toFixed(2);
        
        if (!isTracking) {
            isTracking = true;
            statusDot.classList.add('active');
            statusText.textContent = 'トラッキング中';
        }
    } else {
        if (isTracking && isCameraStarted) {
            isTracking = false;
            statusDot.classList.remove('active');
            statusText.textContent = '顔を検出中...';
        }
    }
}

async function startCamera() {
    startBtn.disabled = true;
    startBtn.textContent = '起動中...';
    statusText.textContent = 'カメラ起動中...';
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: { ideal: 640 }, 
                height: { ideal: 480 }, 
                facingMode: 'user' 
            }
        });
        
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = async () => {
            await videoElement.play();
            
            // Set canvas size
            faceCanvas.width = videoElement.videoWidth || 640;
            faceCanvas.height = videoElement.videoHeight || 480;
            
            isCameraStarted = true;
            
            // Start face detection loop
            cameraInstance = new Camera(videoElement, {
                onFrame: async () => {
                    if (faceDetection) {
                        await faceDetection.send({ image: videoElement });
                    }
                },
                width: 640,
                height: 480
            });
            
            await cameraInstance.start();
            
            startBtn.textContent = 'カメラ起動中';
            statusText.textContent = '顔を検出中...';
            statusDot.classList.remove('active');
        };
        
    } catch (error) {
        console.error('Camera error:', error);
        startBtn.disabled = false;
        startBtn.textContent = 'カメラを起動';
        statusText.textContent = 'カメラエラー';
        statusDot.classList.remove('active');
        
        let errorMsg = 'カメラへのアクセスができませんでした。';
        if (error.name === 'NotAllowedError') {
            errorMsg += '\nブラウザのカメラ許可を確認してください。';
        } else if (error.name === 'NotFoundError') {
            errorMsg += '\nカメラが見つかりません。';
        }
        alert(errorMsg);
    }
}

// ===== Model Switching =====
const modelButtons = document.querySelectorAll('.model-btn');
modelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modelButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const model = btn.dataset.model;
        currentModel = model;
        
        switch(model) {
            case 'cube':
                createCubeModel();
                break;
            case 'character':
                createCharacterModel();
                break;
            case 'room':
                createRoomModel();
                break;
        }
    });
});

// ===== Animation Loop =====
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    
    // Smooth interpolation for head tracking
    const smoothing = 0.08;
    headX += (targetHeadX - headX) * smoothing;
    headY += (targetHeadY - headY) * smoothing;
    headZ += (targetHeadZ - headZ) * smoothing;
    
    // ===== HEAD-COUPLED PERSPECTIVE =====
    // The key insight: move the camera based on head position
    // This creates the illusion that the screen is a window
    
    const parallaxAmount = 3; // How much the camera moves
    
    // Move camera position based on head position
    camera.position.x = headX * parallaxAmount;
    camera.position.y = headY * parallaxAmount;
    camera.position.z = 10; // Keep distance constant
    
    // Always look at the center of the scene
    camera.lookAt(0, 0, 0);
    
    // ===== Animate objects =====
    modelGroup.children.forEach(child => {
        // Floating animation
        if (child.userData.isFloating) {
            const baseY = child.userData.baseY || 0;
            child.position.y = baseY + Math.sin(time * 2 + (child.userData.angle || 0)) * 0.15;
            child.rotation.x += 0.008;
            child.rotation.y += 0.012;
        }
        
        // Character bobbing
        if (child.userData.isCharacter) {
            child.position.y = Math.sin(time * 1.5) * 0.08;
            child.rotation.y = Math.sin(time * 0.5) * 0.08;
        }
    });
    
    // Rotate main cube
    if (currentModel === 'cube') {
        modelGroup.children.forEach(child => {
            if (child.userData.isMainObject) {
                child.rotation.x += 0.004;
                child.rotation.y += 0.006;
            }
        });
    }
    
    renderer.render(scene, camera);
}

// ===== Fullscreen Mode =====
const fullscreenBtn = document.getElementById('fullscreenBtn');
const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
const webcamMini = document.getElementById('webcamMini');
const faceCanvasMini = document.getElementById('faceCanvasMini');
let isFullscreen = false;

function enterFullscreen() {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
    
    document.body.classList.add('fullscreen-mode');
    isFullscreen = true;
    
    // Clone video stream to mini webcam
    if (videoElement.srcObject) {
        webcamMini.srcObject = videoElement.srcObject;
        webcamMini.play();
    }
    
    // Resize canvas for fullscreen
    setTimeout(resizeForFullscreen, 100);
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    
    document.body.classList.remove('fullscreen-mode');
    isFullscreen = false;
    
    // Reset canvas size
    setTimeout(resizeForNormal, 100);
}

function resizeForFullscreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    canvas.style.width = '100%';
    canvas.style.height = '100%';
}

function resizeForNormal() {
    renderer.setSize(640, 480);
    camera.aspect = 640 / 480;
    camera.updateProjectionMatrix();
}

// Handle fullscreen change events
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen-mode');
        isFullscreen = false;
        resizeForNormal();
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
        document.body.classList.remove('fullscreen-mode');
        isFullscreen = false;
        resizeForNormal();
    }
});

// Fullscreen UI model buttons
document.querySelectorAll('.fullscreen-ui .model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update all model buttons (both normal and fullscreen UI)
        document.querySelectorAll('.model-btn').forEach(b => {
            if (b.dataset.model === btn.dataset.model) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        
        const model = btn.dataset.model;
        currentModel = model;
        
        switch(model) {
            case 'cube':
                createCubeModel();
                break;
            case 'character':
                createCharacterModel();
                break;
            case 'room':
                createRoomModel();
                break;
        }
    });
});

// ===== Event Listeners =====
startBtn.addEventListener('click', startCamera);
fullscreenBtn.addEventListener('click', enterFullscreen);
exitFullscreenBtn.addEventListener('click', exitFullscreen);

// ESC key to exit fullscreen (backup)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (isFullscreen) {
        resizeForFullscreen();
    }
});

// ===== Initialize =====
initFaceDetection();
animate();

console.log('3D Parallax Viewer initialized');
