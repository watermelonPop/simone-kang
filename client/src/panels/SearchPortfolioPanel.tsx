import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { faGithub} from '@fortawesome/free-brands-svg-icons';
import SelectedProjectPortfolioPanel from './SelectedProjectPortfolioPanel'
import type {Project} from '../types'
import '../App.css'
import './PortfolioPanel.css'

interface SearchPortfolioPanelProps {
    debouncedSearch: string
    isMobile: boolean
    selectedProject: Project | null
    setSelectedProject: (project: Project | null) => void
}

function SearchPortfolioPanel({ debouncedSearch, isMobile, selectedProject, setSelectedProject }: SearchPortfolioPanelProps){
    const [searchResults, setSearchResults] = useState<Project[]>([]);
    //const [selectedSearchResult, setSelectedSearchResult] = useState<Project | null>(null);

    useEffect(() => {
        if (debouncedSearch === "" || !debouncedSearch) {
            setSearchResults([]);
            return; // ✅ Prevent running search calls when search is empty
        }

        const doSearch = async () => {
                try {
                        const response = await fetch(`/api/projects/search?q=${debouncedSearch}`, {
                        method: "GET",
                        });
        
                        if (!response.ok) {
                        throw new Error('Failed to grab projects');
                        }
                        const data = await response.json();
                        console.log(data);
                        setSearchResults(data);
                } catch (err) {
                        console.error('Error:', err);
                }
        };


        doSearch();
            
    }, [debouncedSearch]);

    return (
    <>
    {selectedProject === null ? (
            <div className='portfolioContentLarge'>
            {searchResults ? searchResults.map(item=>
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
                                            <p>
                                                <FontAwesomeIcon icon={faBan}></FontAwesomeIcon>
                                            </p>
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
                                            <p>
                                                <FontAwesomeIcon icon={faBan}></FontAwesomeIcon>
                                            </p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className='projectBott'>
                            <p>{item.name}</p>
                            {!isMobile ? (
                                    <p>{item.desc}</p>
                            ):(
                                    <div style={{ display: 'none' }}></div>
                            )}
                        </div>
                    </div>
                ): ""}
            </div>
    ):(
        <SelectedProjectPortfolioPanel selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
    )
    }
    </>
    );
}

export default SearchPortfolioPanel