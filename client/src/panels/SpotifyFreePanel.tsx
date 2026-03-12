import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faMagnifyingGlass, faList, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../App.css'
import './SpotifyPanel.css'

interface SpotifyFreePanelProps {
    search: string
    setSearch: (search: string) => void
    searchResults: any[]
    setSearchResults: React.Dispatch<React.SetStateAction<any[]>>
    selectedPlaylist: any 
    setSelectedPlaylist: (playlist: any) => void
    setSelectedPlaylistId: (id: string | null ) => void
    handleUnlikeSong: (track: any) => void
    handleLikeSong: (track: any) => void
    playlists: any[]
    loggedIn: boolean 
    msToMinutesAndSeconds: (ms: number) => string
}


function SpotifyFreePanel({ search,setSearch,searchResults,setSearchResults,selectedPlaylist,setSelectedPlaylist,setSelectedPlaylistId,handleUnlikeSong,handleLikeSong,playlists,loggedIn,msToMinutesAndSeconds }: SpotifyFreePanelProps){
    const [selectedPanel, setSelectedPanel] = useState("Search");

    const handleToggleLikeSearch = async (track: any, e: React.MouseEvent) => {
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

    const handleToggleLikePlaylists = async (track: any, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("TRACK: ", track);
        console.log("PLAYLIST: ", selectedPlaylist);
        if(track.liked === false){
                try{
                        const val = await handleLikeSong(track);
                        setSelectedPlaylist((prevPlaylist: any) => ({
                                ...prevPlaylist,
                                tracks: {
                                    ...prevPlaylist.tracks,
                                    items: prevPlaylist.tracks.items.map((item: any) =>
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
                        setSelectedPlaylist((prevPlaylist: any) => ({
                                ...prevPlaylist,
                                tracks: {
                                    ...prevPlaylist.tracks,
                                    items: prevPlaylist.tracks.items.map((item: any) =>
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
                                {selectedPlaylist ? selectedPlaylist?.tracks?.items?.map((track: any, idx: number) => (
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

export default SpotifyFreePanel