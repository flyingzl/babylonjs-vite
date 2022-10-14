import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Scalar } from '@babylonjs/core/Maths/math.scalar'

import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CreateSceneClass } from '../createScene'

// If you don't need the standard material you will still need to import it since the scene requires it.
// import '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { StarfieldProceduralTexture } from '@babylonjs/procedural-textures'
import '@babylonjs/core/Helpers/sceneHelpers'
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture'

import { Control } from '@babylonjs/gui/2D/controls/control'
import { Grid } from '@babylonjs/gui/2D/controls/grid'
import { Image } from '@babylonjs/gui/2D/controls/image'
import { TextBlock, TextWrapping } from '@babylonjs/gui/2D/controls/textBlock'
import { Button } from '@babylonjs/gui/2D/controls/button'
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle'

import menuBg from '../../assets/textures/2d/menuBackground.png'
import cargoIcon from '../../assets/textures/2d/cargo_icon.png'
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents'
import { Observable } from '@babylonjs/core/Misc/observable'

type MenuItem = {
    name?: string,
    title: string
    color?: string,
    height?: string,
    thickness?: number,
    cornerRadius?: number,
    shadowOffsetY?: number,
    shadowOffsetX?: number,
    background?: string,
    fontSize?: string,
    onInvoked?: () => void
}


export class GuiWithMenu implements CreateSceneClass {

    scene!: Scene

    private selectionChangedObserver!: Observable<number>

    private selectionIcon!: Image

    private grid!: Grid

    private _selectedIndex = -1


    get selectedItemIndex() {
        return this._selectedIndex
    }


    set selectedItemIndex(idx: number) {
        const rowCount = this.grid.rowCount
        if (idx > rowCount || idx < 0) return
        this._selectedIndex = idx
        this.selectionChangedObserver.notifyObservers(idx)
    }


    async createScene(
        engine: Engine,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        canvas: HTMLCanvasElement
    ): Promise<Scene> {
        const scene = new Scene(engine)
        this.scene = scene
        scene.clearColor = new Color4(0, 0, 0, 1)
        scene.createDefaultCameraOrLight(true, true, true)
        // this.createEnv(scene)
        this.createGUI(scene)
        const grid = this.grid

        this.selectionChangedObserver = new Observable()
        this.selectionChangedObserver.add(idx => {
            this.selectionIcon.isVisible = true
            grid.removeControl(this.selectionIcon)
            grid.addControl(this.selectionIcon, idx)
        })


        this.showDebug(scene)

        scene.onKeyboardObservable.add(keyboardEvent => {
            if (keyboardEvent.type === KeyboardEventTypes.KEYUP) {
                switch (keyboardEvent.event.code) {
                    case 'ArrowUp':
                        this.selectedItemIndex = this.selectedItemIndex - 1
                        break
                    case 'ArrowDown':
                        this.selectedItemIndex = this.selectedItemIndex + 1
                }
            }
        })

        scene.whenReadyAsync().then(() => {
            this.selectedItemIndex = 0
        })


        return scene
    }


    createEnv(scene: Scene) {
        const sft = new StarfieldProceduralTexture('startFieldTexture', 512, scene)
        sft.beta = .1
        const space = CreateCylinder('space', {
            diameterTop: 0,
            diameterBottom: 60,
            height: 100
        }, scene)
        const mat = new StandardMaterial('stfMat')
        mat.diffuseTexture = sft
        mat.diffuseTexture.coordinatesMode = Texture.SKYBOX_MODE
        mat.backFaceCulling = false
        space.material = mat
        scene.registerBeforeRender(() => {
            sft.time += scene.getEngine().getDeltaTime() / 1000
        })

    }


    createGUI(scene: Scene) {
        const gui = AdvancedDynamicTexture.CreateFullscreenUI('2d', true, scene)
        gui.renderAtIdealSize = true

        const menuContainer = new Rectangle('rect')
        menuContainer.background = menuBg
        menuContainer.width = .8
        menuContainer.thickness = .5
        menuContainer.cornerRadius = 10

        const image = new Image('image', menuBg)
        menuContainer.addControl(image)
        gui.addControl(menuContainer)

        menuContainer.addControl(this.createTitle())
        const grid = this.createGrid()
        this.grid = grid
        this.createMenuButtons(grid)

        // create icon
        const selectionIcon = this.createIcon()
        this.selectionIcon = selectionIcon
        grid.addControl(selectionIcon, 0, 0)
        this.createIconAnimation(selectionIcon)

        menuContainer.addControl(grid)

        return gui


    }

    createTitle() {
        const title = new TextBlock('text', 'Babylon GUI')
        title.resizeToFit = true
        title.textWrapping = TextWrapping.WordWrapEllipsis
        title.fontSize = '72px'
        title.color = '#fff'
        title.width = .9
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
        title.paddingTop = title.paddingBottom = '20px'
        title.shadowOffsetX = 3
        title.shadowOffsetY = 5
        title.shadowColor = '#f00'
        return title
    }

    createGrid() {
        const grid = new Grid('grid')
        grid.addColumnDefinition(.33)
        grid.addColumnDefinition(.33)
        grid.addColumnDefinition(.33)
        grid.addRowDefinition(.5)
        grid.addRowDefinition(.5)
        return grid
    }

    createIcon() {
        const imageIcon = new Image('cargoIcon', cargoIcon)
        imageIcon.width = '160px'
        imageIcon.height = '60px'
        imageIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
        imageIcon.paddingRight = '30px'
        imageIcon.shadowOffsetX = 5
        imageIcon.shadowOffsetY = 3
        imageIcon.shadowBlur = 5
        imageIcon.isVisible = false
        return imageIcon
    }

    createIconAnimation(image: Image) {
        let value = 0
        this.scene.onBeforeRenderObservable.add(() => {
            const delta = this.scene.getEngine().getDeltaTime() / 1000
            value = Scalar.Repeat(delta * 5 + value, Math.PI * 2)
            image.top = `${Math.sin(value)}px`
        })
    }

    createMenuButtons(grid: Grid) {
        const playOption: MenuItem = {
            name: 'play',
            title: 'Play',
            background: 'red',
            color: '#fff',
            onInvoked: () => {
                this.selectedItemIndex = 0
            }
        }
        const playBtn = this.createMenuItem(playOption)

        const exitOption: MenuItem = {
            name: 'exit',
            title: 'Exit',
            background: 'white',
            color: '#000',
            onInvoked: () => {
                this.selectedItemIndex = 1
            }
        }

        const exitBtn = this.createMenuItem(exitOption)
        grid.addControl(playBtn, grid.children.length, 1)
        grid.addControl(exitBtn, grid.children.length, 1)

    }

    createMenuItem(option: MenuItem) {
        const btn = Button.CreateSimpleButton(option.name || '', option.title)
        btn.color = option.color || '#fff'
        btn.background = option.background || '#0f0'
        btn.height = option.height || '80px'
        btn.thickness = option.thickness || 4
        btn.cornerRadius = option.cornerRadius || 40
        btn.shadowOffsetY = option.shadowOffsetY || 12
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        btn.fontSize = option.fontSize || '36px'
        btn.onPointerClickObservable.add(() => {
            option.onInvoked?.()
        })
        return btn
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

export default new GuiWithMenu()
