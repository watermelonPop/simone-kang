import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import '../App.css'
import '../mobile.css'
import './SettingsPanel.css'
import type {Theme} from '../types'

interface SettingsPanelProps {
    themes: Theme[]
    currentTheme: Theme 
    setCurrentTheme: (theme: Theme) => void
}

function SettingsPanel({ themes, currentTheme, setCurrentTheme }: SettingsPanelProps){
    const containerRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const measure = () => {
            const selectedIdx = themes.findIndex(t => t.name === currentTheme.name);
            const row = rowRefs.current[selectedIdx];
            const container = containerRef.current;
            if (row && container) {
                const rowRect = row.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rowRect.height === 0) return; // not ready yet
                setIndicatorStyle({
                    top: rowRect.top - containerRect.top + container.scrollTop,
                    height: rowRect.height,
                });
                setReady(true);
            }
        };

        // Wait for modal grow animation to finish (0.25s) before measuring
        const timeout = setTimeout(measure, 300);
        return () => clearTimeout(timeout);
    }, [currentTheme, themes]);

    const handleResetData = () => {
        localStorage.removeItem('currentTheme');
        setCurrentTheme(themes[0]);
    };

    return (
        <>
        <div className='settingsWidgetOuter'>
                <p className='settingsTitle'>Settings</p>
                <div className='settingsContent'>
                    <p className='themesTitle'>Themes</p>
                    <div className='themesOuterDiv' ref={containerRef}>
                        {/* Sliding indicator */}
                        <div className='themeIndicator' style={{
                            top: indicatorStyle.top - 2,
                            height: indicatorStyle.height,
                            transition: ready ? 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s ease' : 'none',
                        }} />
                        {themes.map((theme: Theme, idx: number) => (
                            <div
                                className='outerThemeDiv'
                                key={theme.name}
                                ref={el => { rowRefs.current[idx] = el; }}
                            >
                                <div className="themeDiv" onClick={() => setCurrentTheme(theme)}>
                                    <div style={{ backgroundColor: theme.backgroundColor, color: theme.backgroundTxtColor, borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px" }}>
                                        <FontAwesomeIcon icon={faHeart} />
                                    </div>
                                    <div style={{ backgroundColor: theme.accentColor1, color: theme.accentTxtColor1 }}>
                                        <p className='themeName'>{theme.name}</p>
                                    </div>
                                    <div style={{ backgroundColor: theme.accentColor2, color: theme.accentTxtColor2, borderBottomRightRadius: "15px", borderTopRightRadius: "15px" }}>
                                        <FontAwesomeIcon icon={faHeart} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='settingsBtnsDiv'>
                        <button onClick={handleResetData}>Reset Settings Data</button>
                    </div>
                </div>
        </div>
        </>
    );
}

export default SettingsPanel