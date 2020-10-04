import {OrgbValue, UpdateParams} from "core";
import {CameraResult} from "camera";

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

export interface Params extends UpdateParams {
  camera: CameraResult
}


export default abstract class GameObject<ParamsType extends Params> implements Space {
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
  children = Array<GameObject<ParamsType>>();
  parent?: GameObject<ParamsType>;

  tick = (params: ParamsType) => {
    if (!this.needUpdate(params)) {
      return;
    }
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

    if (this.inBound(params)) {
      this.draw(p);
    }

    this.children.forEach(child => child.tick(p));
  };
  needUpdate = (params: ParamsType) => {
    return this.inBound(params);
  };
  inBound = (params: ParamsType) => {
    return params.camera.inBound(this.position, this.size);
  };
  addChild = (child: GameObject<ParamsType>) => {
    child.parent = this;
    this.children.push(child);
  };
  removeChild = (child: GameObject<ParamsType>) => {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = undefined;
      this.children.splice(index, 1);
    }
  };
  destroy() {
    this.parent?.removeChild(this);
  }
  abstract update(params: ParamsType): void;
  abstract draw(params: ParamsType): void;
}
