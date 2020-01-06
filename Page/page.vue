<template>
  <div class="page-root">
    <div
      class="item"
      :class="{'item-disabled': value <= 1}"
      @click.prevent.stop="(value > 1) && previous()"
      v-text="'<'"
    />
    <div
      v-for="(item, index) in items"
      :key="index"
      class="item"
      :class="{'item-active': item === value}"
      @click="change(item)"
      v-text="item"
    />
    <div
      class="item"
      :class="{'item-disabled': value >= length}"
      @click.prevent.stop="(value < length) && next()"
      v-text="'>'"
    />
  </div>
</template>
<script>
/**
 * <Page v-model="currentPage" :length="pageSize" @change="handlePageChange"/>
 */
export default {
  name: 'Page',
  props: {
    length: {
      type: Number,
      default: 0,
      validator: (val) => val % 1 === 0
    },
    totalVisible: {
      type: [Number, String],
      default: 9
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  computed: {
    items () {
      const maxLength = parseInt(this.totalVisible, 10)

      if (this.length <= maxLength) {
        return this.range(1, this.length)
      }

      const even = maxLength % 2 === 0 ? 1 : 0
      const left = Math.floor(maxLength / 2)
      const right = this.length - left + 1 + even

      if (this.value > left && this.value < right) {
        const start = this.value - left + 2
        const end = this.value + left - 2 - even

        return [1, '...', ...this.range(start, end), '...', this.length]
      } else if (this.value === left) {
        const end = this.value + left - 1 - even
        return [...this.range(1, end), '...', this.length]
      } else if (this.value === right) {
        const start = this.value - left + 1
        return [1, '...', ...this.range(start, this.length)]
      } else {
        return [
          ...this.range(1, left),
          '...',
          ...this.range(right, this.length)
        ]
      }
    }
  },
  methods: {
    updatePage (no) {
      if (Number(this.value) === Number(no)) {
        return
      }
      this.$emit('input', no)
      this.$emit('change', no)
    },
    change (item) {
      if (Number.isNaN(Number(item))) return
      this.updatePage(item)
    },
    next () {
      this.updatePage(this.value + 1)
    },
    previous () {
      this.updatePage(this.value - 1)
    },
    range (start, end) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-root {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  max-width: 100%;
  width: 100%;
  .item {
    cursor: pointer;
    margin: 0.3rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    height: 34px;
    width: auto;
    min-width: 34px;
    padding: 0 5px;
    font-size: 1rem;
    background: rgb(255, 255, 255);
    color: rgba(0, 0, 0, 0.87);
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    &.item-disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    &.item-active {
      $activeColor: rgba(24, 103, 192, 1);
      background: $activeColor;
      color: rgb(255, 255, 255);
      border-color: $activeColor;
    }
  }
}
</style>