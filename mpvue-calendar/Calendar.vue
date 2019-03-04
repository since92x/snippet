<template>
  <div class="calendar">
    <div class="month-head">
      <div class="month-info">
        <div class="year" v-text="year" />
        <div class="month" v-text="prettyMonth" />
      </div>
    </div>
    <div class="week-head">
      <div v-for="(WEEK, Windex) in WEEKS" class="day-head" :class="{'sunday-head': sundayStart}" :key="Windex" v-text="WEEK" />
    </div>
    <div class="week" v-for="(week, windex) in weeks" :key="windex">
      <div class="day" :class="{hide: day==0 }" v-for="(day, dindex) in week" :key="dindex">
        <div class="day-number" v-text="day.id" :class="{'event-day': day.event, disabled: day.disabled}" @click="!day.disabled && day.event && dayHandler(day.event)" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    year: {
      type: [Number, String],
      required: true
    },
    month: {
      type: [Number, String],
      required: true
    },
    events: {
      type: Array,
      default: []
    },
    sundayStart: {
      type: Boolean,
      default: true
    },
    paddingEmpty: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      WEEKS: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      days: [],
      weeks: []
    }
  },
  computed: {
    prettyMonth () {
      const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return MONTHS[this.month]
    }
  },
  created () {
    this.setDays()
    this.setWeeks()
  },
  methods: {
    getDaysInOneMonth (date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const d = new Date(year, month, 0)
      return d.getDate()
    },
    // 向前空几个
    getMonthweek (date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const dateFirstOne = new Date(year + '/' + month + '/1')
      return this.sundayStart ? dateFirstOne.getDay() === 0 ? 7 : dateFirstOne.getDay() : dateFirstOne.getDay() === 0 ? 6 : dateFirstOne.getDay() - 1
    },
    /**
     * 获取当前日期上个月或者下个月
    */
    getOtherMonth (date, str = 'nextMonth') {
      const timeArray = this.dateFormat(date).split('/')
      const year = timeArray[0]
      const month = timeArray[1]
      const day = timeArray[2]
      let year2 = year
      let month2
      if (str === 'nextMonth') {
        month2 = parseInt(month) + 1
        if (month2 === 13) {
          year2 = parseInt(year2) + 1
          month2 = 1
        }
      } else {
        month2 = parseInt(month) - 1
        if (month2 === 0) {
          year2 = parseInt(year2) - 1
          month2 = 12
        }
      }
      let day2 = day
      const days2 = new Date(year2, month2, 0).getDate()
      if (day2 > days2) {
        day2 = days2
      }
      if (month2 < 10) {
        month2 = '0' + month2
      }
      if (day2 < 10) {
        day2 = '0' + day2
      }
      const t2 = year2 + '/' + month2 + '/' + day2
      return new Date(t2)
    },
    // 上个月末尾的一些日期
    getLeftArr (date) {
      const arr = []
      const leftNum = this.getMonthweek(date)
      const num = this.getDaysInOneMonth(this.getOtherMonth(date, 'preMonth')) - leftNum + 1
      const preDate = this.getOtherMonth(date, 'preMonth')
      // 上个月多少开始
      for (let i = 0; i < leftNum; i++) {
        const nowTime = preDate.getFullYear() + '/' + (preDate.getMonth() + 1) + '/' + (num + i)
        arr.push(this.paddingEmpty ? 0 : {
          id: num + i,
          date: nowTime,
          isToday: false,
          otherMonth: 'preMonth'
        })
      }
      return arr
    },
    // 下个月末尾的一些日期
    getRightArr (date) {
      const arr = []
      const nextDate = this.getOtherMonth(date, 'nextMonth')
      const leftLength = this.getDaysInOneMonth(date) + this.getMonthweek(date)
      const _length = 7 - leftLength % 7
      for (let i = 0; i < _length; i++) {
        const nowTime = nextDate.getFullYear() + '/' + (nextDate.getMonth() + 1) + '/' + (i + 1)
        arr.push(this.paddingEmpty ? 0 : {
          id: i + 1,
          date: nowTime,
          isToday: false,
          otherMonth: 'nextMonth'
        })
      }
      return arr
    },
    // format日期
    dateFormat (date) {
      date = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : date
      return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
    },
    // 获取某月的列表不包括上月和下月
    getMonthListNoOther (date) {
      const arr = []
      const num = this.getDaysInOneMonth(date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const toDay = this.dateFormat(new Date())

      for (let i = 0; i < num; i++) {
        const nowTime = year + '/' + month + '/' + (i + 1)
        arr.push({
          id: i + 1,
          date: nowTime,
          isToday: toDay === nowTime,
          disabled: new Date(nowTime) - new Date(toDay) < 0,
          otherMonth: 'nowMonth',
          event: this.events.find(event => event.day === i + 1)
        })
      }
      return arr
    },
    // 获取某月的列表 用于渲染
    getMonthList (date) {
      return [...this.getLeftArr(date), ...this.getMonthListNoOther(date), ...this.getRightArr(date)]
    },
    setDays () {
      this.days = this.getMonthList(new Date(this.year, this.month))
    },
    setWeeks () {
      let n = 0
      this.weeks = []
      while (n < this.days.length) {
        let week = [...this.days.slice(n, n += 7), ...Array(7).fill(0)].slice(0, 7)
        this.weeks.push(week)
      }
      console.debug('weeks: ', this.weeks)
    },
    dayHandler (evt) {
      this.$emit('dayEvent', evt)
    }
  }
}
</script>

<style lang='scss' scoped>
.calendar {
  box-sizing: border-box;
  width: 658rpx;
  min-height: 768rpx;
  margin: 0rpx auto;
  padding: 40rpx 35rpx 10rpx;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 10rpx 30rpx 12rpx rgba(0, 0, 0, 0.13);
  border-radius: 16rpx;
  .month-head {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    .month-info {
      display: flex;
      flex-direction: row-reverse;
      align-items: baseline;
      margin-bottom: 40rpx;
      .month {
        height: 67rpx;
        margin-right: 22rpx;
        font-size: 48rpx;
        font-family: PingFangSC-Thin;
        font-weight: 100;
        color: rgba(70, 198, 97, 1);
        line-height: 67rpx;
      }
      .year {
        height: 50rpx;
        font-size: 36rpx;
        font-family: PingFangSC-Light;
        font-weight: 300;
        color: rgba(155, 155, 155, 1);
        line-height: 50rpx;
      }
    }
  }
  .week-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .day-head {
      width: 87rpx;
      height: 33rpx;
      text-align: center;
      font-size: 24rpx;
      font-family: PingFangSC-Semibold;
      font-weight: 600;
      color: rgba(155, 155, 155, 1);
      line-height: 33rpx;
    }
    .sunday-head:last-child {
      order: -1;
    }
  }
  .week {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .hide {
      opacity: 0;
    }
    .day {
      width: 87rpx;
      height: 105rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .day-number {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 36rpx;
        height: 42rpx;
        font-size: 30rpx;
        font-family: PingFangSC-Semibold;
        font-weight: 600;
        color: rgba(155, 155, 155, 1);
        line-height: 42rpx;
      }
      .event-day {
        width: 58rpx;
        height: 58rpx;
        color: #fff;
        background: #46c661;
        border-radius: 50%;
      }
      .disabled {
        background: #fff;
        color: rgba(202, 202, 202, 1);
      }
    }
  }
}
</style>
