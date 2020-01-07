<template>
  <div class="picker-root" v-clickaway="()=>togglePicker(false)">
    <div class="container">
      <input class="picker-input" v-model="selfValue" @click="togglePicker(true)" @keydown="handleKeydown" :placeholder="placeholder" />
      <span class="clear" v-show="showClearButton" @click.stop="clear" @mousedown.prevent.stop>✕</span>
    </div>
    <div class="picker-select" v-show="datePickerShow">
      <div class="panel">
        <div class="indicator" v-show="isDatePicker">
          <span class="ind-item" @click="toggleYearPicker(true)">
            <span class="year" v-text="render.year" />
            <span class="divide" v-text="'年'" />
          </span>
          <span class="ind-item" @click="toggleMonthPicker(true)">
            <span class="month" v-text="render.month + 1" />
            <span class="divide" v-text="'月'" />
          </span>
        </div>
        <div class="indicator" v-show="!isDatePicker">
          <span class="ind-item" @click="toggleYearPicker(true)">
            <span class="year" v-text="render.year" />
            <span class="divide" v-text="'年'" />
          </span>
        </div>
        <div class="month-ctrl" v-show="isDatePicker">
          <span class="ctrl-item prev-year" @click.prevent.stop="changeYear(-1)" v-text="'<<'" />
          <span class="ctrl-item prev-month" @click.prevent.stop="changeMonth(-1)" v-text="'<'" />
          <!-- <span class="ctrl-item today" @click.prevent.stop="reset" v-text="'今天'" /> -->
          <span class="ctrl-item next-month" @click.prevent.stop="changeMonth(+1)" v-text="'>'" />
          <span class="ctrl-item next-year" @click.prevent.stop="changeYear(+1)" v-text="'>>'" />
        </div>
        <div class="month-ctrl" v-show="!isDatePicker">
            <span v-show="yearPickerShow">
              <span class="ctrl-item prev-year" @click.prevent.stop="changeYearOpts(-10)" v-text="'<<'" />
              <span class="split"/>
              <span class="ctrl-item next-year" @click.prevent.stop="changeYearOpts(+10)" v-text="'>>'" />
            </span>
            <span v-show="monthPickerShow">
              <span class="ctrl-item prev-year" @click.prevent.stop="changeYear(-1)" v-text="'<<'" />
              <span class="split"/>
              <span class="ctrl-item next-year" @click.prevent.stop="changeYear(+1)" v-text="'>>'" />
            </span>
        </div>
      </div>
      <div class="body" v-if="yearPickerShow">
        <div class="year-opts">
          <span class="year-row" v-for="row in Math.ceil(yearOpts.length/3)" :key="row">
            <span class="year-cell" v-for="(year, index) in yearOpts.slice(3*(row-1), 3*row)" :key="row+'-'+index" v-text="year+'年'" @click.prevent.stop="selectYear(year)" />
          </span>
        </div>
      </div>
      <div class="body" v-else-if="monthPickerShow">
        <div class="month-opts">
          <span class="month-row" v-for="row in Math.ceil(monthOpts.length/3)" :key="row">
            <span class="month-cell" v-for="(month, index) in monthOpts.slice(3*(row-1), 3*row)" :key="row+'-'+index" v-text="month+1+'月'" @click.prevent.stop="selectMonth(month)" />
          </span>
        </div>
      </div>
      <div class="body" v-else>
        <div class="week">
          <div v-for="(head, index) in heads" :key="index" class="cell">
            <span class="day" v-text="head" />
          </div>
        </div>
        <div v-for="(week, wIndex) in weeks" :key="wIndex" class="week">
          <div
            v-for="(d, dIndex) in week"
            :key="dIndex"
            class="cell"
            @click.prevent.stop="handleDateClick(d.ymd)"
          >
            <span
              class="day day-hover"
              :class="{'today': d.isToday, [d.dateType]: !d.isToday, 'selected': isSelectedDay(d.ymd)}"
              :data-date="d.ymd.join('/')"
              @click="selectDay(d.ymd)"
              v-text="d.date"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * <DatePicker class="input" v-model="date" @change="handleChange"/>
 */
