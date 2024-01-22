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
const global = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Background Color
scene.background = new THREE.Color('#00141F')
// Fix this from threejs lesson, hex isnt correct in gui
gui.addColor(scene, 'background')

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


/**
 * Particles
 */

// Particle Parameters
const parameters = {}
parameters.count = 10000
parameters.size = 0.001
parameters.maxRadius = 100
parameters.minRadius = 50
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff9595'
parameters.outsideColor = '#1b3984'

let particleGeometry = null
let particleMaterial = null
let points = null

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
    const scales = new Float32Array(parameters.count * 1)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
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
        
        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.maxRadius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scales
        scales[i] = Math.random()
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /** 
     * Material
     */
    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size * parameters.scales,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(points)
}

generateParticles()

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateParticles)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'maxRadius').min(1).max(500).step(0.01).onFinishChange(generateParticles)
gui.add(parameters, 'minRadius').min(1).max(100).step(0.01).onFinishChange(generateParticles)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateParticles)
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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()