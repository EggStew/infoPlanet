import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('ambietLightIntensity')


const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9)
directionalLight.position.set(1, 0.25, 0)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name('pointLightIntensity')

/**
 * Models
 */
const planetGeometry = new THREE.SphereGeometry()
const planetMaterial = new THREE.MeshNormalMaterial()

function newPlanet(pos){
    var planet = new THREE.Mesh(planetGeometry, planetMaterial)
    planet.scale.set(0.5, 0.5, 0.5)
    planet.position.set(0, 0, 0)
    return planet
}

var planets = [
    {
        name: "Murcury",
        mesh: newPlanet(2),
        orbitalPeriod: 0.241, // 4.15
        distanceFromSun: 0.387, // 2.59
    },
    {
        name: "Venus",
        mesh: newPlanet(4),
        orbitalPeriod: 0.615,
        distanceFromSun: 0.723,
    },
    {
        name: "Earth",
        mesh: newPlanet(6),
        orbitalPeriod: 1.0,
        distanceFromSun: 1.0,
    },
    {
        name: "Mars",
        mesh: newPlanet(8),
        orbitalPeriod: 1.88,
        distanceFromSun: 1.52,
    },
    {
        name: "Jupiter",
        mesh: newPlanet(10),
        orbitalPeriod: 11.9,
        distanceFromSun: 5.20,
    },
    {
        name: "Saturn",
        mesh: newPlanet(12),
        orbitalPeriod: 29.4,
        distanceFromSun: 9.57,
    },
    {
        name: "Uranus",
        mesh: newPlanet(14),
        orbitalPeriod: 83.7,
        distanceFromSun: 19.17,
    },
    {
        name: "Neptune",
        mesh: newPlanet(16),
        orbitalPeriod: 163.7,
        distanceFromSun: 30.18,
    },
    {
        name: "Pluto",
        mesh: newPlanet(18),
        orbitalPeriod: 247.9,
        distanceFromSun: 39.48,
    },

]

// Sun
const solar = new THREE.Mesh(planetGeometry, planetMaterial)
scene.add(solar)

// Planets
for(const planet of planets){
    scene.add(planet.mesh)
}

/**
 * Particles
 */

// Particle Parameters
const parameters = {}
parameters.count = 10000
parameters.size = 0.05
parameters.maxRadius = 65
parameters.minRadius = 40
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

window.addEventListener('dblclick', () => 
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {   
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        } 
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        } 
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -20
camera.position.y = 20
camera.position.z = 30
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
    for(const planet of planets){

        planet.mesh.position.x = Math.cos(planetAngle * Math.log(planet.orbitalPeriod * 4.15)) * (Math.log((planet.distanceFromSun * 2.59)) * 10)
        planet.mesh.position.z = Math.sin(planetAngle * Math.log(planet.orbitalPeriod * 4.15)) * (Math.log((planet.distanceFromSun * 2.59)) * 10)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()