<template>
    <div class="card-container">
        <div class="card-parent" :class="{
            selected: props.selected,
            lose: props.lose,
        }">
            <div class="card-child">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    selected: {
        type: Boolean,
        default: false,
    },
    lose: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.card-container {
    margin: .5em;
}

.card-parent {
    display: inline-block;
    border: .3em solid var(--color-border-hover);

    border-radius: 1em;

    /* margin: .2em; */

    transition: all .2s;

    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.card-child {

    font-weight: bold;
    font-size: 3em;
    width: 2em;
    height: 2em;
    line-height: 2em;
    text-align: center;
}

.selected {
    background-color: var(--color-border-hover);
}

.lose {
    border: .3em solid red;
}
</style>