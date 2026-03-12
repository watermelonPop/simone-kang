import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward, faPause, faVolumeHigh, faRepeat, faShuffle, faHeart, faMusic, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../App.css'
import './SpotifyPanel.css'

interface SpotifyPremiumPanelProps {
    accessToken: string | null
    search: string
    setSearch: (search: string) => void
    searchResults: any[]
    setSearchResults: React.Dispatch<React.SetStateAction<any[]>>
    selectedPlaylist: any 
    setSelectedPlaylist: (playlist: any) => void
    playlists: any[]
    setSelectedPlaylistId: (id: string | null ) => void
    handleUnlikeSong: (track: any) => void
    handleLikeSong: (track: any) => void
    isMobile: boolean
    isPlaying: boolean
    progressMs: number
    shuffleOn: boolean
    volume: number
    repeatState: string | null
    currentSong: any 
    setCurrentSong: (song: any) => void
    loggedIn: boolean 
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

function SpotifyPremiumPanel({ accessToken, search, setSearch, searchResults, selectedPlaylist, playlists, setSelectedPlaylistId, handleUnlikeSong, handleLikeSong, setSearchResults, setSelectedPlaylist, isMobile, isPlaying, progressMs, shuffleOn, volume, repeatState, currentSong, setCurrentSong, loggedIn, pause, play, previous, next, toggleShuffle, toggleRepeatState, handleVolumeChange, handleProgressChange, msToMinutesAndSeconds }: SpotifyPremiumPanelProps){
        const navigate = useNavigate();
        const location = useLocation();
        const [selectedPanel, setSelectedPanel] = useState<string>(() => {
                const parts = location.pathname.split('/');
                const sub = parts[2]; // /Spotify/Current -> "Current"
                const valid = ['Current', 'Search', 'Playlists'];
                return valid.includes(sub) ? sub : 'Current';
        });

        useEffect(() => {
                const parts = location.pathname.split('/');
                const sub = parts[2];
                const valid = ['Current', 'Search', 'Playlists'];
                if (!valid.includes(sub)) {
                        navigate('/Spotify/Current', { replace: true });
                }
        }, []);

        useEffect(() => {
                if (search !== '') {
                        navigate(`/Spotify/Search?query=${encodeURIComponent(search)}`, { replace: true });
                        setSelectedPanel('Search');
                } else if (selectedPanel === 'Search') {
                        navigate(`/Spotify/Search`, { replace: true });
                }
        }, [search]);

        const handleSelectPanel = (page: string) => {
                setSelectedPanel(page);
                if (page === 'Search' && search !== '') {
                        navigate(`/Spotify/Search?query=${encodeURIComponent(search)}`);
                } else {
                        navigate(`/Spotify/${page}`);
                }
        };

        const handleAddToQueue = async (uri: string) => {
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

        const handlePlayTrack = async (track: any) => {
                try {
                        await handleAddToQueue(track.uri);
                        setCurrentSong(track);
                        next();
                } catch (error) {
                        console.error('Error fetching liked status for tracks:', error);
                        // Set all tracks to false in case of error
                        //ids.forEach(id => newLikedStatus[id] = false);
                }  
        };

        const handleToggleLike = async (track: any) => {
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


        const handleToggleLikeSearch = async (track: any, e: React.MouseEvent) => {
                e.stopPropagation();
                console.log("TRACK: ", track);

                try {
                        await (track.liked ? handleUnlikeSong(track) : handleLikeSong(track));

                        setSearchResults((prevResults: any[]) =>
                        prevResults.map((item: any) =>
                                item.id === track.id
                                ? { ...item, liked: !track.liked }
                                : item
                        )
                        );

                } catch (error) {
                        console.error('Error: ', error);
                }
                };


        const handleToggleLikePlaylists = async (track: any, e: React.MouseEvent) => {
                e.stopPropagation();

                console.log("TRACK: ", track);
                console.log("PLAYLIST: ", selectedPlaylist);

                if (track.liked === false) {
                        try {
                        await handleLikeSong(track);

                        setSelectedPlaylist((prevPlaylist: any) => ({
                                ...prevPlaylist,
                                tracks: {
                                ...prevPlaylist.tracks,
                                items: prevPlaylist.tracks.items.map((item: any) =>
                                        item.track.id === track.id
                                        ? {
                                                ...item,
                                                track: { ...item.track, liked: true }
                                        }
                                        : item
                                )
                                }
                        }));

                        } catch (error) {
                        console.error('Error: ', error);
                        }

                } else if (track.liked === true) {

                        try {
                        await handleUnlikeSong(track);

                        setSelectedPlaylist((prevPlaylist: any) => ({
                                ...prevPlaylist,
                                tracks: {
                                ...prevPlaylist.tracks,
                                items: prevPlaylist.tracks.items.map((item: any) =>
                                        item.track.id === track.id
                                        ? {
                                                ...item,
                                                track: { ...item.track, liked: false }
                                        }
                                        : item
                                )
                                }
                        }));

                        } catch (error) {
                        console.error('Error: ', error);
                        }
                }
                };

    return (
        <>
        {loggedIn ? (
                <>
                <div className="spotifySelectDiv">
                        <p className={selectedPanel === "Current" ? "selected" : ""} onClick={() => handleSelectPanel("Current")}><FontAwesomeIcon icon={faMusic}></FontAwesomeIcon> Playing</p>
                        <p className={selectedPanel === "Search" ? "selected" : ""} onClick={() => handleSelectPanel("Search")}><FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon> Search</p>
                        <p className={selectedPanel === "Playlists" ? "selected" : ""} onClick={() => handleSelectPanel("Playlists")}><FontAwesomeIcon icon={faList}></FontAwesomeIcon> Playlists</p>
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
                                                <div className='currentSongImgDiv'>
                                                        <img className='currentSongImg' src={currentSong?.album?.images?.[0]?.url}></img>
                                                </div>
                                                <div className='currentSongTxt'>
                                                        <p className='currentSongTitle'>{currentSong?.name}</p>
                                                        <p className='currentSongArtist'>{currentSong?.artists?.[0]?.name}</p>
                                                </div>
                                        </div>
                                </div>
                                </>
                        ):(
                                <>
                                <div className='currentSongInfo'>
                                <p className='errMess'>Sorry, Spotify SDK doesn't allow you to start listening from here!<br></br> Start a song and come back!</p>
                                </div>
                                </>
                        )}
                        <div className='currentSongControls'>
                                <div className='controlsDiv'>
                                        <div className='bottControls'>
                                        <p>{progressMs !== null ? msToMinutesAndSeconds(progressMs) : "0:00"}</p>
                                        <input id="songTime" type="range" min="0" 
                                        max={currentSong?.duration_ms} value={progressMs} onChange={(e) => handleProgressChange(Number(e.target.value))}></input>
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
                                {searchResults.map((track) => (
                                        <>
                                        <div className='songDiv' onClick={()=>handlePlayTrack(track)}>
                                        <img src={track?.album?.images?.[0]?.url}></img>
                                        <div className='trackMainInfo'>
                                                <p>{track?.name}</p>
                                                <p>{track?.artists?.[0]?.name}</p>
                                        </div>
                                        {!isMobile ? (
                                                <div className='trackAlbumName'>
                                                        <p>{track?.album?.name}</p>
                                                </div>
                                        ):(
                                                <div style={{ display: 'none' }}></div>
                                        )}
                                        <div className='trackLikeBtn'>
                                                <button className={track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikeSearch(track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                        </div>
                                        <div className='trackLikeBtn'>
                                                <p>
                                                        {track?.id === currentSong?.id ? (
                                                                <p><FontAwesomeIcon icon={faVolumeHigh}></FontAwesomeIcon></p>
                                                        ):(
                                                                <p></p>
                                                        )}
                                                </p>
                                        </div>
                                        <div className='trackDuration'>
                                                <p>{msToMinutesAndSeconds(track?.duration_ms)}</p>
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
                                {playlists.map((plist) => (
                                <>
                                <div className='playlistSongDiv' onClick={()=>setSelectedPlaylistId(plist.id)}>
                                        <div className='playlistImgDiv'>
                                        <img src={plist.images?.[0]?.url || "/logo192.png"}></img>
                                        </div>
                                        <div className='playlistName'>
                                        <p>{plist.name}</p>
                                        </div>
                                        <div className='playlistTracks'>
                                        <p>{plist.tracks?.total}</p>
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
                                {selectedPlaylist ? selectedPlaylist?.tracks?.items?.filter((item:any) => item?.track?.id != null).filter((item:any, index:any, self:any) => index === self.findIndex((t:any) => t?.track?.id === item?.track?.id)).map((track: any) => (
                                        <>
                                        <div className='songDiv' onClick={()=>handlePlayTrack(track.track)}>
                                        <img src={track?.track?.album?.images?.[0]?.url || "/logo192.png"}></img>
                                        <div className='trackMainInfo'>
                                                <p>{track?.track?.name}</p>
                                                <p>{track?.track?.artists?.[0]?.name}</p>
                                        </div>
                                        {!isMobile ? (
                                                <div className='trackAlbumName'>
                                                        <p>{track?.track?.album?.name}</p>
                                                </div>
                                        ):(
                                                <div style={{ display: 'none' }}></div>
                                        )}
                                        <div className='trackLikeBtn'>
                                                <button className={track?.track?.liked === true ? "trackLiked" : "trackUnliked"} onClick={(e)=>handleToggleLikePlaylists(track.track, e)}><FontAwesomeIcon icon={faHeart}></FontAwesomeIcon></button>
                                        </div>
                                        {!isMobile && (
                                                <div className='trackLikeBtn'>
                                                        <div>
                                                                {track?.track.id === currentSong?.id ? (
                                                                        <p><FontAwesomeIcon icon={faVolumeHigh}></FontAwesomeIcon></p>
                                                                ):(
                                                                        <p></p>
                                                                )}
                                                        </div>
                                                </div>
                                        )}
                                        <div className='trackDuration'>
                                                {isMobile && track?.track.id === currentSong?.id ? (
                                                        <p><FontAwesomeIcon icon={faVolumeHigh}></FontAwesomeIcon></p>
                                                ):(
                                                        <p>{msToMinutesAndSeconds(track?.track?.duration_ms)}</p>
                                                )}
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

export default SpotifyPremiumPanel