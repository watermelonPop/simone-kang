import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart} from '@fortawesome/free-solid-svg-icons';
import './SettingsWidget.css';
function SettingsWidget({themes,currentTheme, setCurrentTheme}) {
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
                    <div className='themesOuterDiv'>
                    {themes.map((theme, idx) => (
                        <>
                        <div className={theme.name === currentTheme.name ? 'outerThemeDiv selectedThemeDiv' : 'outerThemeDiv'}>
                        <div className="themeDiv" onClick={() =>setCurrentTheme(theme)}>
                            <div style={{ backgroundColor: theme.backgroundColor, color: theme.backgroundTxtColor, borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px" }}>
                                <FontAwesomeIcon icon={faHeart}></FontAwesomeIcon>
                            </div>
                            <div style={{ backgroundColor: theme.accentColor1, color: theme.accentTxtColor1 }}>
                                <p className='themeName'>{theme.name}</p>
                            </div>
                            <div style={{ backgroundColor: theme.accentColor2, color: theme.accentTxtColor2, borderBottomRightRadius: "15px", borderTopRightRadius: "15px" }}>
                                <FontAwesomeIcon icon={faHeart}></FontAwesomeIcon>
                            </div>
                        </div>
                        </div>
                        </>
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

export default SettingsWidget;