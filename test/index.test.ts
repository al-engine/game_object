import GameObject, { GameObjectParams } from '../src';

test('', () => {
  class Test extends GameObject<GameObjectParams> {}
  const obj = new Test();
  expect(obj).toBeTruthy();
});
