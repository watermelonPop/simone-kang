import { useState, useEffect, useRef } from 'react'
import SpotifyWebApi from "spotify-web-api-node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import '../App.css'
import './SpotifyWidget.css'

const spotify_client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const spotifyApi = new SpotifyWebApi({
    clientId: spotify_client_id,
});

interface SpotifyWidgetProps {
    accessToken: string | null
    currentSong: any
}

function SpotifyWidget({ accessToken, currentSong }: SpotifyWidgetProps){

    return (
        <>
        {!currentSong || !accessToken ? (
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

export default SpotifyWidget