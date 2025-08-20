import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import './LinkedinWidget.css';
function LinkedinWidget() {
    //open github in new window button
    //https://www.linkedin.com/in/simone-kang-65285228b/
    const openLinkedin = () => {
        window.open("https://www.linkedin.com/in/simone-kang-65285228b/", "_blank");
    };
    return (
        <>
        <div className='linkedinWidgetOuter'>
                <p className='linkedinTitle'>Simone's Linkedin</p>
                <div className='linkedinContent'>
                    <div className='linkedinOuter' onClick={openLinkedin}>
                        <p className='linkedinIcon'><FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon></p>
                        <p className='linkedinUser'><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon> /simone-kang-65285228b</p>
                    </div>
                </div>
        </div>
        </>
    );
}

export default LinkedinWidget;