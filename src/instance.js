function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);
      if (properties) {
        this._xAngle = properties[0];
        this._yAngle = properties[1];
        this._zAngle = properties[2];
        this._xOffset = properties[3];
        this._yOffset = properties[4];
        this._zOffset = properties[5];
        this._xScale = properties[6];
        this._yScale = properties[7];
        this._zScale = properties[8];
      } else {
        this._xAngle = 0
        this._yAngle = 0
        this._zAngle = 0
        this._xOffset = 0;
        this._yOffset = 0;
        this._zOffset = 0;
        this._xScale = 1;
        this._yScale = 1;
        this._zScale = 1;
      }

      const quat = globalThis.glMatrix.quat;
      this._quaternion = quat.create();
      this._useQuaternion = false;

      // Monkey patch draw
      this._inst._oldDraw = this._inst.Draw;
      this._inst.Draw = function (renderer) {
        const behInst = this.GetBehaviorInstanceFromCtor(C3.Behaviors.mikal_rotate_shape)
        const glMatrix = globalThis.glMatrix;
        const mat4 = glMatrix.mat4;
        const quat = glMatrix.quat;
        const tmpModelView = mat4.create();
        const modelRotate = mat4.create();
        const wi = this.GetWorldInfo();

        mat4.copy(tmpModelView, renderer._matMV);
        // Get behavior instance data
        const xAngle = behInst._sdkInst._xAngle;
        const yAngle = behInst._sdkInst._yAngle;
        const zAngle = behInst._sdkInst._zAngle;
        const xOff = behInst._sdkInst._xOffset;
        const yOff = behInst._sdkInst._yOffset;
        const zOff = behInst._sdkInst._zOffset;
        const xScale = behInst._sdkInst._xScale;
        const yScale = behInst._sdkInst._yScale;
        const zScale = behInst._sdkInst._zScale;

        let rotate = null;
        if (behInst._sdkInst._useQuaternion) {
          rotate = behInst._sdkInst._quaternion;
        } else {
          rotate = quat.create();
          quat.fromEuler(rotate, xAngle, yAngle, zAngle);
        }
        const x = wi.GetX()+xOff;
        const y = wi.GetY()+yOff;
        const z = wi.GetZElevation()+zOff;
        const width = wi.GetWidth();
        const height = wi.GetHeight();
        let zHeight = this._sdkInst._zHeight;
        if (!zHeight) {
          zHeight = 0;
        }

        // mat4.fromRotationTranslationScale(modelRotate, rotate, [0,0,0], [1,1,1]);
        if (behInst._sdkInst._useQuaternion) {
          const rotZ = quat.create();
          quat.fromEuler(rotZ, 0, 0, -zAngle)
          quat.multiply(rotate, rotate, rotZ)
        }

        mat4.fromRotationTranslationScaleOrigin(modelRotate, rotate, [0,0,0], [xScale, yScale, zScale], [x,y,z+zHeight/2]);
       // mat4.copy(modelRotate, modelRotate);
        mat4.multiply(modelRotate, tmpModelView, modelRotate);
        renderer.SetModelViewMatrix(modelRotate);
        this._oldDraw(renderer);
        renderer.SetModelViewMatrix(tmpModelView);
      }

      if (properties) {
      }
    }

    Release() {
      super.Release();
      this._xAngle = null
      this._yAngle = null
      this._zAngle = null
      this._xOffset = null;
      this._yOffset = null;
      this._zOffset = null;
      this._xScale = null;
      this._yScale = null;
      this._zScale = null;
    }

    SaveToJson() {
      return {
        // data to be saved for savegames
      };
    }

    DrawRotate(renderer) {
      // draw rotated
      const behInst = this.GetBehaviorInstanceFromCtor(C3.Behaviors.mikal_rotate_shape)
    }

    LoadFromJson(o) {
      // load state for savegames
    }

    Trigger(method) {
      super.Trigger(method);
      const addonTrigger = addonTriggers.find((x) => x.method === method);
      if (addonTrigger) {
        this.GetScriptInterface().dispatchEvent(new C3.Event(addonTrigger.id));
      }
    }

    _SetRotationAngles(xAngle, yAngle, zAngle) {
      this._xAngle = xAngle;
      this._yAngle = yAngle;
      this._zAngle = zAngle;
    }

    _SetRotationAnglesXY(xAngle, yAngle) {
      this._xAngle = xAngle;
      this._yAngle = yAngle;
    }

    _SetCenterOffset(x, y, z) {
      this._xOffset = x;
      this._yOffset = y;
      this._zOffset = z;
    }

    _SetScale(x, y, z) {
      this._xScale = x;
      this._yScale = y;
      this._zScale = z;
    }

    _xOffset() {
      return this._xOffset;
    }

    _yOffset() {
      return this._yOffset;
    }

    _zOffset() {
      return this._zOffset;
    }

    _AngleX() {
      return this._xAngle;
    }

    _AngleY() {
      return this._yAngle;
    }

    _AngleZ() {
      return this._zAngle;
    }

    // expression x,y,z scale
    _xScale() {
      return this._xScale;
    }
    _yScale() {
      return this._yScale;
    }
    _zScale() {
      return this._zScale;
    }

    GetScriptInterfaceClass() {
      return scriptInterface;
    }
  };
}
