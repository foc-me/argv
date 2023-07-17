import createArgv from "../src/index.js"

console.log(createArgv().object())
console.log(createArgv().opt())
console.log(createArgv().array())

createArgv().pipe("h", () => {
    console.log("-v for version")
}, "break").pipe("v", () => {
    console.log("version 10.01")
}).pipe("~", () => {
    console.log("always")
}, "always").commit(keys => {
    if (keys.length > 0) {
        console.log(`bad option ${keys[0]}`)
    }
    return keys.length < 1
})

// const args = "-a -c abc"

// createArgv(args).commit(keys => {
//     if (keys.length > 0) {
//         console.log(`bad option ${keys[0]}`)
//     }
//     return keys.length < 1
// })
// createArgv(args).pipe("-a", value => {
//     console.log("-a is", value)
// }).pipe("-b", value => {
//     console.log("-b is", value)
// }, "always").commit(keys => {
//     if (keys.length > 0) {
//         console.log(`bad option ${keys[0]}`)
//     }
//     return keys.length < 1
// })

// const append = "-a 12 -b index.js ./index.js"
// console.log(createArgv(args).append(append).object())
// console.log(createArgv(args).append(append, "replace").object())
// console.log(createArgv(args).append(append, "ignore").object())
// console.log(createArgv(args).append(append, "ignore").append({ d: 123 }).object())