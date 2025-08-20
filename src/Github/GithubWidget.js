import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import './GithubWidget.css';
function GithubWidget() {
    //open github in new window button

    const openGithub = () => {
        window.open("https://github.com/watermelonPop", "_blank");
    };

    return (
        <>
        <div className='githubWidgetOuter'>
                <p className='githubTitle'>Simone's Github</p>
                <div className='githubContent'>
                    <div className='githubOuter' onClick={openGithub}>
                        <p className='githubIcon'><FontAwesomeIcon icon={faGithub}></FontAwesomeIcon></p>
                        <p className='githubUser'><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>@watermelonPop</p>
                    </div>
                </div>
        </div>
        </>
    );
}

export default GithubWidget;