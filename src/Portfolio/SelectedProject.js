import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircle, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './PortfolioWidget.css';

function SelectedProject({selectedProject, setSelectedProject}) {
    return (
        <>
        <div className='selectedProjectOuter'>
                <div className='selectedProjectHeader'>
                        <button onClick={()=>setSelectedProject(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                        <p className='selectedProjectTitle'>{selectedProject.name}</p>
                </div>
                <div className='selectedProjectBott'>
                        <div className='imgInfoDiv'>
                                <img className='imgInfoDivImg' src={selectedProject ? `/projectImgs/${selectedProject.image}` : null} alt={selectedProject?.name || ''}/>
                                <div className='langOuterDiv'>
                                        <div className='langLabelDiv'>
                                                <p>Language: </p>
                                                <p>Framework: </p>
                                                <p>Github: </p>
                                                <p>Demo: </p>
                                        </div>
                                        <div className='langImgDiv'>
                                                <div className='langImgIcon'>
                                                        <img src={`/iconImgs/${selectedProject.language}.png`}></img>
                                                </div>
                                                {selectedProject.framework !== "static" ? (
                                                        <div className='langImgIcon'>
                                                                <img src={`/iconImgs/${selectedProject.framework}.png`}></img>
                                                        </div>
                                                ):(
                                                        <div className='langImgIcon'>
                                                                <p><FontAwesomeIcon icon={faCircle}></FontAwesomeIcon></p>
                                                        </div>
                                                )}
                                                <div className='langImgIcon'>
                                                        <p>
                                                                <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
                                                        </p>
                                                </div>
                                                <div className='langImgIcon'>
                                                        <p>
                                                                <FontAwesomeIcon icon={faLaptopCode}></FontAwesomeIcon>
                                                        </p>
                                                </div>
                                        </div>
                                        <div className='langInfoDiv'>
                                                <p>{selectedProject.language}</p>
                                                <p>{selectedProject.framework}</p>
                                                <a href={selectedProject.github_link} target="_blank">Link</a>
                                                <a href={selectedProject.demo_link} target="_blank">Link</a>
                                        </div>
                                </div>
                        </div>
                        <p className='projectDesc'>{selectedProject.desc}</p>
                </div>
        </div>
        </>
    );
}

export default SelectedProject;
