import { useState, useEffect, useCallback } from 'react';
import './SpotifyWidget.css';
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
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

function SpotifyWidget({accessToken}) {
    var spotify_redirect_uri = "http://127.0.0.1:3000";
    const [loggedIn, setLoggedIn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [user, setUser] = useState(null);
    

    //LOGGED IN & PREMIUM:
    //currently playing, search, liked songs
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




    useEffect(() => {
        if (!accessToken) return;
    
        const fetchUserData = async () => {
            try {
                const response = await fetch("https://api.spotify.com/v1/me", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
                //alert(data.display_name); // Process the user data as needed
                if(data){
                    setUser(data);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };
        
        fetchUserData();
    }, [accessToken]);

    return (
        <>
        {!currentSong ? (
                <p className='spotifyWidgetOff'><FontAwesomeIcon icon={faSpotify}></FontAwesomeIcon></p>
        ):(
                <>
                <div className="spotifyWidgetSmallOuter">
                        <div className='spotifySmallTop'>
                                <img src={currentSong?.album.images[0].url}></img>
                                <p><FontAwesomeIcon icon={faSpotify}></FontAwesomeIcon></p>
                        </div>
                        <div className='spotifySmallBott'>
                                <p className='spotifySmallTitle'>{currentSong?.name}</p>
                                <p className='spotifySmallSubtitle'>{currentSong?.artists[0].name}</p>
                        </div>
                </div>
                </>
        )}
        </>
    );
}

export default SpotifyWidget;
