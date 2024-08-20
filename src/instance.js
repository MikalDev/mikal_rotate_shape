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
                this._xAngle = 0;
                this._yAngle = 0;
                this._zAngle = 0;
                this._xOffset = 0;
                this._yOffset = 0;
                this._zOffset = 0;
                this._xScale = 1;
                this._yScale = 1;
                this._zScale = 1;
            }

            const angle = this._inst.GetWorldInfo().GetAngle();
            if (angle != 0) {
                this._zAngle = -angle * (180 / Math.PI);
            }

            const quat = globalThis.glMatrix.quat;
            this._quaternion = quat.create();
            this._useQuaternion = false;

            // Monkey patch draw
            this._inst._oldDraw = this._inst.Draw;
            this._inst.Draw = function (renderer) {
                const behInst = this.GetBehaviorInstanceFromCtor(
                    C3.Behaviors.mikal_rotate_shape
                );
                const glMatrix = globalThis.glMatrix;
                const mat4 = glMatrix.mat4;
                const quat = glMatrix.quat;
                const tmpModelView = mat4.create();
                const modelRotate = mat4.create();
                const wi = this.GetWorldInfo();
                const tmpProjection = mat4.create();

                if (behInst._sdkInst._fragLight)
                    mat4.copy(tmpProjection, renderer._matP);

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

                let rotate = quat.create();
                if (behInst._sdkInst._useQuaternion) {
                    quat.copy(rotate, behInst._sdkInst._quaternion);
                } else {
                    quat.fromEuler(rotate, xAngle, yAngle, zAngle);
                }
                const x = wi.GetX() + xOff;
                const y = wi.GetY() + yOff;
                const z = wi.GetTotalZElevation() + zOff;
                const width = wi.GetWidth();
                const height = wi.GetHeight();
                let zHeight = this._sdkInst._zHeight;
                if (!zHeight) {
                    zHeight = 0;
                }

                // mat4.fromRotationTranslationScale(modelRotate, rotate, [0,0,0], [1,1,1]);
                if (behInst._sdkInst._useQuaternion) {
                    const rotZ = quat.create();
                    quat.fromEuler(rotZ, 0, 0, zAngle);
                    quat.multiply(rotate, rotate, rotZ);
                }

                mat4.fromRotationTranslationScaleOrigin(
                    modelRotate,
                    rotate,
                    [0, 0, 0],
                    [xScale, yScale, zScale],
                    [x, y, z + zHeight / 2]
                );
                if (behInst._sdkInst._fragLight)
                    mat4.copy(behInst._sdkInst._modelRotate, modelRotate);
                mat4.multiply(modelRotate, tmpModelView, modelRotate);
                if (behInst._sdkInst._fragLight)
                    mat4.multiply(modelRotate, renderer._matP, modelRotate);
                renderer.SetModelViewMatrix(modelRotate);
                if (behInst._sdkInst._fragLight) {
                    const encodedModelRotate = mat4.clone(
                        behInst._sdkInst._modelRotate
                    );
                    encodedModelRotate[3] = encodedModelRotate[12] + 11000000;
                    renderer.SetProjectionMatrix(encodedModelRotate);
                }

                this._oldDraw(renderer);
                renderer.SetModelViewMatrix(tmpModelView);
                if (behInst._sdkInst._fragLight)
                    renderer.SetProjectionMatrix(tmpProjection);
            };

            if (properties) {
            }
        }

        Release() {
            super.Release();
            this._xAngle = null;
            this._yAngle = null;
            this._zAngle = null;
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
            const behInst = this.GetBehaviorInstanceFromCtor(
                C3.Behaviors.mikal_rotate_shape
            );
        }

        LoadFromJson(o) {
            // load state for savegames
        }

        Trigger(method) {
            super.Trigger(method);
            const addonTrigger = addonTriggers.find((x) => x.method === method);
            if (addonTrigger) {
                this.GetScriptInterface().dispatchEvent(
                    new C3.Event(addonTrigger.id)
                );
            }
        }

        _SetRotationAngles(xAngle, yAngle, zAngle) {
            this._xAngle = xAngle;
            this._yAngle = yAngle;
            this._zAngle = zAngle;
            this._inst.GetRuntime().UpdateRender();
        }

        _SetRotationAnglesXY(xAngle, yAngle) {
            this._xAngle = xAngle;
            this._yAngle = yAngle;
            this._inst.GetRuntime().UpdateRender();
        }

        _SetCenterOffset(x, y, z) {
            this._xOffset = x;
            this._yOffset = y;
            this._zOffset = z;
            this._inst.GetRuntime().UpdateRender();
        }

        _SetScale(x, y, z) {
            this._xScale = x;
            this._yScale = y;
            this._zScale = z;
            this._inst.GetRuntime().UpdateRender();
        }

        _EnableFragLight(enable) {
            this._fragLight = enable;
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

        _Quaternion() {
            if (this._useQuaternion) return JSON.stringify(this._quaternion);
            return JSON.stringify([0, 0, 0, 1]);
        }

        _quaternionToEuler(quat) {
            // XYZ
            // Quaternion components
            const q0 = quat[3];
            const q1 = quat[0];
            const q2 = quat[1];
            const q3 = quat[2];

            // Roll (z-axis rotation)
            const sinr_cosp = 2 * (q0 * q3 + q1 * q2);
            const cosr_cosp = 1 - 2 * (q2 * q2 + q3 * q3);
            const roll = Math.atan2(sinr_cosp, cosr_cosp);

            // Pitch (x-axis rotation)
            const sinp = 2 * (q0 * q1 - q2 * q3);
            let pitch;
            if (Math.abs(sinp) >= 1) {
                pitch = Math.copySign(Math.PI / 2, sinp); // Use 90 degrees if out of range
            } else {
                pitch = Math.asin(sinp);
            }

            // Yaw (y-axis rotation)
            const siny_cosp = 2 * (q0 * q2 + q3 * q1);
            const cosy_cosp = 1 - 2 * (q1 * q1 + q2 * q2);
            const yaw = Math.atan2(siny_cosp, cosy_cosp);

            return [pitch, yaw, roll]; // Returns Euler angles in radians
        }

        _RotateTowardsPosition(
            x,
            y,
            z,
            objXAngle,
            objYAngle,
            objZAngle,
            upX,
            upY,
            upZ
        ) {
            const glMatrix = globalThis.glMatrix;
            const mat4 = glMatrix.mat4;
            const quat = glMatrix.quat;
            const vec3 = glMatrix.vec3;
            const target = vec3.fromValues(x, y, z);
            const posX = this._inst.GetWorldInfo().GetX();
            const posY = this._inst.GetWorldInfo().GetY();
            const posZ = this._inst.GetWorldInfo().GetTotalZElevation();
            const pos = vec3.fromValues(posX, posY, posZ);
            const targetMat = mat4.create();
            const upVec = vec3.fromValues(upX, upY, upZ);
            mat4.targetTo(targetMat, pos, target, upVec);
            const targetQuat = quat.create();
            mat4.getRotation(targetQuat, targetMat);
            if (objYAngle != 0)
                quat.rotateY(
                    targetQuat,
                    targetQuat,
                    (objYAngle * Math.PI) / 180
                );
            if (objXAngle != 0)
                quat.rotateX(
                    targetQuat,
                    targetQuat,
                    (objXAngle * Math.PI) / 180
                );
            if (objZAngle != 0)
                quat.rotateZ(
                    targetQuat,
                    targetQuat,
                    (objZAngle * Math.PI) / 180
                );
            // normalize
            quat.normalize(targetQuat, targetQuat);

            // const rotation = quat.create();
            // quat.rotationTo(rotation, base, targetQuat);

            this._quaternion = targetQuat;
            this._useQuaternion = true;
            this._inst.GetRuntime().UpdateRender();
        }

        GetScriptInterfaceClass() {
            return scriptInterface;
        }
    };
}
