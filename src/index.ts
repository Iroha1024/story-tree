import Konva from 'konva'

interface Option {
    container: HTMLDivElement | string
    width: number
    height: number
    root: Node
    padding?: number | [number, number]
    gutter?: number | [number, number]
}

type LocateOption = Pick<Option, 'width' | 'height' | 'padding' | 'gutter'>

interface Node {
    uuid: string
    next: Node[]
}

interface TreeData {
    uuid: string
    next: string[]
    rank: number
    x: number
    y: number
    width: number
    height: number
}

type SortTreeData = Pick<TreeData, 'uuid' | 'next' | 'rank'>

export default class StoryTree {
    scale = 0

    stage: Konva.Stage
    preview?: Konva.Stage
    data: TreeData[]

    constructor(option: Option) {
        const { container, width, height, root, padding, gutter } = option
        const square = this.lineUp(root)
        const { data, canvasWidth, canvasHeight } = this.setPosition(square, {
            width,
            height,
            padding,
            gutter,
        })
        this.data = data
        this.stage = new Konva.Stage({
            container,
            width,
            height,
        })
        this.draw(canvasWidth, canvasHeight)
        this.drawPreview(canvasWidth, canvasHeight)
    }

    lineUp(root: Node) {
        const store: SortTreeData[] = []
        const transformNode = (node: Node, store: SortTreeData[], rank = 0) => {
            const sameNode = store.find((item) => item.uuid == node.uuid)
            if (sameNode && rank >= sameNode.rank) {
                sameNode.rank = rank
            } else {
                store.push({
                    uuid: node.uuid,
                    next: node.next.map((item) => item.uuid),
                    rank,
                })
            }
            node.next.forEach((item) => transformNode(item, store, rank + 1))
        }
        transformNode(root, store)
        const square: SortTreeData[][] = []
        let index = 0,
            sum = 0
        while (store.length != sum) {
            square[index] = []
            square[index].push(...store.filter((item) => item.rank == index))
            sum += square[index].length
            index++
        }
        return square
    }

    setPosition(square: SortTreeData[][], option: LocateOption) {
        const nodeWidth = 100,
            nodeHeight = 80
        const { padding, gutter } = option
        const paddingX =
            padding == undefined ? 0 : typeof padding == 'number' ? padding : padding[0]
        const paddingY =
            padding == undefined ? 0 : typeof padding == 'number' ? padding : padding[1]
        const gutterX = gutter == undefined ? 0 : typeof gutter == 'number' ? gutter : gutter[0]
        const gutterY = gutter == undefined ? 0 : typeof gutter == 'number' ? gutter : gutter[1]

        const temp: TreeData[] = []
        let maxCoordinateX = 0

        square.forEach((line, lineIndex) => {
            line.forEach((item, colIndex) => {
                const treeData = {
                    ...item,
                    x:
                        (colIndex - line.length / 2) * nodeWidth +
                        (colIndex - line.length / 2 + 0.5) * gutterX,
                    y: lineIndex * (nodeHeight + gutterY),
                    width: nodeWidth,
                    height: nodeHeight,
                }
                if (treeData.x > maxCoordinateX) {
                    maxCoordinateX = treeData.x
                }
                temp.push(treeData)
            })
        })

        maxCoordinateX += nodeWidth
        const maxCoordinateY = temp[temp.length - 1].y + nodeHeight

        const actualCanvasWidth = (paddingX + maxCoordinateX) * 2
        const actualCanvasheight = paddingY * 2 + maxCoordinateY

        temp.forEach((item) => {
            item.x += maxCoordinateX + paddingX
            item.y += paddingY
        })

        return {
            data: temp,
            canvasWidth: actualCanvasWidth,
            canvasHeight: actualCanvasheight,
        }
    }

    draw(canvasWidth: number, canvasHeight: number) {
        const stage = this.stage

        const layer = new Konva.Layer({
            id: 'mainLayer',
        })
        stage.add(layer)

        const background = new Konva.Rect({
            width: stage.width(),
            height: stage.height(),
            fill: '#c5e5f6',
            listening: false,
        })
        layer.add(background)

        const group = new Konva.Group({
            id: 'nodeGroup',
            draggable: stage.width() < canvasWidth || stage.height() < canvasHeight,
            dragBoundFunc(pos) {
                let position = {
                    x: pos.x,
                    y: pos.y,
                }
                if (stage.width() >= canvasWidth) {
                    position.x = this.absolutePosition().x
                } else {
                    if (pos.x > 0) {
                        position.x = 0
                    } else if (pos.x < stage.width() - canvasWidth) {
                        position.x = stage.width() - canvasWidth
                    }
                }
                if (stage.height() >= canvasHeight) {
                    position.y = this.absolutePosition().y
                } else {
                    if (pos.y > 0) {
                        position.y = 0
                    } else if (pos.y < stage.height() - canvasHeight) {
                        position.y = stage.height() - canvasHeight
                    }
                }
                return position
            },
        })

        //x center
        if (stage.width() > canvasWidth) {
            group.setAttrs({
                offsetX: (canvasWidth - stage.width()) / 2,
            })
        }

        group.on('dragmove', () => {
            if (this.preview) {
                const previewLayer = this.preview.findOne('#previewLayer')
                const slider = (previewLayer as Konva.Layer).findOne('#slider')
                slider.setAttrs({
                    x: -group.x() * this.scale,
                    y: -group.y() * this.scale,
                })
                ;(previewLayer as Konva.Layer).batchDraw()
            }
        })

        this.drawShape(group)

        layer.add(group)
        layer.draw()
    }

