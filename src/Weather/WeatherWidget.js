import { useState, useEffect } from 'react';
import './WeatherWidget.css';

function WeatherWidget() {
        const [location, setLocation] = useState({
                lat: 40.4432, // Default: Pittsburgh
                lon: -79.9428
            });
    const [weatherWidgetInfo, setWeatherWidgetInfo] = useState(null);
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

    return (
        <>
        <div className='outerWeatherWidget'>
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
    );
}

export default WeatherWidget;
