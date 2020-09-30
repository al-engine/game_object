import {OrgbValue, UpdateParams} from "core";
import {KeyInputsResult} from "key_inputs";
import {MoveCamera} from "camera";

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface Space {
  position: Position;
  size: Size;
}

export interface GamePbjectParms extends UpdateParams {
  keyboard: KeyInputsResult,
  moveCamera: MoveCamera,
}

export default abstract class GameObject implements Space {
  position = {
    x: 0,
    y: 0,
  };
  size = {
    width: 1,
    height: 1,
  };
  tick = (params: GamePbjectParms) => {
    const setPixel = (x: number, y: number, color: OrgbValue) => {
      params.pixels.setPixel(this.position.x + x, this.position.y + y, color);
    };
    this.update({
      ...params,
      pixels: {
        ...params.pixels,
        setPixel
      }
    });
  };
  abstract update(params: GamePbjectParms): void;
}
