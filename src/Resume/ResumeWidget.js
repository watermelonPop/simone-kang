import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import './ResumeWidget.css';
function ResumeWidget({isMobile}) {
    //displays resume pdf
    //download button
    //open pdf in new window
    return (
        <>
        <div className='resumeWidgetOuter'>
                <p className='resumeTitle'>Simone's Resume</p>
                <div className='resumeContentDiv'>
                    {isMobile ? (
                        <div className='githubOuter' onClick={() => window.open('resume.pdf', '_blank', 'noopener,noreferrer')}>
                            <p className='githubIcon'><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></p>
                            <p className='githubUser'><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>Resume PDF</p>
                        </div>
                    ) : (
                        <div className='iframeOuter'>
                        <iframe id="inlineFrameExample" 
                            src="resume.pdf"> 
                        </iframe> 
                        </div>
                    )}
                </div>
        </div>
        </>
    );
}

export default ResumeWidget;