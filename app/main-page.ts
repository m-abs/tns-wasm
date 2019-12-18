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
            memoryBase: 0,
            tableBase: 0,
            memory: new WebAssembly.Memory({
                initial: 256,
                maximum: 512
            }),
            table: new WebAssembly.Table({
                initial: 0,
                element: "anyfunc"
            }),
            puts(index) {
                console.log(utf8ToString(buffer, index));
            }
        }
    };

    const filePath = `${fs.knownFolders.currentApp().path}/assets/test.wasm`;

    const file = fs.File.fromPath(filePath);

    const data = file.readSync();
    const wasmCode = new Uint8Array(data);

    const r = new Date();
    WebAssembly.instantiate(wasmCode, importObject)
        .then(results => {
            global["wasmResult"] = results;
            console.log("results", r, results);
            return results.instance;
        })
        .then(instance => {
            console.log("instance", r, instance);
            global["wasmInstance"] = instance;

            buffer = new Uint8Array((instance.exports.memory as any).buffer);
            return instance.exports.main as () => number;
        })
        .then(main => main())
        .catch(err => {
            console.error(err, r);
        });
}
