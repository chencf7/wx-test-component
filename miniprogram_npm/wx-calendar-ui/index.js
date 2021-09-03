/*
 * @description:
 * @author: chenchaofan
 * @date: 2021-09-03 08:56:38
 * @modifyTime: 2021-09-03 08:57:38
 * @filePath: \calendar-ui\src\index.js
 */
// calendar-ui/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 默认时间
    defaultTime: {
      type: String,
      value: ''
    },
    isOpen: {
      type: Boolean,
      value: false
    },
    isRangePicker: {
      type: Boolean,
      value: false
    },
    // 日历设置小圆点
    spot: {
      type: Array,
      value: []
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    dateList: [], //日历主体渲染数组
    selectDay: {}, //选中时间
    // 当前月
    currentMonth: 0,
    // 是否展开
    open: false,

    // 滑动开始
    touchStartX: 0,
    touchStartY: 0,

    // daterange picker 可选开始、结束日期
    startDate: '',
    endDate: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initDatePolyfill(dt) {
      if(Object.prototype.toString.call(dt) === '[object Date]') {
        return dt
      }
      dt = dt.replace(/\-/g, '/');
      return new Date(dt)
    },
     /**
     * 时间戳转化为年 月 日 时 分 秒
     * time: 需要被格式化的时间，可以被new Date()解析即可
     * format：格式化之后返回的格式，年月日时分秒分别为Y, M, D, h, m, s，这个参数不填的话则显示多久前
     */
    formatTime(datetime, format) {
      format = format || 'YYYY-MM-DD'
      return this.getDate(datetime, format)
    },
    //
    getDate(datetime, format) {
      // 数字小于10，补0
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }

      const formateArr = ['YYYY', 'MM', 'DD', 'hh', 'mm', 'ss']
      const returnArr = []
      const date = this.initDatePolyfill(datetime)
      returnArr.push(date.getFullYear())
      returnArr.push(formatNumber(date.getMonth() + 1))
      returnArr.push(formatNumber(date.getDate()))
      returnArr.push(formatNumber(date.getHours()))
      returnArr.push(formatNumber(date.getMinutes()))
      returnArr.push(formatNumber(date.getSeconds()))
      for (const i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i])
      }
      return format
    },
    // 换算日期时间为当前日期时间前多久
    getDateDescription(datetime) {
      let r = ''
      const ft = this.initDatePolyfill(datetime)
      const nt = new Date()
      const nd = new Date(nt)
      nd.setHours(23)
      nd.setMinutes(59)
      nd.setSeconds(59)
      nd.setMilliseconds(999)
      const d = parseInt((nd - ft) / 86400000)
      switch (true) {
        case d === 0:
          const t = parseInt(nt / 1000) - parseInt(ft / 1000)
          switch (true) {
            case t < 60:
              r = '刚刚'
              break
            case t < 3600:
              r = parseInt(t / 60) + '分钟前'
              break
            default:
              r = parseInt(t / 3600) + '小时前'
          }
          break
        case d === 1:
          r = '昨天'
          break
        case d === 2:
          r = '前天'
          break
        case d > 2 && d < 30:
          r = d + '天前'
          break
        default:
          r = this.getDate(datetime, 'YYYY-MM-DD')
      }
      return r
    },

    getAnyDay(datetime, symbol, n) {
      symbol = symbol || '-'
      let nowDate = this.initDatePolyfill(datetime) || new Date()
      nowDate = nowDate.setDate(nowDate.getDate() + n)
      nowDate = new Date(nowDate)

      let y = nowDate.getFullYear(),
        m = nowDate.getMonth() + 1,
        d = nowDate.getDate()
      m = m < 10 ? '0' + m : m
      d = d < 10 ? '0' + d : d
      return y + symbol + m + symbol + d
    },
    // 初始化日历，天展示列表
    initDateList(setYear, setMonth) {
      const pageData = this.data
      setYear = setYear || pageData.selectDay.year;
      setMonth = setMonth || pageData.selectDay.month;

      let dateList = []; //需要遍历的日历数组数据
      // 当前月份的1号
      let setYearMonth1 = new Date(setYear, setMonth - 1);
      // 从 Date 对象返回一周中的某一天 (0 ~ 6)，当前日历是从星期1到7
      let startWeek = setYearMonth1.getDay(); //目标月1号对应的星期几
      startWeek === 0 && (startWeek = 7);

      //展开状态，需要渲染完整的月份
      if (pageData.open) {
        let dayNum = new Date(setYear, setMonth, 0).getDate(); //当前月有多少天
        let forNum = Math.ceil((startWeek + dayNum) / 7) * 7 //当前月跨越的周数
        for (let i = 0; i < forNum; i++) {
          const now2 = new Date(setYearMonth1)
          now2.setDate(i - (startWeek-1) + 1)

          // 兼容处理，当本月天数大于21天，又出现天数为1时break
          if(i > 21 && i % 7 === 0 && now2.getDate() < 2) {
            break;
          }
          let obj = {};
          obj = {
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, 'YYYY-MM-DD'),
            spot: false
          };
          dateList[i] = obj;
        }
      } else {
        //非展开状态，只需要渲染当前周
        for (let i = 0; i < 7; i++) {
          let now2 = new Date(setYearMonth1);
          // 计算当前选中天在当前月份的第几周
          let selectedWeek = Math.ceil((pageData.selectDay.day + startWeek-1) / 7)
          //当前周的7天
          now2.setDate(selectedWeek * 7 - 6 - (startWeek-1) + i)
          let obj = {};
          obj = {
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, 'YYYY-MM-DD'),
            spot: false
          };
          dateList[i] = obj;
        }
      }
      this.setData({
        dateList: dateList
      })
    },
    // 初始化日历
    initCalendar(setYear, setMonth, setDay, callType) {
      if (this.data.selectDay.year !== setYear || this.data.selectDay.month !== setMonth) {
        const day = Math.min(new Date(setYear, setMonth, 0).getDate(), this.data.selectDay.day)
        const dt = new Date(setYear, setMonth - 1, setDay ? setDay : day)

        const newPagedata = {
          selectDay: {
            year: setYear,
            month: setMonth,
            day: setDay ? setDay : day,
            dateString: this.formatTime(dt, 'YYYY-MM-DD')
          },
          currentMonth: setMonth
        }
        this.setData(newPagedata)

        this.initDateList(setYear, setMonth);
        // 日历渲染小圆点
        !this.data.isRangePicker && this.setSpot();

        // 组件初始化时不触发组件 change 事件
        if(callType !== 'onComponentInit') {
          this.triggerEvent('change', newPagedata.selectDay);
        }
      }
    },
    // 展示当月全部天数或当前周天数切换
    showMoreClick() {
      const pageData = this.data
      this.setData({
        open: !pageData.open
      })
      this.initDateList()
      !pageData.isRangePicker && this.setSpot()
    },
    // 日历底下是否展示小圆点
    setSpot() {
      const timeArr = this.data.spot.map(item => {
        return this.formatTime(item, 'YYYY-MM-DD')
      })
      this.data.dateList.forEach(item => {
        if (timeArr.indexOf(item.dateString) !== -1) {
          item.spot = true
        } else {
          item.spot = false
        }
      })
      this.setData({
        dateList: this.data.dateList
      })
    },
    // 滑动开始
    calendarTouchStart(e) {
      this.setData({
        touchStartX: e.changedTouches[0].clientX,
        touchStartY: e.changedTouches[0].clientY
      });
    },
    // 滑动结束
    calendarTouchEnd(e) {
      const pageData = this.data
      let x = e.changedTouches[0].clientX;
      let y = e.changedTouches[0].clientY;

      this.getTouchData(x, y, pageData.touchStartX, pageData.touchStartY)
    },
    // 滑动触发事件
    getTouchData (endX, endY, startX, startY) {
      const that = this;
      const pageData = this.data

      let turn = '';
      if (endX - startX > 50 && Math.abs(endY - startY) < 50) {
        // 右侧滑动
        turn = 'right';
        pageData.open && this.lastOrNextMonth('last');
        !pageData.open && !this.lastOrNextWeek('last');
      }
      if (endX - startX < -50 && Math.abs(endY - startY) < 50) {
        // 左侧滑动
        turn = 'left';
        pageData.open && this.lastOrNextMonth('next');
        !pageData.open && this.lastOrNextWeek('next');
      }

      setTimeout(() => {
        that.setData({
          touchStartX: 0,
          touchStartY: 0
        })
      }, 10);
    },
    // 上月、下月切换
    lastOrNextMonth(pType) {
      const pageData = this.data;
      // 当前选中天
      const { selectDay } = pageData;
      let lastOrNextMonth = pType === 'last'
        ? new Date(selectDay.year, selectDay.month - 2)
        : new Date(selectDay.year, selectDay.month);

      const selectYear = lastOrNextMonth.getFullYear(),
        selectMonth = lastOrNextMonth.getMonth() + 1;
      if(pageData.isRangePicker) {
        // 日期区间选择框
        // 滑动时只做切换月份操作，不重新选中天数
        if (selectDay.year !== selectYear || selectDay.month !== selectMonth) {
          this.setData({
            selectDay: {
              year: selectYear,
              month: selectMonth,
              day: '',
              dateString: ''
            },
            currentMonth: selectMonth
          });
          this.initDateList(selectYear, selectMonth);
        }
      }else {
        // 日历正常滑动操作
        this.initCalendar(selectYear, selectMonth);
      }
    },
    // 上周、下周切换
    lastOrNextWeek(pType) {
      const { year, month, day } = this.data.selectDay;
      let selectedDay = new Date(year, month - 1, day)
      // 当前星期几 0 ~ 6
      let currentWeekDay = selectedDay.getDay()
      currentWeekDay === 0 && (currentWeekDay = 7)

      let addOrMinusDay = pType === 'last' ? -(7 + (currentWeekDay-1)) : (7 - (currentWeekDay-1));
      let lastWeekMonday = this.getAnyDay(selectedDay, '-', addOrMinusDay);
      let weekMondayArr = lastWeekMonday.split('-').map(x => parseInt(x));

      let currentSelectDay = {
        year: weekMondayArr[0],
        month: weekMondayArr[1],
        day: weekMondayArr[2],
        dateString: this.formatTime(lastWeekMonday, 'YYYY-MM-DD')
      }
      this.setData({
        selectDay: currentSelectDay,
        currentMonth: weekMondayArr[1]
      });

      // 初始化date list
      this.initDateList();
      this.triggerEvent('change', currentSelectDay)
    },

    // 某一天被点击时
    clickDayChange(e) {
      const that = this;
      const pageData = this.data;
      const clickedDateStr = e.currentTarget.dataset.datestr || '';

      let dateArr = clickedDateStr.split('-').map(x => parseInt(x));
      if(Array.isArray(dateArr) && dateArr.length >= 3) {
        let selectDay = {
          year: dateArr[0],
          month: dateArr[1],
          day: dateArr[2],
          dateString: clickedDateStr
        }

        if(pageData.isRangePicker) {
          // 日期选择框渲染逻辑
          let tmpStartDate = '',
            tmpEndDate = '';
          if(pageData.startDate && pageData.endDate) {
            // 开始、结束时间均重新初始化，开始时间为当前点击时间
            tmpStartDate = clickedDateStr;
          }
          // 开始时间已经选中，点击选中结束时间
          if(pageData.startDate && !pageData.endDate) {
            //
            if(pageData.startDate <= clickedDateStr) {
              tmpStartDate = pageData.startDate
              tmpEndDate = clickedDateStr
            }else {
              tmpStartDate = clickedDateStr
              tmpEndDate = pageData.startDate
            }
          }

          if (pageData.selectDay.day !== dateArr[2]) {
            this.setData({
              selectDay: selectDay,
              currentMonth: dateArr[1],
            })
          }

          setTimeout(() => {
            that.setData({
              startDate: tmpStartDate,
              endDate: tmpEndDate
            })
            that.triggerEvent('rangePickerChange', {
              startDate: tmpStartDate,
              endDate: tmpEndDate
            })
          }, 1);
        }else {
          // 日历点击天数渲染逻辑
          if (pageData.selectDay.year !== dateArr[0] || pageData.selectDay.month !==  dateArr[1]) {
            this.initCalendar(dateArr[0], dateArr[1], dateArr[2]);
            return
          }
          if (pageData.selectDay.day !== dateArr[2]) {
            this.setData({
              selectDay: selectDay,
              currentMonth: dateArr[1],
            })
            this.triggerEvent('change', this.data.selectDay)
          }
        }
      }
    },

  },
  lifetimes: {
    // 组件实例进入页面节点树时执行
    attached() {
      const pageData = this.data;
      let nowDate = this.data.defaultTime ? this.initDatePolyfill(pageData.defaultTime) : new Date()

      let currentDay = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        day: nowDate.getDate(),
        // dateString: this.formatTime(nowDate, 'YYYY-MM-DD')
      }
      this.initCalendar(currentDay.year, currentDay.month, currentDay.day, 'onComponentInit')
      // 初始化开始日期为 当前日期
      if(pageData.isRangePicker) {
        const nowDateStr = this.formatTime(nowDate, 'YYYY-MM-DD')
        this.setData({
          startDate: nowDateStr,
          endDate: nowDateStr
        })
        this.triggerEvent('rangePickerChange', {
          startDate: nowDateStr,
          endDate: nowDateStr
        })
      }
    }
  },
  observers: {
    isOpen: function (val) {
      if(val) {
        this.setData({
          open: val
        })
      }
    },
    spot: function () {
      !this.data.isRangePicker && this.setSpot()
    }
  }
})
