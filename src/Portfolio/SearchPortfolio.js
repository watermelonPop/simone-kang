import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faCircle, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import './PortfolioWidget.css';

function SearchPortfolio({debouncedSearch, isMobile}) {
        const [searchResults, setSearchResults] = useState([]);
        const [selectedSearchResult, setSelectedSearchResult] = useState(null);
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
                {selectedSearchResult === null ? (
                        <div className='portfolioContentLarge'>
                        {searchResults ? searchResults.map(item=>
                                <div className='portProject' onClick={(()=>setSelectedSearchResult(item))}>
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
                        <div className='selectedProjectOuter'>
                                <div className='selectedProjectHeader'>
                                        <button onClick={()=>setSelectedSearchResult(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                                        <p>{selectedSearchResult.name}</p>
                                </div>
                                <div className='selectedProjectBott'>
                                        <div className='imgInfoDiv'>
                                                <img src={selectedSearchResult ? `/projectImgs/${selectedSearchResult.image}` : null} alt={selectedSearchResult?.name || ''}/>
                                                <div className='langOuterDiv'>
                                                        <div className='langLabelDiv'>
                                                                <p>Language: </p>
                                                                <p>Framework: </p>
                                                                <p>Github: </p>
                                                                <p>Demo: </p>
                                                        </div>
                                                        <div className='langImgDiv'>
                                                                <div className='langImgIcon'>
                                                                        <img src={`/iconImgs/${selectedSearchResult.language}.png`}></img>
                                                                </div>
                                                                {selectedSearchResult.framework !== "static" ? (
                                                                        <div className='langImgIcon'>
                                                                                <img src={`/iconImgs/${selectedSearchResult.framework}.png`}></img>
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
                                                                <p>{selectedSearchResult.language}</p>
                                                                <p>{selectedSearchResult.framework}</p>
                                                                <a href={selectedSearchResult.github_link} target="_blank">Link</a>
                                                                <a href={selectedSearchResult.demo_link} target="_blank">Link</a>
                                                        </div>
                                                </div>
                                        </div>
                                        {!isMobile ? (
                                                <p className='projectDesc'>{selectedSearchResult.desc}</p>
                                        ):(
                                                <div style={{ display: 'none' }}></div>
                                        )}
                                </div>
                        </div>
                )
                }
        </>
    );
}

export default SearchPortfolio;
