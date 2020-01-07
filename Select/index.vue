<template>
  <transition name="fade">
    <div class="select-root">
      <div class="select-toggle"
        @click.stop="toggleDropdown"
        @mouseover.stop.prevent="mouseover"
        @mouseout.stop.prevent="mouseout"
        @mousedown.prevent.stop
        v-clickaway="blur"
      >
        <input class="select-value" v-bind="scope.attributes" />
        <div class="select-actions">
          <button type="button" class="clear" v-show="showClearButton" @click.stop="clear" @mousedown.prevent.stop>✕</button>
          <i v-show="!showClearButton" class="indicator" :class="{'arrow-down': !open, 'arrow-up': open }" />
        </div>
      </div>
      <ul class="select-box" v-show="open">
        <li
          class="select-item"
          v-for="(opt, index) in opts"
          :class="{selected: isOptionSelected(opt)}"
          :key="index"
          v-text="composeVisualPrefix(getOptionLabel(opt))"
          @click.stop="select(opt)"
          @mousedown.prevent.stop
        />
      </ul>
    </div>
  </transition>
</template>

<script>
/**
 * <Select v-model="myValue"
 *   :opts="[{name: 'Tom', id: '1'}, {name: 'Jack', id: '2'}]"
 *   :config="{label: 'name', value: 'id'}"
 * />
 */
export default {
  name: 'Select',
  directives: {
    clickaway: {
      bind (el, { value }) {
        function documentHandler (e) { el.contains(e.target) || value(e) }
        el.__vueClickOutside__ = documentHandler
        document.addEventListener('click', documentHandler)
      },
      unbind (el) {
        document.removeEventListener('click', el.__vueClickOutside__)
        delete el.__vueClickOutside__
      }
    }
  },
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    visualPrefix: {
      type: [String, Number],
      default: ''
    },
    config: {
      type: Object,
      default: () => null
    },
    opts: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: `请选择`
    }
  },
  computed: {
    scope () {
      return {
        attributes: {
          type: 'text',
          readonly: 'readonly',
          autocomplete: 'off',
          placeholder: this.placeholder,
          value: this.composeVisualPrefix(this.currentValue)
        }
      }
    }
  },
  data () {
    return {
      currentValue: null,
      open: false,
      showClearButton: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        this.setInitialValue(val)
      }
    }
  },
  methods: {
    mouseover () {
      if (this.currentValue) {
        this.showClearButton = true
      }
    },
    mouseout () {
      this.showClearButton = false
    },
    composeVisualPrefix (label) {
      if (!label) return null
      if (!this.visualPrefix) return label
      return `${this.visualPrefix} ${label}`
    },
    updateValue (opt) {
      const label = this.getOptionLabel(opt)
      const value = this.getOptionValue(opt)
      if (value === this.currentValue) return
      this.currentValue = label
      this.$emit('input', value)
      this.$emit('change', opt)
    },
    setInitialValue (value) {
      if (!value) {
        this.currentValue = null
        return
      }
      const initialOpt = this.opts.find(opt => {
        return this.config ? (opt[this.config.value]) === value : (opt === value)
      }) || (this.config ? {} : null)
      this.updateValue(initialOpt)
    },
    toggleDropdown () {
      this.open = !this.open
    },
    blur () {
      this.open = false
    },
    clear (e) {
      this.updateValue(null)
    },
    select (opt) {
      this.updateValue(opt)
      this.blur()
    },
    getOptionLabel (opt) {
      if (!opt) return null
      return this.config ? opt[this.config.label] : opt
    },
    getOptionValue (opt) {
      if (!opt) return null
      return this.config ? opt[this.config.value] : opt
    },
    isOptionSelected (opt) {
      return this.value === this.getOptionValue(opt)
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}
.fade-enter-active {
  transition-delay: .25s;
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
.select-root {
  position: relative;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 1);
  height: 30px;
}
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.select-toggle {
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 5px;
  border: 1px solid rgba(216, 223, 229, 1);
  border-radius: 1px;
}
.select-value {
  cursor: pointer;
  box-sizing: border-box;
  font-size: 12px;
  height: 99%;
  height: calc(100% - 1px);
  width: 100%;
  border: 0;
}
.select-actions {
  box-sizing: border-box;
  font-size: 12px;
  width: 12px;
  height: 12px;
  overflow: hidden;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.clear {
  cursor: pointer;
}
.indicator {
  position:relative;
  width: 12px;
  height: 7px;
  transition: all 0.2s ease-in-out;
  &.arrow-up {
    background-size: 100%;
  }
  &.arrow-down {
    background-size: 100%;
  }
}
.select-box {
  box-sizing: border-box;
  border: 1px solid rgba(216, 223, 229, 1);
  border-top-style: none;
  position: absolute;
  z-index: 99;
  top: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: left;
  background: #fff;
  list-style: none;
}
.select-item:hover {
  background: rgba(243, 243, 243, 1);
}
.selected {
  background: rgba(243, 243, 243, 1) !important;
  color: rgba(45, 140, 240, 1);
}
.select-item:not(:hover) {
  background: #fff;
}
.select-item {
  cursor: pointer;
  box-sizing: border-box;
  padding: 7px 16px;
  width: 100%;
  background: #fff;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
