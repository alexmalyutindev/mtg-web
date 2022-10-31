import { parseCard } from "magic-card-parser";

function Test() {

    var result = parseCard({
        name: "Thraben Doomsayer",
        oracle_text: "{T}: create a 1/1 white Human creature token.\nFateful hour — as long as you have 5 or less life, other creatures you control get +2/+2."
    });

    console.log(result);

    interface Cost {
        costs: any;
        activatedAbility: any;
        activate: () => void;
    }

    class ActivatedAbility {
        costs: any;
        activatedAbility: any;
        activate = () => {
            console.log("activate");
        };
    }

    var testText = JSON.stringify(result.result[2][0]);
    console.log(testText);
    var parsed: ActivatedAbility = JSON.parse(testText);

    console.log(parsed);

    // const response = await fetch("https://api.scryfall.com/cards/random");
    // var cardInfo = await response.json();
    // var texture = loadTexture(gl, cardInfo['image_uris']['small']);
}

function loadTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.crossOrigin = "";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture!;
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}