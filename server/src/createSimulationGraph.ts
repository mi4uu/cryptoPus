import { PairEnumType } from "@prisma/client"
import dayjs from "dayjs"
import { prisma } from "./utils/prisma"
import { promises as fs } from 'fs'
import * as dotenv from "dotenv";
import path from "path";
import { indicators } from "tulind";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

dotenv.config();
function median(numbers:number[]) {
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}
function avg(numbers:number[]){

  return numbers.reduce((a,b)=>a+b,0)/numbers.length
}
const humanizePeriod = (date0:Date|string,date1:Date|string)=>dayjs.duration(dayjs(date0).diff(date1)).humanize();
const couldIWon = (price:number, prices:number[])=>{
  let counter = 0
  for(const _price of prices){

    if (price<_price)
      return counter
    counter+=1
  }
  return false
}
const html =(script:string)=>`<!DOCTYPE html>
<html><head>
<script src="libs/d3.v6.min.js"></script>
<script src='https://cdn.plot.ly/plotly-2.14.0.min.js'></script>
</head>
<style>
.hovertext .rect {
  fill: rgb(0, 0, 0) !important; fill-opacity: 0.5 !important;
}
    #chart {
        width: 100vw;
        height:1024px;
    }

        path.bb-shape {
            shape-rendering: optimizeSpeed;
        }

    .overplot {
      display:none
    }
    }
</style>
</head>
<div id="chart"></div>


${script}

</html>
`

export interface trades {
  dateBuy:string,
  dateSell:string,
  buyFor:number,
  soldFor:number,
  target:number,
  macd?:number

}

