import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faSquareCaretLeft, faSquareCaretRight, faHeart } from '@fortawesome/free-solid-svg-icons';
import type {Project} from '../types'
import '../App.css'
import './PortfolioWidget.css'

interface PortfolioWidgetProps {
    projects: Project[]
}

function PortfolioWidget({ projects }: PortfolioWidgetProps){
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [nextIndex, setNextIndex] = useState<number | null>(null);
    const [animating, setAnimating] = useState<boolean>(false);
    const [direction, setDirection] = useState<string>('right');

    useEffect(() => {
        if (projects.length === 0) return;
        const interval = setInterval(() => {
            handleChange((currentIndex + 1) % projects.length, 'right');
        }, 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [projects, currentIndex]);

    const handleChange = (targetIdx: number, dir: string) => {
        if (animating) return;
        setNextIndex(targetIdx);
        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex(targetIdx);
            setNextIndex(null);
            setAnimating(false);
        }, 400);
    };
    

    const handleLeftClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newIndex = (currentIndex - 1 + projects.length) % projects.length;
        handleChange(newIndex, 'left');
    };

    const handleRightClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newIndex = (currentIndex + 1) % projects.length;
        handleChange(newIndex, 'right');
    };

    return (
        <>
            <div className='portfolioWidgetOuter'>
                <p className='portfolioTitle'><FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon> Simone's Portfolio</p>
                <div className='portfolioContent'>
                    <button className='portfolioBtns' onClick={handleLeftClick}>
                        <FontAwesomeIcon icon={faSquareCaretLeft} />
                    </button>
                    <div className='portCaro'>
                    <div className="portCaroCardStack">
                        {animating && nextIndex !== null ? (
                            <>
                            <PortfolioCard
                                project={projects[currentIndex]}
                                animation={direction === 'right' ? 'slideOutLeft' : 'slideOutRight'}
                                key={currentIndex + '-out'}
                            />
                            <PortfolioCard
                                project={projects[nextIndex]}
                                animation={direction === 'right' ? 'slideInRight' : 'slideInLeft'}
                                key={nextIndex + '-in'}
                            />
                            </>
                        ) : (
                            <PortfolioCard
                            project={projects[currentIndex]}
                            key={currentIndex}
                            />
                        )}
                        </div>

                        <p className='caroTracker'>
                            {projects.map((_, i) => (
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    key={i}
                                    style={{ opacity: i === currentIndex ? 1 : 0.3 }}
                                />
                            ))}
                        </p>
                    </div>
                    <button className='portfolioBtns' onClick={handleRightClick}>
                        <FontAwesomeIcon icon={faSquareCaretRight} />
                    </button>
                </div>
            </div>
        </>
    );
}

interface PortfolioCardProps {
    project: Project 
    animation?: string
}

function PortfolioCard({ project, animation }: PortfolioCardProps) {
    return (
        <>
        <div className={`caroProjectOuter ${animation ? animation : ''}`}>
        <div className={`topCaroCard`}>
            <img className='portCaroImg' src={project ? `/projectImgs/${project.image}` : undefined} alt={project?.name || ''} />
            <div className='portCaroInfo'>
                <p className='portCaroTitle'>{project?.name}</p>
                <p className='portCaroDesc'>{project?.desc}</p>
            </div>
        </div>
            <div className='caroProjectBott'>
                {project && project.front_end.length > 0 && (
                    project.front_end.map((tech: string) => 
                        <div className='imgIconCaro'>
                            <img src={`/iconImgs/${tech}.png`}></img>
                        </div>
                    )
                )}
                {project && project.back_end.length > 0 && (
                    project.back_end.map((tech: string) => 
                        <div className='imgIconCaro'>
                            <img src={`/iconImgs/${tech}.png`}></img>
                        </div>
                    )
                )}
            </div>
            </div>
        </>
    );
}

export default PortfolioWidget