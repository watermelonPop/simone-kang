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

function DayNightWidgetLarge() {
    const [phase, setPhase] = useState(getDayPhase(new Date().getHours()));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [backgrounds, setBackgrounds] = useState([{ phase, opacity: 1 }]);
    const [infoShown, setInfoShown] = useState(false);
    const [demoModeOn, setDemoModeOn] = useState(false);

    const infoTimeoutRef = useRef(null);

    useEffect(() => {
        let timer;
        if (demoModeOn) {
            // Demo mode: cycle through phases every 10 seconds
            setPhase((prev) => {
                if (prev === "Morning") return "Afternoon";
                if (prev === "Afternoon") return "Evening";
                if (prev === "Evening") return "Night";
                return "Morning";
            });
            timer = setInterval(() => {
                setPhase((prev) => {
                    if (prev === "Morning") return "Afternoon";
                    if (prev === "Afternoon") return "Evening";
                    if (prev === "Evening") return "Night";
                    return "Morning";
                });
                setCurrentDate(new Date());
            }, 10000);
        } else {
            // Real time: update phase and time every 10 seconds
            const newDate = new Date();
            setCurrentDate(newDate);
            setPhase(getDayPhase(newDate.getHours()));

            timer = setInterval(() => {
                const newDate = new Date();
                setCurrentDate(newDate);
                setPhase(getDayPhase(newDate.getHours()));
            }, 10000);
        }
        return () => clearInterval(timer);
    }, [demoModeOn]);
    

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

    const dateString = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const timeString = currentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });


    const toggleInfoShown = () => {
        if (infoTimeoutRef.current) {
            clearTimeout(infoTimeoutRef.current);
        }
        setInfoShown(!infoShown);
        infoTimeoutRef.current = setTimeout(() => {
            setInfoShown(false);
        }, 15000);
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (infoTimeoutRef.current) {
                clearTimeout(infoTimeoutRef.current);
            }
        };
    }, []);
    

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
                {`Good ${phase}!`}
                <br />
                {`It's ${timeString} on ${dateString}`}
                <br />
                <br />
                <p className='outerDemoBtn'>
                    Demo Mode 
                    <button className='demoBtn' onClick={() => setDemoModeOn((prev) => !prev)}>
                        {demoModeOn ? (
                            <FontAwesomeIcon icon={faToggleOn} />
                        ) : (
                            <FontAwesomeIcon icon={faToggleOff} />
                        )}
                    </button>
                </p>

                <br/>
                <br />
                {infoShown === true ? "This animation changes throughout the day! Toggle on Demo Mode to see the full animation!" : ""
                }
            </p>

            <p className="daynight-info" onClick={() => toggleInfoShown()}><FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon></p>

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

export default DayNightWidgetLarge;