    drawShape(group: Konva.Group) {
        this.data.forEach((node) => {
            const { x, y, width, height } = node
            const rect = new Konva.Rect({
                x,
                y,
                width,
                height,
                fill: 'red',
            })
            group.add(rect)
            node.next.forEach((uuid) => {
                const nextNode = this.data.find((item) => item.uuid == uuid)
                if (nextNode) {
                    const arrow = new Konva.Arrow({
                        points: [
                            node.x + node.width / 2,
                            node.y + node.height,
                            nextNode.x + nextNode.width / 2,
                            nextNode.y,
                        ],
                        fill: 'black',
                        stroke: 'black',
                        strokeWidth: 4,
                    })
                    group.add(arrow)
                }
            })
        })
    }

    drawPreview(canvasWidth: number, canvasHeight: number) {
        const stage = this.stage

        let scale = 1 / Math.max(canvasWidth / stage.width(), canvasHeight / stage.height())
        if (scale > 1) return
        scale *= 0.3

        this.scale = scale

        const container = stage.container()
        Object.assign(container.style, {
            position: 'relative',
            width: 'fit-content',
        })

        const preview = document.createElement('div')
        preview.id = 'preview'
        Object.assign(preview.style, {
            position: 'absolute',
            top: '0',
            right: '0',
        })
        container.append(preview)

        const previewStage = new Konva.Stage({
            container: preview,
            width: scale * canvasWidth,
            height: scale * canvasHeight,
        })

        previewStage.on('click', () => {
            const verctor = previewStage.getPointerPosition()
            if (verctor == null) return
            let { x, y } = verctor
            const halfSliderWidth = (scale * stage.width()) / 2
            const halfSliderHeight = (scale * stage.height()) / 2
            const sliderCenterPoint = {
                x: slider.x() + halfSliderWidth,
                y: slider.y() + halfSliderHeight,
            }
            if (x > scale * canvasWidth - halfSliderWidth) {
                x = scale * canvasWidth - halfSliderWidth
            } else if (x < halfSliderWidth) {
                x = halfSliderWidth
            }
            if (y > scale * canvasHeight - halfSliderHeight) {
                y = scale * canvasHeight - halfSliderHeight
            } else if (y < halfSliderHeight) {
                y = halfSliderHeight
            }
            slider.setAttrs({
                x: slider.x() + x - sliderCenterPoint.x,
                y: slider.y() + y - sliderCenterPoint.y,
            })
            layer.batchDraw()
            moveNodeGroup()
        })

        this.preview = previewStage

        const layer = new Konva.Layer({
            id: 'previewLayer',
        })
        previewStage.add(layer)

        const background = new Konva.Rect({
            width: previewStage.width(),
            height: previewStage.height(),
            fill: '#f0f0f080',
            listening: false,
        })
        layer.add(background)

        const mainLayer = stage.findOne('#mainLayer')
        const nodeGroup = (mainLayer as Konva.Layer).findOne('#nodeGroup')
        const group = new Konva.Group({
            scaleX: scale,
            scaleY: scale,
        })
        Array.from(nodeGroup.children).forEach((item) => {
            const shape = item as Konva.Shape
            const clone = shape.clone()
            group.add(clone)
        })
        layer.add(group)

        const slider = new Konva.Rect({
            width: scale * stage.width(),
            height: scale * stage.height(),
            id: 'slider',
            fill: '#cccccc80',
            draggable: stage.width() < canvasWidth || stage.height() < canvasHeight,
            dragBoundFunc(pos) {
                let position = {
                    x: pos.x,
                    y: pos.y,
                }
                if (stage.width() >= canvasWidth) {
                    position.x = this.absolutePosition().x
                } else {
                    if (pos.x < 0) {
                        position.x = 0
                    } else if (pos.x > (canvasWidth - stage.width()) * scale) {
                        position.x = (canvasWidth - stage.width()) * scale
                    }
                }
                if (stage.height() >= canvasHeight) {
                    position.y = this.absolutePosition().y
                } else {
                    if (pos.y < 0) {
                        position.y = 0
                    } else if (pos.y > (canvasHeight - stage.height()) * scale) {
                        position.y = (canvasHeight - stage.height()) * scale
                    }
                }
                return position
            },
        })

        const moveNodeGroup = () => {
            nodeGroup.setAttrs({
                x: -slider.x() / scale,
                y: -slider.y() / scale,
            })
            ;(mainLayer as Konva.Layer).batchDraw()
        }

        slider.on('dragmove', moveNodeGroup)

        layer.add(slider)

        layer.draw()
    }
}
