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

const solar = new THREE.Mesh(planetGeometry, planetMaterial)
scene.add(solar)

const planet1 = new THREE.Mesh(planetGeometry, planetMaterial)
planet1.scale.set(0.5, 0.5, 0.5)
planet1.position.set(2, 0, 0)
scene.add(planet1)

const planet2 = new THREE.Mesh(planetGeometry, planetMaterial)
planet2.scale.set(0.5, 0.5, 0.5)
planet2.position.set(4, 0, 0)
scene.add(planet2)

const planet3 = new THREE.Mesh(planetGeometry, planetMaterial)
planet3.scale.set(0.5, 0.5, 0.5)
planet3.position.set(6, 0, 0)
scene.add(planet3)

const planet4 = new THREE.Mesh(planetGeometry, planetMaterial)
planet4.scale.set(0.5, 0.5, 0.5)
planet4.position.set(8, 0, 0)
scene.add(planet4)

const planet5 = new THREE.Mesh(planetGeometry, planetMaterial)
planet5.scale.set(0.5, 0.5, 0.5)
planet5.position.set(10, 0, 0)
scene.add(planet5)

const planet6 = new THREE.Mesh(planetGeometry, planetMaterial)
planet6.scale.set(0.5, 0.5, 0.5)
planet6.position.set(12, 0, 0)
scene.add(planet6)

const planet7 = new THREE.Mesh(planetGeometry, planetMaterial)
planet7.scale.set(0.5, 0.5, 0.5)
planet7.position.set(14, 0, 0)
scene.add(planet7)

const planet8 = new THREE.Mesh(planetGeometry, planetMaterial)
planet8.scale.set(0.5, 0.5, 0.5)
planet8.position.set(16, 0, 0)
scene.add(planet8)

const planet9 = new THREE.Mesh(planetGeometry, planetMaterial)
planet9.scale.set(0.5, 0.5, 0.5)
planet9.position.set(18, 0, 0)
scene.add(planet9)

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
camera.position.x = -2
camera.position.y = 2
camera.position.z = 3
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
 *  Orbit Period Adjustment
 */

const translate = (value, leftMin, leftMax, rightMin, rightMax) => 
{
    // # Figure out how 'wide' each range is
    let leftSpan = leftMax - leftMin
    let rightSpan = rightMax - rightMin

    // # Convert the left range into a 0-1 range (float)
    let valueScaled = (value - leftMin) / leftSpan

    // # Convert the 0-1 range into a value in the right range.
    return rightMin + (valueScaled * rightSpan)
}

let planetOrbitSpeed1 = translate(0.241, 0.241, 247.9, 0, 1)
let planetOrbitSpeed2 = translate(0.615, 0.241, 247.9, 0, 1)
let planetOrbitSpeed3 = translate(1.0, 0.241, 247.9, 0, 1)
let planetOrbitSpeed4 = translate(1.88, 0.241, 247.9, 0, 1)
let planetOrbitSpeed5 = translate(5.20, 0.241, 247.9, 0, 1)
let planetOrbitSpeed6 = translate(9.57, 0.241, 247.9, 0, 1)
let planetOrbitSpeed7 = translate(19.17, 0.241, 247.9, 0, 1)
let planetOrbitSpeed8 = translate(30.18 , 0.241, 247.9, 0, 1)
let planetOrbitSpeed9 = translate(247.9, 0.241, 247.9, 0, 1)

const planetOrbitAvg = 
    (planetOrbitSpeed1 + planetOrbitSpeed2 +
    planetOrbitSpeed3 + planetOrbitSpeed4 + 
    planetOrbitSpeed5 + planetOrbitSpeed6 +
    planetOrbitSpeed7 + planetOrbitSpeed8 + 
    planetOrbitSpeed9) / 9

console.log(planetOrbitAvg)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update Planet Rotations
    // Determines Speed of orbit
    const planetAngle = elapsedTime

    // Creates circular orbit, multiply to increasing distance from center

    // Murcury
    planet1.position.x = Math.cos(planetAngle * planetOrbitSpeed1) * 0.387  
    planet1.position.z = Math.sin(planetAngle * planetOrbitSpeed1) * 0.387 

    // Venus
    planet2.position.x = Math.cos(planetAngle * planetOrbitSpeed2) * 0.723 
    planet2.position.z = Math.sin(planetAngle * planetOrbitSpeed2) * 0.723 

    // Earth
    planet3.position.x = Math.cos(planetAngle * planetOrbitSpeed3) * 1
    planet3.position.z = Math.sin(planetAngle * planetOrbitSpeed3) * 1

    // Mars
    planet4.position.x = Math.cos(planetAngle * planetOrbitSpeed4) * 1.52 
    planet4.position.z = Math.sin(planetAngle * planetOrbitSpeed4) * 1.52 

    // Jupiter
    planet5.position.x = Math.cos(planetAngle * planetOrbitSpeed5) * 5.20 
    planet5.position.z = Math.sin(planetAngle * planetOrbitSpeed5) * 5.20 

    // Saturn
    planet6.position.x = Math.cos(planetAngle * planetOrbitSpeed6) * 9.57 
    planet6.position.z = Math.sin(planetAngle * planetOrbitSpeed6) * 9.57 

    // Uranus
    planet7.position.x = Math.cos(planetAngle * planetOrbitSpeed7) * 19.17 
    planet7.position.z = Math.sin(planetAngle * planetOrbitSpeed7) * 19.17 

    // Neptune
    planet8.position.x = Math.cos(planetAngle * planetOrbitSpeed8) * 30.18 
    planet8.position.z = Math.sin(planetAngle * planetOrbitSpeed8) * 30.18 

    // Pluto
    planet9.position.x = Math.cos(planetAngle * planetOrbitSpeed9) * 39.48 
    planet9.position.z = Math.sin(planetAngle * planetOrbitSpeed9) * 39.48 


    // Update Planet Orbits

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()