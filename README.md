2020 © All rights reserved, owned by LosSantosGamble. 

Distribution without the permission of the author will be reported for copyright infringement

## Installation

Create an src folder and upload files from this repository into it


Exit the "src" folder and type in cmd these commands
```npm
npm install discord.js
```

```npm
npm install discord-akairo
```

```npm
npm install sqlite
```

```npm
npm install typeorm
```

## TS Config (optional)
You can make your own tsconfig.json file
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es2018",
        "outDir": "dist",
        "lib": [
            "ESNext",
            "ESNext.Array",
            "ESNext.AsyncIterable",
            "ESNext.Intl",
            "ESNext.Symbol"
        ],
        "sourceMap": false,
        "inlineSourceMap": true,
        "inlineSources": true,
        "incremental": true,
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules"
    ]
}
```
