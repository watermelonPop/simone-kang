import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import './PortfolioWidget.css';
import AllProjects from './AllProjects';
import SelectedProject from './SelectedProject';
import SearchPortfolio from './SearchPortfolio';
function PortfolioWidgetLarge({projects, isMobile}) {
    const [selectedProject, setSelectedProject] = useState(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchType, setSearchType] = useState("Name");
    //grid of portfolio projects
        //title, image, languages, framework, team/individual, demo link, github link

        useEffect(() => {
            const delayDebounce = setTimeout(() => {
                setDebouncedSearch(search);
            }, 400); // 400ms delay after user stops typing
        
            return () => clearTimeout(delayDebounce);
        }, [search]);

    return (
        <>
        <div className='portfolioWidgetOuterLarge'>
                <div className='portfolioTitleLarge'>
                    <p>Simone's Portfolio</p>
                    <div className='portSearchOuter'>
                        <input className='portSearchBar' placeholder="Search project names, languages, or frameworks" type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        <button className='portSearchBtn' onClick={()=>setSearch("")}>x</button>
                    </div>
                </div>
                <div className='portfolioContentOuterCond'>
                    {search !== "" ? (
                        <SearchPortfolio debouncedSearch={debouncedSearch} isMobile={isMobile}/>
                    ):(
                        <>
                        {selectedProject === null ? (
                            <AllProjects projects={projects} setSelectedProject={setSelectedProject} isMobile={isMobile}/>
                        ):(
                            <SelectedProject selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                        )}
                        </>
                    )
                    }
                </div>
        </div>
        </>
    );
}

export default PortfolioWidgetLarge;
