import { parseCard } from "magic-card-parser";

var result = parseCard({
    name: "Thraben Doomsayer",
    oracle_text: "{T}: create a 1/1 white Human creature token.\nFateful hour — as long as you have 5 or less life, other creatures you control get +2/+2."
});

console.log(result);