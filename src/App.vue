<template>
    <div class="container">
        <div class="flex-display">
            <template v-for="(item, index) in cardRival" :key="index">
                <Card :selected="index == rivalCardSelected" :lose="rivalLose" @click="setSelected(index, true); myrun()">
                    {{ item }}
                </Card>
            </template>
        </div>
        <div class="flex-display">
            <template v-for="(item, index) in cardMine" :key="index">
                <Card :selected="index == myCardSelected" :lose="myLose" @click="setSelected(index)">
                    {{ item }}
                </Card>
            </template>
        </div>

        <div class="btn-group" style="margin-top: 1em;">
            <button class="btn btn-primary" @click="addHand()">长出一只手</button>
            <button class="btn btn-primary" @click="removeHand()">剁掉一只手</button>
        </div>

        <div class="input-group mb-3" style="width: 10em;">
            <span class="input-group-text">计算深度</span>
            <input type="number" class="form-control" v-model="depth" />
        </div>

        <div v-if="situationNumber >= 0">计算局面数：
            <span :style="{ color: getColor(0, maxSituation, situationNumber) }">{{ situationNumber }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRaw } from "vue";
import { decide } from "./components/ai";

import Card from "./components/CardComponent.vue";


const handNumbers = ref(2);

const cardRival = reactive([1, 1]);
const cardMine = reactive([1, 1]);

const addHand = () => {
    handNumbers.value++;
    autoDepth();
    initCards();
};

const removeHand = () => {
    if (handNumbers.value <= 1) {
        handNumbers.value = 1;
        return;
    }

    handNumbers.value--;
    autoDepth();
    initCards();
};

const initCards = (num: number = -1) => {
    situationNumber.value = -1;
    if (num == -1) num = handNumbers.value;

    setSelectedLock = false;

    cardRival.splice(0, cardRival.length);
    cardMine.splice(0, cardMine.length);

    for (let i = 0; i < num; i++) {
        cardRival.push(1);
        cardMine.push(1);
    }
};


const depth = ref<number>(7);
const maxSituation = computed(() => (cardRival.length ** 2) ** depth.value);

const autoDepth = () => {
    if (handNumbers.value == 1) depth.value = 1;
    else if (handNumbers.value == 2) depth.value = 7;
    else if (handNumbers.value == 3) depth.value = 5;
    else if (handNumbers.value == 4) depth.value = 3;
    else depth.value = 2;
};

const myCardSelected = ref(-1);
const rivalCardSelected = ref(-1);

let setSelectedLock = false;

const setSelected = (index: number, rival: boolean = false) => {
    console.log("setSelected");
    if (setSelectedLock) return;

    if (rival) rivalCardSelected.value = index;
    else myCardSelected.value = index;
};


function getColor(min: number, max: number, n: number) {
    if (max == min) {
        if (n > 0) return "rgb(255, 0, 0)";
        else return "rgb(255, 255, 255)";
    }
    let c = Math.max(0.1, (n - min) / (max - min));
    let green = (1 - c) * 200;
    return `rgb(${green}, ${200 - green}, 0)`;
}


const rivalLose = ref(false);
const myLose = ref(false);

const situationNumber = ref(-1);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const myrun = async () => {

    if (myCardSelected.value == -1) {
        rivalCardSelected.value = -1;
        return;
    }

    setSelectedLock = true;

    cardMine[myCardSelected.value] += cardRival[rivalCardSelected.value];
    cardMine[myCardSelected.value] %= 10;

    await sleep(200);
    myCardSelected.value = -1;
    rivalCardSelected.value = -1;


    if (cardMine.some(x => x == 0)) {
        rivalLose.value = true;
        await sleep(1000);
        rivalLose.value = false;

        setSelectedLock = false;

        initCards();

        return;
    }
    const aiStart = +new Date();

    // AI 决策
    console.log("Calculating...");
    const [aiRivalCardSelected, ayMyCardSelected, atSituationNumber] = decide(cardRival, cardMine, depth.value);


    const aiCalculatTime = +new Date - aiStart;

    await sleep(500 - aiCalculatTime);

    [rivalCardSelected.value, myCardSelected.value, situationNumber.value] = [aiRivalCardSelected, ayMyCardSelected, atSituationNumber];

    cardRival[rivalCardSelected.value] += cardMine[myCardSelected.value];
    cardRival[rivalCardSelected.value] %= 10;

    await sleep(200);
    myCardSelected.value = -1;
    rivalCardSelected.value = -1;

    console.log(toRaw(cardRival), toRaw(cardMine));


    // 判断输赢
    if (cardRival.some(x => x == 0)) {
        myLose.value = true;
        await sleep(2000);
        myLose.value = false;

        initCards();
    }

    if (cardMine.some(x => x == 0)) {
        rivalLose.value = true;
        await sleep(1000);
        rivalLose.value = false;

        initCards();
    }

    setSelectedLock = false;
};

</script>

<style scoped>
.container {
    text-align: center;
    justify-content: center;
}

.flex-display {
    display: flex;
    justify-content: center;
}

.input-group {
    margin: .5em auto !important;
}
</style>