export default {
  name: 'Calendar',
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
    attrs: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: `请选择`
    },
    value: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    const config = this.makeConfig()
    const render = {
      year: config.year,
      month: config.month
    }
    const HEADS = ['日', '一', '二', '三', '四', '五', '六']
    this.heads = [...HEADS.slice(config.weekStartsOn), ...HEADS.slice(0, config.weekStartsOn)]
    const yearOpts = [...Array(10).keys()].map(i => config.year + i)
    const monthOpts = [...Array(12).keys()]
    return {
      config,
      render,
      yearOpts,
      monthOpts,
      weeks: [],
      datePickerShow: false,
      isDatePicker: true,
      yearPickerShow: false,
      monthPickerShow: false,
      selfValue: null
    }
  },
  computed: {
    showClearButton () {
      return !this.datePickerShow && this.selfValue
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        if (!val) {
          this.selfValue = null
        } else {
          const d = new Date(val)
          this.selfValue = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
        }
      }
    }
  },
  created () {
    this.weeks = this.updateCalendar(this.render.year, this.render.month, this.config.today, this.config.weekStartsOn)
  },
  methods: {
    updateValue ([y, m, d]) {
      this.selfValue = `${y}/${Number(m) + 1}/${d}`
      const milliseconds = new Date(y, m, d).getTime()
      this.$emit('input', milliseconds)
      this.$emit('change', milliseconds)
    },
    makeConfig () {
      const year = new Date().getFullYear()
      const month = new Date().getMonth()
      const date = new Date().getDate()
      return {
        today: [year, month, date],
        year,
        month,
        weekStartsOn: 0,
        ...this.attrs
      }
    },
    handleKeydown (e) {
      const keyCode = e.keyCode
      if (keyCode === 27) {
        if (this.datePickerShow) {
          e.stopPropagation()
          this.togglePicker(false)
        }
      }
      if (keyCode === 13) {
        try {
          const [y, m, d] = this.selfValue.split(/[,./_-]/)
          const isValid = !Number.isNaN(new Date(y, m, d).getMilliseconds())
          if (isValid) {
            this.updateValue([y, Number(m) - 1, d])
          } else {
            this.updateValue(this.config.today)
          }
        } catch (e) {
          this.updateValue(this.config.today)
        } finally {
          this.togglePicker(false)
        }
      }
    },
    clear () {
      this.selfValue = null
      this.$emit('input', null)
      this.$emit('change', null)
    },
    togglePicker (value = !this.datePickerShow) {
      this.datePickerShow = value
    },
    toggleYearPicker (value = !this.yearPickerShow) {
      this.isDatePicker = false
      this.monthPickerShow = false
      this.yearPickerShow = value
    },
    toggleMonthPicker (value = !this.monthPickerShow) {
      this.isDatePicker = false
      this.yearPickerShow = false
      this.monthPickerShow = value
    },
    selectYear (year) {
      this.changeYear(year - this.render.year)
      this.yearPickerShow = false
      this.monthPickerShow = true
    },
    selectMonth (month) {
      this.changeMonth(month - this.render.month)
      this.monthPickerShow = false
      this.isDatePicker = true
    },
    isSelectedDay ([y, m, d]) {
      return this.selfValue === `${y}/${Number(m) + 1}/${d}`
    },
    selectDay (ymd) {
      this.updateValue(ymd)
      this.yearPickerShow = false
      this.monthPickerShow = false
      this.isDatePicker = true
      this.datePickerShow = false
    },
    changeYearOpts (delta) {
      this.yearOpts = this.yearOpts.map(i => i + delta)
    },
    changeYear (yearDelta = 1) {
      const { year, month } = this.render
      const d = new Date(year, month)
      d.setFullYear(year + yearDelta)
      this.renderCalendar(d.getFullYear(), d.getMonth())
    },
    changeMonth (monthDelta = 1) {
      const { year, month } = this.render
      const d = new Date(year, month)
      d.setMonth(month + monthDelta)
      this.renderCalendar(d.getFullYear(), d.getMonth())
    },
    reset () {
      this.renderCalendar(...this.config.today.slice(0, 2))
    },
    renderCalendar (year, month) {
      if (+year !== +this.render.year || +month !== +this.render.month) {
        this.render = { year: +year, month: +month }
        this.weeks = this.updateCalendar(+year, +month, this.config.today, this.config.weekStartsOn)
      }
    },
    updateCalendar (
      year = new Date().getFullYear(),
      month = new Date().getMonth(),
      today = [new Date().getFullYear(), new Date().getMonth(), new Date().getDate()],
      weekStartsOn = 0
    ) {
      // startOfWeek
      const startDate = new Date(year, month, 1)
      const day = startDate.getDay()
      const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
      startDate.setDate(startDate.getDate() - diff)
      const [rows, cols] = [6, 7]
      const length = rows * cols
      return Array.from({ length })
        // create a list of dates
        .map((_, index) => {
          const d = new Date(startDate)
          const targetDate = new Date(d.setDate(d.getDate() + index))
          const [year, month, date] = [targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()]
          const ymd = [year, month, date]
          const { year: ry, month: rm } = this.render
          return {
            date,
            ymd,
            isToday: ymd.join() === today.join(),
            dateType: (year === ry && month === rm) ? 'present' : ((year > ry || (year === ry && month > rm)) ? 'future' : 'past')
          }
        })
        // fold the array into a matrix
        .reduce((matrix, current, index, days) => {
          return !(index % cols !== 0) ? [...matrix, days.slice(index, index + cols)] : matrix
        }, [])
    },
    handleDateClick ([y, m, d]) {
      this.$emit('change', { year: y, month: m + 1, date: d })
    }
  }
}
</script>

