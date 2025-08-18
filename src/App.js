import { useRef, useState, useEffect } from 'react';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';
import axios from "axios";
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 670);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);
  const hasExchangedCodeRef = useRef(false); // instead of state
  const [themes, setThemes] = useState([
    {
      name: "strawberry", 
      backgroundColor: "#FCF7EB", 
      backgroundTxtColor: "#000000",
      accentColor1: "#FD9E9E",
      accentTxtColor1: "#000000",
      accentColor2: "#92C786",
      accentTxtColor2: "#000000",
      fontFamily: '"Rubik", sans-serif',
    },
    {
      name: "Dark Blue", 
      backgroundColor: "#181E25", 
      backgroundTxtColor: "#FFFFFF",
      accentColor1: "#203A4F",
      accentTxtColor1: "#FFFFFF",
      accentColor2: "#4693B7",
      accentTxtColor2: "#FFFFFF",
      fontFamily: '"Playfair Display", serif',
    },
    {
      name: "Tteok", 
      backgroundColor: "#FFE5D9", 
      backgroundTxtColor: "#000000",
      accentColor1: "#F4ACB7",
      accentTxtColor1: "#000000",
      accentColor2: "#9D8189",
      accentTxtColor2: "#000000",
      fontFamily: '"Sour Gummy", sans-serif',
    },
    {
      name: "Red Velvet", 
      backgroundColor: "#461220", 
      backgroundTxtColor: "#FFFFFF",
      accentColor1: "#FCB9B2",
      accentTxtColor1: "#000000",
      accentColor2: "#B23A48",
      accentTxtColor2: "#000000",
      fontFamily: '"Lexend", sans-serif',
    },
  ]);

  const [currentTheme, setCurrentTheme] = useState(() => {
    const stored = localStorage.getItem("currentTheme");
    if (stored) return JSON.parse(stored);
    return themes[0];
  })


  const handleUnlock = () => {
    setAnimate(true); // Start swipe animation
    setTimeout(() => {
      setIsUnlocked(true); // After animation, remove LockScreen
      setAnimate(false);   // Reset for potential relock
    }, 600); // Duration matches CSS
  };

  useEffect(() => {
    if(!currentTheme) return;
    var r = document.querySelector(':root');
    r.style.setProperty('--backgroundColor', currentTheme.backgroundColor);
    r.style.setProperty('--backgroundTxtColor', currentTheme.backgroundTxtColor);
    r.style.setProperty('--accentColor1', currentTheme.accentColor1);
    r.style.setProperty('--accentTxtColor1', currentTheme.accentTxtColor1);
    r.style.setProperty('--accentColor2', currentTheme.accentColor2);
    r.style.setProperty('--accentTxtColor2', currentTheme.accentTxtColor2);
    r.style.setProperty('--fontFamily', currentTheme.fontFamily);
    localStorage.setItem("currentTheme", JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 670);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
  
    if (code && !hasExchangedCodeRef.current) {
      hasExchangedCodeRef.current = true; // set to true immediately
      axios.post("/api/login", { code })
        .then((res) => {
          console.log("SUCCESS");
          setAccessToken(res.data.accessToken);
          setRefreshToken(res.data.refreshToken);
          setExpiresIn(res.data.expiresIn);
          window.history.replaceState({}, document.title, "/");
          setIsUnlocked(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);


  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post("/api/refresh", {
          refreshToken,
        })
        .then((res) => {
          //alert("REFRESH");
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          //window.location = "/";
          console.log("INSIDE CATCH");
        });
    }, (expiresIn - 60) * 1000);

    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <HomeScreen accessToken={accessToken} isMobile={isMobile} themes={themes} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme}/>
      {!isUnlocked && (
        <div
          className={`lockscreen-container${animate ? ' swipe-up' : ''}`}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 2,
            background: 'inherit' // optional, ensures LockScreen covers HomeScreen
          }}
        >
          <LockScreen setIsUnlocked={handleUnlock} isMobile={isMobile} />
        </div>
      )}
    </div>
  );
}

export default App;
