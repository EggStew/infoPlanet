import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from "gsap"

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Textures
 */
const particlesTexture = textureLoader.load('/textures/4.png')

/**
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Base
 */

// Debug
const gui = new GUI()
const debugObject = {}
debugObject.orbiteRate = 0.5
debugObject.rotationRate = 0.05
debugObject.distanceFromSunRate = 0.5

gui.add(debugObject, 'orbiteRate').min(0.1).max(1).step(0.1)
gui.add(debugObject, 'rotationRate').min(0.01).max(0.1).step(0.01)
gui.add(debugObject, 'distanceFromSunRate').min(0.1).max(1).step(0.1)

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Background Color
debugObject.color = '#00141F'
scene.background = new THREE.Color(debugObject.color)
gui.addColor(scene, 'background').onChange(() => {
    scene.background.color.set(debugObject.color)
})

/**
 * Lights
 */

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('ambientLightIntensity');

// Point light (sun)
const pointLight = new THREE.PointLight(0xffffff, 10, 200); // Use white color for sun light, decrease intensity and distance
pointLight.position.set(0, 0, 0); // Position the light at the center of the scene
scene.add(pointLight);

gui.add(pointLight, 'intensity').min(0).max(3).step(0.001).name('pointLightIntensity');

/**
 * Models
 */

// Orbital Information Array

const planetsOrbitalRotationInfo = [
    {
        name: "Mercury",
        orbitalPeriod:   1, // 4.15
        rotationPeriod:  8,
        distanceFromSun: 1,
    },
    {
        name: "Venus",
        orbitalPeriod:   2,
        rotationPeriod: -9,
        distanceFromSun: 2,
    },
    {
        name: "Earth",
        orbitalPeriod:   3,
        rotationPeriod:  5,
        distanceFromSun: 3,
    },
    {
        name: "Moon",
        orbitalPeriod:   3,
        rotationPeriod:  5,
        distanceFromSun: 3,
    },
    {
        name: "Mars",
        orbitalPeriod:   4,
        rotationPeriod:  6,
        distanceFromSun: 4,
    },
    {
        name: "Jupiter",
        orbitalPeriod:   5,
        rotationPeriod:  1,
        distanceFromSun: 5,
    },
    {
        name: "Saturn",
        orbitalPeriod:   6,
        rotationPeriod:  2,
        distanceFromSun: 6,
    },
    {
        name: "Uranus",
        orbitalPeriod:    7,
        rotationPeriod: - 4,
        distanceFromSun:  7,
    },
    {
        name: "Neptune",
        orbitalPeriod:   8,
        rotationPeriod:  3,
        distanceFromSun: 8,
    },
    {
        name: "Pluto",
        orbitalPeriod:   9,
        rotationPeriod:  7,
        distanceFromSun: 9,
    },
]

// GLTF Loader

let extractedPlanetData = [];
// To load models seperately look at lesson 40, and update planet objects gemoetry, animations etc.
gltfLoader.load(
    '/models/Solar_System_3D_Model/Planets.glb',
    (glb) => {

        for (const child of glb.scene.children) {
            // Find matching orbital and rotation periods based on the name
            const planetInfo = planetsOrbitalRotationInfo.find(info => info.name === child.name);

            // If no matching info is found, set default values
            const orbitalPeriod = planetInfo ? planetInfo.orbitalPeriod : 1.0;
            const rotationPeriod = planetInfo ? planetInfo.rotationPeriod : 1.0;
            const distanceFromSun = planetInfo ? planetInfo.distanceFromSun : 0.0;

            // Modify material to remove texture from inside
            child.material.side = THREE.FrontSide; // Only show texture on the front side

            let data = {
                name: child.name,
                geometry: child.geometry,
                material: child.material,
                mesh: null,
                position: {
                    x: child.position.x,
                    y: child.position.y,
                    z: child.position.z
                },
                rotation: {
                    x: child.rotation.x,
                    y: child.rotation.y,
                    z: child.rotation.z
                },
                orbitalPeriod: orbitalPeriod,
                rotationPeriod: rotationPeriod,
                distanceFromSun: distanceFromSun
            };
            
            extractedPlanetData.push(data);
        }

        // Planets
        for(const planet of extractedPlanetData){
            let mesh = new THREE.Mesh(planet.geometry, planet.material)
            planet.mesh = mesh
            mesh.position.set(planet.position.x, planet.position.y, planet.position.z)
            mesh.rotation.set(0, 0, 0)
            scene.add(mesh)
        }
    }
)



