# create-argv

a useless node arguments formater  

## usage  

```javascript
const createArgv = require("@focme/argv")

const argv = createArgv() // a map
const argvObject = argv.object() // an object
```

`createArgv()` will return a map object for the options  
`createArgv().object()` will return an object for the options  
`createArgv().opt()` will return an object for the options that every key removed the leading `-` or `--`  
`createArgv().array()` will return an entries of the options map  


```javascript
// --config ./webpack/webpack.dev.config

console.log(createArgv())
// Map(1) { "--config" => "./webpack/webpack.dev.config" }

console.log(createArgv().object())
// { "--config": "./webpack/webpack.dev.config" }

console.log(createArgv().opt())
// { "config": "./webpack/webpack.dev.config" }

console.log(createArgv().array())
// [["--config", "./webpack/webpack.dev.config"]]
```

## pipe and commit  

**pipe**  

```javascript
pipe(command, callback, type)
```

use `pipe()` function to put a callback into a map for one key in the options  
the callback could be an async function  

```javascript
// call this pipe callback while there is a command --key
createArgv().pipe("key", value => { ... }).commit(() => { ... })

// always call this pipe callback whether there is a command --key
// the value will be undefined
createArgv().pipe("key", value => { ... }, "always").commit(() => { ... })

// will not call the pipe callbacks after this pipe if there is a command --key
createArgv().pipe("key", value => { ... }, "break").commit(() => { ... })
```

**commit**  

use `commit()` function to run the callbacks in the pipe  
after `commit()` complete the pipe will be cleard

```javascript
await createArgv().pipe(key, value => {
    ...
}).commit()
```

as `commit` is an async function  
always should use async before it or use then after it  

in the callback of `commit` will send the keys in `createArgv` but not in the pipe  
return `false` the commit will stop run pipe callbacks  

```javascript
// -V
await createArgv().pipe("v", value => {
    console.log("version 10.01")
}).commit((keys) => {
    // keys = ["-V"]
    if (keys.length > 0) {
        console.log(`bad option ${key}`) // bad option -V
    }
    // commit will not run the pipe callbacks if keys.length > 0
    return keys.length < 1 
})
```

dont use the commit callback if dont care about the not matched keys  