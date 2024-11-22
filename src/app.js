import * as THREE from "../node_modules/three/build/three.module.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';

const container = document.getElementById('container');

// Scene en camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.05, .4); // Position the camera close to the object

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Environment map
const environmentTexture = new THREE.CubeTextureLoader()
    .setPath('src/assets/textures/')
    .load([
        'px.png', 'nx.png',
        'py.png', 'ny.png',
        'pz.png', 'nz.png',
    ]);
scene.background = environmentTexture;

// Verlichting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
light.castShadow = true;
scene.add(light);

const loader = new GLTFLoader();
loader.load('src/assets/models/shoe.glb', (gltf) => {
    const model = gltf.scene;
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);
    console.log(gltf.scene);

    // Object names (replace these with the actual names of your objects)
    const objectNames = ['shoe', 'inside', 'laces', 'outside_1', 'outside_2', 'outside_3', 'sole_bottom', 'sole_top'];
    const objects = {};

    // Mapping of object names to display labels
    const objectLabels = {
        'shoe': 'SHOE',
        'inside': 'INSIDE',
        'laces': 'LACES',
        'outside_1': 'OUTSIDE 1',
        'outside_2': 'OUTSIDE 2',
        'outside_3': 'OUTSIDE 2',
        'sole_bottom': 'SOLE 1',
        'sole_top': 'SOLE 2'
    };

    // Traverse the model to find and store the specific objects
    model.traverse((child) => {
        if (child.isMesh && objectNames.includes(child.name)) {
            objects[child.name] = child;
        }
    });

    // Log the objects to verify they were found
    console.log(objects);

    // GUI for color settings
    const colorGui = new dat.GUI({ autoPlace: false });
    document.body.appendChild(colorGui.domElement);
    colorGui.domElement.style.position = 'fixed';
    colorGui.domElement.style.left = '0';
    colorGui.domElement.style.top = '30%';

    // Predefined colors
    const colors = {
        'Red': 0xbd4a3c,
        'Green': 0x88d064,
        'Blue': 0x2d88c4,
        'Yellow': 0xd0c064,
        'Cyan': 0x8dd1cf,
        'Magenta': 0xbe8dd1,
        'White': 0xFFFFFF,
        'Brown': 0x8B4513,
        'Black': 0x2d2d2d
    };

     // Add folder for outside_1 first
     if (objects['outside_1']) {
        const outside1Folder = colorGui.addFolder(objectLabels['outside_1']);
        const colorController = outside1Folder.add({ color: 'White' }, 'color', Object.keys(colors)).name('');
        colorController.onChange((value) => {
            objects['outside_1'].material.color.setHex(colors[value]);
        });
        outside1Folder.open();
    }

    // Add combined folder for outside_2 and outside_3
    const combinedFolder = colorGui.addFolder('OUTSIDE 2');
    const combinedColorController = combinedFolder.add({ color: 'White' }, 'color', Object.keys(colors)).name('');
    combinedColorController.onChange((value) => {
        if (objects['outside_2']) {
            objects['outside_2'].material.color.setHex(colors[value]);
        }
        if (objects['outside_3']) {
            objects['outside_3'].material.color.setHex(colors[value]);
        }
    });
    combinedFolder.open();

    // Add folders for the remaining objects
    objectNames.forEach((name) => {
        if (objects[name] && name !== 'outside_1' && name !== 'outside_2' && name !== 'outside_3') {
            const objectFolder = colorGui.addFolder(objectLabels[name] || name);
            const colorController = objectFolder.add({ color: 'White' }, 'color', Object.keys(colors)).name('');
            colorController.onChange((value) => {
                objects[name].material.color.setHex(colors[value]);
            });
            objectFolder.open();
        } else if (name === 'outside_2' || name === 'outside_3') {
            // Skip adding individual controllers for outside_2 and outside_3
        } else {
            console.warn(`Object with name "${name}" not found in the model.`);
        }
    });

    // Variables for rotation and scale
    let isRotating = true; // Set to true to spin by default
    const modelSettings = {
        scale: 1,
        rotate: () => {
            isRotating = !isRotating;
        }
    };

    // GUI for model settings
    const modelGui = new dat.GUI({ autoPlace: false });
    document.body.appendChild(modelGui.domElement);
    modelGui.domElement.style.position = 'fixed';
    modelGui.domElement.style.left = '47%';
    modelGui.domElement.style.top = '90%';

    const scaleController = modelGui.add(modelSettings, 'scale', 0.5, 1.5).name('');
    scaleController.onChange((value) => {
        model.scale.set(value, value, value);
    });

    // Hide the label and input for the scale slider using CSS
    const scaleLabel = scaleController.domElement.previousElementSibling;
    if (scaleLabel) {
        scaleLabel.style.display = 'none';
    }
    const scaleInput = scaleController.domElement.querySelector('input');
    if (scaleInput) {
        scaleInput.style.display = 'none';
    }

    // Event listener for the rotate button
    const rotateBtn = document.querySelector('.rotateBtn');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            isRotating = !isRotating;
        });
    }

    // Spin the model slowly
    function animate() {
        requestAnimationFrame(animate);
        if (isRotating) {
            model.rotation.y += 0.005; // Adjust the speed of rotation here
        }
        renderer.render(scene, camera);
    }
    animate();
});

// GUI voor instellingen
const gui = new dat.GUI();
const lightFolder = gui.addFolder('LIGHT');
lightFolder.add(light.position, 'x', -10, 10).name('X');
lightFolder.add(light.position, 'y', -10, 10).name('Y');
lightFolder.add(light.position, 'z', -10, 10).name('Z');
lightFolder.add(light, 'intensity', 0, 2).name('%');
lightFolder.addColor({ color: light.color.getHex() }, 'color').name('Color').onChange((value) => {
    light.color.setHex(value);
});
lightFolder.open();

// Venster opnieuw schalen
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});