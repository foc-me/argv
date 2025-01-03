import { createRequire } from "node:module"
import copy from "rollup-plugin-copy"
import stringify from "@focme/stringify-json"

const require = createRequire(import.meta.url)
const pkg = require("./package.json")

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * @license MIT
 * Copyright (c) 2025 - present Fat Otaku Team
 **/`

const attrs = [
    "name",
    "version",
    "description",
    "keywords",
    "main",
    "module",
    "types",
    "exports",
    "files",
    "author",
    "repository",
    "license"
]
function pickUp(packageInfo) {
    const results = attrs.map(attr => {
        if (typeof attr === "string") return [attr, packageInfo[attr]]
        return attr
    })
    return Object.fromEntries(results)
}

export default {
    input: "./src/index.js",
    output: [
        { file: "./dist/index.js", format: "cjs", banner },
        { file: "./dist/index.esm.js", format: "esm", banner }
    ],
    plugins: [copy({
        targets: [
            { src: ["./index.d.ts", "./readme.md"], dest: "./dist" },
            {
                src: "./package.json",
                dest: "./dist",
                transform: (content) => {
                    const json = pickUp(JSON.parse(content))
                    return stringify(json)
                }
            }
        ]
    })]
}