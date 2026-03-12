import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import '../App.css'
import './GithubPanel.css'
interface GithubPanelProps {
    isMobile: boolean
}

function GithubPanel({isMobile} : GithubPanelProps){
    const openGithub = () => {
        window.open("https://github.com/watermelonPop", "_blank");
    };

    return (
        <>
        <div className='githubWidgetOuter'>
                <p className='githubTitle'>{isMobile ? "Github" : "Simone's Github"}</p>
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

export default GithubPanel