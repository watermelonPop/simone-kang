import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import '../App.css'
import './LinkedinPanel.css'
interface LinkedinPanelProps {
    isMobile: boolean
}

function LinkedinPanel({isMobile}: LinkedinPanelProps){
    const openLinkedin = () => {
        window.open("https://www.linkedin.com/in/simone-kang", "_blank");
    };

    return (
        <>
        <div className='linkedinWidgetOuter'>
                <p className='linkedinTitle'>{isMobile ? "Linkedin" : "Simone's Linkedin"}</p>
                <div className='linkedinContent'>
                    <div className='linkedinOuter' onClick={openLinkedin}>
                        <p className='linkedinIcon'><FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon></p>
                        <p className='linkedinUser'><FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon> /simone-kang</p>
                    </div>
                </div>
        </div>
        </>
    );
}

export default LinkedinPanel