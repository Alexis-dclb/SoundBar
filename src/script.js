import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AxesHelper, CubeTextureLoader, LoadingManager, Material, MeshBasicMaterial, PointLight, TextureLoader } from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'


const fftSize = 32;

/**
 * gui
 */


/**
 * helper
 */

const help = new THREE.AxesHelper(10)
/**
* webgl
*/
const webglCanva = document.querySelector('canvas.webgl')

/**
 * texture 
 * 
*/
const textureLoader = new TextureLoader()


/** 
 * scene 
*/
const scene = new THREE.Scene()
/* scene.add(help)
 */
 /***
  * Material
  */

/**
 * light
 */
const ambiantLight = new THREE.AmbientLight("#ffffff", 1)
scene.add(ambiantLight)

/**
 * object 
 */
let radius = 30
let boxes = new THREE.Group()

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshNormalMaterial()

 for (let i = 0; i < fftSize; i++) {
	const angle = (i % fftSize) / fftSize * Math.PI * 2
	const box = new THREE.Mesh(boxGeometry, boxMaterial)
	box.position.x = Math.cos(angle) * radius
	box.position.z = Math.sin(angle) * radius


	boxes.add(box)
} 

scene.add(boxes)


/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1,1000)
scene.add(camera)

camera.position.y = 54
/**
 * Analyser
 */

const listener = new THREE.AudioListener()
camera.add(listener)

const sound = new THREE.Audio(listener)

const audioLoader = new THREE.AudioLoader()
audioLoader.load('/music.mp3', (buffer) => {
	sound.setBuffer(buffer)
	sound.setLoop(true)
	sound.setVolume(0.5)
})


const analyser = new THREE.AudioAnalyser(sound, (fftSize * fftSize) * 2)


const data = analyser.getAverageFrequency()


document.getElementById('play').addEventListener('click', () => { 
	if (sound.isPlaying) {
		sound.stop()
		sound.play()

	} else {
		sound.play()

	}
})

/**
 * renderer
 */
const orbitControls = new OrbitControls(camera,webglCanva)
orbitControls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
	canvas: webglCanva,
	alpha: true
})

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**animarion
 * 
 */

const clock = new THREE.Clock()
function animate() {
	
	const elapsedTime = clock.getElapsedTime()
	
	camera.position.x = Math.sin(elapsedTime) * 100
	camera.position.z = Math.cos(elapsedTime) * 100


	const frequency = analyser.getFrequencyData()
	boxes.children.forEach((box, i) => {

	 	if (frequency[i] / 10 === 0) {
			box.scale.y = 0.1
		} else {
			box.scale.y = frequency[i] /4		
		} 
	})

  
	orbitControls.update();
	renderer.render(scene, camera);
	
	window.requestAnimationFrame(animate)

}

animate()