const createGraph = async (symbol:PairEnumType, interval:string, startDate:Date, tradesWin:trades[], tradesLoss:trades[] )=>{
  let percents:number[]=[]
    const klines = await prisma.kline.findMany({
        where: {
          pair: symbol,
          period_id: interval,
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: [{ timestamp: "asc" }],

      })
      const volume =  klines.map(k=>k.volume).join(',')
      const _close = klines.map(k=>k.close.toNumber())
      const _high = klines.map(k=>k.high.toNumber())
      const _x = klines.map(k=>dayjs(k.timestamp).toISOString())

      const x = klines.map(k=>`"${dayjs(k.timestamp).toISOString()}"`).join(',')
      const macdClose = klines.map(k=>k.close.toNumber())
      const macd_ = await indicators.macd.indicator([macdClose], [12, 26, 9])
      const macd = macd_[2]
      const win = JSON.stringify(tradesWin)
      const loss = JSON.stringify(tradesLoss)
      const tradesCount = tradesWin.length+tradesLoss.length
      let lowestLow = 0



      const chart = `
<script>
const x =[${x}]
     const close= [${klines.map(k=>k.close).join(',')}]
    const  high= [${klines.map(k=>k.high).join(',')}]
    const  low= [${klines.map(k=>k.low).join(',')}]
    const  open= [${klines.map(k=>k.open).join(',')}]
      const _volume = [${volume}]
      const _macd = [${macd.join(',')}]
      const win = ${win}
      const loss = ${loss}
    const _low = [...low]
    const _high = [...high]
      const candles = {

        x,
        close,
        high,
        low,
        open,


        // cutomise colors

        increasing: {line: {color: 'blue'}},
        decreasing: {line: {color: 'black'}},
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y',
        name:'CANDLES'

      };
      const volume = {
        x,
        y: [${volume}],
        type:'bar',
        xaxis: 'x',
        yaxis: 'y2',
        name:'VOLUME'
      }
      const macd = {
        x,
        y: [${macd}],
        type:'bar',
        xaxis: 'x',
        yaxis: 'y3',
        name:'MACD'
      }



      const data = [candles, volume, macd];



      const layout = {
        autosize: true,
        hovermode:'x',
        spikedistance:-1,
  transition:0,
  yaxis: {domain: [0, 0.8]},
  yaxis2: {domain: [0.81, 0.89]},
  yaxis3: {domain: [0.9, 1]},

        dragmode: 'zoom',
        showlegend: false,
        xaxis: {
          showspikes: true,
          spikemode: 'across' ,
          autorange: true,
          title: 'Date',
           rangeselector: {
              x: 0,
              y: 1.2,
              xanchor: 'left',
              font: {size:8},
              buttons: [{
              step: 'day',
              stepmode: 'backward',
              count: 3,
              label: '3 days'

          },{
                  step: 'month',
                  stepmode: 'backward',
                  count: 1,
                  label: '1 month'

              }, {

                  step: 'month',
                  stepmode: 'backward',
                  count: 6,
                  label: '6 months'

              }, {
                  step: 'all',
                  label: 'All dates'
              }]
            }
        },
        annotations:[]
      }
        for(const t of  ${win}){
          const p = (t.soldFor-t.buyFor)/t.soldFor*100
          const result = {
            x: [t.dateBuy, t.dateSell],
            y: [t.buyFor, t.soldFor],
            type: 'scatter',
            textposition: 'right',
            name:"WIN",
            textfont: {

              family: 'Iosevka',

              size: 12,

              color: '#009900'

            },
            mode: 'lines+markers+text',
            text: ['', p.toFixed(1)+'%'],
            line: {
              color: '#009900',
              width: 2
            },
            marker: {
              color: '#00ff00',
              size: 12
            },
            xaxis: 'x',
            yaxis: 'y'
          };



          const tp = (t.target-t.buyFor)/t.buyFor*100
          const fromIndex = x.findIndex((d)=>t.dateBuy<d)
          const toIndex = x.findIndex((d)=>t.dateSell<d)
          const _max = Math.max(...[...high].splice(fromIndex, toIndex-fromIndex))

          const diffToHigh = (t.target-_max)/_max*100

          const target = {
            x: [t.dateBuy, t.dateSell],
            y: [t.target, t.target],
            type: 'scatter',
            textfont: {
              family: 'Iosevka',
              size: 12,
              color: '#ff9900'
            },
            text: [tp.toFixed(1)+'%          ', '                             to highest: '+diffToHigh.toFixed(1)+'%'],
            name:'TARGET',
            mode: 'lines+text',
            textposition:'middle',
            line: {
              dash: 'dot',
              color: '#ffcc00',
              width: 6
            },
            xaxis: 'x',
            yaxis: 'y'
          };

          data.push(result,target);
        }
        for(const t of  ${loss}){
          const p = (t.soldFor-t.buyFor)/t.soldFor*100
          const result = {
            x: [t.dateBuy, t.dateSell],
            y: [t.buyFor, t.soldFor],
            type: 'scatter',
            textposition: 'right',
            textfont: {
              family: 'Iosevka',
              size: 12,
              color: '#990000'
            },
            mode: 'lines+markers+text',
            name:'LOSS',
            text: ['', p.toFixed(1)+'%'],
            line: {
              color: '#990000',
              width: 2
            },
            marker: {
              color: '#ff0000',
              size: 12
            },
            xaxis: 'x',
            yaxis: 'y'
          };
          const tp = (t.target-t.buyFor)/t.buyFor*100
          const fromIndex = x.findIndex((d)=>t.dateBuy<d)
          const toIndex = x.findIndex((d)=>t.dateSell<d)
          const _max = Math.max(...[...high].splice(fromIndex, toIndex-fromIndex))

          const diffToHigh = (t.target-_max)/_max*100

          const target = {
            x: [t.dateBuy, t.dateSell],
            y: [t.target, t.target],
            type: 'scatter',
            textfont: {
              family: 'Iosevka',
              size: 12,
              color: '#ff9900'
            },
            text: [tp.toFixed(1)+'%          ', '                              to highest: '+diffToHigh.toFixed(1)+'%'],
            name:'TARGET',
            mode: 'lines+text',
            textposition:'middle',
            line: {
              dash: 'dot',
              color: '#ffcc00',
              width: 6
            },
            xaxis: 'x',
            yaxis: 'y'
          };


          data.push(result,target);
        }





const  graphDiv = document.getElementById('chart');
     Plotly.newPlot(graphDiv, data, layout)
      graphDiv.on('plotly_relayout',

      function(eventdata){
        if(eventdata && ('xaxis.range' in eventdata || 'xaxis.range[0]' in eventdata )){
            const from = (eventdata['xaxis.range'] && eventdata['xaxis.range'][0]) || eventdata['xaxis.range[0]']
            const to = (eventdata['xaxis.range'] && eventdata['xaxis.range'][1]) || eventdata['xaxis.range[1]']
            const fromIndex = x.findIndex((d)=>from<d)
            const toIndex = x.findIndex((d)=>to<d)

            const transactions = [...win, ...loss].filter(t=>t.dateBuy>from && t.dateBuy<to && t.dateSell>from && t.dateSell<to)
            const transactionsPrices = transactions.map(t=>[t.soldFor,t.buyFor,t.target]).flat()
            const minValue = Math.min(...[..._low].splice(fromIndex, toIndex-fromIndex),  ...transactionsPrices)
            const maxValue = Math.max(...[..._high].splice(fromIndex, toIndex-fromIndex), ...transactionsPrices)

            // volume
            const minVolume = Math.min(...[..._volume].splice(fromIndex, toIndex-fromIndex))
            const maxVolume = Math.max(...[..._volume].splice(fromIndex, toIndex-fromIndex))

            // macd
            const minMacd = Math.min(...[..._macd].splice(fromIndex, toIndex-fromIndex))
            const maxMacd = Math.max(...[..._macd].splice(fromIndex, toIndex-fromIndex))



            Plotly.update(graphDiv,{}, {
              yaxis:{ domain: [0, 0.8], range:[minValue-(minValue*0.01), maxValue+(maxValue*0.01)]} ,
              yaxis2:{ domain: [0.81, 0.89], range:[minVolume-(minVolume*0.01), maxVolume+(maxVolume*0.01)]} ,
              yaxis3:{ domain: [0.9, 1], range:[minMacd-(minMacd*0.01), maxMacd+(maxMacd*0.01)]}
            }, [0])
        }


      });

</script>

<body>
<table border="1">
<thead>
  <tr><th>buy date</th><th>sell date</th>
  <th>buy price</th><th>sell price</th>
  <th>target price</th><th>diff</th>
    <th>time spend</th><th>time to win (close)</th><th>time to win (high)</th>

  <th>algo macd</th>
  <th>macd</th><th>macd -1</th><th>macd-2</th>
  <th>volume</th><th>volume -1</th><th>volume -2</th></tr>
</thead>
<tbody>

${[...tradesWin, ...tradesLoss].sort((a,b)=>Number(a.dateBuy<b.dateBuy))
  .map((t )=>{
  const p = (t.soldFor-t.buyFor)/t.soldFor*100
  percents.push(p)
  const buyIndex = _x.findIndex((d)=>t.dateBuy<d)
  return `<tr><td>${dayjs(t.dateBuy).format("YYYY-MM-DD HH")}</td>
  <td>${dayjs(t.dateSell).format("YYYY-MM-DD HH")}</td>
  <td>${t.buyFor}</td><td>${t.soldFor}</td>
  <td>${t.target}</td><td style="color:${p>0?'green':'red'}">${p.toFixed(1)}%</td>
  <td>${humanizePeriod(t.dateBuy,t.dateSell)}</td>
  <td>${function(){
    const r =couldIWon(t.target, [..._close].splice((_high.length-buyIndex)*-1))
    if(r===false) return '<span style="color:red">🤦 NOPE ;(</span>'
    let emotion = ''
    if(r<10) emotion = '😁'
    if(r<=30) emotion = '😕'
    if(r>30) emotion = '😡'
    return emotion + ' ' + humanizePeriod(t.dateBuy, _x[buyIndex+r])
  }()}</td>
  <td>${function(){
    const r =couldIWon(t.target, [..._high].splice((_high.length-buyIndex)*-1))
    if(r===false) return '<span style="color:red">🤦 NOPE ;(</span>'
    let emotion = ''
    if(r<=30) emotion = '😕'
    if(r<10) emotion = '😁'
    if(r>30) emotion = '😡'
    return emotion + ' ' + humanizePeriod(t.dateBuy, _x[buyIndex+r])
  }()}</td>

  <td style="color:${t.macd?.toFixed(2)===macd[buyIndex].toFixed(2)?'black':'red'}">${t.macd?.toFixed(2)}</td>
  <td style="color:${macd[buyIndex]>0?'green':'red'}">${macd[buyIndex].toFixed(2)}</td>
  <td style="color:${macd[buyIndex-1]>0?'green':'red'}">${macd[buyIndex-1].toFixed(2)}</td>
  <td style="color:${macd[buyIndex-2]>0?'green':'red'}">${macd[buyIndex-2].toFixed(2)}</td>

  <td style="color:${Number(volume[buyIndex])>Number(volume[buyIndex-1])?'green':'red'}">${volume[buyIndex]}</td>
  <td style="color:${Number(volume[buyIndex-1])>Number(volume[buyIndex-2])?'green':'red'}">${volume[buyIndex-1]}</td>
  <td style="color:${Number(volume[buyIndex-2])>Number(volume[buyIndex-3])?'green':'red'}">${volume[buyIndex-2]}</td>

  </tr>`
})}
</tbody>
</table>
</body>
<h3>Result: </h3>
<h4>AVERAGE:  <b  style="color:${avg(percents)>0?'green':'red'}" >${avg(percents).toFixed(1)} %</b></h4>
<h4>MEDIAN: <b  style="color:${median(percents)>0?'green':'red'}" >${median(percents).toFixed(1)} %</b> </h4>
<h4>TRADES WON: <b  style="color:green" >${tradesWin.length} </b> ( ${((tradesCount-tradesLoss.length)/tradesCount*100).toFixed(1)} % ) </h4>
<h4>TRADES LOST: <b  style="color:red" >${tradesLoss.length} </b> ( ${((tradesCount-tradesWin.length)/tradesCount*100).toFixed(1)} % ) </h4>


      `
      const result = html(chart)
      return result


}
const xd =[
  {
    dateBuy:"2022-05-07T05:00:00.000Z",
    dateSell:"2022-05-08T09:00:00.000Z",
    buyFor:35903.82,
    soldFor:35903.82+(35903.82*0.01),
    target:35903.82+(35903.82*0.009),

  },

  {
    dateBuy:"2022-05-09T23:00:00.000Z",
    dateSell:"2022-05-11T09:00:00.000Z",
    buyFor:31193.82,
    soldFor:31193.82+(35903.82*0.02),
    target:32650.82,
    macd:1

  },

  ]
  const xd2  =[
    {
      dateBuy:"2022-05-14T05:00:00.000Z",
      dateSell:"2022-05-14T09:00:00.000Z",
      buyFor:35104.82,
      soldFor:35104.82-(35903.82*0.02),
      target:35104.82+(35903.82*0.015),
      macd:28.27

    },
  ]
export const saveChart = async (symbol:PairEnumType, interval:string,  tradesWin:trades[], tradesLoss:trades[])=>{
    const start = dayjs(process.env.START_DATE);
    const content = await createGraph(symbol, interval, start.toDate(),tradesWin,tradesLoss)
    const pathToFile = path.join(__dirname,'..', '..','simulationResults',`${symbol}.html`)
    await fs.writeFile(pathToFile, content);
}
saveChart('BTCUSDT','1h', xd,xd2)