/**
 * Particles
 */

// Particle Parameters
const parameters = {}
parameters.count = 15000
parameters.size = 0.05
parameters.maxRadius = 45
parameters.minRadius = 35
parameters.insideColor = '#ff9595'
parameters.outsideColor = '#1b3984'

let particleGeometry = null
let particleMaterial = null
let points = null

// Generate Particles Function
const generateParticles = () => 
{
    /**
     * Destroy old galaxy
     */
    if(points !== null)
    {
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    particleGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Positions
        let innerRadius = parameters.minRadius
        const outterRadius = ((Math.random() - 0.5) * parameters.maxRadius)
        

        if(outterRadius < 0)
        {
            innerRadius *= -1
        } 

        const radius = innerRadius + outterRadius
        
        // Try find a way for the randomness not to be close to the z axis
        const randomS = Math.random() * 2 * Math.PI
        const randomT = Math.random() * Math.PI

        const randomX = radius * Math.cos(randomS) * Math.sin(randomT)
        const randomY = radius * Math.sin(randomS) * Math.sin(randomT)
        const randomZ = radius * Math.cos(randomT)

        positions[i3    ] = randomX 
        positions[i3 + 1] = randomY 
        positions[i3 + 2] = randomZ 

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.maxRadius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /** 
     * Material
     */
    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    particleMaterial.alphaMap = particlesTexture;

    /**
     * Points
     */
    points = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(points)
}

generateParticles()

// Debug Panel Paraments

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateParticles)
gui.add(parameters, 'size').min(0.01).max(0.1).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'maxRadius').min(1).max(500).step(0.01).onFinishChange(generateParticles)
gui.add(parameters, 'minRadius').min(1).max(100).step(0.01).onFinishChange(generateParticles)
gui.addColor(parameters, 'insideColor').onFinishChange(generateParticles)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateParticles)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => 
{
    // Update Sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// Set initial camera position and lookAt target to the center of the scene
camera.position.set(-10, 10, 15); // Initial camera position
camera.lookAt(0, 0, 0); // Look at the center of the scene

scene.add(camera)

/**
 * Event Listeners
 */

// Get all the image elements
const images = document.querySelectorAll('.nav-bar img');

let selectedPlanet = null;

// Loop through each image element and attach a click event listener
images.forEach(image => {
    image.addEventListener('click', function() {
        // Find the selected planet data
        selectedPlanet = extractedPlanetData.find(planet => planet.name === this.id);
    });
});

const homeButton = document.getElementById('house');

const iconButton = document.getElementById('info');

homeButton.addEventListener('click', () => {
    selectedPlanet = null
    gsap.to(camera.position, { duration: 5, x: -10, y: 10, z: 15 });
    gsap.to(camera.rotation, { duration: 5, x: 0, y: 0, z: 0 });
    gsap.to(camera.rotation, { duration: 5, onUpdate: () => {
        camera.lookAt(0, 0, 0);
    }});
})

iconButton.addEventListener('click', () => {
    console.log("clicked")
})

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update Planet Orbits

    // Determines Speed of orbit and starting position
    const planetAngle = 10 + elapsedTime * 0.025

    // Loop through planet meshes and update xz of orbit using orbital period and distnace from sun
    for(const planet of extractedPlanetData){
        
        // Orbit Speed and Distance
        planet.mesh.position.x = Math.cos(planetAngle * planet.orbitalPeriod * debugObject.orbiteRate) * (Math.log((planet.distanceFromSun * debugObject.distanceFromSunRate)+ 1) * 15)
        planet.mesh.position.z = Math.sin(planetAngle * planet.orbitalPeriod * debugObject.orbiteRate )* (Math.log((planet.distanceFromSun * debugObject.distanceFromSunRate) + 1) * 15)
        
        // Planet Rotation
        planet.mesh.rotation.y = elapsedTime * planet.rotationPeriod * debugObject.rotationRate
    }

     // Update camera position to track the selected planet
     if (selectedPlanet) {
        const { x, y, z } = selectedPlanet.mesh.position;
        camera.position.set(x - 1, y + 1, z + 2);
        camera.lookAt(selectedPlanet.mesh.position);
    }

    // // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()