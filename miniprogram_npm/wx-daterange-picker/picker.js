/*
 * @description:
 * @author: chenchaofan
 * @date: 2021-09-03 11:04:03
 * @modifyTime: 2021-09-03 11:06:51
 * @filePath: \datepicker-ui\src\picker.js
 */

// daterange-picker/picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false
    },
    bottom: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowDateRangePicker: false,
    startDate: '',
    endDate: '',
    dateRangeStr: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent('close')
    },
    ok() {
      if(this.data.startDate && this.data.endDate) {
        this.triggerEvent('ok', {
          startDate: this.data.startDate,
          endDate: this.data.endDate
        })
      }else {
        wx.showToast({
          icon: 'none',
          title: '请选择开始、结束时间。',
          duration: 2000
        });
      }
    },
    // 日期选中事件
    dateChange(ev) {
      if(ev && ev.detail) {
        this.setData({
          startDate: ev.detail.startDate,
          endDate: ev.detail.endDate
        })
      }
    }
  },
  observers: {
    isShow: function (val) {
      this.setData({
        isShowDateRangePicker: !!val
      })
    }
  }
})
