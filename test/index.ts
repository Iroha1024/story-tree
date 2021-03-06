import StoryTree from '../src/index'

const node6 = {
    uuid: '6',
    next: [
        {
            uuid: '7',
            next: [],
        },
    ],
}

new StoryTree({
    container: '#app',
    width: 400,
    height: 400,
    // width: window.innerWidth,
    // height: window.innerHeight,
    root: {
        uuid: '1',
        next: [
            {
                uuid: '2',
                next: [node6],
            },
            {
                uuid: '3',
                next: [node6],
            },
            {
                uuid: '4',
                next: [
                    {
                        uuid: '5',
                        next: [node6],
                    },
                ],
            },
        ],
    },
    gutter: 50,
    padding: 50,
})
