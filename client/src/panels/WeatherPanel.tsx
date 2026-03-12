import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight, faTemperatureArrowUp, faTemperatureArrowDown } from '@fortawesome/free-solid-svg-icons';
import type { WeatherInfo, WeatherHour, WeatherDay, WeatherToday } from '../types';
import '../App.css'
import './WeatherPanel.css'
import '../mobile.css'

interface DayRowProps {
    day: WeatherDay
    idx: number
    isOpen: boolean
    onToggle: (idx: number) => void
    isMobile: boolean
    getTimeStr: (t: string) => string
}

function DayRow({ day, idx, isOpen, onToggle, isMobile, getTimeStr }: DayRowProps) {
    const detailsRef = useRef<HTMLDivElement>(null);
    const [detailsHeight, setDetailsHeight] = useState<number>(0);

    useEffect(() => {
        if (!detailsRef.current) return;
        const el = detailsRef.current;
        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.height = 'auto';
        clone.style.width = `${el.offsetWidth}px`;
        document.body.appendChild(clone);
        const naturalHeight = clone.scrollHeight;
        document.body.removeChild(clone);
        setDetailsHeight(isOpen ? naturalHeight : 0);
    }, [isOpen]);

    return (
        <div key={day.date || idx} className='dailyHolder'>
            <div
                className={isOpen ? "hourlyDaySummaryOpen" : "hourlyDaySummary"}
                onClick={() => onToggle(idx)}
            >
                <span>
                    <FontAwesomeIcon icon={isOpen ? faCaretDown : faCaretRight} />
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
            <div
                ref={detailsRef}
                className='hourlyDayDetails'
                style={{ 
                    height: `${detailsHeight}px`, 
                    overflow: 'hidden', 
                    transition: 'height 0.4s ease',
                    marginTop: detailsHeight > 0 ? '0.5rem' : '0',
                    paddingBottom: detailsHeight > 0 ? '0.5rem' : '0',
                }}
            >
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
                            <p className="hourlyWeeklyTime">Feels<br />Like<br />{hour.feels_like_f}&deg;F</p>
                        ) : (
                            <p className="hourlyWeeklyTime">Feels Like<br />{hour.feels_like_f}&deg;F</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface WeatherPanelProps {
    isMobile: boolean
}

function WeatherPanel({ isMobile }: WeatherPanelProps){
    const [location, setLocation] = useState({
                lat: 40.4432, // Default: Pittsburgh
                lon: -79.9428
            });
    const [weatherWidgetInfo, setWeatherWidgetInfo] = useState<WeatherInfo | null>(null);
    const [todayInfo, setTodayInfo] = useState<WeatherToday | null>(null);
    const [weekInfo, setWeekInfo] = useState<WeatherDay[] | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openDays, setOpenDays] = useState(new Set());
    const navigate = useNavigate();
    const location2 = useLocation();

    // Initialize from URL
    const [selectedTimeFrame, setSelectedTimeFrame] = useState(() => {
        return location2.pathname.includes('3days') ? 3 : 1;
    });

    const handleSelectTimeFrame = (frame: number) => {
        setSelectedTimeFrame(frame);
        navigate(frame === 1 ? '/Weather/today' : '/Weather/3days');
    };

    useEffect(() => {
        const timer = setInterval(() => {
            let cDate = new Date();
            setCurrentDate(cDate);
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
                    let tempHours: WeatherHour[] = [];
                    for(let i = 0; i < data.forecast.forecastday[0].hour.length; i++){
                        let tempHour: WeatherHour = {time: data.forecast.forecastday[0].hour[i].time, temp_f: data.forecast.forecastday[0].hour[i].temp_f, condition: data.forecast.forecastday[0].hour[i].condition.text, conditionIcon: data.forecast.forecastday[0].hour[i].condition.icon, feels_like_f: data.forecast.forecastday[0].hour[i].feelslike_f};
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
                    let tempWeek:WeatherDay[] = [];
                    const forecastDays = data.forecast.forecastday;
                    for(let j = 0; j < forecastDays.length; j++){
                        const dayData = forecastDays[j];
                        let tempHours: WeatherHour[] = [];
                        for(let i = 0; i < dayData.hour.length; i++){
                            let tempHour: WeatherHour = {time: dayData.hour[i].time, temp_f: dayData.hour[i].temp_f, condition: dayData.hour[i].condition.text, conditionIcon: dayData.hour[i].condition.icon, feels_like_f: dayData.hour[i].feelslike_f};
                            tempHours.push(tempHour);
                        }

                        let tempDay: WeatherDay = {date: getDateStr(new Date(dayData.date)), maxTemp:  dayData.day.maxtemp_f, minTemp: dayData.day.mintemp_f, condition: dayData.day.condition.text, conditionIcon: dayData.day.condition.icon, hours: tempHours}
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

    const getDateStr = (d: Date) => {
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

    const getTimeStr = (t: string) => {
        const isoString = t.replace(' ', 'T');
        const date = new Date(isoString);

        // Format to "7:00 PM" using toLocaleTimeString
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const toggleDayOpen = (idx: number) => {
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

    return (
        <>
            <div className='outerWeatherWidgetLarge'>
                <p className='weatherTitleLarge'>
                    {isMobile ? (
                        <p className='weatherTitleLarge'>
                            Weather
                        </p>
                    ):(
                        <p className='weatherTitleLarge'>
                        {selectedTimeFrame === 1 ? (
                                "Today's "
                            ) : selectedTimeFrame === 3 ? (
                                "3 Days of "
                            ): ""
                        }
                        Weather in {weatherWidgetInfo?.cityName || "Pittsburgh"}
                        </p>
                    )}
                </p>
                <div className='weatherContentLarge'>
                    <div className="weatherSelectDiv">
                        <p className={selectedTimeFrame === 1 ? "selected" : ""} onClick={() => handleSelectTimeFrame(1)}>{isMobile ? "Today" : `Today's Forecast (${getDateStr(currentDate)})`}</p>
                        <p className={selectedTimeFrame === 3 ? "selected" : ""} onClick={() => handleSelectTimeFrame(3)}>{isMobile ? "3-Days" : `3-Day Forecast (${get3DayDatesStr()})`}</p>
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
                                                {hour.feels_like_f}&deg;F
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
                                {weekInfo && weekInfo.map((day, idx) => (
                                    <DayRow
                                        key={day.date || idx}
                                        day={day}
                                        idx={idx}
                                        isOpen={openDays.has(idx)}
                                        onToggle={toggleDayOpen}
                                        isMobile={isMobile}
                                        getTimeStr={getTimeStr}
                                    />
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

export default WeatherPanel