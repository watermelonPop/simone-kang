import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons';
function LockScreen({setIsUnlocked, isMobile}) {
        const [currentDate, setCurrentDate] = useState(new Date());
        const touchStartY = useRef(null);
        const unlock = () => setIsUnlocked(true);

        useEffect(() => {
                const timer = setInterval(() => {
                        setCurrentDate(new Date());
                    }, 1000);
            
                    // Cleanup on unmount
                    return () => clearInterval(timer);
        });

        const dateString = isMobile ? `${currentDate.toLocaleDateString('en-US', { weekday: 'short' })} ${currentDate.getDate()}` : currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            const timeString = currentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true // Set to true for AM/PM format
            });

            useEffect(() => {
                function onKeyDown(e) {
                    if (e.key === 'ArrowUp') unlock();
                }
                function onClick() {
                    unlock();
                }
                window.addEventListener('keydown', onKeyDown);
                window.addEventListener('click', onClick);
                return () => {
                    window.removeEventListener('keydown', onKeyDown);
                    window.removeEventListener('click', onClick);
                };
            }, [unlock]);
            useEffect(() => {
                function onTouchStart(e) {
                    if (e.touches && e.touches.length === 1) {
                        touchStartY.current = e.touches[0].clientY;
                    }
                }
                function onTouchEnd(e) {
                    if (e.changedTouches && e.changedTouches.length === 1 && touchStartY.current !== null) {
                        const deltaY = touchStartY.current - e.changedTouches[0].clientY;
                        if (deltaY > 50) { // Swipe up threshold (px)
                            unlock();
                        }
                        touchStartY.current = null;
                    }
                }
                window.addEventListener('touchstart', onTouchStart);
                window.addEventListener('touchend', onTouchEnd);
                return () => {
                    window.removeEventListener('touchstart', onTouchStart);
                    window.removeEventListener('touchend', onTouchEnd);
                };
            }, [unlock]);
        return (
                <>
                <div className="lockScreenOuter">
                        <div className="lockDate">
                                <p>{dateString}</p>
                                <p><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></p>
                                <p>{isMobile ? "Simone" : "Simone Kang"}</p>
                        </div>
                        <div className='lockMiddle'>
                            <h1 className="lockTime">{timeString}</h1>
                        </div>
                        <div className='lockBottom'>
                            <p className="lockTxt">click, swipe up, or arrow up to unlock</p>
                            <div className="swipeBar"></div>
                        </div>
                </div>
                </>
        );
}

export default LockScreen;
