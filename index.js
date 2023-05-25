const declare = [/^-.+$/, /^--.+$/]
function isDeclare(target) {
    for (const reg of declare) {
        if (reg.test(target)) return true
    }
    return false
}

const regs = [
    { option: "--=", test: /^--(\w[\w-]*)=(.+)?$/ },
    { option: "--", test: /^--(\w[\w-]*)$/ },
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

function getArgv() {
    if (process && process.argv) {
        return process.argv.slice(2)
    }
    return []
}

function nil(value) {
    return value === undefined || value === null || value === ""
}

function insertSet(map, key, value) {
    const bo = isDeclare(value) || nil(value)
    if (Array.isArray(key)) {
        key.forEach(current => {
            map.set(current, bo || value)
        })
    } else map.set(key, bo || value)
    return !bo
}

function insertVariable(map, value) {
    const variables = map.get("_") || []
    if (!Array.isArray(map.get("_"))) {
        map.set("_", variables)
    }
    variables.push(value)
}

function createArgv(argv = []) {
    const args = argv.length > 0 ? argv : getArgv()
    const result = new Map()

    while (args.length > 0) {
        const current = args.shift()
        const { option, match } = testRegs(current)
        let [, phf, phs] = match
        switch (option) {
            case "-":
                phf = phf.split("")
            case "--":
                if (insertSet(result, phf, args[0])) {
                    args.shift()
                }
                break
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