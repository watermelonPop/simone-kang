import { useState, useEffect, useCallback } from 'react';
import './SpotifyWidget.css';
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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

function SpotifyFree({accessToken, search, setSearch, searchResults, selectedPlaylist, playlists, setSelectedPlaylistId, handleLikeSong, setSearchResults, handleUnlikeSong, setSelectedPlaylist}) {
    var spotify_redirect_uri = "http://127.0.0.1:3000";
    //sign in for spotify premium users
    //player
    //default 1 song for those who don't sign in / don't have premium
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${spotify_redirect_uri}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-recently-played%20user-follow-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20user-follow-modify`;
    const [loggedIn, setLoggedIn] = useState(false);
    const [selectedPanel, setSelectedPanel] = useState("Search");
    


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
                  <div className="spotifySelectDivFree">
                    <p
                      className={selectedPanel === "Search" ? "selected" : ""}
                      onClick={() => setSelectedPanel("Search")}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon> Search
                    </p>
                    <p
                      className={selectedPanel === "Playlists" ? "selected" : ""}
                      onClick={() => setSelectedPanel("Playlists")}
                    >
                      <FontAwesomeIcon icon={faList}></FontAwesomeIcon> Playlists
                    </p>
                    <div className="freeSpotifySelectIndicator" data-selected={selectedPanel} />
                  </div>
      
                  <div className='spotifySelectedOutput'>
                    {selectedPanel === "Search" ? (
                      <>
                        <div className='searchDiv'>
                          <p><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon> Search Tracks</p>
                          <div className='spotSearchOuter'>
                                <input className='spotSearchBar' value={search} onChange={(e) => setSearch(e.target.value)}></input>
                                <button className='spotSearchBtn' onClick={() => setSearch("")}>x</button>
                          </div>
                        </div>
                        <div className='searchResultsDiv'>
                          {searchResults.map((track, idx) => (
                            <div className='songDiv' key={track.id || idx}>
                              <img src={track.album.images[0].url} alt={track.name}></img>
                              <div className='trackMainInfo'>
                                <p>{track.name}</p>
                                <p>{track.artists[0].name}</p>
                              </div>
                              <div className='trackAlbumName'>
                                <p>{track.album.name}</p>
                              </div>
                              <div className='trackLikeBtn'>
                                        <button className={track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikeSearch(track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                </div>
                              <div className='trackDuration'>
                                <p>{msToMinutesAndSeconds(track.duration_ms)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : selectedPanel === "Playlists" ? (
                      <>
                        <div className='playlistsDiv'>
                          {selectedPlaylist === null ? (
                            <div className='scrollPlaylist'>
                              {playlists.map((plist, idx) => (
                                <div className='playlistSongDiv' key={plist.id || idx} onClick={() => setSelectedPlaylistId(plist.id)}>
                                  <div className='playlistImgDiv'>
                                    <img src={plist.images[0].url} alt={plist.name}></img>
                                  </div>
                                  <div className='playlistName'>
                                    <p>{plist.name}</p>
                                  </div>
                                  <div className='playlistTracks'>
                                    <p>{plist.tracks.total}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='innerPlaylistDiv'>
                              <div className='playlistInfoDiv'>
                                <button onClick={() => setSelectedPlaylistId(null)}>
                                  <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                                </button>
                                <p>{selectedPlaylist.name} ({selectedPlaylist?.tracks?.items?.length} Songs)</p>
                              </div>
                              <div className='playlistTracksDiv'>
                                {selectedPlaylist ? selectedPlaylist?.tracks?.items?.map((track, idx) => (
                                  <div className='songDiv' key={track.track.id || idx}>
                                    <img src={track?.track?.album?.images?.[0]?.url || "/logo192.png"} alt={track.track.name}></img>
                                    <div className='trackMainInfo'>
                                      <p>{track.track.name}</p>
                                      <p>{track.track.artists[0].name}</p>
                                    </div>
                                    <div className='trackAlbumName'>
                                      <p>{track.track.album.name}</p>
                                    </div>
                                    <div className='trackLikeBtn'>
                                                <button className={track?.track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikePlaylists(track.track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                        </div>
                                    <div className='trackDuration'>
                                      <p>{msToMinutesAndSeconds(track.track.duration_ms)}</p>
                                    </div>
                                  </div>
                                )) : (
                                  <p></p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p></p>
                    )}
                  </div>
                </>
              ) : null}
        </>
      );      
}

export default SpotifyFree;
