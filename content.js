
var app = new Vue({
    el: '#app',
    data: {
        content: "",
        coinsData: JSON,
        nullabels:2,
        oldPrices:[],
        statisticsPrice:JSON,
        counter:0,
        minPriceChart:0,
        maxPriceChart:0,
        itemCount:15
    },
    updated(){
        //console.log(`Обновлено: ${Date() }`)
        this.counter++;
        //console.log(`Counter ${this.counter}`)
    },

    methods:{
         toMoreInformation(id,idCanvas,name,symbol){

            console.log(`pressed ${id}, ${idCanvas}`)
            var url = `https://api.coincap.io/v2/assets/${id}/history?interval=m5`;
            settingsInfoItem.url = url;
            console.log(`ajax url: ${url}`)
            
            if(document.getElementById('chart row')!=null&&document.getElementById(id+"Canvas")==null){
                deleteEl('chart row')

            }
            else if(document.getElementById('chart row')!=null&&document.getElementById(id+"Canvas")!=null){
                deleteEl('chart row')
                return;
            }
            if(document.getElementById('chart row')==null&&document.getElementById(id+"Canvas")==null){
                
                
               // var canvas = document.getElementById(idCanvas)
                //console.log(canvas)
                
                $.ajax(settingsInfoItem).done(function (response) {
                    //console.log(`ajax,toMore and: ${url}`)
                    //console.log(response.data);
                     getChart(id,response.data,name,symbol.toLowerCase())
                    
                });


            }
            
            
            
        },
        addItems(){
            this.itemCount+=25;
            if(this.itemCount>=100){
                deleteEl('load-more-id');
            }
        },
     UrlExists(url)
        {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return http.status!=404;
        }
    }
})
var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
var hours = ["s","Mon","Tue","Wed","Thu","Fri","Sat"]
var settings = {
    "url": "https://api.coincap.io/v2/assets",
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



function createEl(id,min,max,average,title,symbol){
    var canvasComponent = Vue.extend({
        template:`<tr class='charts' id="chart row" style="height:0px;">
                    <td colspan="3" >
                        <div class="chartsPrice">
                            <div class="item-info">
                                <img src='https://static.coincap.io/assets/icons/${symbol}@2x.png' width="64px" height="64px" >
                                <h2 >${title}</h2>
                                <h4 >${new Date().getDate()+'.'+(new Date().getMonth()+1)+"."+new Date().getFullYear()}</h4>
                            </div>
                            <div class="item-price">
                                <h5 class="chartsPrice-item"><span style="color:grey;">HIGH </span>$${max}</h5>
                                <h5 class="chartsPrice-item"><span style="color:grey;">LOW </span>$${min}</h5>
                                <h5 class="chartsPrice-item"><span style="color:grey;">AVERAGE </span>$${average}</h5>
                            </div>
                        </div>
                        <canvas id='${id}Canvas' > </canvas>
                        <div class="chartMoreInformation">
                        <a  href="https://coincap.io/assets/${id}" target="_blank" >More Details</a>
                        </div>
                    </td>

                </tr>`
    })
    var canvasEl = new canvasComponent().$mount()
    console.log(canvasEl.$el);
    document.getElementById(id).insertAdjacentElement('afterend',canvasEl.$el)
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

 function getChart(id,data,name,symbol){
    console.log("executing..")
    
        var timePrice = getTimeMoney(data)
        
        var minPrice = (parseFloat(Math.min.apply(null,timePrice[1])).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        var maxPrice = (parseFloat(Math.max.apply(null,timePrice[1])).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        var sum = Sum(timePrice[1]);
        


        var average = (parseFloat(sum/timePrice[1].length).toFixed(app.nullabels)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        console.log(sum)
        //console.log(minPrice)
         createEl(id,minPrice,maxPrice,average,name,symbol)


        console.log(timePrice)
        var ctx = document.getElementById(id+'Canvas').getContext('2d');
        if(ctx!=null&&data!=null){
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timePrice[0],
                datasets: [{
                    label: `${name}`,
                    data:timePrice[1],
                    backgroundColor:'rgb(111, 227, 156)',
                    borderColor:'rgb(17, 191, 84)',
                    borderWidth: 2,
                    pointRadius:0,
                    pointHitRadius:1,
                    pointHoverRadius:1,
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
