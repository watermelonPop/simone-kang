import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCaretRight, faSquareCaretLeft, faHeart, faCircle, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import './PortfolioWidget.css';
function PortfolioWidget({projects}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState('right');

    useEffect(() => {
        if (projects.length === 0) return;
        const interval = setInterval(() => {
            handleChange((currentIndex + 1) % projects.length, 'right');
        }, 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [projects, currentIndex]);

    const handleChange = (targetIdx, dir) => {
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
    

    const handleLeftClick = (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex - 1 + projects.length) % projects.length;
        handleChange(newIndex, 'left');
    };
    
    const handleRightClick = (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex + 1) % projects.length;
        handleChange(newIndex, 'right');
    };
    const displayedProject = projects[currentIndex];
    //title
    //carousel -- changes auto every 15s, or when user swipes right/left, clicking on it changes it to the next one too
        //title, image, 
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
                            {animating ? (
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
    
    // Simple presentational card component, accepts "animation" prop for class control
    function PortfolioCard({ project, animation }) {
        return (
            <>
            <div className={`caroProjectOuter ${animation ? animation : ''}`}>
            <div className={`topCaroCard`}>
                <img className='portCaroImg' src={project ? `/projectImgs/${project.image}` : null} alt={project?.name || ''} />
                <div className='portCaroInfo'>
                    <p className='portCaroTitle'>{project?.name}</p>
                    <p className='portCaroDesc'>{project?.desc}</p>
                </div>
            </div>
                <div className='caroProjectBott'>
                    {
                        project?.framework === "static" ? (
                            <div className='imgIconCaro'>
                                <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon>
                            </div>
                        ):(
                            <div className='imgIconCaro'>
                                <img src={`/iconImgs/${project?.framework}.png`}></img>
                            </div>
                        )
                    }
                    <div className='imgIconCaro'>
                        <img src={`/iconImgs/${project?.language}.png`}></img>
                    </div>
                </div>
                </div>
            </>
        );
    }
    
    export default PortfolioWidget;