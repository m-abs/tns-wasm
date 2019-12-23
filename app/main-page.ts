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

export function loadWasm() {
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
