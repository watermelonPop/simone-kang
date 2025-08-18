import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faGear, faFile, faSquareXmark, faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faSpotify } from '@fortawesome/free-brands-svg-icons';
import SpotifyWebApi from "spotify-web-api-node";
import WeatherWidget from './Weather/WeatherWidget';
import DayNightWidget from './DayNight/DayNightWidget';
import ContactWidget from './Contact/ContactWidget';
import PortfolioWidget from './Portfolio/PortfolioWidget';
import WeatherWidgetLarge from './Weather/WeatherWidgetLarge';
import SpotifyWidget from './Spotify/SpotifyWidget';
import SpotifyWidgetLarge from './Spotify/SpotifyWidgetLarge';
import DayNightWidgetLarge from './DayNight/DayNightWidgetLarge';
import ContactWidgetLarge from './Contact/ContactWidgetLarge';
import PortfolioWidgetLarge from './Portfolio/PortfolioWidgetLarge';
import AboutMeWidget from './About Me/AboutMeWidget';
import SettingsWidget from './Settings/SettingsWidget';
import ResumeWidget from './Resume/ResumeWidget';
import GithubWidget from './Github/GithubWidget';
import LinkedinWidget from './Linkedin/LinkedinWidget';
import MobileHome from './MobileHome';
import axios from "axios";
const spotify_client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;    
const spotifyApi = new SpotifyWebApi({
    clientId: spotify_client_id,
});
function msToMinutesAndSeconds(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function debounce(func, delay) {
        let timeout;
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), delay);
        };
}

