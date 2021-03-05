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
    stage: Konva.Stage
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
        const { width, padding, gutter } = option
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
            if (width > actualCanvasWidth) {
                item.x += (width - actualCanvasWidth) / 2
            }
        })

        return {
            data: temp,
            canvasWidth: actualCanvasWidth,
            canvasHeight: actualCanvasheight,
        }
    }

    draw(canvasWidth: number, canvasHeight: number) {
        const layer = new Konva.Layer()
        this.stage.add(layer)

        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.stage.width(),
            height: this.stage.height(),
            fill: '#c5e5f6',
            listening: false,
        })
        layer.add(background)

        const stage = this.stage

        const group = new Konva.Group({
            x: 0,
            y: 0,
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

        layer.add(group)
        layer.draw()
    }
}
