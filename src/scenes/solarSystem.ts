import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CreateSceneClass } from '../createScene'

// If you don't need the standard material you will still need to import it since the scene requires it.
// import '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StarfieldProceduralTexture } from '@babylonjs/procedural-textures/starfield/index'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
// import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
// Agument scene class
import '@babylonjs/core/Helpers/sceneHelpers'
import { Scalar } from '@babylonjs/core/Maths/math.scalar'
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { TrailMesh } from '@babylonjs/core/Meshes/trailMesh'
import { Animation } from '@babylonjs/core/Animations/animation'
import disortionTexure from '../../assets/textures/distortion.png'
import rockTexure from '../../assets/textures/rock.png'
import rockNormal from '../../assets/textures/rockn.png'



type Planet = {
    name: string
    posRadians: number,
    posRadius: number,
    scale: number,
    color: Color3,
    rocky: boolean
}


export class SolarSystem implements CreateSceneClass {
    async createScene(
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine)

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            'my first camera',
            0,
            1.26,
            350,
            new Vector3(0, 0, 0),
            scene
        )

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true)

        this.createEnv(scene)

        const sun = this.createSun(scene)
        this.startSunAnimation(sun, scene)

        this.createPlanets(scene)


        const glowLayer = new GlowLayer('glowLayer', scene)
        glowLayer.addIncludedOnlyMesh(sun)


        this.showDebug(scene)


        return scene
    }


    createSun(scene: Scene) {
        const sun = CreateSphere('sun', {
            diameter: 16,
            segments: 128
        })
        const mat = new StandardMaterial('sunMat')
        mat.emissiveColor = new Color3(.38, .333, .11)
        mat.diffuseTexture = new Texture(disortionTexure, scene)
        mat.diffuseTexture.level = 1.8
        sun.rotation = Vector3.Zero()
        sun.material = mat
        return sun
    }

    startSunAnimation(sun: AbstractMesh, scene: Scene) {
        const fps = 30
        const animation = new Animation('sunAni', 'rotation.y', fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
        animation.setKeys([
            {
                frame: 0,
                value: 0
            },
            {
                frame: 2 * fps,
                value: Scalar.TwoPi
            }
        ])
        sun.animations.push(animation)
        scene.beginAnimation(sun, 0, 2 * fps, true)
    }


    createPlanets(scene: Scene): AbstractMesh[] {
        const hg = {
            name: 'hg',
            posRadians: Scalar.RandomRange(0, 2 * Math.PI),
            posRadius: 14,
            scale: 2,
            color: new Color3(0.45, 0.33, 0.18),
            rocky: true
        }
        const aphro = {
            name: 'aphro',
            posRadians: Scalar.RandomRange(0, 2 * Math.PI),
            posRadius: 35,
            scale: 3.5,
            color: new Color3(0.91, 0.89, 0.72),
            rocky: true
        }
        const tellus = {
            name: 'tellus',
            posRadians: Scalar.RandomRange(0, 2 * Math.PI),
            posRadius: 65,
            scale: 3.75,
            color: new Color3(0.17, 0.63, 0.05),
            rocky: true
        }
        const ares = {
            name: 'ares',
            posRadians: Scalar.RandomRange(0, 2 * Math.PI),
            posRadius: 100,
            scale: 3,
            color: new Color3(0.55, 0, 0),
            rocky: true
        }
        const zeus = {
            name: 'zeus',
            posRadians: Scalar.RandomRange(0, 2 * Math.PI),
            posRadius: 140,
            scale: 6,
            color: new Color3(0, 0.3, 1),
            rocky: false
        }

        const planets = [
            hg,
            aphro,
            tellus,
            ares,
            zeus,
        ]

        return planets.map(planet => {
            return this.createPlanet(planet, scene)
        })

    }

    createPlanet(planet: Planet, scene: Scene) {
        const sphere = CreateSphere(planet.name, {
            diameter: 1
        }, scene)
        const mat = new StandardMaterial(`${planet.name}Mat`)
        mat.diffuseColor = mat.specularColor = mat.emissiveColor = planet.color
        mat.specularPower = 0
        if (planet.rocky) {
            mat.bumpTexture = new Texture(rockNormal)
            mat.diffuseTexture = new Texture(rockTexure)
        } else {
            mat.diffuseTexture = new Texture(disortionTexure)
        }
        sphere.material = mat
        sphere.scaling.setAll(planet.scale)
        sphere.position.x = planet.posRadius * Math.sin(planet.posRadians)
        sphere.position.z = planet.posRadius * Math.cos(planet.posRadians)
        this.createAndStartOrbitAnimation(planet, sphere, scene)
        return sphere
    }


    createAndStartOrbitAnimation(planet: Planet, sphere: AbstractMesh, scene: Scene) {
        const gm = 6672.59 * 0.07
        const rCubed = Math.pow(planet.posRadius, 3)
        const twoPi = Scalar.TwoPi
        // 天文学中绕中心天体在圆形或者椭圆轨道上运转的小天体轨道周期为：2π * sqrt(r^3 / u), u = G * M，其中 G 为引力常熟，M 为天体质量
        // 参考 https://zh.wikipedia.org/wiki/%E8%BD%A8%E9%81%93%E5%91%A8%E6%9C%9F
        const peroid = twoPi * Math.sqrt(rCubed / gm)
        const w = twoPi / peroid
        const length = twoPi * planet.posRadius

        let angPos = planet.posRadians
        sphere.computeWorldMatrix(true)

        const trail = new TrailMesh(`${planet.name}Trail`, sphere, scene, .1, length, true)
        trail.material = sphere.material

        scene.onBeforeRenderObservable.add(() => {
            sphere.position.x = planet.posRadius * Math.sin(angPos)
            sphere.position.z = planet.posRadius * Math.cos(angPos)
            angPos = Scalar.Repeat(angPos + w, Scalar.TwoPi)
        })

    }


    createEnv(scene: Scene) {
        const sft = new StarfieldProceduralTexture('startFieldTexture', 512, scene)
        sft.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE
        sft.darkmatter = 1.5
        sft.distfading = .9
        const light = new PointLight('starLight', Vector3.Zero(), scene)
        light.intensity = 5
        light.diffuse = new Color3(1, 1, 0)
        light.specular = new Color3(.98, 1, 0)

        return scene.createDefaultEnvironment({
            skyboxSize: 512,
            createGround: false,
            skyboxTexture: sft
        })

    }


    showDebug(scene: Scene) {
        void Promise.all([
            import('@babylonjs/core/Debug/debugLayer'),
            import('@babylonjs/inspector'),
        ]).then(() => {
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
                globalRoot: document.getElementById('#root') || undefined,
            })
        })
    }
}

export default new SolarSystem()
