import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faArrowLeft, faLaptopCode, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import type {Project} from '../types'
import '../App.css'
import './PortfolioPanel.css'

function MobileExpandable({ isOpen, children }: { isOpen: boolean, children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (!ref.current) return;
        if (isOpen) {
            setHeight(ref.current.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <div style={{
            height: `${height}px`,
            overflow: 'hidden',
            transition: 'height 0.4s ease',
            width: '100%',
        }}>
            <div ref={ref} style={{ paddingBottom: '1rem' }}>
                {children}
            </div>
        </div>
    );
}

interface SelectedProjectPortfolioPanelProps {
    selectedProject: Project | null
    setSelectedProject: (project: Project | null) => void
    isMobile: boolean
}

function SelectedProjectPortfolioPanel({ selectedProject, setSelectedProject, isMobile }: SelectedProjectPortfolioPanelProps){
    const [frontEndExpanded, setFrontEndExpanded] = useState(false);
    const [backEndExpanded, setBackEndExpanded] = useState(false);

    const frontEndList = selectedProject?.front_end ?? [];
    const backEndList = selectedProject?.back_end ?? [];

    const gridRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [gridHeight, setGridHeight] = useState<number>(0);

    useEffect(() => {
        if (!gridRef.current) return;
        
        const el = gridRef.current;
        
        // Measure natural height without disrupting the current rendered height
        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.height = 'auto';
        clone.style.width = `${el.offsetWidth}px`;
        document.body.appendChild(clone);
        const naturalHeight = clone.scrollHeight;
        document.body.removeChild(clone);
        
        setGridHeight(naturalHeight);
    }, [frontEndExpanded, backEndExpanded, selectedProject]);

    useEffect(() => {
        setFrontEndExpanded(false);
        setBackEndExpanded(false);
    }, [selectedProject]);

    return (
        <>
        <div className='selectedProjectOuter'>
                <div className='selectedProjectHeader'>
                        <button onClick={()=>setSelectedProject(null)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                        <p className='selectedProjectTitle'>{selectedProject?.name}</p>
                </div>
                <div className='selectedProjectBott'>
                        <div className='imgInfoDiv'>
                            <img className='imgInfoDivImg' ref={imgRef} src={selectedProject ? `/projectImgs/${selectedProject.image}` : undefined} alt={selectedProject?.name || ''}/>
                            <div className='langOuterDiv' ref={gridRef} style={isMobile ? {} : { height: `${gridHeight}px` }}>

                                {/* Front End */}
                                <div className='infoOuterRow' key={`fe-0`}>
                                    <p className='infoLabel'>{frontEndList.length > 0 ? 'Front-End:' : ''}</p>
                                    <div className='outerAfter'>
                                        <div className='infoIcon'>
                                            {frontEndList.length > 0
                                                ? <img src={`/iconImgs/${frontEndList[0]}.png`} alt={frontEndList[0]} />
                                                : <p><FontAwesomeIcon icon={faBan} /></p>}
                                        </div>
                                        <div className='infoValue'>
                                            {frontEndList.length > 1 && (
                                                <button className='expandBtn' onClick={() => setFrontEndExpanded(e => !e)}>
                                                    <FontAwesomeIcon icon={frontEndExpanded ? faCaretDown : faCaretRight} />
                                                </button>
                                            )}
                                            {frontEndList.length > 0 ? frontEndList[0] : 'None'}
                                            {!frontEndExpanded && frontEndList.length > 1 && ` +${frontEndList.length - 1}`}
                                        </div>
                                    </div>
                                </div>
                                {frontEndList.length > 1 && (
                                    isMobile ? (
                                        <MobileExpandable isOpen={frontEndExpanded}>
                                            {frontEndList.slice(1).map((tech, i) => (
                                                <div className='infoOuterRow' key={`fe-${i + 1}`}>
                                                    <p className='infoLabel'></p>
                                                    <div className='outerAfter'>
                                                        <div className='infoIcon'>
                                                            <img src={`/iconImgs/${tech}.png`} alt={tech} />
                                                        </div>
                                                        <div className='infoValue'>{tech}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </MobileExpandable>
                                    ) : (
                                        frontEndExpanded && frontEndList.slice(1).map((tech, i) => (
                                            <div className='infoOuterRow' key={`fe-${i + 1}`}>
                                                <p className='infoLabel'></p>
                                                <div className='outerAfter'>
                                                    <div className='infoIcon'>
                                                        <img src={`/iconImgs/${tech}.png`} alt={tech} />
                                                    </div>
                                                    <div className='infoValue'>{tech}</div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}

                                {/* Back End */}
                                <div className='infoOuterRow' key={`be-0`}>
                                    <p className='infoLabel'>{backEndList.length > 0 ? 'Back-End:' : ''}</p>
                                    <div className='outerAfter'>
                                        <div className='infoIcon'>
                                            {backEndList.length > 0
                                                ? <img src={`/iconImgs/${backEndList[0]}.png`} alt={backEndList[0]} />
                                                : <p><FontAwesomeIcon icon={faBan} /></p>}
                                        </div>
                                        <div className='infoValue'>
                                            {backEndList.length > 1 && (
                                                <button className='expandBtn' onClick={() => setBackEndExpanded(e => !e)}>
                                                    <FontAwesomeIcon icon={backEndExpanded ? faCaretDown : faCaretRight} />
                                                </button>
                                            )}
                                            {backEndList.length > 0 ? backEndList[0] : 'None'}
                                            {!backEndExpanded && backEndList.length > 1 && ` +${backEndList.length - 1}`}
                                        </div>
                                    </div>
                                </div>
                                {backEndList.length > 1 && (
                                    isMobile ? (
                                        <MobileExpandable isOpen={backEndExpanded}>
                                            {backEndList.slice(1).map((tech, i) => (
                                                <div className='infoOuterRow' key={`be-${i + 1}`}>
                                                    <p className='infoLabel'></p>
                                                    <div className='outerAfter'>
                                                        <div className='infoIcon'>
                                                            <img src={`/iconImgs/${tech}.png`} alt={tech} />
                                                        </div>
                                                        <div className='infoValue'>{tech}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </MobileExpandable>
                                    ) : (
                                        backEndExpanded && backEndList.slice(1).map((tech, i) => (
                                            <div className='infoOuterRow' key={`be-${i + 1}`}>
                                                <p className='infoLabel'></p>
                                                <div className='outerAfter'>
                                                    <div className='infoIcon'>
                                                        <img src={`/iconImgs/${tech}.png`} alt={tech} />
                                                    </div>
                                                    <div className='infoValue'>{tech}</div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}

                                {/* Github */}
                                <div className='infoOuterRow'>
                                    <p className='infoLabel'>Github:</p>
                                    <div className='outerAfter'>
                                        <div className='infoIcon'><p><FontAwesomeIcon icon={faGithub} /></p></div>
                                        <div className='infoValue'>
                                            <a href={selectedProject?.github_link} target="_blank">Link</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Demo */}
                                <div className='infoOuterRow'>
                                    <p className='infoLabel'>Demo:</p>
                                    <div className='outerAfter'>
                                        <div className='infoIcon'><p><FontAwesomeIcon icon={faLaptopCode} /></p></div>
                                        <div className='infoValue'>
                                            <a href={selectedProject?.demo_link} target="_blank">Link</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <p className='projectDesc'>{selectedProject?.desc}</p>
                </div>
        </div>
        </>
    );
}

export default SelectedProjectPortfolioPanel