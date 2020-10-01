import {OrgbValue, UpdateParams} from "core";

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface Vector {
  x: number;
  y: number;
}

interface Space {
  position: Position;
  size: Size;
}


export default abstract class GameObject<ParamsType extends UpdateParams, StateType> implements Space {
  position = {
    x: 0,
    y: 0,
  };
  size = {
    width: 1,
    height: 1,
  };
  speed: Vector = {
    x: 0,
    y: 0,
  };

  state: StateType;

  constructor(state: StateType) {
    this.state = state;
  }

  tick = (params: ParamsType) => {
    const setPixel = (x: number, y: number, color: OrgbValue) => {
      params.pixels.setPixel(Math.round(this.position.x + x), Math.round(this.position.y + y), color);
    };

    const p = {
      ...params,
      pixels: {
        ...params.pixels,
        setPixel
      }
    };

    this.update(p);

    this.position.x += this.speed.x * params.delta / 1000;
    this.position.y += this.speed.y * params.delta / 1000;

    this.draw(p);
  };
  abstract update(params: ParamsType): void;
  abstract draw(params: ParamsType): void;
}
