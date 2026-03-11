import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import SpotifyPremiumPanel from './SpotifyPremiumPanel';
import SpotifyFreePanel from './SpotifyFreePanel';
import '../App.css'
import './SpotifyPanel.css'

const spotify_client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const spotify_redirect_uri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;
const spotifyApi = new SpotifyWebApi({
    clientId: spotify_client_id,
});

interface SpotifyPanelProps {
    accessToken: string | null
    loggedIn: boolean
    setLoggedIn: (logged: boolean) => void
    user: any
    setUser: (user: any) => void
    isMobile: boolean 
    isPlaying: boolean 
    progressMs: number 
    shuffleOn: boolean 
    volume: number 
    repeatState: string | null 
    currentSong: any 
    setCurrentSong: (song: any) => void
    pause: () => void
    play: () => void 
    previous: () => void 
    next: () => void 
    toggleShuffle: () => void 
    toggleRepeatState: () => void 
    handleVolumeChange: (volume: number) => void
    handleProgressChange: (progress: number) => void
    msToMinutesAndSeconds: (ms: number) => string
}

function SpotifyPanel({ accessToken, loggedIn, setLoggedIn, user, setUser, isMobile, isPlaying, progressMs, shuffleOn, volume, repeatState, currentSong, setCurrentSong, pause, play, previous, next, toggleShuffle, toggleRepeatState, handleVolumeChange, handleProgressChange, msToMinutesAndSeconds}: SpotifyPanelProps){
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${spotify_redirect_uri}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-recently-played%20user-follow-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20user-follow-modify`;
    const location = useLocation();
    const [search, setSearch] = useState<string>(() => {
        const params = new URLSearchParams(location.search);
        return params.get('query') ?? '';
    });
    const [searchType, setSearchType] = useState("tracks");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
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
                        <SpotifyPremiumPanel accessToken={accessToken} search={search} setSearch={setSearch} searchResults={searchResults} selectedPlaylist={selectedPlaylist} playlists={playlists} setSelectedPlaylistId={setSelectedPlaylistId} handleUnlikeSong={handleUnlikeSong} handleLikeSong={handleLikeSong} setSearchResults={setSearchResults} setSelectedPlaylist={setSelectedPlaylist} isMobile={isMobile} isPlaying={isPlaying} progressMs={progressMs} shuffleOn={shuffleOn} volume={volume} repeatState={repeatState} currentSong={currentSong} setCurrentSong={setCurrentSong} loggedIn={loggedIn} pause={pause} play={play} previous={previous} next={next} toggleShuffle={toggleShuffle} toggleRepeatState={toggleRepeatState} handleVolumeChange={handleVolumeChange} handleProgressChange={handleProgressChange} msToMinutesAndSeconds={msToMinutesAndSeconds} />
                        </>
                    ) :(
                        <SpotifyFreePanel search={search} setSearch={setSearch} searchResults={searchResults} setSearchResults={setSearchResults} selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} setSelectedPlaylistId={setSelectedPlaylistId} handleUnlikeSong={handleUnlikeSong} handleLikeSong={handleLikeSong} playlists={playlists} loggedIn={loggedIn} msToMinutesAndSeconds={msToMinutesAndSeconds} />
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

export default SpotifyPanel