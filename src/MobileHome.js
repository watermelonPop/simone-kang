import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faGear, faFile, faSquareXmark, faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft, faCircleInfo, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
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

function MobileHome({accessToken, isMobile, openModal}) {
        return (
                <>
                        <div className="mobileHomeScreenOuter">
                                <div className='mobileMain'>
                                        <div className='row1n2'>
                                                <div className='squareWidget sqWidget' onClick={() => openModal("Weather")}>
                                                        <WeatherWidget/>
                                                </div>
                                                <div className='squareWidget' onClick={() => openModal("Spotify")}>
                                                        <SpotifyWidget accessToken={accessToken}/>
                                                </div>
                                        </div>
                                        <div className='row3n4'>
                                                <div className='rectWidget' onClick={() => openModal("DayNight")}>
                                                        <DayNightWidget />
                                                </div>
                                        </div>
                                        <div className='row5'>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Contact")}><FontAwesomeIcon icon={faAddressBook}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Contact</p>
                                                </div>
                                                <div className='appIcon'>
                                                        <p className='appIconImg' onClick={() => openModal("Portfolio")}><FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon></p>
                                                        <p className='appIconTxt'>Porfolio</p>
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
                                        <div className='row6'></div>
                                </div>
                                <div className='mobileDock'>
                                        <div className='appIcon'>
                                                <p className='appIconImg' onClick={() => openModal("AboutMe")}><FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon></p>
                                                <p className='appIconTxt'>AboutMe</p>
                                        </div>
                                        <div className='appIcon'>
                                                <p className='appIconImg' onClick={() => openModal("Resume")}><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></p>
                                                <p className='appIconTxt'>Resume</p>
                                        </div>
                                        <div className='appIcon' onClick={() => openModal("Spotify")}>
                                                <p className='appIconImg'><FontAwesomeIcon icon={faSpotify}></FontAwesomeIcon></p>
                                                <p className='appIconTxt'>Spotify</p>
                                        </div>
                                        <div className='appIcon'>
                                                <p className='appIconImg' onClick={() => openModal("Settings")}><FontAwesomeIcon icon={faGear}></FontAwesomeIcon></p>
                                                <p className='appIconTxt'>Settings</p>
                                        </div>
                                </div>
                        </div>
                </>
        );
}

export default MobileHome;
