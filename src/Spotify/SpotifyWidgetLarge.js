import { useState, useEffect, useCallback } from 'react';
import './SpotifyWidget.css';
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import axios from "axios";
import SpotifyFree from './SpotifyFree';
import SpotifyPremium from './SpotifyPremium';
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

function SpotifyWidgetLarge({accessToken, isMobile}) {
    var spotify_redirect_uri = "https://simone-kang.vercel.app";
    //sign in for spotify premium users
    //player
    //default 1 song for those who don't sign in / don't have premium
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${spotify_redirect_uri}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-recently-played%20user-follow-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20user-follow-modify`;
    const [loggedIn, setLoggedIn] = useState(false);
    const [selectedPanel, setSelectedPanel] = useState("Current");
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState("tracks");
    const [searchResults, setSearchResults] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [user, setUser] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400); // 400ms delay after user stops typing
    
        return () => clearTimeout(delayDebounce);
    }, [search]);

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
        if (debouncedSearch === "" || !debouncedSearch) {
            setSearchResults([]);
            return; // ✅ Prevent running search calls when search is empty
        }
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        const doSearch = async () => {
            try{
                if (searchType === "tracks") {
                    const data = await spotifyApi.searchTracks(search, { limit: 50 });
                    let items = data.body.tracks.items;
                
                    // Remove duplicates by track ID
                    const seen = new Set();
                    items = items.filter(track => {
                      if (seen.has(track.id)) {
                        return false;
                      } 
                      seen.add(track.id);
                      return true;
                    });
                
                    const ids = items.map(track => track.id).filter(Boolean);
                    const chunkedIds = [];
                    for (let i = 0; i < ids.length; i += 50) {
                      chunkedIds.push(ids.slice(i, i + 50));
                    }
                    const likedStatusChunks = await Promise.all(
                      chunkedIds.map(chunk => checkIfLiked(chunk))
                    );
                    const likedStatusArray = likedStatusChunks.flat();
                    const itemsWithLiked = items.map((item, i) => ({
                      ...item,
                      liked: likedStatusArray[i],
                    }));
                    setSearchResults(itemsWithLiked);
                }
                
            } catch (err) {
                console.error(err);
                setSearchResults([]); // Optionally clear results on error
            }
        };

        doSearch();
        
    }, [debouncedSearch, accessToken, searchType]);


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


    useEffect(() => {
        if (!accessToken || !user || !user.id) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
        
        const fetchPlaylists = async () => {
                spotifyApi.getUserPlaylists(user.id)
                .then(function(data) {
                        console.log('Retrieved playlists', data.body);
                        //alert(data.body.items);
                        setPlaylists(data.body.items);
                },function(err) {
                        console.log('Something went wrong!', err);
                });
        };
        
        fetchPlaylists();
    }, [accessToken, user]);


    useEffect(() => {
        if (!accessToken) return;
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }

        if(selectedPlaylistId === null){
            setSelectedPlaylist(null);
            return;
        }
        
        const fetchSelectedPlaylist = async () => {
            try {
                // Get initial playlist data (includes first 100 tracks)
                const playlistResponse = await spotifyApi.getPlaylist(selectedPlaylistId, { limit: 100, offset: 0 });
                const playlist = playlistResponse.body;
                let allTracks = [...playlist.tracks.items];
        
                const total = playlist.tracks.total;
                let offset = allTracks.length;
        
                // Fetch additional tracks as needed
                while (offset < total) {
                    const pagedTracks = await spotifyApi.getPlaylistTracks(selectedPlaylistId, { limit: 100, offset });
                    allTracks = allTracks.concat(pagedTracks.body.items);
                    offset += pagedTracks.body.items.length;
                }
        
                // Gather all track IDs (filter out missing/invalid tracks)
                const trackIds = allTracks
                    .map(item => item.track && item.track.id)
                    .filter(Boolean);
        
                // Check liked status in batches of 50
                let likedStatusArray = [];
                for (let i = 0; i < trackIds.length; i += 50) {
                    const batch = trackIds.slice(i, i + 50);
                    const likedStatus = await checkIfLiked(batch);
                    likedStatusArray = likedStatusArray.concat(likedStatus);
                }
        
                // Add 'liked' property to each track object
                allTracks = allTracks.map((item, i) => ({
                    ...item,
                    track: {
                        ...item.track,
                        liked: likedStatusArray[i]
                    }
                }));
        
                // Set the updated playlist (with all tracks and liked status)
                setSelectedPlaylist({
                    ...playlist,
                    tracks: {
                        ...playlist.tracks,
                        items: allTracks
                    }
                });
        
                console.log('Retrieved FULL playlist', playlist.name, 'Total tracks:', allTracks.length);
            } catch (err) {
                console.log('Something went wrong!', err);
            }
        };
        
        
        fetchSelectedPlaylist();
    }, [accessToken, selectedPlaylistId]);


    const checkIfLiked = async (ids) => {
        //max: 50
        try {
                const idsStr = ids.join(',');
    
            const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${idsStr}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            if (!response.ok) {
                throw new Error('Failed to check liked songs');
            }
    
            const data = await response.json();
            return data;
            
        } catch (err) {
            console.error('Error fetching liked status:', err);
            return ids.map(() => false); // Return an array of false values if there's an error
        }
    };

    const handleUnlikeSong = async (track) => {
        if (!spotifyApi.getAccessToken()) {
            console.warn("Spotify access token is missing");
            return;
        }
    
        try {
            await spotifyApi.removeFromMySavedTracks([track.id]);
        } catch (err) {
            console.log('Something went wrong!', err);
        }
};

const handleLikeSong = async (track) => {
        spotifyApi.addToMySavedTracks([track.id])
        .then(function(data) {
        }, function(err) {
                console.log('Something went wrong!', err);
        });
};



    return (
        <>
        <div className='spotifyWidgetOuter'>
                <p className='spotifyTitle'><FontAwesomeIcon icon={faSpotify}></FontAwesomeIcon>Spotify</p>
                <div className='spotifyContent'>
                {loggedIn ? (
                    <>
                    {user?.product === "premium" ? (
                        <>
                        <SpotifyPremium accessToken={accessToken} search={search} setSearch={setSearch} setSearchResults={setSearchResults} searchResults={searchResults} selectedPlaylist={selectedPlaylist} playlists={playlists} setSelectedPlaylistId={setSelectedPlaylistId} checkIfLiked={checkIfLiked} handleUnlikeSong={handleUnlikeSong} handleLikeSong={handleLikeSong} setSelectedPlaylist={setSelectedPlaylist} isMobile={isMobile}/>
                        </>
                    ) :(
                        <SpotifyFree accessToken={accessToken} search={search} setSearch={setSearch} searchResults={searchResults} selectedPlaylist={selectedPlaylist} playlists={playlists} setSelectedPlaylistId={setSelectedPlaylistId} handleLikeSong={handleLikeSong} setSearchResults={setSearchResults} handleUnlikeSong={handleUnlikeSong} setSelectedPlaylist={setSelectedPlaylist}/>
                    )
                    }
                    </>
                )
                : (
                    <div className='spotifyLoginOuter'>
                        <a className='spotifyLoginBtn' href={AUTH_URL}>Log In With Spotify</a>
                    </div>
                )}
                </div>
        </div>
        </>
    );
}

export default SpotifyWidgetLarge;
