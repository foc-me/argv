const declare = [/^-.+$/, /^--.+$/]

function isDeclare(target) {
    for (const reg of declare) {
        if (reg.test(target)) return true
    }
    return false
}

const regs = [
    { option: "__", test: /^--$/ },
    { option: "--=", test: /^--(\w[\w-]*)=(.+)?$/ },
    { option: "--", test: /^--(\w[\w-]*)$/ },
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
    if (process && process.argv) {
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

function insertIgnore(map, value) {
    const variables = map.get("__") || []
    if (!Array.isArray(map.get("__"))) {
        map.set("__", variables)
    }
    variables.push(...value)
}

function insertVariable(map, value) {
    const variables = map.get("_") || []
    if (!Array.isArray(map.get("_"))) {
        map.set("_", variables)
    }
    variables.push(value)
}

function createArgv(argv) {
    const args = getArgv(argv)
    const result = new Map()

    main: while (args.length > 0) {
        const current = args.shift()
        const { option, match } = testRegs(current)
        let [, phf, phs] = match
        switch (option) {
            case "__":
                insertIgnore(result, args)
                break main
            case "-":
                phf = phf.split("")
            case "--":
                if (insertSet(result, phf, args[0])) {
                    args.shift()
                }
                break
            case "-=":
                phf = phf.split("")
            case "--=":
                insertSet(result, phf, phs)
                break
            default:
                insertVariable(result, phf)
                break
        }
    }

    result.object = function() {
        return Object.fromEntries(this)
    }

    return result
}

module.exports = createArgv