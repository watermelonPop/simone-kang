import { useState, useEffect, useCallback } from 'react';
import './SpotifyWidget.css';
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import SpotifyFree from './SpotifyFree';
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

function SpotifyPremium({accessToken, search, setSearch, searchResults, selectedPlaylist, playlists, setSelectedPlaylistId, checkIfLiked, handleUnlikeSong, handleLikeSong, setSearchResults, setSelectedPlaylist, isMobile}) {
    var spotify_redirect_uri = "https://simone-kang.vercel.app";
    //sign in for spotify premium users
    //player
    //default 1 song for those who don't sign in / don't have premium
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${spotify_redirect_uri}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-recently-played%20user-follow-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20user-follow-modify`;
    const [selectedPanel, setSelectedPanel] = useState("Current");
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [shuffleOn, setShuffleOn] = useState(false);
    const [volume, setVolume] = useState(0);
    const [repeatState, setRepeatState] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

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
                    console.log('Now playing: ' + data.body.item.id);
                    let likedStatus = await checkIfLiked([data.body.item.id]);
                    console.log("LIKED: ", likedStatus);
                    let tempTrack = {...data.body.item, liked: likedStatus[0]};
                    setCurrentSong(tempTrack);
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

    const handleAddToQueue = async (uri) => {
        try {
                const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to add to queue');
                }
                else{
                     console.log("SONG QUEUED")
                }
        } catch (err) {
                console.error('Error queueing:', err);
        }
    };

    const handlePlayTrack = async (track) => {
        try {
                const val = await handleAddToQueue(track.uri);
                setCurrentSong(track);
                next();
        } catch (error) {
                console.error('Error fetching liked status for tracks:', error);
                // Set all tracks to false in case of error
                //ids.forEach(id => newLikedStatus[id] = false);
        }  
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
  

const handleToggleLike = async (track) => {
        console.log("TRACK: ", track);
        if(track.liked === false){
                try{
                        const val = await handleLikeSong(track);
                        setCurrentSong({...track, liked: true});
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }else if(track.liked === true){
                try{
                        const val = await handleUnlikeSong(track);
                
                        setCurrentSong({...track, liked: false});
                              
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }
};


const handleToggleLikeSearch = async (track, e) => {
        e.stopPropagation();
        console.log("TRACK: ", track);
        if(track.liked === false){
                try{
                        const val = await handleLikeSong(track);
                        setSearchResults(prevResults => (prevResults.map(item =>
                                item.id === track.id
                                  ? { ...item, liked: true }
                                  : item
                        )));
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }else if(track.liked === true){
                try{
                        const val = await handleUnlikeSong(track);
                
                        setSearchResults(prevResults => (prevResults.map(item =>
                                item.id === track.id
                                  ? { ...item, liked: false }
                                  : item
                        )));
                              
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }
};


const handleToggleLikePlaylists = async (track, e) => {
        e.stopPropagation();
        console.log("TRACK: ", track);
        console.log("PLAYLIST: ", selectedPlaylist);
        if(track.liked === false){
                try{
                        const val = await handleLikeSong(track);
                        setSelectedPlaylist(prevPlaylist => ({
                                ...prevPlaylist,
                                tracks: {
                                    ...prevPlaylist.tracks,
                                    items: prevPlaylist.tracks.items.map(item =>
                                        item.track.id === track.id
                                            ? { 
                                                ...item, 
                                                track: { ...item.track, liked: true } // toggle liked on .track
                                              }
                                            : item
                                    )
                                }
                            }));
                            
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }else if(track.liked === true){
                try{
                        const val = await handleUnlikeSong(track);
                        setSelectedPlaylist(prevPlaylist => ({
                                ...prevPlaylist,
                                tracks: {
                                    ...prevPlaylist.tracks,
                                    items: prevPlaylist.tracks.items.map(item =>
                                        item.track.id === track.id
                                            ? { 
                                                ...item, 
                                                track: { ...item.track, liked: false } // toggle liked on .track
                                              }
                                            : item
                                    )
                                }
                            }));
                            
                              
                }catch (error) {
                        console.error('Error: ', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                } 
        }
};

return (
        <>
        {loggedIn ? (
                <>
                        <div className="spotifySelectDiv">
                <p className={selectedPanel === "Current" ? "selected" : ""} onClick={() => setSelectedPanel("Current")}><FontAwesomeIcon icon={faMusic}></FontAwesomeIcon> Playing</p>
                <p className={selectedPanel === "Search" ? "selected" : ""} onClick={() => setSelectedPanel("Search")}><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon> Search</p>
                <p className={selectedPanel === "Playlists" ? "selected" : ""} onClick={() => setSelectedPanel("Playlists")}><FontAwesomeIcon icon={faList}></FontAwesomeIcon> Playlists</p>
                <div className="spotifySelectIndicator" data-selected={selectedPanel} />
                </div>
                <div className='spotifySelectedOutput'>
                {
                selectedPanel === "Current" ? (
                        <>
                        {isPlaying === true || currentSong !== null ? (
                                <>
                                <div className='currentSongInfo'>
                                        <div className='currentSongBorder'>
                                                <img className='currentSongImg' src={currentSong?.album.images[0].url}></img>
                                                <div className='currentSongTxt'>
                                                        <p className='currentSongTitle'>{currentSong?.name}</p>
                                                        <p className='currentSongArtist'>{currentSong?.artists[0].name}</p>
                                                </div>
                                        </div>
                                </div>
                                </>
                        ):(
                                <>
                                <div className='currentSongInfo'>
                                <p>Empty</p>
                                </div>
                                </>
                        )}
                        <div className='currentSongControls'>
                                <div className='controlsDiv'>
                                        <div className='bottControls'>
                                        <p>{progressMs !== null ? msToMinutesAndSeconds(progressMs) : "0:00"}</p>
                                        <input id="songTime" type="range" min="0" 
                                        max={currentSong?.duration_ms} value={progressMs} onChange={(e) => handleProgressChange(e.target.value)}></input>
                                        <p>{msToMinutesAndSeconds(currentSong?.duration_ms)}</p>
                                        </div>
                                        <div className='topControls'>
                                        <button onClick={toggleShuffle} className={"shuffle-" + shuffleOn}><FontAwesomeIcon icon={faShuffle}></FontAwesomeIcon></button>
                                        <button onClick={previous}><FontAwesomeIcon icon={faBackward}></FontAwesomeIcon></button>
                                        <button onClick={isPlaying ? pause : play}>
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
                                        <button className={currentSong?.liked === true ? "trackLiked" : "trackUnliked"} onClick={()=>handleToggleLike(currentSong)}>
                                                <FontAwesomeIcon icon={faHeart}></FontAwesomeIcon>
                                        </button>
                                        </div>
                                </div>
                                {!isMobile ? (
                                        <div className='volumeDiv'>
                                                <p><FontAwesomeIcon icon={faVolumeHigh}></FontAwesomeIcon></p>
                                                <input type="range" id="volume" min="0" 
                                                max="100" value={volume} onChange={(e) => handleVolumeChange(Number(e.target.value))}></input>
                                        </div>
                                ):(<div style={{ display: 'none' }}></div>
                                )}
                        </div>
                        </>
                ) : selectedPanel === "Search" ? (
                        <>
                        <div className='searchDiv'>
                                {isMobile ? (
                                        <div style={{ display: 'none' }}></div>
                                ):(
                                        <p><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon> Search Tracks</p>
                                )}
                                <div className='spotSearchOuter'>
                                        <input className='spotSearchBar' value={search} onChange={(e) => setSearch(e.target.value)}></input>
                                        <button className='spotSearchBtn' onClick={() => setSearch("")}>x</button>
                                </div>
                        </div>
                        <div className='searchResultsDiv'>
                                {searchResults.map((track, idx) => (
                                        <>
                                        <div className='songDiv' onClick={()=>handlePlayTrack(track)}>
                                        <img src={track.album.images[0].url}></img>
                                        <div className='trackMainInfo'>
                                                <p>{track.name}</p>
                                                <p>{track.artists[0].name}</p>
                                        </div>
                                        {!isMobile ? (
                                                <div className='trackAlbumName'>
                                                        <p>{track.album.name}</p>
                                                </div>
                                        ):(
                                                <div style={{ display: 'none' }}></div>
                                        )}
                                        <div className='trackLikeBtn'>
                                                <button className={track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikeSearch(track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                        </div>
                                        <div className='trackDuration'>
                                                <p>{msToMinutesAndSeconds(track.duration_ms)}</p>
                                        </div>
                                        </div>
                                        </>
                                ))
                                }
                        </div>
                        </>
                ) : selectedPanel === "Playlists" ? (
                        <>
                        <div className='playlistsDiv'>
                        {selectedPlaylist === null ? (
                                <>
                                <div className='scrollPlaylist'>
                                {playlists.map((plist, idx) => (
                                <>
                                <div className='playlistSongDiv' onClick={()=>setSelectedPlaylistId(plist.id)}>
                                        <div className='playlistImgDiv'>
                                        <img src={plist.images[0].url}></img>
                                        </div>
                                        <div className='playlistName'>
                                        <p>{plist.name}</p>
                                        </div>
                                        <div className='playlistTracks'>
                                        <p>{plist.tracks.total}</p>
                                        </div>
                                </div>
                                </>
                                ))}
                                </div>
                                </>
                        ) : (
                                <>
                                <div className='innerPlaylistDiv'>
                                <div className='playlistInfoDiv'>
                                        <button onClick={()=>setSelectedPlaylistId(null)}><FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon></button>
                                        <p>{selectedPlaylist.name} ({selectedPlaylist?.tracks?.items?.length} Songs)</p>
                                </div>
                                <div className='playlistTracksDiv'>
                                {selectedPlaylist ? selectedPlaylist?.tracks?.items?.map((track, idx) => (
                                        <>
                                        <div className='songDiv' onClick={()=>handlePlayTrack(track.track)}>
                                        <img src={track?.track?.album?.images?.[0]?.url || "/logo192.png"}></img>
                                        <div className='trackMainInfo'>
                                                <p>{track.track.name}</p>
                                                <p>{track.track.artists[0].name}</p>
                                        </div>
                                        {!isMobile ? (
                                                <div className='trackAlbumName'>
                                                        <p>{track.track.album.name}</p>
                                                </div>
                                        ):(
                                                <div style={{ display: 'none' }}></div>
                                        )}
                                        <div className='trackLikeBtn'>
                                                <button className={track?.track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikePlaylists(track.track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                        </div>
                                        <div className='trackDuration'>
                                                <p>{msToMinutesAndSeconds(track.track.duration_ms)}</p>
                                        </div>
                                        </div>
                                        </>
                                )): (
                                        <p></p>
                                )
                                }
                                </div>
                                </div>
                                </>
                        )
                        }
                        </div>
                        </>
                ) : (
                        <p></p>
                )
                }
                </div>
                </>
        ):(
                <>
                <p></p>
                </>
        )}
        </>
        );      
}

export default SpotifyPremium;
                