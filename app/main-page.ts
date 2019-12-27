import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { HelloWorldModel } from "./main-view-model";
import * as fs from "@nativescript/core/file-system";

function utf8ToString(h: Uint8Array, p: number) {
    let s = "";
    for (let i = p; h[i]; i++) {
        s += String.fromCharCode(h[i]);
    }
    return s;
}

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new HelloWorldModel();
}

export function loadWasmFromFile() {
    let buffer;
    const importObject = {
        env: {
            puts(index) {
                console.log(utf8ToString(buffer, index));
            }
        }
    };

    const filePath = `${fs.knownFolders.currentApp().path}/assets/test.wasm`;

    const file = fs.File.fromPath(filePath);
    const wasmCode = new Uint8Array(file.readSync());

    const r = new Date().toISOString();

    const p = WebAssembly.compile(wasmCode)
        .then(wasmModule => {
            console.log(wasmModule);

            return WebAssembly.instantiate(wasmModule, importObject);
        })
        .then(instance => {
            global["wasmInstance"] = instance;

            buffer = new Uint8Array((instance.exports.memory as any).buffer);
            return instance.exports.main as () => number;
        })
        .then(main => {
            console.log("call main", main());
        });

    console.log("promise", r, p);
}

export function loadHardCodedWasm() {
    let buffer;
    const importObject = {
        env: {
            puts(index) {
                console.log(utf8ToString(buffer, index));
            }
        }
    };

    const wasmCode = new Uint8Array([
        0,
        97,
        115,
        109,
        1,
        0,
        0,
        0,
        1,
        138,
        128,
        128,
        128,
        0,
        2,
        96,
        1,
        127,
        1,
        127,
        96,
        0,
        1,
        127,
        2,
        140,
        128,
        128,
        128,
        0,
        1,
        3,
        101,
        110,
        118,
        4,
        112,
        117,
        116,
        115,
        0,
        0,
        3,
        130,
        128,
        128,
        128,
        0,
        1,
        1,
        4,
        132,
        128,
        128,
        128,
        0,
        1,
        112,
        0,
        0,
        5,
        131,
        128,
        128,
        128,
        0,
        1,
        0,
        1,
        6,
        129,
        128,
        128,
        128,
        0,
        0,
        7,
        145,
        128,
        128,
        128,
        0,
        2,
        6,
        109,
        101,
        109,
        111,
        114,
        121,
        2,
        0,
        4,
        109,
        97,
        105,
        110,
        0,
        1,
        10,
        143,
        128,
        128,
        128,
        0,
        1,
        137,
        128,
        128,
        128,
        0,
        0,
        65,
        16,
        16,
        0,
        26,
        65,
        0,
        11,
        11,
        148,
        128,
        128,
        128,
        0,
        1,
        0,
        65,
        16,
        11,
        14,
        104,
        101,
        108,
        108,
        111,
        44,
        32,
        119,
        111,
        114,
        108,
        100,
        33,
        0
    ]);

    const r = new Date().toISOString();

    const p = WebAssembly.compile(wasmCode)
        .then(wasmModule => {
            console.log(wasmModule);

            return WebAssembly.instantiate(wasmModule, importObject);
        })
        .then(instance => {
            buffer = new Uint8Array((instance.exports.memory as any).buffer);
            return instance.exports.main as () => number;
        })
        .then(main => {
            console.log("call main", main());
        });

    console.log("promise", r, p);
}
