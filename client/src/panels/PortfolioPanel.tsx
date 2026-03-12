import { useState, useEffect} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import type {Project} from '../types'
import SearchPortfolioPanel from './SearchPortfolioPanel';
import ProjectsPortfolioPanel from './ProjectsPortfolioPanel';
import SelectedProjectPortfolioPanel from './SelectedProjectPortfolioPanel';
import '../App.css'
import './PortfolioPanel.css'

interface PortfolioPanelProps {
    projects: Project[] 
    isMobile: boolean
}

function PortfolioPanel({ projects, isMobile }: PortfolioPanelProps){
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    const parts = location.pathname.split('/');
    const projectSlug = parts[2]; // /Portfolio/Project-Name
        if (projectSlug && projects.length > 0) {
            return projects.find(p => p.name.replace(/\s+/g, '-') === projectSlug) ?? null;
        }
        return null;
    });

    const [search, setSearch] = useState<string>(() => {
        const params = new URLSearchParams(location.search);
        return params.get('query') ?? '';
    });

    const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400); // 400ms delay after user stops typing
    
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        if (selectedProject !== null) {
            const slug = selectedProject.name.replace(/\s+/g, '-');
            navigate(`/Portfolio/${slug}`, { replace: true });
        } else if (search !== '') {
            navigate(`/Portfolio?query=${encodeURIComponent(search)}`, { replace: true });
        } else {
            navigate('/Portfolio', { replace: true });
        }
    }, [selectedProject, search]);

    useEffect(() => {
        if (projects.length === 0 || selectedProject !== null) return;
        const parts = location.pathname.split('/');
        const projectSlug = parts[2];
        if (projectSlug) {
            const match = projects.find(p => p.name.replace(/\s+/g, '-') === projectSlug);
            if (match) setSelectedProject(match);
        }
    }, [projects]);

    return (
        <>
            <div className='portfolioWidgetOuterLarge'>
                <div className='portfolioTitleLarge'>
                    <p>{isMobile ? "Portfolio" : "Simone's Portfolio"}</p>
                    <div className='portSearchOuter'>
                        <input className='portSearchBar' placeholder="Search project names, languages, or frameworks" type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        <button className='portSearchBtn' onClick={()=>setSearch("")}>x</button>
                    </div>
                </div>
                <div className='portfolioContentOuterCond'>
                    {selectedProject !== null ? (
                        <SelectedProjectPortfolioPanel selectedProject={selectedProject} setSelectedProject={setSelectedProject} isMobile={isMobile}/>
                    ) : search !== "" ? (
                        <SearchPortfolioPanel debouncedSearch={debouncedSearch} isMobile={isMobile} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                    ) : (
                        <ProjectsPortfolioPanel projects={projects} setSelectedProject={setSelectedProject} isMobile={isMobile}/>
                    )}
                </div>
            </div>
        </>
    );
}

export default PortfolioPanel