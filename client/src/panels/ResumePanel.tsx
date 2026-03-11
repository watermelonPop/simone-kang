import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare,faFile  } from '@fortawesome/free-solid-svg-icons';
import '../App.css'
import './ResumePanel.css'

interface ResumePanelProps {
    isMobile: boolean
}

function ResumePanel({ isMobile }: ResumePanelProps){

    return (
        <>
        <div className='resumeWidgetOuter'>
                <p className='resumeTitle'>{isMobile ? "Resume" : "Simone's Resume"}</p>
                <div className='resumeContentDiv'>
                    {isMobile ? (
                        <div className='githubOuter' onClick={() => window.open('resume.pdf', '_blank', 'noopener,noreferrer')}>
                            <p className='githubIcon'><FontAwesomeIcon icon={faFile}></FontAwesomeIcon></p>
                            <p className='githubUser'><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>Resume PDF</p>
                        </div>
                    ) : (
                        <>
                        <div className='iframeOuter'>
                            <iframe id="inlineFrameExample" 
                                src="resume.pdf#toolbar=0&navpanes=0"> 
                            </iframe> 
                        </div>
                        <div className='openResumeBtn'>
                            <button onClick={() => window.open('resume.pdf', '_blank', 'noopener,noreferrer')}><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>Resume PDF</button>
                        </div>
                        </>
                    )}
                </div>
        </div>
        </>
    );
}

export default ResumePanel