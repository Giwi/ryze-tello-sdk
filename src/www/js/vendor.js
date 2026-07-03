import 'bootstrap/dist/css/bootstrap.min.css'
import $ from 'jquery'
import 'bootstrap'
import Chart from 'chart.js'

// ponytail: dayjs aliased as moment (2KB vs 230KB), satisfies Chart.js time scale
import dayjs from 'dayjs'

window.$ = window.jQuery = $
window.Chart = Chart
window.moment = dayjs
