import { OnePlusOne } from "./core";

export const decide = (current: number[], rival: number[], depth = 5) => {
    const instance = new OnePlusOne([...current], [...rival]);

    instance.swap();

    console.log("forward");

    instance.forward(depth);
    
    console.log("deathTransfer");

    instance.deathTransfer();

    // console.dir(instance, { depth: 4 });

    const sitmap = instance.children.map((child) => ({
        // instance: child,
        method: child.method,
        situation: child.countSituations(),
    })).sort((x, y) => {
        if (y.situation[1] == 0 && x.situation[1] == 0) {
            if (y.situation[1] == 0 && x.situation[1] == 0) {
                return Math.random() - 0.5;
            }
            return y.situation[0] - x.situation[0];
        }

        const winningRate = y.situation[0] / y.situation[1] - x.situation[0] / x.situation[1];
        return winningRate;
    });

    console.log(sitmap);

    return [...sitmap[0].method, instance.counter] as [number, number, number];
};