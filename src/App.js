import React, { Component } from 'react';

import './App.css';
import axios from 'axios';
import {Line} from 'react-chartjs-2';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      dataWeather: [],
      dataForecast: [],
      celsius: false,
      iconClass: '',
      dataForcast:[],
      colorClass: '',
      chartData:{
        labels: [],
        datasets:[
          {
            label:'Sun Hour',
            data: [],
            backgroundColor:'rgba(255, 206, 86, 0.6)'
          },
          {
            label:'UV Index',
            data: [],
            backgroundColor:'rgba(153, 102, 255, 0.6)'
          },
          {
            label:'Maximum temperature',
            data: [],
            backgroundColor:'rgba(54, 162, 235, 0.6)'
          },
          {
            label:'Minimum temperature',
            data: [],
            backgroundColor:'rgba(255, 99, 132, 0.6)'
          }
        ]
      },
      load: true
    };
  }

  fullDay(str) {
    switch (str) {
      case 'Tue':
        return 'Tuesday';
      case 'Wed':
        return 'Wednesday';
      case 'Thu':
        return 'Thursday';
      case 'Sat':
        return 'Saturday';
      default:
        return str + 'day';
    }
  }

  titleCase(str) {
    return str.split(' ').map(function (word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  chooseIcon(){
    var icon;
    switch (this.state.dataWeather.weather[0].icon) {
        case '01d':
          icon = ('wi wi-day-sunny');
          break;
        case '02d':
          icon = ('wi wi-day-sunny-overcast');
          break;
        case '01n':
          icon = ('wi wi-night-clear');
          break;
        case '02n':
          icon = ('wi wi-night-partly-cloudy');
          break;
      }

      switch (this.state.dataWeather.weather[0].icon.substr(0, 2)) {
        case '03':
          icon = ('wi wi-cloud');
          break;
        case '04':
          icon = ('wi wi-cloudy');
          break;
        case '09':
          icon = ('wi wi-showers');
          break;
        case '10':
          icon = ('wi wi-rain');
          break;
        case '11':
          icon = ('wi wi-thunderstorm');
          break;
        case '13':
          icon = ('wi wi-snow');
          break;
        case '50':
          icon = ('wi wi-fog');
          break;
      }
      this.setState({iconClass: icon});
  }

  toggleCelsius() {
    var currenttemp = this.state.dataWeather;
    if(this.state.celsius){
      currenttemp.main.temp = Math.round((currenttemp.main.temp * (9/5))+ 32);
    }else{
      currenttemp.main.temp = (Math.round((currenttemp.main.temp - 32) * (5 / 9)));
    }
    this.setState({celsius: !this.state.celsius, dataWeather: currenttemp}); //add class active
  }

  changeBackground(){
    var temp = this.state.dataWeather.main.temp;
    var color;
    if (temp >= 80) color = 'hot';
      else if (temp >= 70) color = 'warm';
      else if (temp >= 60) color = 'cool';
      else color = 'cold';
    this.setState({colorClass: color});
  }
  getWeather(){
    var self = this;
    this.setState({load: true});
    const APP_ID = "58b6f7c78582bffab3936dac99c31b25";
    var input = this.state.city;
    
    // weather fetch
    axios.get('//api.openweathermap.org/data/2.5/weather', {
    params: {
      q: input,
      units: 'imperial',
      appid: APP_ID
    }
    })
    .then(function (res) {
      var dt = new Date(res.data.dt * 1000).toString().split(' ');
      res.data.current = dt;
      console.log(res);
      self.setState({dataWeather:res.data});
      self.chooseIcon();
      self.changeBackground();
    })

    //forcast fetch
    var s=this;
    axios.get('//api.openweathermap.org/data/2.5/forecast/daily', {
    params: {
      q: input,
      units: 'imperial',
      cnt: '6',
      appid: APP_ID
    }
    })
    .then(function (res) {
      var forecast = [];
      var length = res.data.list.length;
      for (var i = 1; i < length; i++) {
        forecast.push({
          date: new Date(res.data.list[i].dt * 1000).toString().split(' ')[0],
          fahrenheit: {
            high: Math.round(res.data.list[i].temp.max),
            low: Math.round(res.data.list[i].temp.min),
          },
          celsius: {
            high: Math.round((res.data.list[i].temp.max - 32) * (5 / 9)),
            low: Math.round((res.data.list[i].temp.min - 32) * (5 / 9))
          }
        });
      }
      console.log(forecast);
      s.setState({dataForcast:forecast});

    })

    var todayDate = new Date().toISOString().slice(0,10);
    console.log(todayDate);
    var minusseven = new Date(todayDate);
    minusseven = new Date(minusseven.setDate(minusseven.getDate()-6)).toISOString().slice(0,10);
    console.log(minusseven);

    axios.get('//api.worldweatheronline.com/premium/v1/past-weather.ashx', {
    params: {
      q: input,
      format: 'json',
      date: minusseven,
      enddate: todayDate,
      key: "5e1a1ce3f2784c3cb22135946191503"
    }
    })
    .then(function (res) {
      console.log(res);
      var tempchartData = self.state.chartData;
      var data = res.data.data.weather;
      for(let i=0;i<data.length;i++){
        tempchartData.labels[i] = data[i].date;
        tempchartData.datasets[2].data[i] = parseInt(data[i].maxtempC);
        tempchartData.datasets[3].data[i] = parseInt(data[i].mintempC);
        tempchartData.datasets[0].data[i] = parseInt(data[i].sunHour);
        tempchartData.datasets[1].data[i] = parseInt(data[i].uvIndex);
      }
      self.setState({chartData: tempchartData,load: false});
    })
  }
  render() {
    return (
      <div className={this.state.colorClass} style={{height: "100%",backgroundColor:this.state.colorClass ? "":"rgba(54, 162, 235, 0.6)"}}>
      <div className={this.state.colorClass} style={{width: "100%",minHeight: "100%",backgroundColor: this.state.colorClass == ''? 'rgba(255, 99, 132, 0.6)' : ''}}>
        <div className="wrapper" style={{paddingTop: this.state.colorClass == ''? "15%": ""}}>
          <div className={this.state.dataWeather.length !==0 ? "":"cityinput"} >  
            <input className="searchbar transparent" id='search' type='text' onChange={e => this.setState({city: e.target.value})} placeholder='enter city, country' />
            <input className="button transparent" id='button' onClick={()=>this.getWeather()} type="submit" value='GO' />
          </div>
      {this.state.dataWeather.length !== 0 &&
          ( <div>
          <div className='panel'>
            <h2 className='city' id='city'>
            { this.state.dataWeather.sys.country? this.state.dataWeather.name + ', ' + this.state.dataWeather.sys.country: this.state.dataWeather.name}
            </h2>
            <div className='weather' id='weather'>
              <div className='group secondary'>
                <h3 id='dt'>{this.fullDay(this.state.dataWeather.current[0]) + ' ' + this.state.dataWeather.current[4].substring(0, 5)}</h3>
                <h3 id='description'>{this.titleCase(this.state.dataWeather.weather[0].description)}</h3>
              </div>
              <div className='group secondary'>
                <h3 id='wind'>{'Wind: ' + this.state.dataWeather.wind.speed + ' mph'}</h3>
                <h3 id='humidity'>{'Humidity ' + this.state.dataWeather.main.humidity + '%'}</h3>
              </div>
              <div className='temperature' id='temperature'>
                <h1 className='temp' id='temp'>
                  <i id='condition' className={this.state.iconClass}></i> 
                  <span id='num'>{Math.round(this.state.dataWeather.main.temp)}</span>
                  <a className={this.state.celsius ?'fahrenheit' :'fahrenheit active'} onClick={()=>this.toggleCelsius()} id='fahrenheit' href="#">&deg;F</a>
                  <span className='divider secondary'>|</span>
                  <a className={this.state.celsius ?'celsius active' :'celsius'} onClick={()=>this.toggleCelsius()} id='celsius' href="#">&deg;C</a>
                </h1>
              </div>
              <div className='forecast' id='forecast'>
                {this.state.dataForcast.map((data,index) => {
                  return (
                     <div key={index} className="block">
                      <h3 className="secondary">{data.date}</h3>
                      <h2 className="high">{this.state.celsius ? data.celsius.high : data.fahrenheit.high }</h2>
                      <h4 className="secondary">{this.state.celsius ? data.celsius.low : data.fahrenheit.low }</h4>
                    </div>
                  );
                })
                }
              </div>
            </div>
          </div>
         </div> )}
        <div style={{marginTop: "5%",backgroundColor: "black",marginTop: "20px",marginBottom: "20px"}}>
          {!this.state.load && <Line data={this.state.chartData}/>}
        </div>
        </div>
      </div>
      </div>
    );
  }
}

export default App;
