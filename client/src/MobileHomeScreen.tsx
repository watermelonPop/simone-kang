import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faAddressBook, faFolderOpen, faCircleInfo, faGear, faFile } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faSpotify } from '@fortawesome/free-brands-svg-icons';
import './App.css'
import './mobile.css'
import WeatherWidget from './widgets/WeatherWidget';
import DayNightWidget from './widgets/DayNightWidget';
import SpotifyWidget from './widgets/SpotifyWidget';

interface MobileHomeScreenProps {
    accessToken: string | null
    openModal: (page: string) => void
    currentSong: any
}

function MobileHomeScreen({ accessToken, openModal, currentSong }: MobileHomeScreenProps){
    return (
    <>
        <div className="mobileHomeScreenOuter">
                <div className='mobileMain'>
                        <div className='row1n2'>
                                <div className='squareWidget sqWidget' onClick={() => openModal("Weather/today")}>
                                        <WeatherWidget/>
                                </div>
                                <div className='squareWidget' onClick={() => openModal("Spotify")}>
                                        <SpotifyWidget accessToken={accessToken} currentSong={currentSong}/>
                                </div>
                        </div>
                        <div className='row3n4'>
                                <div className='rectWidget' onClick={() => openModal("DayNight")}>
                                        <DayNightWidget />
                                </div>
                        </div>
                        <div className='row5'>
                                <div className='appIcon'>
                                        <p className='mobileAppIconImg' onClick={() => openModal("Contact")}><FontAwesomeIcon icon={faAddressBook}></FontAwesomeIcon></p>
                                        <p className='appIconTxt'>Contact</p>
                                </div>
                                <div className='appIcon'>
                                        <p className='mobileAppIconImg' onClick={() => openModal("Portfolio")}><FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon></p>
                                        <p className='appIconTxt'>Porfolio</p>
                                </div>
                                <div className='appIcon'>
                                        <p className='mobileAppIconImg' onClick={() => openModal("Github")}><FontAwesomeIcon icon={faGithub}></FontAwesomeIcon></p>
                                        <p className='appIconTxt'>Github</p>
                                </div>
                                <div className='appIcon'>
                                        <p className='mobileAppIconImg' onClick={() => openModal("Linkedin")}><FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon></p>
                                        <p className='appIconTxt'>Linkedin</p>
                                </div>
                        </div>
                        <div className='row6'></div>
                </div>
                <div className='mobileDock'>
                        <div className='appIcon'>
                                <p className='mobileAppIconImg' onClick={() => openModal("AboutMe")}><FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon></p>
                                <p className='appIconTxt'>AboutMe</p>
                        </div>
                        <div className='appIcon'>
                                <p className='mobileAppIconImg' onClick={() => openModal("Resume")}><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></p>
                                <p className='appIconTxt'>Resume</p>
                        </div>
                        <div className='appIcon' onClick={() => openModal("Spotify")}>
                                <p className='mobileAppIconImg'><FontAwesomeIcon icon={faSpotify}></FontAwesomeIcon></p>
                                <p className='appIconTxt'>Spotify</p>
                        </div>
                        <div className='appIcon'>
                                <p className='mobileAppIconImg' onClick={() => openModal("Settings")}><FontAwesomeIcon icon={faGear}></FontAwesomeIcon></p>
                                <p className='appIconTxt'>Settings</p>
                        </div>
                </div>
        </div>
    </>
    );
}

export default MobileHomeScreen