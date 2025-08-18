import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import './PortfolioWidget.css';

function AllProjects({projects, setSelectedProject, isMobile}) {

    return (
        <div className='portfolioContentLarge'>
        {projects ? projects.map(item=>
                <div className='portProject' onClick={(()=>setSelectedProject(item))}>
                    <div className='projectTop'>
                        <img className='projectImg' src={item ? `/projectImgs/${item.image}` : null} alt={item?.name || ''} />
                        <div className='projectInfo'>
                            {
                                item.framework === "static" ? (
                                    <div className='imgIcon'>
                                        <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon>
                                    </div>
                                ):(
                                    <div className='imgIcon'>
                                        <img src={`/iconImgs/${item.framework}.png`}></img>
                                    </div>
                                )
                            }
                            <div className='imgIcon'>
                                <img src={`/iconImgs/${item.language}.png`}></img>
                            </div>
                        </div>
                    </div>
                    <div className='projectBott'>
                        <p className='projectCardTitle'>{item.name}</p>
                        {!isMobile ? (
                                <p>{item.desc}</p>
                        ):(
                                <div style={{ display: 'none' }}></div>
                        )}
                    </div>
                </div>
            ): ""}
        </div>
    );
}

export default AllProjects;
