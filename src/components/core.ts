let situationCounter: number = 0;

export enum ConditionEnum {
    CurrentWin,
    RivalWin,
    Continue,
    BothWin,
}

export class OnePlusOne {

    /** 你所持有的卡牌 */
    public CardCurrent: number[] = [];
    /** 对手所持有的卡牌 */
    public CardRival: number[] = [];

    /** 局面深度 */
    public depth: number = 0;

    /** 生成该局面采取的方法 */
    public method: [number, number] = [-1, -1];

    /** 该局面的子局面 */
    public children: OnePlusOne[] = [];

    public condition: ConditionEnum = ConditionEnum.Continue;

    private sitcnt = 0;

    /**
     * @param current 你所持有的卡牌
     * @param rival 对手所持有的卡牌
     * @param depth 局面深度
     * @param method 生成该局面采取的方法
     * @param weight 该局面的权重
     * @param children 该局面的子局面
     */
    constructor(
        current: number[] = [1, 1],
        rival: number[] = [1, 1],

        depth: number = 0,

        method: [number, number] = [-1, -1],

        children: OnePlusOne[] = []
    ) {
        // if (current.length != rival.length) throw "Current cards and rival cards should have the same length.";

        this.CardCurrent = current;
        this.CardRival = rival;

        this.depth = depth;

        this.method = [
            method[0] < 0 ? -1 : method[0],
            method[1] < 0 ? -1 : method[1]
        ];

        this.children = children;

        this.sitcnt = 1;
    }

    /** 深拷贝当前状态 */
    public copy(): OnePlusOne {
        return new OnePlusOne(
            [...this.CardCurrent],
            [...this.CardRival],
            this.depth,
            [...this.method],
        );
    }

    /**
     * 交换当前玩家与对手的数值
     */
    public swap(): void {
        [this.CardCurrent, this.CardRival] = [this.CardRival, this.CardCurrent];
    }

    private privateForward(instance: OnePlusOne): OnePlusOne {
        const current = instance.CardCurrent;
        const rival = instance.CardRival;

        const children: OnePlusOne[] = [];

        for (let i = 0; i < current.length; i++) {
            for (let j = 0; j < rival.length; j++) {
                if (current[i] == 0 || rival[j] == 0) continue;

                const temp = instance.copy();
                temp.method = [i, j];
                temp.depth++;

                temp.CardCurrent[i] = (temp.CardCurrent[i] + temp.CardRival[j]) % 10;

                temp.CardCurrent.sort();
                temp.CardRival.sort();

                temp.updateCondition();

                children.push(temp);

                situationCounter++;
            }
        }

        instance.children = children;

        return instance;
    }

    public forward(depth: number = 1): void {
        if (depth <= 0) return;

        const PreSituationCounter = situationCounter;

        this.swap();
        this.privateForward(this);
        this.swap();

        this.children.forEach((val: OnePlusOne) => {
            if (!val.isWin())
                val.forward(depth - 1);
        });

        this.sitcnt = situationCounter - PreSituationCounter;
    }

    public get counter() {
        return this.sitcnt;
    }

    public isWin() {
        return this.CardCurrent.some((val: number) => val == 0) ||
            this.CardRival.some((val: number) => val == 0);
    }

    public updateCondition() {
        const [_rival, _current] = [
            this.CardRival.some((val: number) => val == 0),
            this.CardCurrent.some((val: number) => val == 0),
        ];

        if (_rival && _current) this.condition = ConditionEnum.BothWin;
        else if (_current) this.condition = ConditionEnum.CurrentWin;
        else if (_rival) this.condition = ConditionEnum.RivalWin;
        else this.condition = ConditionEnum.Continue;
    }

    public countSituations(swap = false): [number, number, number, number] {
        if (this.condition == ConditionEnum.CurrentWin) return [1, 0, 0, 0];
        else if (this.condition == ConditionEnum.RivalWin) return [0, 1, 0, 0];
        else if (this.condition == ConditionEnum.BothWin) return [0, 0, 1, 0];

        let currentWin = 0, rivalWin = 0, bothWin = 0, continueWin = 0;

        this.children.forEach((val: OnePlusOne) => {
            const [cur, rival, both, cont] = val.countSituations(!swap);
            if (swap) {
                currentWin += cur;
                rivalWin += rival;
            } else {
                rivalWin += cur;
                currentWin += rival;
            }
            bothWin += both;
            continueWin += cont;
        });

        return [currentWin, rivalWin, bothWin, continueWin];
    }

    public deathTransfer() {
        const lose = this.children.some(child => child.condition == ConditionEnum.CurrentWin);
        const win = this.children.some(child => child.condition == ConditionEnum.RivalWin);
        
        if (win && lose) this.condition = ConditionEnum.BothWin;
        else if (win) this.condition = ConditionEnum.CurrentWin;
        else if (lose) this.condition = ConditionEnum.RivalWin;
        else {
            this.condition = ConditionEnum.Continue;
            for (const child of this.children) child.deathTransfer();
        }
    }
}


// if (require.main == module) {
//     const test = new OnePlusOne([5, 5], [5, 5]);
//     test.forward(6);
//     console.log(test);
//     console.dir(test, { depth: 4 });
//     console.log(test.counter);
//     console.log(test.countSituations());
// }