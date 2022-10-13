import * as Ammo from "ammo.js";

// eslint-disable-next-line
export let ammoModule: any;
export const ammoReadyPromise = new Promise((resolve) => {
    new Ammo().then((res: unknown) => {
        ammoModule = res;
        resolve(res);
    });
});