function HomeScreen({accessToken, isMobile, themes, currentTheme, setCurrentTheme}) {
        //log in: set access token with useAuth
        //spotifyApi.setAccessToken(accessToken);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalOpen, setModalOpen] = useState(false);
    const [showBackdrop, setShowBackdrop] = useState(false); // controls DOM presence
    const modalRef = useRef();
    const [modalPage, setModalPage] = useState(null);
    const [redirectDone, setRedirectDone] = useState(false);

     var spotify_redirect_uri = "http://127.0.0.1:3000";
        const [loggedIn, setLoggedIn] = useState(false);
        const [isPlaying, setIsPlaying] = useState(false);
        const [progressMs, setProgressMs] = useState(0);
        const [shuffleOn, setShuffleOn] = useState(false);
        const [volume, setVolume] = useState(0);
        const [repeatState, setRepeatState] = useState(null);
        const [currentSong, setCurrentSong] = useState(null);
        const [bottomSlidingOut, setBottomSlidingOut] = useState(false);
        const [bottomHidden, setBottomHidden] = useState(false);
        const [bottomSlidingIn, setBottomSlidingIn] = useState(false);
        const [projects, setProjects] = useState([]);
        
            useEffect(() => {
                const handleFetchProjects = async () => {
                    try {
                            const response = await fetch(`/api/projects`, {
                                method: "GET",
                            });
                
                            if (!response.ok) {
                                throw new Error('Failed to grab projects');
                            }
                            const data = await response.json();
                            console.log(data);
                            setProjects(data);
                    } catch (err) {
                            console.error('Error:', err);
                    }
                };
        
                handleFetchProjects();
            }, []);



        useEffect(() => {
                console.log("ACCESS: ", accessToken);
                if (accessToken) {
                    spotifyApi.setAccessToken(accessToken);  // ✅ this is critical
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            }, [accessToken]);

                useEffect(() => {
                    if (!accessToken) return;
                    if (!spotifyApi.getAccessToken()) {
                        console.warn("Spotify access token is missing");
                        return;
                    }
                    //alert("SEC");
                    const checkPlaybackState = () => {
                            spotifyApi.getMyCurrentPlaybackState()
                            .then(function(data) {
                            // Output items
                                    if (data.body && data.body.is_playing) {
                                            console.log("User is currently playing something!");
                                            setIsPlaying(true);
                                    } else {
                                            setIsPlaying(false);
                                            console.log("User is not playing anything, or doing so in private.");
                                    }
                                    if (data.body && data.body.shuffle_state !== undefined) {
                                        setShuffleOn(data.body.shuffle_state);
                                    }
                                    if(data.body && data.body.device.volume_percent !== undefined){
                                            //alert("HELLO");
                                            setVolume(data.body.device.volume_percent);
                                            if(document.getElementById("volume") !== null){
                                                document.getElementById("volume").style.setProperty('--value', `${volume}%`);
                                            }
                                    }
                                    if(data.body && data.body.repeat_state !== undefined){
                                            setRepeatState(data.body.repeat_state);
                                    }
                                    if(data.body && data.body.progress_ms !== undefined){
                                        setProgressMs(data.body.progress_ms);
                                    }
                            }, function(err) {
                                    console.log('Something went wrong!', err);
                            });
                    };
            
                    checkPlaybackState();
            
                    // Set up an interval to check every second
                    const intervalId = setInterval(checkPlaybackState, 1000);
            
                    // Clean up function to clear the interval when the component unmounts or accessToken changes
                    return () => clearInterval(intervalId);
                }, [accessToken]);


    useEffect(() => {
        if(redirectDone === true || accessToken === null){
                return;
        }
        console.log("ACCESS: ", accessToken);
        if(accessToken !== null){
                openModal("Spotify");
                setRedirectDone(true);
        }
    }, [accessToken]);

    // Timer for clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (modalOpen) setShowBackdrop(true);
    }, [modalOpen]);

    useEffect(() => {
        if (showBackdrop && modalRef.current) {
            console.log("HELLO");
            modalRef.current.classList.add('growAni');
        }
    }, [showBackdrop]);


        useEffect(() => {
            if (!accessToken) return;
            if (!spotifyApi.getAccessToken()) {
                console.warn("Spotify access token is missing");
                return;
            }
        
            const fetchCurrentTrack = async () => {
                //title: data.body.item.name
                //artist: data.body.item.artists[0].name
                //isliked
                //length: data.body.item.duration_ms
                try {
                    const data = await spotifyApi.getMyCurrentPlayingTrack();
                    if (data.body && data.body.item) {
                        console.log('Now playing: ' + data.body.item.name);
                        setCurrentSong(data.body.item);
                    } else {
                        console.log('No track currently playing');
                        setCurrentSong(null);
                    }
                } catch (err) {
                    console.error('Error fetching current track:', err);
                }
            };
        
            fetchCurrentTrack();
        
            // Set up an interval to check the current track every 5 seconds
            const interval = setInterval(fetchCurrentTrack, 1000);
        
            // Cleanup function to clear the interval when the component unmounts or accessToken changes
            return () => clearInterval(interval);
        }, [accessToken, isPlaying]); // Only re-run the effect if accessToken changes
    
    

        const dateString = currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
        });

        const timeString = currentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true // Set to true for AM/PM format
            });


            const openModal = (pageStr) => {
                setBottomSlidingOut(true); // trigger animation
                setTimeout(() => {
                    setBottomHidden(true);  // ⬅️ fully hide content after slide
                    setModalPage(pageStr);
                    setModalOpen(true);     // grow modal
                    setBottomSlidingOut(false); // reset
                }, 250);
            };
            
            
        
            const closeModal = () => {
                if (modalRef.current) {
                    modalRef.current.classList.remove('growAni');
                    modalRef.current.classList.add('shrinkAni');
                }
            
                // Start shrinking modal
                setTimeout(() => {
                    setModalOpen(false);
                    setShowBackdrop(false);
                }, 200);
            
                // Show and animate the bottom bar again
                setTimeout(() => {
                    setBottomHidden(false);       // Show content
                    setBottomSlidingIn(true);     // Trigger animation
                }, 200);
            
                // Reset the animation flag so it can re-trigger next time
                setTimeout(() => {
                    setBottomSlidingIn(false);
                }, 500); // Match the .25s animation (add some buffer)
            };
            




    const pause = () => {
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        spotifyApi.pause()
        .then(function() {
                console.log('Playback paused');
                setIsPlaying(false);
        }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
    };

    const play = () => {
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        spotifyApi.play()
        .then(function() {
                console.log('Playback started');
                setIsPlaying(true);
        }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
    };


    const previous = () => {
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        spotifyApi.skipToPrevious()
        .then(function() {
                console.log('Skip to previous');
                setCurrentSong(null);
        }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
};

    const next = () => {
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        spotifyApi.skipToNext()
        .then(function() {
                console.log('Skip to next');
                setCurrentSong(null);
        }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
    };

    const toggleShuffle = () => {
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        spotifyApi.setShuffle(!shuffleOn)
        .then(function() {
                setShuffleOn(!shuffleOn);
        }, function  (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
    };

    const handleSetRepeatState = (val) => {
        spotifyApi.setRepeat(val)
        .then(function () {
                setRepeatState(val);
                console.log('Repeat track.');
        }, function(err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong!', err);
        });
};

    const toggleRepeatState = () => {
        if(repeatState == "off"){
                handleSetRepeatState("context");
        }else if(repeatState == "context"){
                handleSetRepeatState("track");
        }else if(repeatState == "track"){
                handleSetRepeatState("off");
        }
};


const debouncedSetVolume = useCallback(
    debounce((newVolume) => {
      if (!accessToken || !spotifyApi.getAccessToken()) return;
      spotifyApi.setVolume(newVolume)
        .then(() => {
          console.log(`Volume set to ${newVolume}`);
        })
        .catch((err) => {
          console.error('Error setting volume:', err?.body?.error || err);
        });
    }, 300), // wait 300ms after user stops dragging
    [accessToken]
  );
  
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    debouncedSetVolume(newVolume);
  }, [debouncedSetVolume]);

  const debouncedSeek = useCallback(
    debounce((newProgress) => {
      if (!accessToken || !spotifyApi.getAccessToken()) return;
      spotifyApi.seek(newProgress)
        .then(() => {
          console.log('Seeked to ' + newProgress);
        })
        .catch((err) => {
          console.error('Error seeking track:', err?.body?.error || err);
        });
    }, 300),
    [accessToken]
  );

  const handleProgressChange = useCallback((newProgress) => {
    setProgressMs(newProgress);
    debouncedSeek(newProgress);
  }, [debouncedSeek]);


        return (
                <>
                {isMobile ? <MobileHome accessToken={accessToken} isMobile={isMobile} openModal={openModal}/> : (
                <div className="homeScreenOuter">
                        <div className='homeTopOuter'>
                                <div className='sideBarHome'>
                                        <div className='homeScreenDateDiv'>
                                                <p className='homeScreenTime'>{timeString}</p>
                                                <p className='homeScreenDate'>{dateString}</p>
                                        </div>
                                        <div className='sideBarWidgetRow'>
                                                <div className='squareWidget sqWidget' onClick={() => openModal("Weather")}>
                                                        <WeatherWidget/>
                                                </div>
                                                <div className='squareWidget' onClick={() => openModal("Spotify")}>
                                                        <SpotifyWidget accessToken={accessToken}/>
                                                </div>
                                        </div>
                                        <div className='sideBarWidgetRow'>
                                                <div className='rectWidget middleWidget' onClick={() => openModal("DayNight")}>
                                                        <DayNightWidget />
                                                </div>
                                        </div>
                                        <div className='sideBarWidgetRow'>
                                                <div className='rectWidget' onClick={() => openModal("Contact")}>
                                                        <ContactWidget/>
                                                </div>
                                        </div>
                                </div>
                                <div className='appsHome'>
                                        <div className='appIconsRow'>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("AboutMe")}><FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>AboutMe</p>
                                                </div>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Settings")}><FontAwesomeIcon icon={faGear}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Settings</p>
                                                </div>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Resume")}><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Resume</p>
                                                </div>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Github")}><FontAwesomeIcon icon={faGithub}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Github</p>
                                                </div>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Linkedin")}><FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Linkedin</p>
                                                </div>
                                        </div>
                                        <div className='portfolioWidgetRow'>
                                                <div className='portfolioWidget' onClick={() => openModal("Portfolio")}>
                                                        <PortfolioWidget projects={projects}/>
                                                </div>
                                        </div>
                                </div>
                        </div>
                        <div className={`homeBottomOuter ${bottomSlidingOut ? 'slideDownOut' : ''} ${bottomSlidingIn ? 'slideUpIn' : ''} ${!showBackdrop && isPlaying === true && currentSong !== null && !bottomHidden ? 'songPlaying' : ''}`}>
                                {!showBackdrop && isPlaying === true && currentSong !== null && !bottomHidden ? (
                                        <>
                                        <img className='homeCurrentSongImg' src={currentSong.album.images[0].url}></img>
                                        <div className='homeCurrentSongTxt'>
                                                <p className='homeCurrentTitle'>{currentSong.name}</p>
                                                <p className='homeCurrentSubtitle'>{currentSong.artists[0].name}</p>
                                        </div>
                                        <div className='homeCurrentSongControls'>
                                                <div className='controlsDiv'>
                                                        <div className='topControls'>
                                                        <button onClick={toggleShuffle} className={"shuffle-" + shuffleOn}><FontAwesomeIcon icon={faShuffle}></FontAwesomeIcon></button>
                                                        <button onClick={previous}><FontAwesomeIcon icon={faBackward}></FontAwesomeIcon></button>
                                                        <button onClick={()=>{
                                                                //run slide animation
                                                                pause();
                                                                setBottomSlidingOut(true); // trigger animation
                                                                setTimeout(() => {
                                                                setBottomHidden(true);  // ⬅️ fully hide content after slide
                                                                setBottomSlidingOut(false); // reset
                                                                }, 250);
                                                        }}>
                                                                {isPlaying ? <FontAwesomeIcon icon={faPause}></FontAwesomeIcon> : <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon>}
                                                        </button>
                                                        <button onClick={next}><FontAwesomeIcon icon={faForward}></FontAwesomeIcon></button>
                                                        <button className={"repeat-" + repeatState} onClick={toggleRepeatState}>
                                                                {repeatState === "track" ? (
                                                                        <p>1</p>
                                                                ):(
                                                                        <FontAwesomeIcon icon={faRepeat}></FontAwesomeIcon>
                                                                )}
                                                        </button>
                                                        </div>
                                                        <div className='bottControls'>
                                                        <p>{progressMs !== null ? msToMinutesAndSeconds(progressMs) : "0:00"}</p>
                                                        <input id="songTime" type="range" min="0" 
                                                        max={currentSong?.duration_ms} value={progressMs} onChange={(e) => handleProgressChange(e.target.value)}></input>
                                                        <p>{msToMinutesAndSeconds(currentSong?.duration_ms)}</p>
                                                        </div>
                                                </div>
                                                <div className='volumeDiv'>
                                                        <p><FontAwesomeIcon icon={faVolumeHigh}></FontAwesomeIcon></p>
                                                        <input type="range" id="volume" min="0" 
                                                        max="100" value={volume} onChange={(e) => handleVolumeChange(e.target.value)}></input>
                                                </div>
                                        </div>
                                        </>
                                ) : (
                                        <p></p>
                                )
                                }
                        </div>
                </div>
                )}

                {showBackdrop && (
                        <div
                                className={`modalBackdrop${modalOpen ? ' visible' : ''}`}
                                onClick={closeModal}
                        >
                                <div
                                id="modal"
                                className="modal"
                                ref={modalRef}
                                onClick={e => e.stopPropagation()}
                                >
                                <button className="modalCloseBtn" onClick={closeModal}><FontAwesomeIcon icon={faSquareXmark}></FontAwesomeIcon></button>
                                {
                                        modalPage === "Weather" ? <WeatherWidgetLarge isMobile={isMobile} /> :
                                        modalPage === "Spotify" ? <SpotifyWidgetLarge accessToken={accessToken} isMobile={isMobile}/> :
                                        modalPage === "DayNight" ? <DayNightWidgetLarge /> :
                                        modalPage === "Contact" ? <ContactWidgetLarge /> :
                                        modalPage === "Portfolio" ? <PortfolioWidgetLarge projects={projects} isMobile={isMobile}/> :
                                        modalPage === "AboutMe" ? <AboutMeWidget /> :
                                        modalPage === "Settings" ? <SettingsWidget themes={themes} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme}/> :
                                        modalPage === "Resume" ? <ResumeWidget isMobile={isMobile}/> :
                                        modalPage === "Github" ? <GithubWidget /> :
                                        modalPage === "Linkedin" ? <LinkedinWidget /> :
                                        <p></p>
                                }

                                </div>
                        </div>
                        )}
                </>
        );
}

export default HomeScreen;
