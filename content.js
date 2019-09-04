
var app = new Vue({
    el: '#app',
    data: {
        coinsData: JSON,
        nullabels:2,
        oldPrices:[],
        statisticsPrice:JSON,
        counter:0,
        minPriceChart:0,
        maxPriceChart:0,
        itemCount:15,
        error: false
    },
    updated(){
        //console.log(`Обновлено: ${Date() }`)
        this.counter++;
        //console.log(`Counter ${this.counter}`)
    },
    errorCaptured:(err,vm,info)=>{

        console.log('err')

    },

    methods:{
         toMoreInformation(item){

            console.log(`pressed ${item.id}, ${item.id}+Canvas`)
            var url = `https://api.coincap.io/v2/assets/${item.id}/history?interval=m5`;
            settingsInfoItem.url = url;
            console.log(`ajax url: ${url}`)
            if(document.getElementById('chart row')!=null&&document.getElementById(item.id+"Canvas")==null){
                deleteEl('chart row')

            }
            else if(document.getElementById('chart row')!=null&&document.getElementById(item.id+"Canvas")!=null){
                deleteEl('chart row')
                return;
            }
            if(document.getElementById('chart row')==null&&document.getElementById(item.id+"Canvas")==null){
                
                
               // var canvas = document.getElementById(idCanvas)
                //console.log(canvas)
                
                $.ajax(settingsInfoItem).done(function (response) {
                    //console.log(`ajax,toMore and: ${url}`)
                    //console.log(response.data);
                     getChart(item,response.data)
                    
                });


            }
            
            
            
        },
        addItems(){
            this.itemCount+=50;
            if(this.itemCount>=1500){
                deleteEl('load-more-id');
            }
        },
      UrlExists(url)
        {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            if(http.status!=404){
                return url;
            }else 
                return './default.png' ;
        }
    }
})


var months = ["January","February","March","April","May","June","Jule","August","September","October","November","December"]

var settings = {
    "url": "https://api.coincap.io/v2/assets?limit=1500",
    "method": "GET",
    "timeout": 0,
};
var settingsInfoItem = {
    "url": " ",
    "method": "GET",
    "timeout": 0,
  };



setTimeout(HandlerSocket(),2500)
function HandlerSocket(){
    
      new WebSocket('wss://ws.coincap.io/trades/binance').onmessage =(msg)=>{
        var json = JSON.parse(msg.data)

        //console.log(json)
        Comparator(app.coinsData,json)
    }
}


var imgel = document.getElementById('iconpaxos-standard-token')


function parseDate(date){
    var day = new Date(date).getDay()
    var month = months[parseInt(new Date(date).getMonth())]
    var year = new Date(date).getFullYear()
    day = parseInt(day)<10?'0'+day:day;
    return `${day} ${month} ${year}`

}
function Comparator(coins,coinChecks){
    //console.log()
    for(var i = 0;i<coins.length;i++){
        

        if((coins[i].name).toLowerCase()==coinChecks.base&&coins[i].priceUsd!=coinChecks.priceUsd
        &&coinChecks.priceUsd!=null){
            
                coins[i].priceUsd = coinChecks.priceUsd
                
            
        }
    }
}


function isHide(id){
    var elem = document.getElementById(id)
    
    if(elem.style.display=='none'){
        elem.style.display='inline'
        console.log("inline")
        
    }
    else{
        elem.style.display='none'
        console.log("none")
    }
}


$.ajax(settings).done(function (response) {
    //console.log(response);
    app.coinsData = response.data
    app.statisticsPrice = response.data
    //app.forceUpdate();
  });
  $('img').on("error", function() {
      console.log(this)
    $(this).attr('src', '/default.png');
  });


function createEl(item,min,max,average){
    var canvasComponent = Vue.extend({
        template:`<tr class='charts' id="chart row" style="height:0px;">
                    <td colspan="3" >
                        <div class="chartsPrice">
                            <div class="item-info">
                                <img src='https://static.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png' width="64px" height="64px" >
                                <h2 >${item.name}</h2>
                                <h4 >${parseDate(new Date().valueOf())}</h4>
                            </div>
                            <div class="item-price-left">
                                <div class="left">
                                    <h5 class="chartsPrice-left" ><span style="color:grey;">HIGH </span>$${max}</h5>
                                    <h5 class="chartsPrice-left" ><span style="color:grey;">LOW </span>$${min}</h5>

                                </div>
                            </div>
                            <div class="item-price-right">
                                <div class="right">
                                     <h5 class="chartsPrice-right" ><span style="color:grey;">AVERAGE </span>$${average}</h5>

                                    <h5 class="chartsPrice-right" ><span style="color:grey;">CHANGE </span>${parseFloat(item.changePercent24Hr).toFixed(2)}%</h5>
                                </div>
                            </div>
                        </div>
                        <canvas id='${item.id}Canvas' > </canvas>
                        <div class="chartMoreInformation">
                        <a  href="https://coincap.io/assets/${item.id}" target="_blank" >More Details</a>
                        </div>
                    </td>

                </tr>`
    })
    var canvasEl = new canvasComponent().$mount()
    console.log(canvasEl.$el);
    document.getElementById(item.id).insertAdjacentElement('afterend',canvasEl.$el)
}
function deleteEl(id){
    document.getElementById(id).remove()
}
function getTimeMoney(data){
    var pricesStat = []
    var hours = []
        
        for(var i=data.length-288;i<data.length;i++){
            
            
            hours[data.length-i-1] = data[i].time
            pricesStat[data.length-i-1]=data[i].priceUsd
        }

        
        
        hours.reverse()
        pricesStat.reverse()
    return([hours,pricesStat])
}




function Sum(arr){
    var sum =0;
    for(var i=0;i<arr.length;i++){
        sum= sum+parseFloat(arr[i])

    }
    return sum;
}
var myChart = new Chart()

 function getChart(item,data){
    console.log("executing..")
    
        var timePrice = getTimeMoney(data)
        
        var minPrice = (parseFloat(Math.min.apply(null,timePrice[1])).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        var maxPrice = (parseFloat(Math.max.apply(null,timePrice[1])).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        var sum = Sum(timePrice[1]);
        


        var average = (parseFloat(sum/timePrice[1].length).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        console.log(sum)
        //console.log(minPrice)
         createEl(item,minPrice,maxPrice,average)


        console.log(timePrice)
        var ctx = document.getElementById(item.id+'Canvas').getContext('2d');
        if(ctx!=null&&data!=null){
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timePrice[0],
                datasets: [{
                    label: `${item.name}`,
                    data:timePrice[1],
                    backgroundColor:parseFloat(item.changePercent24Hr)>0?'rgba(111, 227, 156,30%)':'rgba(255, 53, 63,40%)',
                    borderColor:parseFloat(item.changePercent24Hr)>0?'rgb(17, 191, 84)':'rgb(255, 53, 63)',
                    borderWidth: 2,
                    pointRadius:0,
                    pointHitRadius:1.5,
                    pointHoverRadius:1.5,
                    lineTension:0
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false
                        }
                    }],
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        time: {
                            displayFormats: {
                                quarter: 'HH MM'
                            }
                        }
                    }]
                }
            },
            
        });
        
    }
}
