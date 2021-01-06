import {OrgbValue, UpdateParams, CameraResult,Sprite } from "core";

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

export interface GameObjectParams extends UpdateParams {
  camera: CameraResult
}

export default abstract class GameObject<ParamsType extends GameObjectParams> implements Space {
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
  sprite?: Sprite;
  needUpdate = (params: ParamsType) => {
    return this.inBound(params);
  };
  inBound = (params: ParamsType) => {
    return params.camera.inBound(this.position, this.size);
  };
  addChild = (child: GameObject<ParamsType>) => {
    child.parent = this;
    this.children.push(child);
    child.init();
  };
  removeChild = (child: GameObject<ParamsType>) => {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = undefined;
      this.children.splice(index, 1);
    }
  };
  getAncestorByType: <T extends GameObject<ParamsType>> (type: any) => T | null  = <T extends GameObject<ParamsType>>(type: any): T | null => {
    let target = this.parent;

    while (target) {
      if (target instanceof type) {
        return target as T;
      }
      target = target.parent;
    }
    return null;
  };
  destroy() {
    this.parent?.removeChild(this);
  }
  init() {}
  tick = (params: ParamsType) => {
    if (!this.needUpdate(params)) {
      return;
    }
    this.update(params);

    this.children.forEach(child => child.tick(params));
  };
  update = (_: ParamsType) => {};
  render = (params: ParamsType) => {
    if (!this.inBound(params)) {
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

    this.draw(p);

    this.children.forEach(child => child.render(p));
  };
  draw = (params: ParamsType) => {
    if (this.sprite) {
      for (let i = 0; i < this.sprite.pixels.length; i++) {
        const row = Math.floor(i / this.sprite.width);
        const col = i - row * this.sprite.width;
        params.pixels.setPixel(col, row, this.sprite.pixels[i]);
      }
      return;
    }
  };
}
