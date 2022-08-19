import { parseCard } from "magic-card-parser";

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
var parsed : ActivatedAbility = JSON.parse(testText);

console.log(parsed);


const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

var x = 0, y = 0;
var speed = 2;
var dx = speed, dy = speed;
var width = 160, height = 90;

const image = new Image(width, height);

function Update() {
    ctx.clearRect(0, 0, 900, 600);

    ctx.drawImage(image, x, y, width, height);

    x += dx;
    y += dy;

    if (x + width > 900) dx = -speed;
    if (x < 0) dx = speed;

    if (y + height > 600) dy = -speed;
    if (y < 0) dy = speed;

    requestAnimationFrame(Update);
}

image.onload = () => {    
    requestAnimationFrame(Update);
}
image.src = "https://www.freepnglogos.com/uploads/dvd-png/tweaking-allm-the-difference-between-blu-ray-and-dvd-30.png";