<style lang="scss" scoped>
.picker-root {
  position: relative;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 1);
  height: 30px;
  &:hover {
    .clear {
      opacity: 1;
    }
  }
  &:not(:hover) {
    .clear {
      opacity: 0;
    }
  }
}
.container {
  height: 100%;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 5px;
  border: 1px solid rgba(216, 223, 229, 1);
  border-radius: 1px;
}
.picker-input {
  box-sizing: border-box;
  font-size: 12px;
  width: 100%;
  height: 99%;
  height: calc(100% - 1px);
  border: none;
  outline: none;
}
.clear {
  font-size: 12px;
  cursor: pointer;
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  overflow: hidden;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.picker-select {
  position: absolute;
  z-index: 999;
  top: 31px;
  left: 0;
  user-select: none;
  box-sizing: border-box;
  display: inline-block;
  min-width: 200px;
  min-height: 200px;
  font-size: 14px;
  background: rgba(255, 255, 255, 1);
  color: rgba(60, 64, 67, 1);
  border: 1px solid #e3e3e3;
}
.panel {
  cursor: default;
  margin: 0 auto;
  display: table;
  box-sizing: border-box;
  line-height: 40px;
  .indicator {
    box-sizing: border-box;
    display: table-cell;
    text-align: left;
    padding: 0 4px;
    .ind-item {
      cursor: pointer;
    }
  }
  .month-ctrl {
    box-sizing: border-box;
    display: table-cell;
    text-align: right;
    .ctrl-item {
      cursor: pointer;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: middle;
    }
    .today {

    }
    .prev-year {

    }
    .next-year {

    }
    .split {
      display: table-cell;
      width: 10px;
    }
    .prev-month {
      padding: 0 5px;
    }
    .next-month {
      padding: 0 5px;
    }
  }
}
.body {
  box-sizing: border-box;
  display: table;
  table-layout: fixed;
  width: 100%;
  .year-opts, .month-opts {
    display: table;
    table-layout: fixed;
    width: 100%;
  }
  .year-row, .month-row {
    display: table-row;
  }
  .year-cell, .month-cell {
    display: table-cell;
    width: 40px;
    height: 28px;
    line-height: 28px;
    border-radius: 3px;
    text-align: center;
  }
  .week {
    display: table-row;
    text-align: center;
  }
  .cell {
    cursor: default;
    box-sizing: border-box;
    position: relative;
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    border: 0;
  }
  .day {
    box-sizing: border-box;
    cursor: pointer;
    display: inline-block;
    width: 28px;
    height: 28px;
    line-height: 28px;
    &.day-hover:hover {
      border-radius: 50%;
      background-color: rgba(210, 227, 252, 0.5);
      color: rgba(24, 90, 188, 1);
    }
  }
  .today {
    border-radius: 50%;
    color: rgba(24, 90, 188, 0.5);
    border: 1px solid currentColor;
  }
  .selected {
    border-radius: 50%;
    color: rgba(24, 90, 188, 1) !important;
    background-color: rgb(210, 227, 252) !important;
  }
  .present {
    color: rgb(60, 64, 67);
    background-color: rgb(255, 255, 255);
  }
  .future, .past {
    color: rgb(112, 117, 122);
    background-color: rgb(255, 255, 255);
  }
}
</style>
