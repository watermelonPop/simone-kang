import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import type {Project} from '../types'
import '../App.css'
import './PortfolioPanel.css'

interface ProjectsPortfolioPanelProps {
    projects: Project[]
    isMobile: boolean
    setSelectedProject: (project: Project) => void
}

function ProjectsPortfolioPanel({ projects, setSelectedProject, isMobile }: ProjectsPortfolioPanelProps){

    return (
        <div className='portfolioContentLarge'>
        {projects ? projects.map(item=>
                <div className='portProject' onClick={(()=>setSelectedProject(item))}>
                    <div className='projectTop'>
                        <img className='projectImg' src={item ? `/projectImgs/${item.image}` : undefined} alt={item?.name || ''} />
                        <div className='projectInfo'>
                            {
                                item.front_end.length > 0 ? (
                                    <div className='imgIcon'>
                                        <img src={`/iconImgs/${item.front_end[0]}.png`}></img>
                                    </div>
                                ):(
                                    <div className='imgIcon'>
                                        <FontAwesomeIcon icon={faBan}></FontAwesomeIcon>
                                    </div>
                                )
                            }
                            {
                                item.back_end.length > 0 ? (
                                    <div className='imgIcon'>
                                        <img src={`/iconImgs/${item.back_end[0]}.png`}></img>
                                    </div>
                                ):(
                                    <div className='imgIcon'>
                                        <FontAwesomeIcon icon={faBan}></FontAwesomeIcon>
                                    </div>
                                )
                            }
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

export default ProjectsPortfolioPanel