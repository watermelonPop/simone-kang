import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown, faTemperatureArrowUp, faTemperatureArrowDown } from '@fortawesome/free-solid-svg-icons';
import './WeatherWidget.css';

function WeatherWidgetLarge({isMobile}) {
    //temp, feels like temp, condition, etc. for the week
    //button to enable / un enable location
        const [location, setLocation] = useState({
                lat: 40.4432, // Default: Pittsburgh
                lon: -79.9428
            });
    const [weatherWidgetInfo, setWeatherWidgetInfo] = useState(null);
    const [todayInfo, setTodayInfo] = useState(null);
    const [weekInfo, setWeekInfo] = useState([{date: null, hours: [
        {time: null, temp_f: null, condition: null, conditionIcon: null, feels_like_f: null}
    ]}]);
    const [twoWeekInfo, setTwoWeekInfo] = useState(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [endDate, setEndDate] = useState((new Date()).getDate() + 7);

    const [selectedTimeFrame, setSelectedTimeFrame] = useState(1);
    const [openDays, setOpenDays] = useState(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            let cDate = new Date();
            setCurrentDate(cDate);
            setEndDate(cDate.getDate() + 7);
        }, 100000);
        return () => clearInterval(timer);
    }, []);
// Get user location
useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    // User denied or error occurred; keep default
                    console.warn('Using default location due to error or denial:', error);
                }
            );
        } else {
            // Geolocation not available; keep default
            console.warn('Geolocation not supported, using default location.');
        }
    }, []);


    //fill up weatherwidgetinfo

    useEffect(() => {
        fetch(`https://api.weatherapi.com/v1/current.json?key=8c425ce1c19b47e1a06202208250407&q=${location.lat},${location.lon}`)
            .then(res => {
                if (!res.ok) throw new Error("Weather API error");
                return res.json();
            })
            .then(data => {
                if (data && data.current && data.location) {
                    setWeatherWidgetInfo({
                        temp_f: data.current.temp_f,
                        cityName: data.location.name,
                        condition: data.current.condition.text,
                        conditionIcon: data.current.condition.icon
                    });
                } 
            })
            .catch(err => {
                console.warn(err);
            });
    }, [location]);

    //fill up todayInfo

    useEffect(() => {
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=8c425ce1c19b47e1a06202208250407&q=${location.lat},${location.lon}&days=1`)
            .then(res => {
                if (!res.ok) throw new Error("Weather API error");
                return res.json();
            })
            .then(data => {
                if (data && data.current && data.location && data.forecast) {
                    let tempHours = [];
                    for(let i = 0; i < data.forecast.forecastday[0].hour.length; i++){
                        let tempHour = {time: data.forecast.forecastday[0].hour[i].time, temp_f: data.forecast.forecastday[0].hour[i].temp_f, condition: data.forecast.forecastday[0].hour[i].condition.text, conditionIcon: data.forecast.forecastday[0].hour[i].condition.icon, feels_like_f: data.forecast.forecastday[0].hour[i].feelslike_f};
                        tempHours.push(tempHour);
                    }

                    setTodayInfo({date: getDateStr(currentDate), hours: tempHours});
                    console.log({date: getDateStr(currentDate), hours: tempHours});
                } 
            })
            .catch(err => {
                console.warn(err);
            });
    }, [location, currentDate]);

    //fill up weekInfo
    useEffect(() => {
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=8c425ce1c19b47e1a06202208250407&q=${location.lat},${location.lon}&days=7`)
            .then(res => {
                if (!res.ok) throw new Error("Weather API error");
                return res.json();
            })
            .then(data => {
                if (data && data.current && data.location && data.forecast) {
                    console.log("HIII: ", data);
                    let tempWeek = [];
                    const todayAPIDate = getAPIDateStr(new Date());
                    const forecastDays = data.forecast.forecastday;
                    for(let j = 0; j < forecastDays.length; j++){
                        const dayData = forecastDays[j];
                        let tempHours = [];
                        for(let i = 0; i < dayData.hour.length; i++){
                            let tempHour = {time: dayData.hour[i].time, temp_f: dayData.hour[i].temp_f, condition: dayData.hour[i].condition.text, conditionIcon: dayData.hour[i].condition.icon, feels_like_f: dayData.hour[i].feelslike_f};
                            tempHours.push(tempHour);
                        }

                        let tempDay = {date: getDateStr(new Date(dayData.date)), maxTemp:  dayData.day.maxtemp_f, minTemp: dayData.day.mintemp_f, condition: dayData.day.condition.text, conditionIcon: dayData.day.condition.icon, hours: tempHours}
                        tempWeek.push(tempDay);
                    }

                    setWeekInfo(tempWeek);
                    console.log(tempWeek);
                } 
            })
            .catch(err => {
                console.warn(err);
            });
    }, [location, currentDate]);

     //fill up twoweekInfo
    useEffect(() => {
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=8c425ce1c19b47e1a06202208250407&q=${location.lat},${location.lon}&days=14`)
            .then(res => {
                if (!res.ok) throw new Error("Weather API error");
                return res.json();
            })
            .then(data => {
                if (data && data.current && data.location && data.forecast) {
                    let tempWeek = [];
                    const todayAPIDate = getAPIDateStr(new Date());
                    const forecastDays = data.forecast.forecastday;
                    for(let j = 0; j < forecastDays.length; j++){
                        const dayData = forecastDays[j];
                        let tempHours = [];
                        for(let i = 0; i < dayData.hour.length; i++){
                            let tempHour = {time: dayData.hour[i].time, temp_f: dayData.hour[i].temp_f, condition: dayData.hour[i].condition.text, conditionIcon: dayData.hour[i].condition.icon, feels_like_f: dayData.hour[i].feelslike_f};
                            tempHours.push(tempHour);
                        }

                        let tempDay = {date: getDateStr(new Date(dayData.date)), maxTemp:  dayData.day.maxtemp_f, minTemp: dayData.day.mintemp_f, condition: dayData.day.condition.text, conditionIcon: dayData.day.condition.icon, hours: tempHours}
                        tempWeek.push(tempDay);
                    }

                    setTwoWeekInfo(tempWeek);
                    console.log(tempWeek);
                } 
            })
            .catch(err => {
                console.warn(err);
            });
    }, [location, currentDate]);

    const getDateStr = (d) => {
        return d.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        });
    };

    const get3DayDatesStr = () => {
        if(weekInfo === null){
            return;
        }
        return `${weekInfo[0].date} - ${weekInfo[weekInfo.length - 1].date}`;
    };

    const getTimeStr = (t) => {
        const isoString = t.replace(' ', 'T');
        const date = new Date(isoString);

        // Format to "7:00 PM" using toLocaleTimeString
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const toggleDayOpen = (idx) => {
        setOpenDays(prev => {
          const newSet = new Set(prev);
          if (newSet.has(idx)) {
            newSet.delete(idx);
          } else {
            newSet.add(idx);
          }
          return newSet;
        });
      };

      const getAPIDateStr = (d) => {
        // Format: YYYY-MM-DD
        return d.toISOString().split('T')[0];
        };
    
      
    /*return (
        <>
        <div className='outerWeatherWidget'>
            <p className="weatherCondition">{weatherWidgetInfo?.condition || "Clear"}</p>
            <div className="middleWeatherWidget">
                <p className="weatherIcon">
                        {weatherWidgetInfo?.conditionIcon
                        ? <img src={weatherWidgetInfo.conditionIcon.startsWith('//') ? `https:${weatherWidgetInfo.conditionIcon}` : weatherWidgetInfo.conditionIcon} alt={weatherWidgetInfo?.condition || "Weather"} />
                        : "none"}
                </p>
                <p className="weatherTempF">{weatherWidgetInfo?.temp_f !== null && weatherWidgetInfo?.temp_f !== undefined ? weatherWidgetInfo.temp_f : "0"}°F</p>
            </div>
            <p className="weatherCity">In {weatherWidgetInfo?.cityName || "Pittsburgh"}</p>
        </div>
        </>
    );*/

    return (
        <>
            <div className='outerWeatherWidgetLarge'>
                <p className='weatherTitleLarge'>
                    {selectedTimeFrame === 1 ? (
                            "Today's "
                        ) : selectedTimeFrame === 3 ? (
                            "3 Days of "
                        ): ""
                    }
                    Weather in {weatherWidgetInfo?.cityName || "Pittsburgh"}
                </p>
                <div className='weatherContentLarge'>
                    <div className="weatherSelectDiv">
                        <p className={selectedTimeFrame === 1 ? "selected" : ""} onClick={() => setSelectedTimeFrame(1)}>{isMobile ? "Today" : `Today's Forecast (${getDateStr(currentDate)})`}</p>
                        <p className={selectedTimeFrame === 3 ? "selected" : ""} onClick={() => setSelectedTimeFrame(3)}>{isMobile ? "3-Days" : `3-Day Forecast (${get3DayDatesStr()})`}</p>
                        <div className="timeframe-indicator" data-selected={selectedTimeFrame} />
                    </div>
                    <div className='weatherSelectedOutput'>
                    {
                        selectedTimeFrame === 1 ? (
                            <>
                            <div className='hoursHolder'>
                                {
                                todayInfo?.hours
                                    .slice(currentDate.getHours(), todayInfo.hours.length)
                                    .map((hour, idx) => (
                                        <>
                                        <div className='hourlyHolder' key={hour.time || idx}>
                                            <div className='hourlyOuter'>
                                                {hour.conditionIcon
                                                ? <img className='hourlyIcon' src={hour.conditionIcon.startsWith('//') ? `https:${hour.conditionIcon}` : hour.conditionIcon} alt={hour?.condition || "Weather"} />
                                                : "none"}
                                                <p className='hourlyTimeUnder'>
                                                    {getTimeStr(hour.time)}
                                                    {/* time: temp_f:, condition:, conditionIcon:, feels_like_f: */}
                                                </p>
                                            </div>
                                            <p className='hourlyCondition'>
                                                {hour.condition}
                                            </p>
                                            <p className='hourlyTemp'>
                                                {hour.temp_f}&deg;F
                                            </p>
                                            <p className='hourlyFeelsLike' >
                                                Feels Like
                                                <br></br>
                                                {hour.feels_like_f} &deg;F
                                            </p>
                                        </div>
                                        </>
                                    ))
                                }
                            </div>
                            </>
                        ) : selectedTimeFrame === 3 ? (
                            <>
                            <div className='hoursHolder'>
                            {weekInfo.map((day, idx) => (
                                <div key={day.date || idx} className='dailyHolder' >
                                    <div
                                    className={openDays.has(idx) ? "hourlyDaySummaryOpen" : "hourlyDaySummary"}
                                    onClick={() => toggleDayOpen(idx)}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon={openDays.has(idx) ? faCaretDown : faCaretRight} />
                                        </span>
                                        <div className='hourlyOuter3Day'>
                                            {day.conditionIcon
                                                ? <img className='hourlyIcon' src={day.conditionIcon.startsWith('//') ? `https:${day.conditionIcon}` : day.conditionIcon} alt={day?.condition || "Weather"} />
                                                : "none"}
                                            <p className='hourlyTimeUnder'>
                                                {isMobile ? `${idx === 0 ? "Today" : day.date}` : `${day.date} ${idx === 0 ? " (Today)" : ""}`}
                                            </p>
                                        </div>
                                        <p className='hourlyTime mobileTemp'><FontAwesomeIcon icon={faTemperatureArrowUp} /> {day.maxTemp}&deg;F</p>
                                        <p className='hourlyTime mobileTemp'><FontAwesomeIcon icon={faTemperatureArrowDown} /> {day.minTemp}&deg;F</p>
                                        <p className='hourlyTime'>{day.condition}</p>
                                    </div>
                                    {/* Expandable details */}
                                    {openDays.has(idx) && (
                                    <div className='hourlyDayDetails'>
                                        {/* Example: show all hourly temps */}
                                        {day.hours.map((hour, hidx) => (
                                            <div className='hourDayDiv' key={hour.time ? `${day.date}-${hour.time}` : `${day.date}-hour-${hidx}`}>
                                                <div className='hourlyOuter'>
                                                    {hour.conditionIcon
                                                    ? <img className='hourlyIcon' src={hour.conditionIcon.startsWith('//') ? `https:${hour.conditionIcon}` : hour.conditionIcon} alt={hour?.condition || "Weather"} />
                                                    : "none"}
                                                    <p className='hourlyWeeklyTimeUnder'>
                                                        {isMobile ? getTimeStr(hour.time).replaceAll(" ", "") : getTimeStr(hour.time)}
                                                    </p>
                                                </div>
                                                <p className='hourlyWeeklyTime'>{hour.condition}</p>
                                                <p className='hourlyWeeklyTime'>{hour.temp_f}&deg;F</p>
                                                {isMobile ? (
                                                    <p className="hourlyWeeklyTime">
                                                        Feels
                                                        <br />
                                                        Like
                                                        <br />
                                                        {hour.feels_like_f}&deg;F
                                                    </p>
                                                    ) : (
                                                    <p className="hourlyWeeklyTime">
                                                        Feels Like
                                                        <br />
                                                        {hour.feels_like_f}&deg;F
                                                    </p>
                                                    )}

                                            </div>
                                        ))}
                                    </div>
                                    )}
                                </div>
                                ))}

                            </div>
                            </>
                        ) : (
                            <p></p>
                        )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default WeatherWidgetLarge;
