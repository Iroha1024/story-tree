import StoryTree from '../src/index'

const node5 = {
    uuid: '5',
    next: [
        {
            uuid: '6',
            next: [],
        },
    ],
}

new StoryTree({
    container: '#app',
    width: 400,
    height: 400,
    root: {
        uuid: '1',
        next: [
            {
                uuid: '2',
                next: [node5],
            },
            {
                uuid: '3',
                next: [node5],
            },
            {
                uuid: '4',
                next: [node5],
            },
        ],
    },
    gutter: 50,
    padding: 50,
})
