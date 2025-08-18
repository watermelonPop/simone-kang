import { useState, useEffect, useRef } from 'react';
import './DayNightWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';

function getDayPhase(hour) {
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 24) return 'Evening';
    return 'Night';
}

function DayNightWidget() {
    const [phase, setPhase] = useState(getDayPhase(new Date().getHours()));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [backgrounds, setBackgrounds] = useState([{ phase, opacity: 1 }]);


    const timeString = currentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true // Set to true for AM/PM format
    });


    useEffect(() => {
        let timer;
        // Real time: update phase and time every 10 seconds
        const newDate = new Date();
        setCurrentDate(newDate);
        setPhase(getDayPhase(newDate.getHours()));

        timer = setInterval(() => {
            const newDate = new Date();
            setCurrentDate(newDate);
            setPhase(getDayPhase(newDate.getHours()));
        }, 10000);
        return () => clearInterval(timer);
    }, []);
    

    // Add new background on phase change
    useEffect(() => {
        if (phase !== backgrounds[backgrounds.length - 1].phase) {
            setBackgrounds(bgArr => [
                ...bgArr.map(bg => ({ ...bg, opacity: 1 })),
                { phase, opacity: 0 }
            ]);
        }
        // eslint-disable-next-line
    }, [phase]);

    // Crossfade logic
    useEffect(() => {
        if (backgrounds.length > 1) {
            const timeout = setTimeout(() => {
                setBackgrounds(bgArr =>
                    bgArr.map((bg, i) =>
                        i === bgArr.length - 1
                            ? { ...bg, opacity: 1 }
                            : { ...bg, opacity: 0 }
                    )
                );
            }, 10); // allow DOM to paint first

            const cleanup = setTimeout(() => {
                setBackgrounds(bgArr => bgArr.slice(-1));
            }, 10000); // match your transition duration

            return () => {
                clearTimeout(timeout);
                clearTimeout(cleanup);
            };
        }
    }, [backgrounds]);
    

    return (
        <div className="canvas">
            {/* Crossfade backgrounds */}
            {backgrounds.map((bg, i) => (
                <div
                    key={bg.phase}
                    className={`bg-gradient bg-${bg.phase}`}
                    style={{ opacity: bg.opacity, transition: "opacity 10s" }}
                />
            ))}

            {/* Greeting */}
            <p className="daynight-greeting">
                {`Good ${phase}! It's ${timeString}.`}
            </p>

            {/* Clouds */}
            <div className="cloud"></div>
            <div className="cloud a"></div>
            <div className="cloud b"></div>
            <div className="cloud c"></div>

            {/* Stars: show only at night */}
            {phase === 'Night' && (
                <>
                    <div className="star"></div>
                    <div className="star a"></div>
                    <div className="star b"></div>
                    <div className="star c"></div>
                    <div className="star d"></div>
                </>
            )}

            {/* Wind */}
            <div className="wind"></div>

            {/* Sun/Moon */}
            <div className="eclipse">
                <div className={`sun${phase === 'Night' ? ' hidden' : ''}`}></div>
                <div className={`sun a${phase === 'Night' ? ' hidden' : ''}`}></div>
                <div className={`moon${phase !== 'Night' ? ' hidden' : ''}`}></div>
            </div>
        </div>
    );
}

export default DayNightWidget;
