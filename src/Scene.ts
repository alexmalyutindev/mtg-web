import { Vector3 } from "./Vector";

interface Serializable<T> {
    deserialize(input : T) : T;
}

export class Scene implements Serializable<Scene> {
    root: Entity[];
    
    deserialize(input : Scene): Scene {
        this.root = input.root;
        for (let index = 0; index < this.root.length; index++) {
            this.root[index] = new Entity().deserialize(input.root[index]);
        }
        return this;
    }
}

class Entity implements Serializable<Scene> {
    name: string;
    type: "camera" | "test_quad";
    position: Vector3;
    rotation: Vector3;
    scale: Vector3 = new Vector3(1, 1, 1);
    transform: Matrix4x4;

    UpdateMatrix(): void {
        this.transform.SetTRS(this.position, this.rotation, this.scale);
    }

    deserialize(input : Entity): Entity {
        this.name = input.name;
        this.type = input.type;
        this.position = input.position;
        this.rotation = input.rotation;
        this.scale = input.scale;
        this.transform = new Matrix4x4(Matrix4x4.identity); 

        this.UpdateMatrix();
        return this;
    }
}

const TRANSLATION_X = 3, TRANSLATION_Y = 7, TRANSLATION_Z = 11;
const SCALE_X = 0, SCALE_Y = 5, SCALE_Z = 10;
class Matrix4x4 extends Float32Array {
    static identity : Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    constructor(array : Float32Array) {
        super(array);
        this.set(Matrix4x4.identity);
    }

    SetTRS(this: Float32Array, position: Vector3, rotation: Vector3, scale: Vector3) {
        this.set(Matrix4x4.identity);

        this[TRANSLATION_X] = position.x;
        this[TRANSLATION_Y] = position.y;
        this[TRANSLATION_Z] = position.z;

        this[SCALE_X] *= scale.x;
        this[SCALE_Y] *= scale.y;
        this[SCALE_Z] *= scale.z;
    }
}