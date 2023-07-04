"use strict"

const declare = [/^-.+$/, /^--.+$/]
const globalKeys = ["_", "__"]

function isDeclare(target) {
    for (const reg of declare) {
        if (reg.test(target)) return true
    }
    return false
}

const regs = [
    { option: "__", test: /^--$/ },
    { option: "--=", test: /^(--\w[\w-]*)=(.+)?$/ },
    { option: "--", test: /^(--\w[\w-]*)$/ },
    { option: "-=", test: /^-(\w+)=(.+)?$/ },
    { option: "-", test: /^-(\w+)$/ },
    { option: "_", test: /(.+)/ }
]

function testRegs(target) {
    for (const { option, test } of regs) {
        const match = target.match(test)
        if (match) return { option, match }
    }
    return { option: "", match: [, target] }
}

function nil(value) {
    return value === undefined || value === null || value === ""
}

function getArgv(argv) {
    if (!nil(argv)) {
        if (typeof argv === "string") {
            argv = argv.split(" ")
        }
        if (!Array.isArray(argv)) {
            argv = [argv]
        }
        return argv.filter(i => !nil(i))
    }
    if (process && process.argv && Array.isArray(process.argv)) {
        return process.argv.slice(2)
    }
    return []
}

function setMap(map, key, value) {
    if (!map.has(key)) map.set(key, value)
    else {
        let item = map.get(key)
        if (Array.isArray(item)) item.push(value)
        else {
            const next = [item, value]
            map.set(key, next)
        }
    }
}

function insertSet(map, key, value) {
    const bo = isDeclare(value) || nil(value)
    if (Array.isArray(key)) {
        key.forEach(current => {
            setMap(map, current, bo || value)
        })
    } else setMap(map, key, bo || value)
    return !bo
}

function insertNested(map, value, key = "__") {
    value = Array.isArray(value) ? value : [value]
    for (const item of value) insert(map, item, key)
}

function insert(map, value, key = "_") {
    const variables = map.get(key) || []
    if (!Array.isArray(map.get(key))) {
        map.set(key, variables)
    }
    variables.push(value)
}

function entries(entries) {
    const result = []
    let next = entries.next()
    while (!next.done) {
        result.push(next.value)
        next = entries.next()
    }
    return result
}

function mapKeyIncludes(map, key) {
    const keys = ["", "-", "--"].map(item => `${item}${key}`)
    for (const item of keys) {
        if (map.has(item)) return item
    }
    return false
}

function formatAppendOptions(options) {
    if (!Array.isArray(options) && typeof options === "object") {
        return Object.entries(options)
    }
    return createArgv(options).array()
}

function formatAppendKey(key) {
    if (key.startsWith("-")) return key
    if (key.length === 1) return `-${key}`
    return `--${key}`
}

function originKey(key) {
    return key.replace(/-/g, "")
}

function createArgv(options) {
    const args = getArgv(options)
    const argv = new Map()

    main: while (args.length > 0) {
        const current = args.shift()
        const { option, match } = testRegs(current)
        let [, phf, phs] = match
        switch (option) {
            case "__":
                insertNested(argv, args)
                break main
            case "-":
                phf = phf.split("").map(key => `-${key}`)
            case "--":
                if (insertSet(argv, phf, args[0])) {
                    args.shift()
                }
                break
            case "-=":
                phf = phf.split("").map(key => `-${key}`)
            case "--=":
                insertSet(argv, phf, phs)
                break
            default:
                insert(argv, phf)
                break
        }
    }

    argv.obj = function() {
        const values = entries(this.entries()).map(([key, value]) => {
            if (globalKeys.includes(key)) return [key, value]
            return [originKey(key), value]
        })
        return Object.fromEntries(values)
    }

    argv.object = function() {
        return Object.fromEntries(this)
    }

    argv.array = function() {
        return entries(this.entries())
    }

    argv.append = function(options, type) {
        const Args = formatAppendOptions(options)
        for (const [key, value] of Args) {
            if (globalKeys.includes(key)) {
                insertNested(this, value, key)
            } else {
                const matchKey = mapKeyIncludes(this, key)
                if (matchKey) {
                    switch (type) {
                        case "replace":
                            this.set(matchKey, value)
                            break
                        case "ignore":
                            break
                        default:
                            insertSet(this, matchKey, value)
                            break
                    }
                } else this.set(formatAppendKey(key), value)
            }
        }
        return this
    }

    const pipes = new Map()
    argv.pipe = function(key, callback, type = "ignore") {
        pipes.set(key, { callback, type })
        return this
    }

    argv.commit = async function(unpipedCallback) {
        if (pipes.size < 1) {
            console.log("argv.commit: nothing in the pipe or the pipe has been commited")
            return
        }
        const unpipedKeys = entries(this.keys()).filter(key => {
            if (globalKeys.includes(key)) return false
            const origin = originKey(key)
            return !mapKeyIncludes(pipes, origin)
        })
        const shouldContinue = nil(unpipedCallback) || (typeof unpipedCallback === "function" && unpipedCallback(unpipedKeys) === true)
        if (shouldContinue) {
            for (const [key, { callback, type }] of entries(pipes.entries())) {
                const matchKey = mapKeyIncludes(this, key)
                if (!matchKey && type === "ignore") continue
                if (typeof callback === "function") {
                    const value = this.get(matchKey)
                    await callback(value)
                }
            }
            pipes.clear()
        }
    }

    return argv
}

export default createArgv